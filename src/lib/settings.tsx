import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLanguage, type LangCode } from "./islamic-data";
import { applyAppearance, type Appearance } from "./appearance";

export type ReadingHistoryEntry = { at: number; label: string; href: string };

export type Settings = Appearance & {
  lang: LangCode;

  /* ---- Quran reading preferences (13 & 15 line mushaf + surah reader) ---- */
  translationEdition: string; // "auto" or an alquran.cloud edition id
  tafsirSlug: string; // "auto" or a tafsir_api slug
  reciter: string;
  voiceProfile: string;
  audioQuality: 32 | 64 | 128 | 192;
  playbackSpeed: number;
  repeatVerses: number;
  autoScroll: boolean;
  tajweedColors: boolean;
  showTransliteration: boolean;
  wordByWord: boolean;
  memorization: boolean;
  dailyGoalPages: number;
  dailyVerseNotifications: boolean;
  offlineDownloads: boolean;
  keepHistory: boolean;
  autoBookmark: boolean;

  arabicSize: number;

  /* ---- Saved state ---- */
  lastRead: { lines: 13 | 15; page: number } | null;
  /** Saved page of the 13 line Quran-e-Pak, kept apart from the 15 line one. */
  lastRead13: { lines: 13; page: number } | null;
  /** Last surah the reader had open, so reading can be continued later. */
  lastSurah: { number: number; name: string; translation: string; ayah: number; total: number } | null;
  history: ReadingHistoryEntry[];
  /** progress against the daily reading goal */
  readToday: { date: string; pages: number };

  /* ---- Prayer times ---- */
  city: string;
  country: string;
  /** Exact coordinates when the visitor's location is known — most accurate. */
  coords: { lat: number; lng: number } | null;
  /** "auto" = follow the visitor's device/IP location, "manual" = user chose. */
  locationMode: "auto" | "manual";
  method: number;
  /** Asr calculation: 0 = Standard (Shafi/Maliki/Hanbali), 1 = Hanafi */
  school: number;
};

export const DEFAULTS: Settings = {
  // appearance
  theme: "light",
  themeColor: "emerald",
  accentColor: "gold",
  backdropCircle: "auto",
  backdropCircleVisible: true,
  backdropCircleStrength: 0.05,
  uiFont: "jakarta",
  fontSize: 16,
  quranFont: "amiri-quran",
  arabicFont: "amiri-quran",
  urduFont: "nastaliq",
  lineSpacing: 2.3,
  readingWidth: "medium",
  rounded: 1,
  animation: "full",
  glass: true,
  compact: false,

  lang: "en",

  translationEdition: "auto",
  tafsirSlug: "auto",
  reciter: "ar.alafasy",
  voiceProfile: "scholar",
  audioQuality: 128,
  playbackSpeed: 1,
  repeatVerses: 1,
  autoScroll: true,
  tajweedColors: false,
  showTransliteration: true,
  wordByWord: false,
  memorization: false,
  dailyGoalPages: 4,
  dailyVerseNotifications: false,
  offlineDownloads: false,
  keepHistory: true,
  autoBookmark: true,

  arabicSize: 30,

  lastRead: null,
  lastRead13: null,
  lastSurah: null,
  history: [],
  readToday: { date: "", pages: 0 },

  city: "Hyderabad",
  country: "India",
  coords: null,
  locationMode: "auto",
  method: 1,
  school: 1,
};

const KEY = "rah-e-hidayath-settings";

type Ctx = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  pushHistory: (entry: Omit<ReadingHistoryEntry, "at">) => void;
};

const SettingsContext = createContext<Ctx>({
  settings: DEFAULTS,
  update: () => {},
  reset: () => {},
  pushHistory: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    applyAppearance(settings);
  }, [settings]);

  /* Auto theme has to follow the device in real time. */
  useEffect(() => {
    if (settings.theme !== "auto" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyAppearance(settings);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings]);

  const persist = useCallback((next: Settings) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((prev) => persist({ ...prev, ...patch })),
    [persist],
  );

  const pushHistory = useCallback(
    (entry: Omit<ReadingHistoryEntry, "at">) =>
      setSettings((prev) => {
        if (!prev.keepHistory) return prev;
        const item: ReadingHistoryEntry = { ...entry, at: Date.now() };
        const history = [item, ...prev.history.filter((h) => h.href !== entry.href)].slice(0, 40);
        return persist({ ...prev, history });
      }),
    [persist],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setSettings(DEFAULTS);
  }, []);

  const value = useMemo(
    () => ({ settings, update, reset, pushHistory }),
    [settings, update, reset, pushHistory],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
export const useLang = () => getLanguage(useSettings().settings.lang);
