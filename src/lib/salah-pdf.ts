/**
 * Salah tracker PDF report.
 *
 * Builds a polished, print-ready report entirely from the real tracker data
 * (prayer log, per-prayer status/time stamps and completed rak'ah units) — no
 * sample or filler rows are ever invented.
 */

import {
  PRAYERS,
  getRakah,
  iso,
  todayIso,
  type PrayerName,
  type SalahState,
} from "./salah-log";
import { allRakahIds, blueprintFor, requiredRakahIds } from "./prayer-guide-data";

const BRAND = { r: 15, g: 107, b: 92 };
const GOLD = { r: 176, g: 137, b: 43 };
const INK = { r: 26, g: 32, b: 30 };
const MUTED = { r: 108, g: 122, b: 118 };
const LINE = { r: 224, g: 231, b: 228 };
const OK = { r: 22, g: 128, b: 92 };
const BAD = { r: 178, g: 58, b: 48 };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const prettyDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number) as [number, number, number];
  const date = new Date(y, (m || 1) - 1, d || 1);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
  return `${weekday} ${String(d).padStart(2, "0")} ${MONTHS[(m || 1) - 1]?.slice(0, 3)} ${y}`;
};

const prettyTime = (isoTime?: string) => {
  if (!isoTime) return "—";
  const d = new Date(isoTime);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

type DayRow = {
  day: string;
  prayed: PrayerName[];
  missed: PrayerName[];
  times: Partial<Record<PrayerName, string>>;
  rakahDone: number;
  rakahTotal: number;
};

/** Every day the user has any recorded activity for, newest first. */
function collectDays(state: SalahState): DayRow[] {
  const days = new Set<string>([
    ...Object.keys(state.log ?? {}),
    ...Object.keys(state.meta ?? {}),
    ...Object.keys(state.rakah ?? {}).map((k) => k.split("|")[0] ?? ""),
  ]);
  days.delete("");

  const rows: DayRow[] = [];
  for (const day of days) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    const prayed: PrayerName[] = [];
    const missed: PrayerName[] = [];
    const times: Partial<Record<PrayerName, string>> = {};
    let rakahDone = 0;
    let rakahTotal = 0;

    for (const prayer of PRAYERS) {
      const meta = state.meta?.[day]?.[prayer];
      const inLog = (state.log?.[day] ?? []).includes(prayer);
      if (meta?.status === "prayed" || inLog) {
        prayed.push(prayer);
        if (meta?.at) times[prayer] = meta.at;
      } else if (meta?.status === "missed") {
        missed.push(prayer);
      }
      const units = blueprintFor(prayer)?.units ?? [];
      rakahTotal += allRakahIds(units).length;
      rakahDone += getRakah(state, day, prayer).length;
    }

    if (prayed.length || missed.length || rakahDone) {
      rows.push({ day, prayed, missed, times, rakahDone, rakahTotal });
    }
  }
  return rows.sort((a, b) => (a.day < b.day ? 1 : -1));
}

