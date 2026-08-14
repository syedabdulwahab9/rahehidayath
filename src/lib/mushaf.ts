import { resolveTranslation } from "./islamic-data";
import { idbGet, idbSet } from "./offline";

const AQ = "https://api.alquran.cloud/v1";

export type FullAyah = {
  /** global ayah number 1–6236 */
  number: number;
  surah: number;
  surahName: string;
  surahEnglish: string;
  numberInSurah: number;
  juz: number;
  /** Madani mushaf page (1–604) */
  madaniPage: number;
  arabic: string;
  translation: string;
};

type QuranEditionResponse = {
  data: {
    surahs: Array<{
      number: number;
      name: string;
      englishName: string;
      ayahs: Array<{ number: number; numberInSurah: number; text: string; juz: number; page: number }>;
    }>;
  };
};

async function j<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

/** The complete Quran (all 6,236 ayahs) with the translation of the chosen language. */
export async function fetchFullQuran(langCode: string, translationPref = "auto"): Promise<FullAyah[]> {
  const edition = resolveTranslation(langCode, translationPref);
  const cacheKey = `quran:${edition}`;
  const cached = await idbGet<FullAyah[]>(cacheKey);
  if (cached?.length) return cached;
  const [ar, tr] = await Promise.all([
    j<QuranEditionResponse>(`${AQ}/quran/quran-uthmani`),
    j<QuranEditionResponse>(`${AQ}/quran/${edition}`),
  ]);

  const translations = new Map<number, string>();
  for (const s of tr.data.surahs) for (const a of s.ayahs) translations.set(a.number, a.text);

  const out: FullAyah[] = [];
  for (const s of ar.data.surahs) {
    for (const a of s.ayahs) {
      out.push({
        number: a.number,
        surah: s.number,
        surahName: s.name,
        surahEnglish: s.englishName,
        numberInSurah: a.numberInSurah,
        juz: a.juz,
        madaniPage: a.page,
        arabic: a.text,
        translation: translations.get(a.number) ?? "",
      });
    }
  }
  return out;
}

export type MushafPage = {
  page: number;
  ayahs: FullAyah[];
};

/** Saves the whole Quran (with the chosen translation) for offline reading. */
export async function downloadForOffline(langCode: string, translationPref = "auto") {
  const edition = resolveTranslation(langCode, translationPref);
  const data = await fetchFullQuran(langCode, translationPref);
  await idbSet(`quran:${edition}`, data);
  return data.length;
}

/** Word-for-word English transliteration, loaded only when the user asks. */
export async function fetchTransliteration(): Promise<Map<number, string>> {
  const cached = await idbGet<Array<[number, string]>>("translit:en");
  if (cached?.length) return new Map(cached);
  const d = await j<QuranEditionResponse>(`${AQ}/quran/en.transliteration`);
  const map = new Map<number, string>();
  for (const s of d.data.surahs) for (const a of s.ayahs) map.set(a.number, a.text);
  void idbSet("translit:en", [...map.entries()]);
  return map;
}

/** Characters that comfortably fit on one line of the mushaf frame. */
const CHARS_PER_LINE: Record<13 | 15, number> = { 13: 30, 15: 34 };

function linesFor(text: string, charsPerLine: number) {
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

/**
 * Builds the printed-mushaf pages.
 * - 15 lines uses the authentic Madani mushaf pagination (604 pages).
 * - 13 lines repacks the same ayah stream into 13-line Indo-Pak style pages.
 */
export function buildPages(ayahs: FullAyah[], lines: 13 | 15): MushafPage[] {
  if (!ayahs.length) return [];

  if (lines === 15) {
    const map = new Map<number, FullAyah[]>();
    for (const a of ayahs) {
      const arr = map.get(a.madaniPage) ?? [];
      arr.push(a);
      map.set(a.madaniPage, arr);
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([page, list]) => ({ page, ayahs: list }));
  }

  const perLine = CHARS_PER_LINE[13];
  const pages: MushafPage[] = [];
  let cur: FullAyah[] = [];
  let used = 0;
  for (const a of ayahs) {
    const need = linesFor(a.arabic, perLine);
    if (used + need > 13 && cur.length) {
      pages.push({ page: pages.length + 1, ayahs: cur });
      cur = [];
      used = 0;
    }
    cur.push(a);
    used += need;
  }
  if (cur.length) pages.push({ page: pages.length + 1, ayahs: cur });
  return pages;
}
