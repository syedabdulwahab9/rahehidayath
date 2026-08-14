/**
 * Daily Good Deeds & Sunnah tracker.
 *
 * Everything lives on this device. Each day keeps its own record, so the
 * tracker looks empty every new day while the whole history is preserved.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

export type DeedCategory = {
  id: string;
  title: string;
  emoji: string;
  deeds: Deed[];
};

export type Deed = {
  id: string;
  label: string;
  /** short explanation of why this deed matters */
  why: string;
  /** hadith or Quran reference when there is one */
  ref?: string;
};

export const DEED_CATEGORIES: DeedCategory[] = [
  {
    id: "morning",
    title: "Morning Deeds",
    emoji: "🌅",
    deeds: [
      { id: "m1", label: "Wake up Dua", why: "The first words of the day return the soul to Allah.", ref: "Bukhari 6312" },
      { id: "m2", label: "Say Alhamdulillah after waking", why: "Gratitude for another day of life and another chance." , ref: "Bukhari 6312" },
      { id: "m3", label: "Use Miswak", why: "A Sunnah loved by the Prophet ﷺ — purity of the mouth.", ref: "Bukhari 887" },
      { id: "m4", label: "Perform Wudu", why: "Wudu washes away small sins with the water.", ref: "Muslim 244" },
      { id: "m5", label: "Pray Fajr Sunnah", why: "Better than the world and all it contains.", ref: "Muslim 725" },
      { id: "m6", label: "Pray Fajr Farḍ", why: "Whoever prays Fajr is under the protection of Allah.", ref: "Muslim 657" },
      { id: "m7", label: "Morning Adhkar", why: "A fortress of remembrance around your whole day.", ref: "Quran 33:41" },
      { id: "m8", label: "Read Qur'an", why: "Ten rewards for every single letter recited.", ref: "Tirmidhi 2910" },
      { id: "m9", label: "Make Dhikr", why: "Hearts find rest only in the remembrance of Allah.", ref: "Quran 13:28" },
      { id: "m10", label: "Send Salawat upon the Prophet ﷺ", why: "One salawat brings ten mercies from Allah.", ref: "Muslim 408" },
      { id: "m11", label: "Ask Allah for forgiveness", why: "The Prophet ﷺ sought forgiveness 100 times a day.", ref: "Muslim 2702" },
      { id: "m12", label: "Smile at someone", why: "Your smile in your brother's face is charity.", ref: "Tirmidhi 1956" },
      { id: "m13", label: "Give Salam", why: "Spread salam and you will love one another.", ref: "Muslim 54" },
    ],
  },
  {
    id: "prayer",
    title: "Prayer Tracker",
    emoji: "🕌",
    deeds: [
      { id: "p1", label: "Answer the Adhan", why: "Repeat after the muadhin word for word.", ref: "Bukhari 611" },
      { id: "p2", label: "Dua after Adhan", why: "Intercession of the Prophet ﷺ becomes due for you.", ref: "Bukhari 614" },
      { id: "p3", label: "Go to the Masjid (if applicable)", why: "Every step to the masjid raises a rank.", ref: "Muslim 666" },
      { id: "p4", label: "Sunnah before prayer", why: "A house is built in Jannah for 12 rakah a day.", ref: "Muslim 728" },
      { id: "p5", label: "Farḍ prayer", why: "The first deed judged on the Day of Judgement.", ref: "Tirmidhi 413" },
      { id: "p6", label: "Sunnah after prayer", why: "It completes and repairs the farḍ.", ref: "Muslim 728" },
      { id: "p7", label: "Dhikr after Salah", why: "33 SubhanAllah, 33 Alhamdulillah, 34 Allahu Akbar.", ref: "Muslim 596" },
      { id: "p8", label: "Ayatul Kursi", why: "Nothing stands between you and Jannah but death.", ref: "Nasa'i 9928" },
    ],
  },
  {
    id: "eating",
    title: "Eating Sunnahs",
    emoji: "🍽",
    deeds: [
      { id: "e1", label: "Say Bismillah", why: "It keeps shaytan away from your food.", ref: "Muslim 2017" },
      { id: "e2", label: "Eat with right hand", why: "The Prophet ﷺ commanded eating with the right hand.", ref: "Muslim 2020" },
      { id: "e3", label: "Eat moderately", why: "A third food, a third drink, a third air.", ref: "Tirmidhi 2380" },
      { id: "e4", label: "Drink while sitting", why: "The Sunnah way of drinking.", ref: "Muslim 2024" },
      { id: "e5", label: "Say Alhamdulillah after eating", why: "Allah is pleased with the servant who thanks Him.", ref: "Muslim 2734" },
    ],
  },
  {
    id: "character",
    title: "Character & Manners",
    emoji: "❤️",
    deeds: [
      { id: "c1", label: "Smiled at others", why: "A smile is a charity you can always afford.", ref: "Tirmidhi 1956" },
      { id: "c2", label: "Spoke kindly", why: "A good word is charity.", ref: "Bukhari 2989" },
      { id: "c3", label: "Controlled anger", why: "The strong one controls himself when angry.", ref: "Bukhari 6114" },
      { id: "c4", label: "Avoided backbiting", why: "Do not backbite one another.", ref: "Quran 49:12" },
      { id: "c5", label: "Lowered my gaze", why: "Tell the believers to lower their gaze.", ref: "Quran 24:30" },
      { id: "c6", label: "Kept my promises", why: "Breaking a promise is a sign of hypocrisy.", ref: "Bukhari 33" },
      { id: "c7", label: "Told the truth", why: "Truthfulness leads to righteousness.", ref: "Bukhari 6094" },
      { id: "c8", label: "Showed patience", why: "Allah is with the patient.", ref: "Quran 2:153" },
      { id: "c9", label: "Avoided wasting time", why: "Two blessings many people lose: health and free time.", ref: "Bukhari 6412" },
      { id: "c10", label: "Helped someone", why: "Allah helps the servant as long as he helps his brother.", ref: "Muslim 2699" },
      { id: "c11", label: "Forgave someone", why: "Let them pardon and overlook.", ref: "Quran 24:22" },
    ],
  },
  {
    id: "family",
    title: "Family",
    emoji: "👨‍👩‍👧",
    deeds: [
      { id: "f1", label: "Spoke kindly to parents", why: "Do not say to them even 'uff'.", ref: "Quran 17:23" },
      { id: "f2", label: "Helped parents", why: "Jannah lies at the feet of your mother.", ref: "Nasa'i 3104" },
      { id: "f3", label: "Made dua for parents", why: "My Lord, have mercy upon them as they raised me.", ref: "Quran 17:24" },
      { id: "f4", label: "Visited relatives", why: "Keeping ties extends life and provision.", ref: "Bukhari 5986" },
      { id: "f5", label: "Helped spouse", why: "The Prophet ﷺ helped his family at home.", ref: "Bukhari 676" },
      { id: "f6", label: "Played with children kindly", why: "He who does not show mercy is not shown mercy.", ref: "Bukhari 5997" },
    ],
  },
  {
    id: "worship",
    title: "Worship",
    emoji: "🤲",
    deeds: [
      { id: "w1", label: "Read Qur'an", why: "The Quran will intercede for its companion.", ref: "Muslim 804" },
      { id: "w2", label: "Memorized an Ayah", why: "Carry the words of Allah in your heart.", ref: "Bukhari 5027" },
      { id: "w3", label: "Learned Islamic knowledge", why: "Allah makes the path to Jannah easy for the seeker.", ref: "Muslim 2699" },
      { id: "w4", label: "Taught someone", why: "The best of you learn the Quran and teach it.", ref: "Bukhari 5027" },
      { id: "w5", label: "Made Istighfar", why: "Istighfar opens a way out of every difficulty.", ref: "Abu Dawud 1518" },
      { id: "w6", label: "Made Dhikr", why: "Two words light on the tongue, heavy on the scale.", ref: "Bukhari 6682" },
      { id: "w7", label: "Sent Salawat", why: "The closest to me are those who send most salawat.", ref: "Tirmidhi 484" },
      { id: "w8", label: "Made Dua", why: "Dua is worship itself.", ref: "Tirmidhi 3372" },
      { id: "w9", label: "Gave Charity", why: "Charity does not decrease wealth.", ref: "Muslim 2588" },
      { id: "w10", label: "Helped someone for Allah's sake", why: "The best people are the most useful to others.", ref: "Tabarani" },
    ],
  },
  {
    id: "evening",
    title: "Evening",
    emoji: "🌙",
    deeds: [
      { id: "n1", label: "Evening Adhkar", why: "Protection for the whole night.", ref: "Abu Dawud 5074" },
      { id: "n2", label: "Pray Witr", why: "Make the last of your night prayer witr.", ref: "Bukhari 998" },
      { id: "n3", label: "Read Surah Al-Mulk", why: "It protects its reciter from the punishment of the grave.", ref: "Tirmidhi 2891" },
      { id: "n4", label: "Read Ayatul Kursi", why: "A guardian stays with you until morning.", ref: "Bukhari 2311" },
      { id: "n5", label: "Read the last two verses of Surah Al-Baqarah", why: "They suffice whoever recites them at night.", ref: "Bukhari 5009" },
      { id: "n6", label: "Sleep on right side", why: "The Sunnah posture of sleeping.", ref: "Bukhari 247" },
      { id: "n7", label: "Sleeping Dua", why: "In Your name, O Allah, I die and I live.", ref: "Bukhari 6324" },
    ],
  },
];

