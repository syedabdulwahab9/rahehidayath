/**
 * Authentic, freely distributable printed-Quran editions, read *inside* this
 * website.
 *
 * There are deliberately no download links and no "open on another site"
 * links: the complete printed pages are streamed straight into our own reader
 * so the whole Quran can be read here, page by page, from the first page to
 * the last.
 */

export type QuranPdf = {
  id: "13" | "15";
  lines: 13 | 15;
  title: string;
  subtitle: string;
  detail: string;
  /** Page-by-page reader, embedded inside our own viewer. */
  embedUrl: string;
  /** Direct PDF file, for downloading the complete printed edition. */
  downloadUrl: string;
  /** Suggested filename when the edition is saved to the device. */
  downloadName: string;
  /** Approximate download size, shown before the download starts. */
  downloadSize: string;
  /** Number of printed pages in this edition. */
  pages: number;
  script: string;
};

export const QURAN_PDFS: QuranPdf[] = [
  {
    id: "13",
    lines: 13,
    title: "13 Line Quran-e-Pak",
    subtitle: "Indo-Pak (Persian) script · complete 30 para",
    detail:
      "The classic 13-line Quran-e-Pak used across the subcontinent — large, generous letters that are easy to read and easy to memorise from. Every para, from Alif Lam Meem to Amma, opens right here.",
    embedUrl: "https://archive.org/embed/quranepak13lines",
    downloadUrl: "https://archive.org/download/quranepak13lines/quran%20e%20pak%20complete.pdf",
    downloadName: "13-Line-Quran-e-Pak.pdf",
    downloadSize: "≈ 90 MB",
    pages: 850,
    script: "Indo-Pak",
  },
  {
    id: "15",
    lines: 15,
    title: "15 Line Madani Mushaf",
    subtitle: "Saudi (Uthmani) print · 604 pages",
    detail:
      "The Madinah Mushaf printed in Uthmani script — every page ends on the same ayah as the printed copy, the standard for hifz worldwide. All 604 pages are readable here without leaving the site.",
    embedUrl: "https://archive.org/embed/QuranMajeed-15Lines-SaudiPrint",
    downloadUrl: "https://archive.org/download/QuranMajeed-15Lines-SaudiPrint/QuranMajeed-15Lines-SaudiPrint.pdf",
    downloadName: "15-Line-Madani-Mushaf.pdf",
    downloadSize: "≈ 60 MB",
    pages: 604,
    script: "Uthmani",
  },
];


export const getQuranPdf = (id: string) => QURAN_PDFS.find((p) => p.id === id) ?? QURAN_PDFS[1]!;
