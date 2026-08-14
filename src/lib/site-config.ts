import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAppState, pushAppState, subscribeAppState } from "./app-state";

/**
 * Everything on the website that the admin can rewrite without touching code:
 * branding, page headings, the naats/nasheeds section copy, and the Spotify
 * playlists embedded on the nasheeds page.
 */

export type SpotifyEntry = {
  id: string;
  /** Spotify playlist / album / track id or a full open.spotify.com link. */
  uri: string;
  kind: "playlist" | "album" | "track" | "artist";
  title: string;
  note: string;
};

export type SiteConfig = {
  siteName: string;
  tagline: string;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  naatsTitle: string;
  naatsSubtitle: string;
  naatsIntro: string;
  naatsVerse: string;
  naatsVerseRef: string;
  spotify: SpotifyEntry[];
  footerNote: string;
  /** Comma separated list of names shown in every footer / credits block. */
  creators: string;
  /** Per-section name lists. Empty means "use the shared list above". */
  homeCreators: string;
  moreCreators: string;
  settingsCreators: string;
  /** Editable headings above the names on the home, More and Settings pages. */
  homeCreditsTitle: string;
  moreCreditsTitle: string;
  settingsCreditsTitle: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  whatsappLink: string;
  socialLinks: string;
  aboutText: string;
  copyrightText: string;
  logoUrl: string;
  faviconUrl: string;
  announcement: string;
  navigationLabels: string;
  wheelDeeds: Array<{ en: string; ur: string; short: string; shortUr: string }>;
};

export const DEFAULT_SITE: SiteConfig = {
  siteName: "Raah e Hidayath",
  tagline: "The Path of Guidance",
  homeHeroTitle: "Raah e Hidayath — The Path of Guidance",
  homeHeroSubtitle:
    "The complete Quran with recitation, translation and tafseer, every major hadith collection, prayer times and daily worship — in your language.",
  naatsTitle: "Naats & Nasheeds",
  naatsSubtitle: "100% human voices — no music, no instruments",
  naatsIntro:
    "Every track in this collection is sung by the human voice alone. No drums, no strings, no synths — only pure vocals praising Allah and sending salawat upon the Prophet ﷺ. Press play and listen right here.",
  naatsVerse: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ",
  naatsVerseRef:
    "\"Indeed, Allah and His angels send blessings upon the Prophet. O believers, send blessings upon him and greet him with peace.\" — Surah Al-Ahzab 33:56",
  spotify: [
    {
      id: "sp1",
      uri: "4SY9ZQfdNDYXcqWINnYPhG",
      kind: "playlist",
      title: "Arabic Nasheeds — Vocals Only",
      note: "الأناشيد العربية بدون موسيقى — a cappella Arabic nasheeds, voice only.",
    },
    {
      id: "sp2",
      uri: "3nhW6RVws0XDoupVDPdz2w",
      kind: "playlist",
      title: "Nasheeds 🕋 Vocals Only",
      note: "A long, calm collection of vocals-only nasheeds for daily listening.",
    },
    {
      id: "sp3",
      uri: "2zn6CaYjLxgHTTlJMMDgh3",
      kind: "playlist",
      title: "Nasheeds — No Music",
      note: "Gentle voice-only nasheeds, perfect for study and travel.",
    },
    {
      id: "sp4",
      uri: "4KxUF1EMW8rI3GnCJp2jrF",
      kind: "playlist",
      title: "Nasheeds (Vocals Only)",
      note: "Modern and classical naats sung purely with the human voice.",
    },
    {
      id: "sp5",
      uri: "51tD9kJZxBT3TqAk5WiYvK",
      kind: "playlist",
      title: "Siedd's Essentials — Vocals Only",
      note: "Well loved English nasheeds recorded completely without instruments.",
    },
    {
      id: "sp6",
      uri: "0PoBVIgjx8bhcWXimb5ybj",
      kind: "playlist",
      title: "Nasheeds Instead of Music",
      note: "A beautiful alternative to music — human voices only, all day long.",
    },
  ],
  footerNote: "",
  creators: "Syed Basharath Ali, Syed Ahmed Ali, Mohd Sufyaan Sayeed, Syed Atif Ammar",
  homeCreators: "Basharath, Sufyaan, Ahmed, Atif",
  moreCreators: "Syed Abdul Wahab",
  settingsCreators: "Syed Abdul Wahab",
  homeCreditsTitle: "Created by",
  moreCreditsTitle: "Developed by",
  settingsCreditsTitle: "Developed by",
  contactEmail: "rahehidayath1@gmail.com",
  contactPhone: "",
  contactAddress: "",
  whatsappLink: "",
  socialLinks: "",
  aboutText: "A complete Islamic companion for Quran, Hadith, worship and family learning.",
  copyrightText: "© Raah e Hidayath. All rights reserved.",
  logoUrl: "",
  faviconUrl: "",
  announcement: "",
  navigationLabels: "Home, Quran, Hadith, Ibadaat, More",
  wheelDeeds: [
    { en: "Pray every salah on time today", ur: "آج ہر نماز وقت پر ادا کریں", short: "Pray on time", shortUr: "نماز باوقت" },
    { en: "Give sadaqah — even a little", ur: "صدقہ کریں — تھوڑا ہی کیوں نہ ہو", short: "Give sadaqah", shortUr: "صدقہ کریں" },
    { en: "Say SubhanAllah 33 times", ur: "۳۳ بار سبحان اللہ کہیں", short: "SubhanAllah ×33", shortUr: "سبحان اللہ ۳۳" },
    { en: "Read one page of the Qur'an", ur: "قرآن کا ایک صفحہ پڑھیں", short: "Read Qur'an", shortUr: "قرآن پڑھیں" },
    { en: "Smile at someone — it is charity", ur: "کسی پر مسکرائیں — یہ بھی صدقہ ہے", short: "Smile", shortUr: "مسکرائیں" },
    { en: "Call your parents today", ur: "آج والدین کو فون کریں", short: "Call parents", shortUr: "والدین کو فون" },
    { en: "Say Astaghfirullah 100 times", ur: "۱۰۰ بار استغفر اللہ کہیں", short: "Istighfar ×100", shortUr: "استغفار ۱۰۰" },
    { en: "Feed a bird or an animal", ur: "کسی پرندے یا جانور کو کھانا دیں", short: "Feed an animal", shortUr: "جانور کو کھانا" },
    { en: "Help a neighbour with something", ur: "کسی پڑوسی کی مدد کریں", short: "Help neighbour", shortUr: "پڑوسی کی مدد" },
    { en: "Send salawat on the Prophet ﷺ 10 times", ur: "۱۰ بار درود شریف پڑھیں", short: "Salawat ×10", shortUr: "درود ۱۰ بار" },
    { en: "Forgive someone today", ur: "آج کسی کو معاف کر دیں", short: "Forgive", shortUr: "معاف کریں" },
    { en: "Remove something harmful from a path", ur: "راستے سے کوئی تکلیف دہ چیز ہٹائیں", short: "Clear a path", shortUr: "راستہ صاف کریں" },
    { en: "Check on someone who is sick", ur: "کسی بیمار کی خیریت پوچھیں", short: "Visit the sick", shortUr: "بیمار کی عیادت" },
    { en: "Make dua for someone in their absence", ur: "کسی کی غیر موجودگی میں اس کے لیے دعا کریں", short: "Dua for others", shortUr: "غیبانہ دعا" },
  ],
};

