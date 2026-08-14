import { getLanguage, getReciter, resolveTafsir, resolveTranslation } from "./islamic-data";

const AQ = "https://api.alquran.cloud/v1";

export type SurahMeta = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

export type Ayah = {
  number: number;
  numberInSurah: number;
  arabic: string;
  translation: string;
  transliteration?: string;
  juz: number;
  page: number;
};

async function j<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

export async function fetchSurahList(): Promise<SurahMeta[]> {
  const d = await j<{ data: SurahMeta[] }>(`${AQ}/surah`);
  return d.data;
}

type EditionAyah = { number: number; numberInSurah: number; text: string; juz: number; page: number };

export async function fetchSurah(surah: number, langCode: string, translationPref = "auto") {
  const editions = ["quran-uthmani", resolveTranslation(langCode, translationPref), "en.transliteration"].join(",");
  const d = await j<{
    data: Array<{ ayahs: EditionAyah[]; edition: { identifier: string } } & SurahMeta>;
  }>(`${AQ}/surah/${surah}/editions/${editions}`);

  const [ar, tr, translit] = d.data;
  const meta = ar as unknown as SurahMeta;
  const ayahs: Ayah[] = (ar?.ayahs ?? []).map((a, i) => ({
    number: a.number,
    numberInSurah: a.numberInSurah,
    arabic: a.text,
    translation: tr?.ayahs?.[i]?.text ?? "",
    transliteration: translit?.ayahs?.[i]?.text ?? "",
    juz: a.juz,
    page: a.page,
  }));
  return { meta, ayahs };
}

export function ayahAudioUrl(globalAyahNumber: number, reciter: string, quality?: number) {
  const r = getReciter(reciter);
  /* Only bitrates the reciter is actually published in can be requested. */
  const bitrate = quality && quality <= r.bitrate ? quality : r.bitrate;
  return `https://cdn.islamic.network/quran/audio/${bitrate}/${r.id}/${globalAyahNumber}.mp3`;
}

/** Ayah audio for a translation edition (e.g. Urdu translation recitation). */
export function translationAudioUrl(globalAyahNumber: number, editionId: string) {
  return `https://cdn.islamic.network/quran/audio/64/${editionId}/${globalAyahNumber}.mp3`;
}

/** A single Madani mushaf page (1–604) with its ayah text. */
export type MushafAyah = {
  number: number;
  numberInSurah: number;
  text: string;
  surah: { number: number; name: string; englishName: string };
};

export async function fetchMushafPage(page: number, langCode: string) {
  const lang = getLanguage(langCode);
  const d = await j<{
    data: Array<{ ayahs: MushafAyah[]; edition: { identifier: string } }>;
  }>(`${AQ}/page/${page}/editions/quran-uthmani,${lang.quranEdition}`);
  const arabic = d.data[0]?.ayahs ?? [];
  const translated = d.data[1]?.ayahs ?? [];
  return arabic.map((a, i) => ({ ...a, translation: translated[i]?.text ?? "" }));
}

export async function fetchTafsir(surah: number, ayah: number, langCode: string, tafsirPref = "auto") {
  const slug = resolveTafsir(langCode, tafsirPref);
  const url = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${slug}/${surah}/${ayah}.json`;
  try {
    const d = await j<{ text: string }>(url);
    return d.text;
  } catch {
    const fb = await j<{ text: string }>(
      `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafisr-ibn-kathir/${surah}/${ayah}.json`,
    );
    return fb.text;
  }
}

export async function searchQuran(query: string, langCode: string) {
  const lang = getLanguage(langCode);
  const d = await j<{
    data: { matches?: Array<{ surah: SurahMeta; numberInSurah: number; text: string }> };
  }>(`${AQ}/search/${encodeURIComponent(query)}/all/${lang.quranEdition}`);
  return d.data.matches ?? [];
}

/* ---- Hadith (fawazahmed0 hadith-api) ---- */
const HD = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

export type HadithItem = { hadithnumber: number; text: string; reference?: { book: number; hadith: number } };

export type HadithEdition = { name: string; language: string; author: string; direction: string };

/** Every edition the API actually publishes for a book, so the language picker can
 *  only offer languages that exist instead of silently falling back to English. */
export async function fetchHadithEditions(book: string): Promise<HadithEdition[]> {
  const all = await j<Record<string, { collection: HadithEdition[] }>>(`${HD}/editions.json`);
  const list = all[book]?.collection ?? [];
  // keep one edition per language (the first, which is the primary translation)
  const seen = new Set<string>();
  return list.filter((e) => {
    if (seen.has(e.language)) return false;
    seen.add(e.language);
    return true;
  });
}

export async function fetchHadithSection(
  book: string,
  langCode: string,
  section: string,
  editions?: HadithEdition[],
) {
  const lang = getLanguage(langCode);
  const byLanguage = editions?.find((e) => e.language.toLowerCase() === lang.label.toLowerCase());
  /* Urdu fallback: when a collection has no Urdu edition of its own, any other
   * Urdu edition of this same book keeps Urdu readers in Urdu (right-to-left
   * rendering is already handled by the page). */
  const urduFallback =
    lang.code === "ur" ? editions?.find((e) => e.name.toLowerCase().startsWith("urd"))?.name : undefined;
  const tryEditions = [
    ...(byLanguage ? [byLanguage.name] : []),
    `${lang.hadithPrefix}-${book}`,
    ...(urduFallback ? [urduFallback] : []),
    `eng-${book}`,
    `ara-${book}`,
  ];
  for (const ed of tryEditions) {
    try {
      const d = await j<{ hadiths: HadithItem[]; metadata: { name: string; section: string } }>(
        `${HD}/editions/${ed}/sections/${section}.min.json`,
      );
      return { ...d, edition: ed };
    } catch {
      continue;
    }
  }
  throw new Error("This book is not available in the selected language.");
}

export async function fetchHadithInfo(book: string) {
  const d = await j<{
    metadata: { name: string; sections: Record<string, string> };
  }>(`${HD}/editions/ara-${book}.min.json`);
  return d.metadata;
}

/* ---- Prayer times / Qibla / Asma ul Husna (Aladhan) ---- */
const AL = "https://api.aladhan.com/v1";

export type Timings = Record<string, string>;

export async function fetchPrayerTimes(city: string, country: string, method: number) {
  const d = await j<{
    data: { timings: Timings; date: { readable: string; hijri: { date: string; month: { en: string }; year: string; day: string } } };
  }>(`${AL}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`);
  return d.data;
}

export async function fetchQibla(lat: number, lng: number) {
  const d = await j<{ data: { direction: number } }>(`${AL}/qibla/${lat}/${lng}`);
  return d.data.direction;
}

export type AsmaName = { name: string; transliteration: string; number: number; en: { meaning: string } };

export async function fetchAsmaUlHusna(): Promise<AsmaName[]> {
  const d = await j<{ data: AsmaName[] }>(`${AL}/asmaAlHusna`);
  return d.data;
}

export async function fetchHijriCalendar(month: number, year: number) {
  const d = await j<{
    data: Array<{ date: { readable: string; hijri: { day: string; month: { en: string }; year: string; weekday: { en: string } } } }>;
  }>(`${AL}/gToHCalendar/${month}/${year}`);
  return d.data;
}