export const ALL_DEEDS = DEED_CATEGORIES.flatMap((c) => c.deeds.map((d) => ({ ...d, category: c.id })));
export const TOTAL_DEEDS = ALL_DEEDS.length;

export type DeedEntry = { at: number; note?: string };
export type DayRecord = Record<string, DeedEntry>;
export type DeedLog = Record<string, DayRecord>;

export type Goal = { id: string; label: string; done: boolean; remind?: boolean };

const LOG_KEY = "reh-deeds-log";
const GOAL_KEY = "reh-deeds-goals";
const PREF_KEY = "reh-deeds-reset";

export const dayIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const ENCOURAGEMENTS = [
  "May Allah accept your efforts.",
  "Every sincere deed, even a smile, is rewarded.",
  "Consistency in small deeds is beloved to Allah.",
  "Little and lasting is better than much and broken.",
  "Your Lord sees what no one else sees.",
];

export function useDeedTracker() {
  const [log, setLog] = useState<DeedLog>({});
  const [goals, setGoals] = useState<Goal[]>([]);
  const [resetAtMidnight, setResetAtMidnight] = useState(true);
  const [mounted, setMounted] = useState(false);
  const today = dayIso(new Date());

  useEffect(() => {
    setLog(read<DeedLog>(LOG_KEY, {}));
    setGoals(read<Goal[]>(GOAL_KEY, []));
    setResetAtMidnight(read<boolean>(PREF_KEY, true));
    setMounted(true);
  }, []);

  const todayRecord = log[today] ?? {};

  const writeLog = useCallback((next: DeedLog) => {
    setLog(next);
    save(LOG_KEY, next);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setLog((prev) => {
        const day = { ...(prev[today] ?? {}) };
        if (day[id]) delete day[id];
        else day[id] = { at: Date.now() };
        const next = { ...prev, [today]: day };
        save(LOG_KEY, next);
        return next;
      });
    },
    [today],
  );

  const setNote = useCallback(
    (id: string, note: string) => {
      setLog((prev) => {
        const day = { ...(prev[today] ?? {}) };
        const entry = day[id] ?? { at: Date.now() };
        day[id] = { ...entry, note };
        const next = { ...prev, [today]: day };
        save(LOG_KEY, next);
        return next;
      });
    },
    [today],
  );

  const addGoal = useCallback((label: string, remind = false) => {
    setGoals((prev) => {
      const next = [...prev, { id: `g${Date.now()}`, label, done: false, remind }];
      save(GOAL_KEY, next);
      return next;
    });
  }, []);

  const toggleGoal = useCallback((id: string) => {
    setGoals((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
      save(GOAL_KEY, next);
      return next;
    });
  }, []);

  const removeGoal = useCallback((id: string) => {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      save(GOAL_KEY, next);
      return next;
    });
  }, []);

  const setResetPref = useCallback((value: boolean) => {
    setResetAtMidnight(value);
    save(PREF_KEY, value);
  }, []);

  const countIn = useCallback(
    (record: DayRecord, categoryId: string) =>
      (DEED_CATEGORIES.find((c) => c.id === categoryId)?.deeds ?? []).filter((d) => record[d.id]).length,
    [],
  );

  const summary = useMemo(() => {
    const total = Object.keys(todayRecord).length;
    return {
      total,
      percent: Math.round((total / TOTAL_DEEDS) * 100),
      salah: countIn(todayRecord, "prayer"),
      sunnah: countIn(todayRecord, "morning") + countIn(todayRecord, "eating") + countIn(todayRecord, "evening"),
      worship: countIn(todayRecord, "worship"),
      character: countIn(todayRecord, "character"),
      family: countIn(todayRecord, "family"),
    };
  }, [todayRecord, countIn]);

  const history = useMemo(() => {
    const days = Object.entries(log).sort(([a], [b]) => (a < b ? -1 : 1));
    const totalsByDay = new Map(days.map(([d, rec]) => [d, Object.keys(rec).length]));

    const lastN = (n: number) => {
      const out: { date: string; n: number }[] = [];
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = dayIso(d);
        out.push({ date: key, n: totalsByDay.get(key) ?? 0 });
      }
      return out;
    };

    let streak = 0;
    const cursor = new Date();
    if (!totalsByDay.get(dayIso(cursor))) cursor.setDate(cursor.getDate() - 1);
    while ((totalsByDay.get(dayIso(cursor)) ?? 0) > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const counts = new Map<string, number>();
    for (const [, rec] of days) for (const id of Object.keys(rec)) counts.set(id, (counts.get(id) ?? 0) + 1);
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const label = (id: string) => ALL_DEEDS.find((d) => d.id === id)?.label ?? id;

    return {
      week: lastN(7),
      month: lastN(30),
      year: lastN(365),
      streak,
      totalDays: days.length,
      allTime: days.reduce((n, [, rec]) => n + Object.keys(rec).length, 0),
      mostConsistent: ranked.slice(0, 5).map(([id, n]) => ({ label: label(id), n })),
      missed: ALL_DEEDS.filter((d) => !counts.has(d.id)).slice(0, 6).map((d) => d.label),
      totalsByDay,
    };
  }, [log]);

  return {
    mounted,
    today,
    todayRecord,
    toggle,
    setNote,
    summary,
    history,
    goals,
    addGoal,
    toggleGoal,
    removeGoal,
    resetAtMidnight,
    setResetPref,
    writeLog,
    log,
  };
}
