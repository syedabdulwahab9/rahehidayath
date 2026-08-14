/**
 * AI Quran Teacher — shared model.
 *
 * Holds the learning modes, the interface languages, the tajweed rule
 * vocabulary the AI is allowed to report, and the session/progress store that
 * lets a learner walk away mid-ayah and come back to the exact same word.
 */

import { supabase } from "@/integrations/supabase/client";
import { getLanguage } from "@/lib/islamic-data";


/* ----------------------------------------------------------------- languages */

/**
 * The interface language is the app-wide one (Settings → language), so the
 * whole site and the teacher always speak together. The Quran text itself
 * always stays in Arabic.
 */
export function langName(code: string) {
  return getLanguage(code).label;
}

export function isRtl(code: string) {
  return getLanguage(code).rtl === true;
}


/* --------------------------------------------------------------------- modes */

export type TeacherMode = "practice" | "precision" | "tajweed" | "assessment" | "hifz" | "revision" | "teacher" | "beginner";

export const TEACHER_MODES: Array<{
  id: TeacherMode;
  name: string;
  blurb: string;
}> = [
  { id: "practice", name: "Reading practice", blurb: "Checks Quran word order and stops you on a real mistake." },
  { id: "precision", name: "Precision", blurb: "Stricter word-level checking — nothing turns green without clear evidence." },
  { id: "tajweed", name: "Tajweed teacher", blurb: "Adds a pronunciation opinion on the word you were stopped at, only when it can genuinely be heard." },
  { id: "assessment", name: "Assessment", blurb: "Recite freely, then read a full report." },
  { id: "hifz", name: "Hifz", blurb: "The Mushaf gradually fades to strengthen memory." },
  { id: "revision", name: "Revision", blurb: "Focuses on the words you struggled with before." },
  { id: "teacher", name: "Teacher", blurb: "Review a learner's corrections and progress." },
  { id: "beginner", name: "Beginner", blurb: "Slower pace, gentler pace, extra explanation." },
];

/* -------------------------------------------------------------- tajweed rules */

/** Every family of mistake the teacher is allowed to report. */
export const TAJWEED_RULES = [
  "makharij",
  "heavy-light",
  "missing-letter",
  "extra-letter",
  "wrong-vowel",
  "shaddah",
  "sukoon",
  "madd",
  "ghunnah",
  "ikhfa",
  "idgham",
  "iqlab",
  "izhar",
  "qalqalah",
  "lam-rule",
  "ra-rule",
  "waqf",
  "hamzatul-wasl",
  "hamzatul-qat",
  "sifat",
  "word-skipped",
  "word-substituted",
] as const;

export type TajweedRule = (typeof TAJWEED_RULES)[number];

export const RULE_LABEL: Record<string, string> = {
  makharij: "Makharij — point of articulation",
  "heavy-light": "Heavy / light letter (Tafkhīm & Tarqīq)",
  "missing-letter": "Missing letter",
  "extra-letter": "Extra letter",
  "wrong-vowel": "Vowel (Harakah)",
  shaddah: "Shaddah",
  sukoon: "Sukoon",
  madd: "Madd length",
  ghunnah: "Ghunnah",
  ikhfa: "Ikhfā'",
  idgham: "Idghām",
  iqlab: "Iqlāb",
  izhar: "Izhār",
  qalqalah: "Qalqalah",
  "lam-rule": "Lām rule",
  "ra-rule": "Rā rule",
  waqf: "Waqf — stopping",
  "hamzatul-wasl": "Hamzatul Wasl",
  "hamzatul-qat": "Hamzatul Qat'",
  sifat: "Sifāt of the letter",
  "word-skipped": "Word skipped",
  "word-substituted": "Different word recited",
};

/* ------------------------------------------------------------------- session */

export type TeacherSession = {
  surah: number;
  page: number;
  line: number;
  ayah: number;
  wordIndex: number;
  qari: number;
  language: string;
  mode: TeacherMode;
  updatedAt: string;
};

