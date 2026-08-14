/**
 * "Download my data" — everything the app has recorded for this person, day
 * by day: salah, ibadah habits, good deeds, Quran reading, hadith bookmarks
 * and every preference. Nothing is invented; only real stored activity is
 * exported.
 */

const PREFIXES = ["rah-e-hidayath-", "reh-"];

export type MyData = {
  exportedAt: string;
  app: string;
  entries: Record<string, unknown>;
};

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function collectMyData(): MyData {
  const entries: Record<string, unknown> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !PREFIXES.some((p) => key.startsWith(p))) continue;
      if (key.includes("translations")) continue; // translation cache is not user data
      const raw = window.localStorage.getItem(key);
      if (raw != null) entries[key] = safeParse(raw);
    }
  } catch {
    /* ignore */
  }
  return { exportedAt: new Date().toISOString(), app: "Raah e Hidayath", entries };
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const stamp = () => new Date().toISOString().slice(0, 10);

export function downloadMyDataJson() {
  const data = collectMyData();
  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    `raah-e-hidayath-my-data-${stamp()}.json`,
  );
}

/* ------------------------------- PDF report ------------------------------- */

type Row = { day: string; lines: string[] };

/** Turns the raw stores into a readable day-by-day activity list. */
function buildDays(entries: Record<string, unknown>): Row[] {
  const byDay = new Map<string, string[]>();
  const push = (day: string, line: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
    const list = byDay.get(day) ?? [];
    list.push(line);
    byDay.set(day, list);
  };

  const salah = entries["reh-salah-tracker"] as Record<string, string[]> | undefined;
  if (salah && typeof salah === "object") {
    for (const [day, prayers] of Object.entries(salah)) {
      if (Array.isArray(prayers) && prayers.length) push(day, `Salah prayed: ${prayers.join(", ")}`);
    }
  }

  const meta = entries["reh-salah-meta"] as
    | Record<string, Record<string, { status: string; at?: string }>>
    | undefined;
  if (meta && typeof meta === "object") {
    for (const [day, prayers] of Object.entries(meta)) {
      const missed = Object.entries(prayers ?? {})
        .filter(([, v]) => v?.status === "missed")
        .map(([k]) => k);
      if (missed.length) push(day, `Missed: ${missed.join(", ")}`);
    }
  }

  const ibadah = entries["reh-ibadah-tree"] as Record<string, string[]> | undefined;
  if (ibadah && typeof ibadah === "object") {
    for (const [day, ids] of Object.entries(ibadah)) {
      if (!Array.isArray(ids) || !ids.length) continue;
      const deeds = ids.filter((i) => i.startsWith("deed:")).map((i) => i.slice(5));
      const habits = ids.filter((i) => !i.startsWith("deed:"));
      if (habits.length) push(day, `Ibadah: ${habits.join(", ")}`);
      if (deeds.length) push(day, `Good deeds: ${deeds.join(", ")}`);
    }
  }

  return [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, lines]) => ({ day, lines }));
}

const BRAND: [number, number, number] = [15, 107, 92];
const GOLD: [number, number, number] = [176, 137, 43];
const INK: [number, number, number] = [26, 32, 30];
const MUTED: [number, number, number] = [108, 122, 118];

export async function downloadMyDataPdf() {
  const { jsPDF } = await import("jspdf");
  const data = collectMyData();
  const days = buildDays(data.entries);
  const bookmarks = (data.entries["rah-e-hidayath-hadith-bookmarks"] as
    | Array<{ text: string; bookName: string; reference?: string }>
    | undefined) ?? [];
  const settings = data.entries["rah-e-hidayath-settings"] as Record<string, unknown> | undefined;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 0;

  const header = (title: string, subtitle: string) => {
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, W, 92, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(title, 40, 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(226, 240, 234);
    doc.text(subtitle, 40, 66);
    doc.setTextColor(...INK);
    y = 124;
  };

  const newPage = (title: string, subtitle: string) => {
    doc.addPage();
    header(title, subtitle);
    return y;
  };

  const room = (need: number, title: string, subtitle: string) => {
    if (y + need > H - 56) y = newPage(title, subtitle);
  };

  header("Raah e Hidayath — My Data", `Everything recorded on this device · exported ${new Date().toLocaleString()}`);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Summary", 40, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const summary = [
    `Days with recorded activity: ${days.length}`,
    `Saved hadith bookmarks: ${bookmarks.length}`,
    `Stored preference groups: ${Object.keys(data.entries).length}`,
    settings?.["lastRead"] ? `Last mushaf page: ${(settings["lastRead"] as { page?: number })?.page ?? "—"}` : "",
    settings?.["lastSurah"]
      ? `Last surah read: ${(settings["lastSurah"] as { name?: string })?.name ?? "—"}`
      : "",
  ].filter(Boolean);
  for (const line of summary) {
    doc.text(line, 40, y);
    y += 15;
  }
  doc.setTextColor(...INK);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Day by day", 40, y);
  y += 8;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.line(40, y, W - 40, y);
  y += 20;

  if (!days.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("No daily activity has been recorded yet.", 40, y);
    y += 18;
    doc.setTextColor(...INK);
  }

  for (const row of days) {
    room(46, "My Data (continued)", "Day by day");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND);
    doc.text(row.day, 40, y);
    y += 14;
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const line of row.lines) {
      const wrapped = doc.splitTextToSize(`• ${line}`, W - 96) as string[];
      for (const w of wrapped) {
        room(18, "My Data (continued)", "Day by day");
        doc.text(w, 52, y);
        y += 13;
      }
    }
    y += 8;
  }

  if (bookmarks.length) {
    y = newPage("My Data — Hadith bookmarks", "Every hadith saved for later");
    doc.setFontSize(10);
    for (const b of bookmarks) {
      room(50, "My Data — Hadith bookmarks", "Every hadith saved for later");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND);
      doc.text(`${b.bookName}${b.reference ? ` · ${b.reference}` : ""}`, 40, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      const wrapped = doc.splitTextToSize(b.text ?? "", W - 80) as string[];
      for (const w of wrapped) {
        room(16, "My Data — Hadith bookmarks", "Every hadith saved for later");
        doc.text(w, 40, y);
        y += 13;
      }
      y += 10;
    }
  }

  doc.save(`raah-e-hidayath-my-data-${stamp()}.pdf`);
}