function streaks(rows: DayRow[]) {
  const full = new Set(rows.filter((r) => r.prayed.length === PRAYERS.length).map((r) => r.day));
  let best = 0;
  let run = 0;
  const sorted = [...rows].sort((a, b) => (a.day < b.day ? -1 : 1));
  let prev: string | null = null;
  for (const row of sorted) {
    if (!full.has(row.day)) {
      run = 0;
      prev = row.day;
      continue;
    }
    const consecutive =
      prev !== null && new Date(row.day).getTime() - new Date(prev).getTime() === 86_400_000;
    run = consecutive ? run + 1 : 1;
    best = Math.max(best, run);
    prev = row.day;
  }

  let current = 0;
  const cursor = new Date();
  for (;;) {
    const day = iso(cursor);
    if (!full.has(day)) break;
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { best, current };
}

export async function downloadSalahReport(state: SalahState, place: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 44;

  const rows = collectDays(state);
  const totalPrayed = rows.reduce((n, r) => n + r.prayed.length, 0);
  const totalMissed = rows.reduce((n, r) => n + r.missed.length, 0);
  const totalRakah = rows.reduce((n, r) => n + r.rakahDone, 0);
  const tracked = totalPrayed + totalMissed;
  const rate = tracked ? Math.round((totalPrayed / tracked) * 100) : 0;
  const { best, current } = streaks(rows);
  const fullDays = rows.filter((r) => r.prayed.length === PRAYERS.length).length;

  const perPrayer = PRAYERS.map((prayer) => {
    const prayed = rows.filter((r) => r.prayed.includes(prayer)).length;
    const missed = rows.filter((r) => r.missed.includes(prayer)).length;
    const units = blueprintFor(prayer)?.units ?? [];
    return {
      prayer,
      prayed,
      missed,
      rate: prayed + missed ? Math.round((prayed / (prayed + missed)) * 100) : 0,
      fard: requiredRakahIds(units).length,
      total: allRakahIds(units).length,
    };
  });

  const byMonth = new Map<string, { prayed: number; missed: number; days: Set<string> }>();
  for (const row of rows) {
    const key = row.day.slice(0, 7);
    const entry = byMonth.get(key) ?? { prayed: 0, missed: 0, days: new Set<string>() };
    entry.prayed += row.prayed.length;
    entry.missed += row.missed.length;
    entry.days.add(row.day);
    byMonth.set(key, entry);
  }
  const months = [...byMonth.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

  let page = 1;
  const setFill = (c: typeof BRAND) => doc.setFillColor(c.r, c.g, c.b);
  const setText = (c: typeof BRAND) => doc.setTextColor(c.r, c.g, c.b);

  const footer = () => {
    doc.setDrawColor(LINE.r, LINE.g, LINE.b);
    doc.setLineWidth(0.6);
    doc.line(M, H - 46, W - M, H - 46);
    doc.setFont("helvetica", "normal").setFontSize(8);
    setText(MUTED);
    doc.text("Raah e Hidayath — Salah Tracker report", M, H - 32);
    doc.text(`Page ${page}`, W - M, H - 32, { align: "right" });
  };

  const banner = (title: string, subtitle: string) => {
    setFill(BRAND);
    doc.rect(0, 0, W, 96, "F");
    setFill(GOLD);
    doc.rect(0, 96, W, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold").setFontSize(20);
    doc.text(title, M, 48);
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.setTextColor(226, 240, 236);
    doc.text(subtitle, M, 70);
  };

  const newPage = (title: string, subtitle: string) => {
    footer();
    doc.addPage();
    page += 1;
    banner(title, subtitle);
    return 132;
  };

  /* ---------- cover / summary ---------- */
  banner(
    "Salah Tracker Report",
    `${place} · generated ${prettyDay(todayIso())} · ${rows.length} recorded day${rows.length === 1 ? "" : "s"}`,
  );

  let y = 132;
  const cards: Array<[string, string, string]> = [
    ["Prayers completed", String(totalPrayed), `${totalRakah} rak'ah recorded`],
    ["Completion rate", `${rate}%`, `${totalMissed} missed of ${tracked} tracked`],
    ["Best streak", `${best} day${best === 1 ? "" : "s"}`, `current streak ${current}`],
    ["Perfect days", String(fullDays), "all five prayers prayed"],
  ];
  const cw = (W - M * 2 - 3 * 12) / 4;
  cards.forEach(([label, value, hint], i) => {
    const x = M + i * (cw + 12);
    doc.setFillColor(246, 250, 248);
    doc.setDrawColor(LINE.r, LINE.g, LINE.b);
    doc.roundedRect(x, y, cw, 82, 8, 8, "FD");
    setText(MUTED);
    doc.setFont("helvetica", "normal").setFontSize(8);
    doc.text(label.toUpperCase(), x + 12, y + 20);
    setText(BRAND);
    doc.setFont("helvetica", "bold").setFontSize(20);
    doc.text(value, x + 12, y + 48);
    setText(MUTED);
    doc.setFont("helvetica", "normal").setFontSize(7.5);
    doc.text(doc.splitTextToSize(hint, cw - 24), x + 12, y + 64);
  });
  y += 116;

  const heading = (text: string) => {
    setText(INK);
    doc.setFont("helvetica", "bold").setFontSize(13);
    doc.text(text, M, y);
    setFill(GOLD);
    doc.rect(M, y + 6, 34, 2.5, "F");
    y += 26;
  };

  /* ---------- per prayer ---------- */
  heading("Prayer by prayer");
  const pCols = [M, M + 120, M + 195, M + 265, M + 335, M + 420];
  setText(MUTED);
  doc.setFont("helvetica", "bold").setFontSize(8.5);
  ["Prayer", "Prayed", "Missed", "Rate", "Fard rak'ah", "With sunnah"].forEach((h, i) =>
    doc.text(h, pCols[i]!, y),
  );
  y += 8;
  doc.setDrawColor(LINE.r, LINE.g, LINE.b);
  doc.line(M, y, W - M, y);
  y += 14;

  perPrayer.forEach((p, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(249, 251, 250);
      doc.rect(M - 6, y - 11, W - M * 2 + 12, 20, "F");
    }
    setText(INK);
    doc.setFont("helvetica", "bold").setFontSize(9.5);
    doc.text(p.prayer, pCols[0]!, y);
    doc.setFont("helvetica", "normal");
    setText(OK);
    doc.text(String(p.prayed), pCols[1]!, y);
    setText(p.missed ? BAD : MUTED);
    doc.text(String(p.missed), pCols[2]!, y);
    setText(INK);
    doc.text(`${p.rate}%`, pCols[3]!, y);
    setText(MUTED);
    doc.text(String(p.fard), pCols[4]!, y);
    doc.text(String(p.total), pCols[5]!, y);
    y += 20;
  });
  y += 14;

  /* ---------- monthly ---------- */
  if (months.length) {
    heading("Month by month");
    setText(MUTED);
    doc.setFont("helvetica", "bold").setFontSize(8.5);
    const mCols = [M, M + 170, M + 260, M + 350, M + 440];
    ["Month", "Days logged", "Prayed", "Missed", "Rate"].forEach((h, i) => doc.text(h, mCols[i]!, y));
    y += 8;
    doc.line(M, y, W - M, y);
    y += 14;
    doc.setFont("helvetica", "normal").setFontSize(9.5);
    months.slice(0, 12).forEach(([key, m], i) => {
      if (y > H - 90) y = newPage("Salah Tracker Report", "Month by month (continued)");
      if (i % 2 === 1) {
        doc.setFillColor(249, 251, 250);
        doc.rect(M - 6, y - 11, W - M * 2 + 12, 20, "F");
      }
      const [yr, mo] = key.split("-");
      const mRate = m.prayed + m.missed ? Math.round((m.prayed / (m.prayed + m.missed)) * 100) : 0;
      setText(INK);
      doc.text(`${MONTHS[Number(mo) - 1]} ${yr}`, mCols[0]!, y);
      setText(MUTED);
      doc.text(String(m.days.size), mCols[1]!, y);
      setText(OK);
      doc.text(String(m.prayed), mCols[2]!, y);
      setText(m.missed ? BAD : MUTED);
      doc.text(String(m.missed), mCols[3]!, y);
      setText(INK);
      doc.text(`${mRate}%`, mCols[4]!, y);
      y += 20;
    });
  }

  /* ---------- daily detail ---------- */
  if (y < H - 320) {
    heading("Daily record");
  } else {
    y = newPage("Daily record", "Every logged day with the time each prayer was marked");
  }
  const dCols = [M, M + 112, M + 190, M + 258, M + 322, M + 392, M + 460];
  const dailyHeader = () => {
    setText(MUTED);
    doc.setFont("helvetica", "bold").setFontSize(8.5);
    ["Date", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Rak'ah"].forEach((h, i) =>
      doc.text(h, dCols[i]!, y),
    );
    y += 8;
    doc.setDrawColor(LINE.r, LINE.g, LINE.b);
    doc.line(M, y, W - M, y);
    y += 14;
  };
  dailyHeader();

  if (!rows.length) {
    setText(MUTED);
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text("No prayers have been logged yet. Mark your prayers in the tracker and export again.", M, y);
  }

  rows.forEach((row, i) => {
    if (y > H - 80) {
      y = newPage("Daily record", "Every logged day with the time each prayer was marked");
      dailyHeader();
    }
    if (i % 2 === 1) {
      doc.setFillColor(249, 251, 250);
      doc.rect(M - 6, y - 11, W - M * 2 + 12, 20, "F");
    }
    setText(INK);
    doc.setFont("helvetica", "bold").setFontSize(9);
    doc.text(prettyDay(row.day), dCols[0]!, y);
    doc.setFont("helvetica", "normal").setFontSize(8.5);
    PRAYERS.forEach((prayer, idx) => {
      const x = dCols[idx + 1]!;
      if (row.prayed.includes(prayer)) {
        setText(OK);
        doc.text(prettyTime(row.times[prayer]) === "—" ? "Prayed" : prettyTime(row.times[prayer]), x, y);
      } else if (row.missed.includes(prayer)) {
        setText(BAD);
        doc.text("Missed", x, y);
      } else {
        setText(MUTED);
        doc.text("—", x, y);
      }
    });
    setText(MUTED);
    doc.text(`${row.rakahDone}/${row.rakahTotal}`, dCols[6]!, y);
    y += 20;
  });

  y += 16;
  if (y > H - 74) y = newPage("Daily record", "Notes about this report");
  setText(MUTED);
  doc.setFont("helvetica", "italic").setFontSize(8.5);
  doc.text(
    doc.splitTextToSize(
      "Times shown are when each prayer was marked in the app. Rak'ah counts include Sunnah, Fard, Nafl and Witr units " +
        "as ticked in the Prayer Guide. This report is generated from the log stored privately on this device.",
      W - M * 2,
    ),
    M,
    y,
  );

  footer();
  doc.save(`salah-tracker-report-${todayIso()}.pdf`);
}
