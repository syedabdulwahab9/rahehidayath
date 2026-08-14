import type { LangCode } from "@/lib/islamic-data";
import { BookOpen, BookMarked, Library, ScrollText, Book, BookText } from "lucide-react";

/** Extra scholarly metadata for each hadith collection, kept separate from
 *  islamic-data.ts so that file never has to be touched by this feature. */
export type HadithMeta = {
  compiler: string;
  era: string;
  narrations: string;
  authenticity: string;
  icon: typeof BookOpen;
  tint: string;
};

export const HADITH_META: Record<string, HadithMeta> = {
  bukhari: {
    compiler: "Imam Muhammad al-Bukhari (194–256 AH)",
    era: "Compiled over 16 years, 3rd century Hijri",
    narrations: "7,563 narrations (with repetition)",
    authenticity: "All narrations in Sahih al-Bukhari are graded sahih by the compiler's own rigorous criteria — the most authentic book after the Qur'an.",
    icon: BookOpen,
    tint: "bg-primary/10 text-primary",
  },
  muslim: {
    compiler: "Imam Muslim ibn al-Hajjaj (206–261 AH)",
    era: "3rd century Hijri, student of al-Bukhari",
    narrations: "7,470 narrations (with repetition)",
    authenticity: "All narrations in Sahih Muslim are graded sahih by the compiler's own criteria, second only to Sahih al-Bukhari in authenticity.",
    icon: BookMarked,
    tint: "bg-accent/15 text-accent",
  },
  abudawud: {
    compiler: "Imam Abu Dawud as-Sijistani (202–275 AH)",
    era: "3rd century Hijri",
    narrations: "5,274 narrations",
    authenticity: "One of the six canonical books (Kutub al-Sittah). Gradings shown here follow Shaykh al-Albani's verification of Sunan Abi Dawud.",
    icon: Library,
    tint: "bg-primary/10 text-primary",
  },
  tirmidhi: {
    compiler: "Imam Abu Isa at-Tirmidhi (209–279 AH)",
    era: "3rd century Hijri",
    narrations: "3,956 narrations",
    authenticity: "One of the six canonical books, known for noting each hadith's grade. Gradings shown here follow Shaykh al-Albani's verification.",
    icon: ScrollText,
    tint: "bg-accent/15 text-accent",
  },
  nasai: {
    compiler: "Imam Ahmad an-Nasa'i (215–303 AH)",
    era: "3rd century Hijri",
    narrations: "5,761 narrations",
    authenticity: "One of the six canonical books, celebrated for its strict narrator criteria. Gradings shown here follow Shaykh al-Albani's verification.",
    icon: Book,
    tint: "bg-primary/10 text-primary",
  },
  ibnmajah: {
    compiler: "Imam Muhammad ibn Majah (209–273 AH)",
    era: "3rd century Hijri",
    narrations: "4,341 narrations",
    authenticity: "The sixth of the Kutub al-Sittah. Gradings shown here follow Shaykh al-Albani's verification of Sunan Ibn Majah.",
    icon: BookText,
    tint: "bg-accent/15 text-accent",
  },
  malik: {
    compiler: "Imam Malik ibn Anas (93–179 AH)",
    era: "2nd century Hijri — the earliest surviving hadith collection",
    narrations: "1,858 narrations",
    authenticity: "The Muwatta predates the six canonical books and combines hadith with the practice ('amal) of the people of Madinah.",
    icon: Library,
    tint: "bg-primary/10 text-primary",
  },
  nawawi: {
    compiler: "Imam Yahya ibn Sharaf an-Nawawi (631–676 AH)",
    era: "7th century Hijri",
    narrations: "42 selected narrations",
    authenticity: "A curated selection of foundational hadith, drawn chiefly from Bukhari and Muslim, beloved for memorisation.",
    icon: BookOpen,
    tint: "bg-primary/10 text-primary",
  },
  qudsi: {
    compiler: "Compiled from multiple canonical collections",
    era: "Sacred sayings (Ahadith Qudsi)",
    narrations: "40 selected narrations",
    authenticity: "Words spoken by Allah but narrated in the Prophet ﷺ's own words — sourced from the authentic books.",
    icon: BookMarked,
    tint: "bg-accent/15 text-accent",
  },
};

export const KUTUB_AL_SITTAH: Array<{ id: string; name: string; note: string }> = [
  { id: "bukhari", name: "Sahih al-Bukhari", note: "Graded sahih by the compiler's own criteria." },
  { id: "muslim", name: "Sahih Muslim", note: "Graded sahih by the compiler's own criteria." },
  { id: "abudawud", name: "Sunan Abu Dawud", note: "Gradings verified by Shaykh al-Albani." },
  { id: "tirmidhi", name: "Jami' at-Tirmidhi", note: "Gradings verified by Shaykh al-Albani." },
  { id: "nasai", name: "Sunan an-Nasa'i", note: "Gradings verified by Shaykh al-Albani." },
  { id: "ibnmajah", name: "Sunan Ibn Majah", note: "Gradings verified by Shaykh al-Albani." },
  { id: "malik", name: "Muwatta Imam Malik", note: "The earliest surviving hadith compilation." },
];

export type LangPill = { code: LangCode; label: string };

export const HADITH_LANG_PILLS: LangPill[] = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ur", label: "اردو" },
  { code: "tr", label: "Türkçe" },
  { code: "id", label: "Indonesia" },
  { code: "bn", label: "বাংলা" },
];