export type TeacherStats = {
  day: string;
  pages: number;
  ayat: number;
  words: number;
  tajweed: number;
  pronunciation: number;
  streak: number;
  /** rule -> how many times it came up. */
  ruleCounts: Record<string, number>;
};

export type StoredMistake = {
  id: string;
  surah: number;
  ayah: number;
  wordIndex: number;
  word: string;
  rule: string;
  severity: "minor" | "major";
  explanation: string;
  corrected: boolean;
  at: string;
};

const SESSION_KEY = "quran-teacher-session-v1";
const STATS_KEY = "quran-teacher-stats-v1";
const MISTAKES_KEY = "quran-teacher-mistakes-v1";

export const DEFAULT_SESSION: TeacherSession = {
  surah: 1,
  page: 1,
  line: 1,
  ayah: 1,
  wordIndex: 0,
  qari: 7,
  language: "en",
  mode: "practice",
  updatedAt: new Date().toISOString(),
};

export const today = () => new Date().toISOString().slice(0, 10);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...(JSON.parse(raw) as object) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the in-memory session still works */
  }
}

export function loadSession(): TeacherSession {
  return read(SESSION_KEY, DEFAULT_SESSION);
}

export function saveSession(session: TeacherSession) {
  write(SESSION_KEY, session);
}

export function loadStats(): TeacherStats {
  const blank: TeacherStats = {
    day: today(),
    pages: 0,
    ayat: 0,
    words: 0,
    tajweed: 100,
    pronunciation: 100,
    streak: 1,
    ruleCounts: {},
  };
  const stored = read(STATS_KEY, blank);
  if (stored.day !== today()) {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    return { ...blank, streak: stored.day === yesterday ? stored.streak + 1 : 1, ruleCounts: {} };
  }
  return stored;
}

export function saveStats(stats: TeacherStats) {
  write(STATS_KEY, stats);
}

export function loadMistakes(): StoredMistake[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MISTAKES_KEY);
    return raw ? (JSON.parse(raw) as StoredMistake[]) : [];
  } catch {
    return [];
  }
}

export function saveMistakes(list: StoredMistake[]) {
  write(MISTAKES_KEY, list.slice(-400));
}

/* --------------------------------------------------------------- cloud sync */

/** Mirror the saved place to the account, so it follows the learner's devices. */
export async function pushSessionToCloud(session: TeacherSession) {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return;
  await supabase.from("quran_sessions").upsert(
    {
      user_id: uid,
      surah: session.surah,
      page: session.page,
      line: session.line,
      ayah: session.ayah,
      word_index: session.wordIndex,
      qari: String(session.qari),
      language: session.language,
      mode: session.mode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function pullSessionFromCloud(): Promise<TeacherSession | null> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return null;
  const { data: row } = await supabase.from("quran_sessions").select("*").eq("user_id", uid).maybeSingle();
  if (!row) return null;
  return {
    surah: row.surah,
    page: row.page,
    line: row.line,
    ayah: row.ayah,
    wordIndex: row.word_index,
    qari: Number(row.qari) || 7,
    language: row.language,
    mode: (row.mode as TeacherMode) ?? "practice",
    updatedAt: row.updated_at,
  };
}

export async function pushStatsToCloud(stats: TeacherStats) {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return;
  await supabase.from("quran_progress").upsert(
    {
      user_id: uid,
      day: stats.day,
      pages: stats.pages,
      ayat: stats.ayat,
      words: stats.words,
      tajweed_accuracy: stats.tajweed,
      pronunciation_accuracy: stats.pronunciation,
      streak: stats.streak,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,day" },
  );
}

export async function pushMistakeToCloud(m: StoredMistake) {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return;
  await supabase.from("quran_mistakes").insert({
    user_id: uid,
    surah: m.surah,
    ayah: m.ayah,
    word_index: m.wordIndex,
    word: m.word,
    rule: m.rule,
    severity: m.severity,
    explanation: m.explanation,
    corrected: m.corrected,
  });
}
