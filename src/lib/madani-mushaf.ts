/**
 * Authentic 15-line Madani Mushaf.
 *
 * Instead of guessing where lines break (the old approach repacked an ayah
 * stream using character counts), this reads the real line-by-line layout of
 * the printed 604-page Madani Mushaf: every word carries the exact
 * `line_number` of the printed page it sits on, so a page rendered here has
 * the same 15 lines, in the same order, with the same words as the paper copy.
 */

const API = "https://api.quran.com/api/v4";

export const MADANI_PAGES = 604;
export const MADANI_LINES = 15;

export type MushafWord = {
  id: number;
  text: string;
  /** Ayah key like "2:255" — null for the ﴿٢٥٥﴾ end-of-ayah marker. */
  verseKey: string | null;
  isAyahMarker: boolean;
};

export type MushafLine =
  | { kind: "words"; line: number; words: MushafWord[]; centered: boolean }
  | { kind: "surah"; line: number; surah: number }
  | { kind: "basmalah"; line: number };

export type MushafPageData = {
  page: number;
  juz: number;
  lines: MushafLine[];
  /** Surahs that appear anywhere on this page, in order. */
  surahs: number[];
  /** verseKey -> ayah text, for translation / transliteration lookups. */
  verseKeys: string[];
};

export type SurahMeta = {
  id: number;
  nameArabic: string;
  nameSimple: string;
  translated: string;
  versesCount: number;
  revelationPlace: string;
  bismillahPre: boolean;
  firstPage: number;
};

/* ------------------------------------------------------------------ surahs */

let surahCache: SurahMeta[] | null = null;

export async function fetchSurahs(): Promise<SurahMeta[]> {
  if (surahCache) return surahCache;
  const res = await fetch(`${API}/chapters?language=en`);
  if (!res.ok) throw new Error("Could not load the surah index.");
  const json = (await res.json()) as {
    chapters: Array<{
      id: number;
      name_arabic: string;
      name_simple: string;
      translated_name: { name: string };
      verses_count: number;
      revelation_place: string;
      bismillah_pre: boolean;
      pages: number[];
    }>;
  };
  surahCache = json.chapters.map((c) => ({
    id: c.id,
    nameArabic: c.name_arabic,
    nameSimple: c.name_simple,
    translated: c.translated_name?.name ?? "",
    versesCount: c.verses_count,
    revelationPlace: c.revelation_place,
    bismillahPre: c.bismillah_pre,
    firstPage: c.pages?.[0] ?? 1,
  }));
  return surahCache;
}

/* -------------------------------------------------------------------- page */

type ApiWord = {
  id: number;
  position: number;
  char_type_name: string;
  text_uthmani?: string;
  text?: string;
  line_number: number;
};

type ApiVerse = {
  verse_key: string;
  verse_number: number;
  juz_number: number;
  page_number: number;
  words: ApiWord[];
};

const pageCache = new Map<number, MushafPageData>();

/** Surahs whose first page starts mid-page never need a header line. */
function buildLines(verses: ApiVerse[], surahs: SurahMeta[], page: number): MushafLine[] {
  const byLine = new Map<number, MushafWord[]>();
  const firstLineOfSurah = new Map<number, number>();

  for (const v of verses) {
    const surah = Number(v.verse_key.split(":")[0]);
    for (const w of v.words) {
      const marker = w.char_type_name === "end";
      const text = w.text_uthmani ?? w.text ?? "";
      if (!text) continue;
      const bucket = byLine.get(w.line_number) ?? [];
      bucket.push({
        id: w.id,
        text,
        verseKey: marker ? null : v.verse_key,
        isAyahMarker: marker,
      });
      byLine.set(w.line_number, bucket);
      if (v.verse_number === 1 && !marker && !firstLineOfSurah.has(surah)) {
        firstLineOfSurah.set(surah, w.line_number);
      }
    }
  }

  /* Empty printed lines are the ornamental surah header and the basmalah.
     Assign them upwards from the first line of each new surah. */
  const decoration = new Map<number, MushafLine>();
  for (const [surah, startLine] of firstLineOfSurah) {
    const meta = surahs.find((s) => s.id === surah);
    const free: number[] = [];
    for (let l = startLine - 1; l >= 1 && free.length < 2; l--) {
      if (byLine.has(l) || decoration.has(l)) break;
      free.unshift(l);
    }
    if (!free.length) continue;
    const wantsBasmalah = meta?.bismillahPre !== false && surah !== 1 && surah !== 9;
    if (free.length >= 2 && wantsBasmalah) {
      decoration.set(free[0]!, { kind: "surah", line: free[0]!, surah });
      decoration.set(free[1]!, { kind: "basmalah", line: free[1]! });
    } else {
      decoration.set(free[free.length - 1]!, { kind: "surah", line: free[free.length - 1]!, surah });
    }
  }

  const lines: MushafLine[] = [];
  for (let l = 1; l <= MADANI_LINES; l++) {
    const deco = decoration.get(l);
    if (deco) {
      lines.push(deco);
      continue;
    }
    const words = byLine.get(l);
    if (!words?.length) continue;
    /* The last line of a surah, and both pages of al-Fatiha / the opening of
       al-Baqarah, are centred rather than stretched to the full measure. */
    const isShort = words.length <= 4;
    const nextHasWords = byLine.has(l + 1);
    lines.push({
      kind: "words",
      line: l,
      words,
      centered: page <= 2 || (!nextHasWords && isShort) || isShort,
    });
  }
  return lines;
}

export async function fetchMushafPage(page: number): Promise<MushafPageData> {
  const clamped = Math.min(Math.max(1, Math.round(page)), MADANI_PAGES);
  const cached = pageCache.get(clamped);
  if (cached) return cached;

  const surahs = await fetchSurahs();
  const url =
    `${API}/verses/by_page/${clamped}?words=true&per_page=50` +
    `&word_fields=text_uthmani,line_number,char_type_name&fields=juz_number,page_number`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load this mushaf page.");
  const json = (await res.json()) as { verses: ApiVerse[] };
  const verses = json.verses ?? [];

  const data: MushafPageData = {
    page: clamped,
    juz: verses[0]?.juz_number ?? 1,
    lines: buildLines(verses, surahs, clamped),
    surahs: [...new Set(verses.map((v) => Number(v.verse_key.split(":")[0])))],
    verseKeys: verses.map((v) => v.verse_key),
  };
  pageCache.set(clamped, data);
  return data;
}

/** Quietly warm the next / previous page so turning feels instant. */
export function prefetchMushafPages(page: number) {
  for (const p of [page + 1, page + 2, page - 1]) {
    if (p >= 1 && p <= MADANI_PAGES && !pageCache.has(p)) void fetchMushafPage(p).catch(() => {});
  }
}

/* ------------------------------------------------------- juz / page lookup */

export const JUZ_START_PAGE = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322,
  342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

export function pageForJuz(juz: number) {
  return JUZ_START_PAGE[Math.min(Math.max(1, juz), 30) - 1] ?? 1;
}
