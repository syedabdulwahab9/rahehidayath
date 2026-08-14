import { useEffect, useMemo, useState } from "react";

/** Shared daily-deed log used by the Ibadah Tree, Hidayah Trail,
 *  Sadaqah Lake and House in Jannah pages. Stored on this device. */

export const IBADAH_KEY = "reh-ibadah-tree";

export const HABIT_IDS = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
  "quran",
  "dhikr",
  "sadaqah",
  "haram",
] as const;

export const PRAYER_IDS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

/** Extra good deeds a person can log any number of times a day.
 *  Every one of these adds a drop to the Sadaqah Lake. */
export const GOOD_DEEDS = [
  { id: "deed:smile", label: "Smiled at someone", emoji: "🙂" },
  { id: "deed:parents", label: "Helped my parents", emoji: "🤍" },
  { id: "deed:charity", label: "Gave charity", emoji: "🪙" },
  { id: "deed:food", label: "Fed someone hungry", emoji: "🍲" },
  { id: "deed:water", label: "Gave water to drink", emoji: "🥤" },
  { id: "deed:salam", label: "Spread salam", emoji: "🕊️" },
  { id: "deed:quran", label: "Taught or shared a verse", emoji: "📖" },
  { id: "deed:dua", label: "Made dua for a Muslim", emoji: "🤲" },
  { id: "deed:forgive", label: "Forgave someone", emoji: "🌸" },
  { id: "deed:harm", label: "Removed harm from the path", emoji: "🧹" },
  { id: "deed:animal", label: "Was kind to an animal", emoji: "🐈" },
  { id: "deed:visit", label: "Visited the sick or a relative", emoji: "🏠" },
] as const;

/** true when a logged id counts as a drop in the Sadaqah Lake */
export const isDrop = (id: string) => id === "dhikr" || id === "sadaqah" || id.startsWith("deed:");

export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export type IbadahLog = Record<string, string[]>;

/** Every hook instance shares one in-memory log so a deed tapped in the
 *  Good Deeds panel instantly fills the Tree, the Lake and the Trail. */
let memoryLog: IbadahLog = {};
let loaded = false;
const listeners = new Set<(l: IbadahLog) => void>();

function readStored(): IbadahLog {
  try {
    const raw = localStorage.getItem(IBADAH_KEY);
    return raw ? (JSON.parse(raw) as IbadahLog) : {};
  } catch {
    return {};
  }
}

function publish(next: IbadahLog) {
  memoryLog = next;
  listeners.forEach((fn) => fn(next));
}

export function useIbadahLog() {
  const todayIso = iso(new Date());
  const [log, setLog] = useState<IbadahLog>(memoryLog);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loaded) {
      loaded = true;
      memoryLog = readStored();
    }
    setLog(memoryLog);
    setMounted(true);

    const onLocal = (l: IbadahLog) => setLog(l);
    listeners.add(onLocal);
    const onStorage = (e: StorageEvent) => {
      if (e.key === IBADAH_KEY) publish(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const done = log[todayIso] ?? [];

  const write = (entries: string[]) => {
    const next: IbadahLog = { ...memoryLog, [todayIso]: entries };
    publish(next);
    try {
      localStorage.setItem(IBADAH_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggle = (id: string) => {
    const current = memoryLog[todayIso] ?? [];
    write(current.includes(id) ? current.filter((h) => h !== id) : [...current, id]);
  };

  /** Good deeds can be done again and again — every tap is one more drop. */
  const addDeed = (id: string) => {
    const current = memoryLog[todayIso] ?? [];
    write([...current, `${id}#${Date.now()}${Math.random().toString(36).slice(2, 5)}`]);
  };

  /** Removes the most recent drop of that deed, in case of a mis-tap. */
  const removeDeed = (id: string) => {
    const current = memoryLog[todayIso] ?? [];
    const last = [...current].reverse().find((e) => e === id || e.startsWith(`${id}#`));
    if (!last) return;
    const at = current.lastIndexOf(last);
    write([...current.slice(0, at), ...current.slice(at + 1)]);
  };


  const fullDay = (ids: string[]) => HABIT_IDS.every((h) => ids.includes(h));

  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    if (!fullDay(log[iso(d)] ?? [])) d.setDate(d.getDate() - 1);
    while (fullDay(log[iso(d)] ?? [])) {
      s += 1;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [log]);

  const todayPrayers = PRAYER_IDS.filter((p) => done.includes(p)).length;

  /** last 7 days, oldest → newest: true when all five prayers were prayed */
  const trailStones = useMemo(() => {
    const out: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = log[iso(d)] ?? [];
      out.push(PRAYER_IDS.every((p) => day.includes(p)));
    }
    return out;
  }, [log]);

  /** every dhikr, sadaqah and good deed ever logged becomes a drop in the lake */
  const deedDrops = useMemo(
    () => Object.values(log).reduce((n, day) => n + day.filter(isDrop).length, 0),
    [log],
  );

  const goodDeedsToday = done.filter((id) => id.startsWith("deed:")).length;

  /** how many times each good deed was logged today */
  const deedCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const entry of done) {
      if (!entry.startsWith("deed:")) continue;
      const base = entry.split("#")[0] as string;
      out[base] = (out[base] ?? 0) + 1;
    }
    return out;
  }, [done.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  const milestones = useMemo(() => {
    const days = Object.values(log);
    const quran = days.filter((d) => d.includes("quran")).length;
    const guarded = days.filter((d) => d.includes("haram")).length;
    const fullPrayerDays = days.filter((d) => PRAYER_IDS.every((p) => d.includes(p))).length;
    const kindness = days.reduce((n, d) => n + d.filter((h) => h.startsWith("deed:")).length, 0);
    return [
      { label: "First full day", done: days.some(fullDay) },
      { label: "3-day streak", done: streak >= 3 },
      { label: "7 days of Quran", done: quran >= 7 },
      { label: "10 drops of dhikr", done: deedDrops >= 10 },
      { label: "7 guarded days", done: guarded >= 7 },
      { label: "25 good deeds", done: kindness >= 25 },
      { label: "14 full prayer days", done: fullPrayerDays >= 14 },
      { label: "30-day streak", done: streak >= 30 },
    ];
  }, [log, streak, deedDrops]);

  const builtBlocks = milestones.filter((m) => m.done).length;

  const week = useMemo(() => {
    const out: { day: string; n: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push({ day: d.toLocaleDateString(undefined, { weekday: "narrow" }), n: log[iso(d)]?.length ?? 0 });
    }
    return out;
  }, [log]);

  return {
    log,
    done,
    toggle,
    addDeed,
    removeDeed,
    deedCounts,
    mounted,
    streak,
    todayPrayers,
    trailStones,
    deedDrops,
    goodDeedsToday,
    milestones,
    builtBlocks,
    week,
  };
}
