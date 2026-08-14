import { supabase } from "@/integrations/supabase/client";

export const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type Prayer = (typeof PRAYERS)[number];

const TRACKER_KEY = "reh-salah-tracker";
const DHIKR_KEY = "reh-family-dhikr";
const QURAN_KEY = "reh-family-quran";
const DEEDS_KEY = "reh-family-deeds";
const FLAGS_KEY = "reh-family-flags";

export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const todayIso = () => iso(new Date());

export function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(iso(d));
  }
  return out;
}

export type MemberProgress = {
  user_id: string;
  day: string;
  prayers: string[];
  quran_pages: number;
  dhikr: number;
  streak: number;
  fasting: boolean;
  tahajjud: boolean;
  sadaqah: boolean;
  good_deeds: number;
  updated_at: string;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  user_id: string;
  role: string;
  share_salah: boolean;
  share_quran: boolean;
  share_dhikr: boolean;
  share_streak: boolean;
  share_fasting: boolean;
  share_tahajjud: boolean;
  share_sadaqah: boolean;
  share_deeds: boolean;
  share_last_active: boolean;
  hide_prayer_times: boolean;
  joined_at: string;
};

export type PrivacyKey =
  | "share_salah"
  | "share_quran"
  | "share_dhikr"
  | "share_streak"
  | "share_fasting"
  | "share_tahajjud"
  | "share_sadaqah"
  | "share_deeds"
  | "share_last_active"
  | "hide_prayer_times";

export const PRIVACY_OPTIONS: { key: PrivacyKey; label: string; note: string }[] = [
  { key: "share_salah", label: "Share Salah", note: "Which of the five prayers you completed today" },
  { key: "share_quran", label: "Share Quran", note: "Pages you read today" },
  { key: "share_dhikr", label: "Share Dhikr", note: "Your tasbeeh count" },
  { key: "share_streak", label: "Share Streak", note: "Your consistency streak in days" },
  { key: "share_fasting", label: "Share Fasting", note: "Whether you kept a fast today" },
  { key: "share_tahajjud", label: "Share Tahajjud", note: "Your night prayer" },
  { key: "share_sadaqah", label: "Share Sadaqah", note: "Charity you gave today" },
  { key: "share_deeds", label: "Share Good Deeds", note: "Small acts of kindness you logged" },
  { key: "share_last_active", label: "Share Last Active", note: "When you last opened the app" },
  { key: "hide_prayer_times", label: "Hide Individual Prayer Names", note: "Show only totals, never which prayer" },
];

export const ENCOURAGEMENTS = [
  "🌸 May Allah reward you.",
  "🤍 Keep going.",
  "🌙 Don't forget Asr.",
  "✨ MashaAllah.",
  "🤲 I'm making dua for you.",
  "❤️ Proud of your consistency.",
  "📖 Let's read Quran together today.",
  "🕌 Jazak Allahu khayran.",
] as const;

/** Extra worship a member can log and share with the family. */
export type DeedFlag = "fasting" | "tahajjud" | "sadaqah";

export const DEED_FLAGS: { key: DeedFlag; label: string; emoji: string; note: string }[] = [
  { key: "fasting", label: "Fasting", emoji: "🌙", note: "Kept a fast today" },
  { key: "tahajjud", label: "Tahajjud", emoji: "🌌", note: "Prayed in the last third of the night" },
  { key: "sadaqah", label: "Sadaqah", emoji: "🤲", note: "Gave charity today" },
];

/* ---------- local worship data (from the existing Salah Tracker) ---------- */

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
}

export function localStreak(log: Record<string, string[]>) {
  let streak = 0;
  const d = new Date();
  if ((log[iso(d)]?.length ?? 0) < 5) d.setDate(d.getDate() - 1);
  for (;;) {
    if ((log[iso(d)]?.length ?? 0) >= 5) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

export type LocalToday = {
  day: string;
  prayers: string[];
  streak: number;
  quran_pages: number;
  dhikr: number;
  good_deeds: number;
  fasting: boolean;
  tahajjud: boolean;
  sadaqah: boolean;
};

export function readLocalToday(): LocalToday {
  const log = readJson<Record<string, string[]>>(TRACKER_KEY, {});
  const day = todayIso();
  const flags = readJson<Record<string, DeedFlag[]>>(FLAGS_KEY, {})[day] ?? [];
  return {
    day,
    prayers: log[day] ?? [],
    streak: localStreak(log),
    quran_pages: Number(readJson<Record<string, number>>(QURAN_KEY, {})[day] ?? 0),
    dhikr: Number(readJson<Record<string, number>>(DHIKR_KEY, {})[day] ?? 0),
    good_deeds: Number(readJson<Record<string, number>>(DEEDS_KEY, {})[day] ?? 0),
    fasting: flags.includes("fasting"),
    tahajjud: flags.includes("tahajjud"),
    sadaqah: flags.includes("sadaqah"),
  };
}

export function bumpLocal(kind: "quran" | "dhikr" | "deeds", amount: number) {
  const key = kind === "quran" ? QURAN_KEY : kind === "dhikr" ? DHIKR_KEY : DEEDS_KEY;
  const day = todayIso();
  const store = readJson<Record<string, number>>(key, {});
  store[day] = Math.max(0, (store[day] ?? 0) + amount);
  writeJson(key, store);
  return store[day];
}

export function toggleLocalFlag(flag: DeedFlag) {
  const day = todayIso();
  const store = readJson<Record<string, DeedFlag[]>>(FLAGS_KEY, {});
  const list = store[day] ?? [];
  store[day] = list.includes(flag) ? list.filter((f) => f !== flag) : [...list, flag];
  writeJson(FLAGS_KEY, store);
  return store[day];
}

/** Push this device's worship log for today into the shared family view. */
export async function syncMyProgress(userId: string) {
  const t = readLocalToday();
  await supabase.from("daily_progress").upsert(
    {
      user_id: userId,
      day: t.day,
      prayers: t.prayers,
      quran_pages: t.quran_pages,
      dhikr: t.dhikr,
      streak: t.streak,
      fasting: t.fasting,
      tahajjud: t.tahajjud,
      sadaqah: t.sadaqah,
      good_deeds: t.good_deeds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,day" },
  );
  await supabase.from("profiles").upsert(
    { id: userId, last_active: new Date().toISOString() },
    { onConflict: "id" },
  );
}

/* ---------- helpers ---------- */

export function makeInviteCode(familyName: string) {
  const base =
    familyName
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 8)
      .toUpperCase() || "FAMILY";
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${base}-${digits}`;
}

export function relativeTime(value?: string | null) {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export type Badge = { id: string; label: string; icon: string; earned: boolean; note: string };

export function badgesFor(streak: number, weekPrayers: number, quranPages: number, dhikr: number): Badge[] {
  return [
    { id: "week", label: "First Week Complete", icon: "🏆", earned: streak >= 7, note: "7 days in a row" },
    { id: "ramadan", label: "Ramadan Warrior", icon: "🌙", earned: streak >= 30, note: "30 days of consistency" },
    { id: "quran", label: "Quran Lover", icon: "📖", earned: quranPages >= 30, note: "30 pages this week" },
    { id: "salah", label: "Salah Guardian", icon: "🤲", earned: weekPrayers >= 30, note: "30 prayers this week" },
    { id: "hundred", label: "100 Day Streak", icon: "🔥", earned: streak >= 100, note: "100 days in a row" },
    { id: "barakah", label: "Family of Barakah", icon: "🌸", earned: dhikr >= 1000, note: "1000 dhikr together" },
  ];
}
