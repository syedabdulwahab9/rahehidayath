/**
 * 13 line Quran-e-Pak — Indo-Pak (Persian) script.
 *
 * A deliberately different reading experience from the 15 line Madani Mushaf:
 * the same complete Quran, but set in the Indo-Pak script the subcontinent
 * reads from, re-flowed into thirteen generous lines per page.
 */

const API = "https://api.quran.com/api/v4";

export const INDOPAK_PAGES = 604;
export const INDOPAK_LINES = 13;

export type IndoWord = {
  id: number;
  text: string;
  verseKey: string | null;
  isAyahMarker: boolean;
};

export type IndoLine =
  | { kind: "words"; line: number; words: IndoWord[]; centered: boolean }
  | { kind: "surah"; line: number; surah: number }
  | { kind: "basmalah"; line: number };

export type IndoPageData = {
  page: number;
  juz: number;
  lines: IndoLine[];
  surahs: number[];
};

type ApiWord = {
  id: number;
  char_type_name: string;
  text_indopak?: string;
  text?: string;
};

type ApiVerse = {
  verse_key: string;
  verse_number: number;
  juz_number: number;
  words: ApiWord[];
};

const cache = new Map<number, IndoPageData>();

type Block = { type: "surah"; surah: number } | { type: "basmalah" } | { type: "words"; words: IndoWord[] };

const weight = (w: IndoWord) => w.text.length + 1;

/** Pack a run of words into `slots` visually even lines. */
function packWords(words: IndoWord[], slots: number): IndoWord[][] {
  if (slots <= 1 || words.length <= 1) return [words];
  const total = words.reduce((n, w) => n + weight(w), 0);
  const target = total / slots;
  const out: IndoWord[][] = [];
  let current: IndoWord[] = [];
  let acc = 0;
  for (const w of words) {
    current.push(w);
    acc += weight(w);
    if (acc >= target && out.length < slots - 1) {
      out.push(current);
      current = [];
      acc = 0;
    }
  }
  if (current.length) out.push(current);
  while (out.length < slots) out.push([]);
  return out;
}

export async function fetchIndopakPage(page: number): Promise<IndoPageData> {
  const clamped = Math.min(Math.max(1, Math.round(page)), INDOPAK_PAGES);
  const cached = cache.get(clamped);
  if (cached) return cached;

  const url =
    `${API}/verses/by_page/${clamped}?words=true&per_page=50` +
    `&word_fields=text_indopak,char_type_name&fields=juz_number`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load this page of the 13 line Quran.");
  const json = (await res.json()) as { verses: ApiVerse[] };
  const verses = json.verses ?? [];

  /* Build an ordered block stream: surah headers, basmalah, and word runs. */
  const blocks: Block[] = [];
  let run: IndoWord[] = [];
  const flush = () => {
    if (run.length) blocks.push({ type: "words", words: run });
    run = [];
  };

  for (const v of verses) {
    const surah = Number(v.verse_key.split(":")[0]);
    if (v.verse_number === 1) {
      flush();
      blocks.push({ type: "surah", surah });
      if (surah !== 1 && surah !== 9) blocks.push({ type: "basmalah" });
    }
    for (const w of v.words) {
      const marker = w.char_type_name === "end";
      const text = w.text_indopak ?? w.text ?? "";
      if (!text.trim()) continue;
      run.push({ id: w.id, text, verseKey: marker ? null : v.verse_key, isAyahMarker: marker });
    }
  }
  flush();

  const decorations = blocks.filter((b) => b.type !== "words").length;
  const wordRuns = blocks.filter((b): b is Extract<Block, { type: "words" }> => b.type === "words");
  const totalChars = wordRuns.reduce((n, r) => n + r.words.reduce((m, w) => m + weight(w), 0), 0) || 1;
  const available = Math.max(1, INDOPAK_LINES - decorations);

  /* Give each word run a share of the remaining lines, by its length. */
  const shares = wordRuns.map((r) => r.words.reduce((m, w) => m + weight(w), 0) / totalChars);
  const slots = shares.map((s) => Math.max(1, Math.round(s * available)));
  let drift = slots.reduce((a, b) => a + b, 0) - available;
  for (let i = slots.length - 1; i >= 0 && drift > 0; i--) {
    const take = Math.min(drift, (slots[i] as number) - 1);
    slots[i] = (slots[i] as number) - take;
    drift -= take;
  }
  while (drift < 0 && slots.length) {
    const biggest = shares.indexOf(Math.max(...shares));
    slots[biggest] = (slots[biggest] as number) + 1;
    drift += 1;
  }

  const lines: IndoLine[] = [];
  let runIndex = 0;
  let n = 0;
  for (const b of blocks) {
    if (b.type === "surah") {
      lines.push({ kind: "surah", line: ++n, surah: b.surah });
    } else if (b.type === "basmalah") {
      lines.push({ kind: "basmalah", line: ++n });
    } else {
      const packed = packWords(b.words, slots[runIndex] ?? 1);
      runIndex += 1;
      packed.forEach((words, i) => {
        if (!words.length) return;
        lines.push({
          kind: "words",
          line: ++n,
          words,
          centered: clamped <= 2 || (i === packed.length - 1 && words.length <= 4),
        });
      });
    }
  }

  const data: IndoPageData = {
    page: clamped,
    juz: verses[0]?.juz_number ?? 1,
    lines,
    surahs: [...new Set(verses.map((v) => Number(v.verse_key.split(":")[0])))],
  };
  cache.set(clamped, data);
  return data;
}

export function prefetchIndopakPages(page: number) {
  for (const p of [page + 1, page + 2, page - 1]) {
    if (p >= 1 && p <= INDOPAK_PAGES && !cache.has(p)) void fetchIndopakPage(p).catch(() => {});
  }
}