const listeners = new Set<(c: SiteConfig) => void>();

export async function saveSite(next: SiteConfig) {
  await pushAppState("site", next);
}

export function useSiteConfig(): [SiteConfig, (next: SiteConfig) => void, () => void] {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE);
  /* While the admin is typing, this device owns the truth: incoming cloud
     echoes of our own writes must never overwrite the newer local text. */
  const editedAt = useRef(0);
  const pending = useRef<SiteConfig | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const listener = (c: SiteConfig) => setConfig(c);
    listeners.add(listener);

    const acceptRemote = (remote: Partial<SiteConfig>) => {
      /* Ignore cloud updates that arrive within 5s of a local keystroke. */
      if (Date.now() - editedAt.current < 5000) return;
      setConfig({ ...DEFAULT_SITE, ...remote });
    };

    /* the cloud copy is the source of truth — every device sees the same site */
    void fetchAppState<Partial<SiteConfig>>("site").then((remote) => {
      if (remote) acceptRemote(remote);
    });
    const unsubscribe = subscribeAppState<Partial<SiteConfig>>("site", acceptRemote);

    return () => {
      listeners.delete(listener);
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
      /* Never lose the last keystroke when the panel closes. */
      if (pending.current) void saveSite(pending.current).catch(() => undefined);
    };
  }, []);

  const save = useCallback((next: SiteConfig) => {
    editedAt.current = Date.now();
    pending.current = next;
    setConfig(next);
    listeners.forEach((l) => l(next));
    /* One write per pause in typing — avoids out-of-order saves overwriting
       each other, which used to make edits look like they never applied. */
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const value = pending.current;
      if (!value) return;
      pending.current = null;
      void saveSite(value).catch(() => undefined);
    }, 500);
  }, []);

  const reset = useCallback(() => {
    editedAt.current = Date.now();
    pending.current = null;
    if (timer.current) clearTimeout(timer.current);
    setConfig(DEFAULT_SITE);
    listeners.forEach((l) => l(DEFAULT_SITE));
    void saveSite(DEFAULT_SITE).catch(() => undefined);
  }, []);

  return [config, save, reset];
}

/** Turns a Spotify link, uri or bare id into an embeddable player URL. */
export function spotifyEmbed(entry: { uri: string; kind: SpotifyEntry["kind"] }): {
  embed: string;
  open: string;
} | null {
  const raw = entry.uri.trim();
  if (!raw) return null;
  const linkMatch = raw.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]+)/);
  const uriMatch = raw.match(/^spotify:(playlist|album|track|artist|episode|show):([A-Za-z0-9]+)$/);
  const bare = /^[A-Za-z0-9]{16,30}$/.test(raw) ? raw : null;
  const kind = linkMatch?.[1] ?? uriMatch?.[1] ?? entry.kind;
  const id = linkMatch?.[2] ?? uriMatch?.[2] ?? bare;
  if (!id) return null;
  return {
    embed: `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator&theme=0`,
    open: `https://open.spotify.com/${kind}/${id}`,
  };
}

export type CreditsSection = "home" | "more" | "settings";

const split = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Footer / credits names, editable from the admin panel. Each section can hold
 * its own list of names; when a section list is empty the shared list is used.
 */
export function creatorList(site: SiteConfig, section?: CreditsSection): string[] {
  if (section) {
    const own = split(
      section === "home" ? (site.homeCreators ?? "") : section === "more" ? (site.moreCreators ?? "") : (site.settingsCreators ?? ""),
    );
    if (own.length) return own;
  }
  return split(site.creators);
}
