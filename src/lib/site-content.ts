/** Editable search-engine and social-sharing settings, stored in the cloud. */
export type SeoConfig = {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  robots: string;
};

export const DEFAULT_SEO: SeoConfig = {
  title: "Raah e Hidayath — The Path of Guidance",
  description:
    "Quran with translation and tafseer, hadith collections, duas, prayer times and daily worship — in your language.",
  keywords: "quran, hadith, duas, prayer times, islam, raah e hidayath",
  ogTitle: "Raah e Hidayath — The Path of Guidance",
  ogDescription: "Your complete Islamic companion: Quran, Hadith, Duas and Prayer Times.",
  ogImage: "",
  canonical: "",
  robots: "index, follow",
};

/** A scheduled, publishable notice shown across the live website. */
export type Announcement = {
  id: string;
  text: string;
  link: string;
  buttonText: string;
  priority: number;
  startsAt: string;
  endsAt: string;
  status: "draft" | "published";
};

export type AnnouncementBoard = { items: Announcement[] };

export const DEFAULT_ANNOUNCEMENTS: AnnouncementBoard = { items: [] };

export const newAnnouncement = (): Announcement => ({
  id: `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  text: "",
  link: "",
  buttonText: "",
  priority: 1,
  startsAt: "",
  endsAt: "",
  status: "draft",
});

/** Only published notices inside their date window reach the public website. */
export function liveAnnouncements(board: AnnouncementBoard, now = new Date()): Announcement[] {
  return (board.items ?? [])
    .filter((a) => a.status === "published" && a.text.trim())
    .filter((a) => !a.startsAt || new Date(a.startsAt) <= now)
    .filter((a) => !a.endsAt || new Date(a.endsAt) >= now)
    .sort((a, b) => b.priority - a.priority);
}

/** Media library entries (files live in cloud storage, not in the browser). */
export type MediaItem = { id: string; name: string; url: string; kind: string };
export type MediaLibrary = { items: MediaItem[] };
export const DEFAULT_MEDIA: MediaLibrary = { items: [] };

/** Prayer-time configuration used by the public app instead of hardcoded values. */
export type PrayerConfig = {
  method: number;
  madhab: "shafi" | "hanafi";
  city: string;
  country: string;
  timezone: string;
  timeFormat: "12h" | "24h";
  showSunrise: boolean;
  adjustments: { fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number };
};

export const DEFAULT_PRAYER: PrayerConfig = {
  method: 1,
  madhab: "hanafi",
  city: "",
  country: "",
  timezone: "",
  timeFormat: "12h",
  showSunrise: true,
  adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
};
