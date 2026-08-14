/**
 * Page-by-page recitation for the printed 15 line Madani Mushaf.
 *
 * The audio follows the *printed page*: every ayah that appears on the page is
 * recited in order, so the listener hears exactly what is on the screen and the
 * reader can turn the page when the page ends.
 */

const API = "https://api.quran.com/api/v4";

export type MushafReciter = { id: number; name: string; style: string };

/** Every full-Quran (all 114 surahs) recitation that publishes page-aligned audio. */
export const MUSHAF_RECITERS: MushafReciter[] = [
  { id: 7, name: "Mishari Rashid al-`Afasy", style: "Murattal" },
  { id: 6, name: "Mahmoud Khalil Al-Husary", style: "Murattal" },
  { id: 12, name: "Mahmoud Khalil Al-Husary", style: "Muallim" },
  { id: 2, name: "AbdulBaset AbdulSamad", style: "Murattal" },
  { id: 1, name: "AbdulBaset AbdulSamad", style: "Mujawwad" },
  { id: 3, name: "Abdur-Rahman as-Sudais", style: "Murattal" },
  { id: 4, name: "Abu Bakr al-Shatri", style: "Murattal" },
  { id: 5, name: "Hani ar-Rifai", style: "Murattal" },
  { id: 9, name: "Mohamed Siddiq al-Minshawi", style: "Murattal" },
  { id: 8, name: "Mohamed Siddiq al-Minshawi", style: "Mujawwad" },
  { id: 10, name: "Sa`ud ash-Shuraym", style: "Murattal" },
  { id: 11, name: "Mohamed al-Tablawi", style: "Murattal" },
];

export type PageAyahAudio = { verseKey: string; url: string };

/** Every ayah of a printed page, in recitation order. */
export async function fetchPageAudio(reciterId: number, page: number): Promise<PageAyahAudio[]> {
  const res = await fetch(`${API}/recitations/${reciterId}/by_page/${page}?per_page=50`);
  if (!res.ok) throw new Error("Could not load the recitation for this page.");

  const json = (await res.json()) as { audio_files?: Array<{ verse_key: string; url: string }> };
  return (json.audio_files ?? []).map((f) => ({
    verseKey: f.verse_key,
    url: f.url.startsWith("http") ? f.url : `https://verses.quran.com/${f.url}`,
  }));
}
