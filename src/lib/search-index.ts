import {
  DUAS,
  HADITH_BOOKS,
  IBADAAT_SECTIONS,
  KHULAFA,
  LANGUAGES,
  PROPHET_NAMES,
  QAIDA_LESSONS,
  RAKAH_TABLE,
  RECITERS,
  SEERAH_FAMILY,
  SEERAH_TIMELINE,
  TAFSIRS,
  TAJWEED_RULES,
  TASBEEH_PRESETS,
  TRANSLATIONS,
} from "./islamic-data";
import { HALAL_CATEGORIES, HALAL_ITEMS, RULING_LABEL } from "./halal-data";
import { NAATS, PROPHETS, PROPHET_CHILDREN, PROPHET_WIVES } from "./extra-data";
import { GOOD_DEEDS } from "./ibadah-log";
import { SURAH_NAMES } from "./surah-names";
import { NASHEEDS } from "./nasheed-data";



export type SiteResult = {
  id: string;
  title: string;
  subtitle: string;
  section: string;
  to: string;
  params?: Record<string, string>;
  haystack: string;
};

const push = (
  out: SiteResult[],
  r: Omit<SiteResult, "haystack"> & { extra?: string },
) => {
  const { extra, ...rest } = r;
  out.push({
    ...rest,
    haystack: `${r.title} ${r.subtitle} ${r.section} ${extra ?? ""}`.toLowerCase(),
  });
};

function build(): SiteResult[] {
  const out: SiteResult[] = [];

  const pages: Array<[string, string, string]> = [
    ["/", "Home", "Prayer times, quick access and today's Islamic date"],
    ["/quran", "Al Quran", "114 surahs — read, listen, translation, tafseer, explanation"],
    ["/mushaf/15", "15 Line Quran", "The authentic 15 line Madani mushaf, all 604 printed pages"],
    ["/quran/pdf", "Quran PDF — 13 & 15 lines", "Read and download the authentic 13 line and 15 line printed Quran"],
    ["/hadith", "Hadith", "Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Malik"],
    ["/ibadaat", "Ibadaat", "Taharah, salah, zakat, sawm, hajj and umrah"],
    ["/duas", "Duas", "Daily, salah, protection, travel and forgiveness duas"],
    ["/names", "99 Names of Allah", "Asma ul Husna with meanings"],
    ["/tasbeeh", "Digital Tasbeeh", "Counter with dhikr presets"],
    ["/qibla", "Qibla Direction", "Live compass towards the Ka'bah"],
    ["/calendar", "Hijri Calendar", "Islamic dates and Gregorian conversion"],
    ["/qaida", "Noorani Qaida", "Learn to read Arabic letter by letter"],
    ["/seerah", "Seerat un Nabi ﷺ", "Life, family, timeline and companions"],
    ["/tracker", "Salah Tracker", "Track your five daily prayers"],
    ["/mood", "Heal Your Heart", "Islamic mood tracker — sad, anxious, angry, lonely, grateful duas"],
    ["/guess-prophet", "Guess the Prophet", "Riddle game about the Prophets of Allah"],
    ["/learn-salah", "Learn Salah & Wudu", "Step by step namaz and drag and drop wudu"],
    ["/family", "Family Connect", "Worship together with your family privately"],
    ["/tree", "The Ibadah Tree", "Grow leaves and blossoms with every deed"],
    ["/trail", "The Hidayah Trail", "A stone lights for every full day of Salah"],
    ["/lake", "The Sadaqah Lake", "Fills with every dhikr and charity"],
    ["/jannah", "The House in Jannah", "Built block by block from your milestones"],
    ["/halal", "Halal or Haram", "Every food, animal, bird and insect ruling"],
    ["/naats", "Naats & Salawat", "Praise of the Prophet with meaning"],
    ["/quiz", "Islamic Quiz", "20 timed questions in English and Urdu"],
    ["/wheel", "Good Deed Wheel", "Spin and do a good deed today"],
    ["/zakat", "Zakat Calculator", "Gold, silver and savings in every currency"],
    ["/ramadan", "Ramadan & Fasting", "Sehri, iftar and fasting tracker"],
    ["/scanner", "Barcode Scanner", "Check a product's country of origin"],
    ["/prophets", "Prophets & Families", "Adam AS to Muhammad ﷺ, wives and children"],
    ["/search", "Search", "Search the whole app by text or voice"],
    ["/more", "More", "All other sections of the app"],
    ["/settings", "Settings", "Language, reciter, theme, city, calculation method"],
    ["/mushaf/13", "13 Line Quran", "The Indo-Pak 13 line Quran-e-Pak, all 604 pages with recitation"],
    ["/about", "About Us", "Raah e Hidayath, Sawaa Enterprise, UpLearn 360° and the team"],
    ["/naats", "Naats & Nasheeds", "Listen to naats, nasheeds and salawat"],
    ["/ibadaat", "Ibadaat", "Taharah, wudu, salah, zakat, sawm, hajj, umrah"],
    ["/hadith", "Hadith collections", "Sahih Bukhari, Muslim, Tirmidhi, Abu Dawud, Nasa'i, Ibn Majah, Malik"],
    ["/auth", "Sign in", "Sign in or create your account"],
  ];
  const gameRoutes = new Set([
    "/guess-prophet", "/quiz", "/wheel", "/tree", "/lake", "/trail", "/jannah",
    "/learn-salah", "/qaida", "/tasbeeh", "/scanner", "/mood",
  ]);
  for (const [to, title, subtitle] of pages)
    if (!gameRoutes.has(to))
      push(out, { id: `page-${to}`, title, subtitle, section: "Page", to, extra: "namaz salah prayer" });


  /* Games, journeys and everything playable — so "game", "timer", "spin",
     "quiz", "tree", "lake" all surface straight from the home search bar. */
  const games: Array<[string, string, string, string]> = [
    ["/guess-prophet", "Guess the Prophet", "Timed riddle game — three clues, one Prophet, 30 seconds", "game games play riddle timer countdown quiz prophets fun"],
    ["/quiz", "Islamic Quiz", "20 timed questions in English and Urdu", "game games play quiz timer questions score streak"],
    ["/wheel", "Good Deed Wheel", "Spin the wheel and do a good deed today", "game games play spin wheel good deed sadaqah kindness"],
    ["/tree", "The Ibadah Tree", "Log your deeds and watch leaves and blossoms grow", "game games play grow tree leaves blossoms habits good deeds streak"],
    ["/lake", "The Sadaqah Lake", "Every dhikr and good deed adds a drop of water", "game games play lake water drops charity sadaqah good deeds"],
    ["/trail", "The Hidayah Trail", "A stone lights up for every full day of Salah", "game games play trail stones climb mountain streak good deeds"],
    ["/jannah", "The House in Jannah", "Build it block by block from your milestones", "game games play build house jannah blocks milestones good deeds"],
    ["/learn-salah", "Learn Salah & Wudu", "Step by step namaz with a drag and drop wudu game", "game games play learn salah wudu namaz steps drag drop"],
    ["/qaida", "Noorani Qaida", "Learn Arabic letters lesson by lesson", "game games play learn letters arabic qaida practice"],
    ["/tasbeeh", "Digital Tasbeeh", "Tap counter with dhikr presets", "game games play counter tap dhikr tasbeeh beads"],
    ["/scanner", "Barcode Scanner", "Scan a product and check its country of origin", "game games play scan barcode boycott origin product"],
    ["/mood", "Heal Your Heart", "Pick how you feel and get the dua for it", "game games play mood feelings sad anxious angry grateful"],
  ];
  for (const [to, title, subtitle, extra] of games)
    push(out, { id: `game-${to}`, title, subtitle, section: "Games & journeys", to, extra });

  /* Good deeds you can log — searchable one by one */
  for (const d of GOOD_DEEDS)
    push(out, {
      id: `deed-${d.id}`,
      title: `${d.emoji} ${d.label}`,
      subtitle: "Tap it to add a drop to the Sadaqah Lake and a blossom to the tree",
      section: "Good deeds",
      to: "/lake",
      extra: "good deed kindness charity sadaqah log tap",
    });


  for (const b of HADITH_BOOKS)
    push(out, {
      id: `hadith-${b.id}`,
      title: b.name,
      subtitle: `${b.arabic} · ${b.count} hadith`,
      section: "Hadith book",
      to: "/hadith/$bookId",
      params: { bookId: b.id },
      extra: b.arabic,
    });

  for (const d of DUAS)
    push(out, {
      id: `dua-${d.title}`,
      title: d.title,
      subtitle: d.en,
      section: `Dua · ${d.cat}`,
      to: "/duas",
      extra: `${d.ar} ${d.tr}`,
    });

  for (const s of IBADAAT_SECTIONS) {
    push(out, { id: `ib-${s.id}`, title: s.title, subtitle: s.summary, section: "Ibadaat", to: "/ibadaat" });
    for (const item of s.items)
      push(out, {
        id: `ib-${s.id}-${item.h}`,
        title: item.h,
        subtitle: item.b.slice(0, 140),
        section: `Ibadaat · ${s.title}`,
        to: "/ibadaat",
        extra: item.b,
      });
  }

  for (const r of RAKAH_TABLE)
    push(out, {
      id: `rakah-${r.prayer}`,
      title: `${r.prayer} — rak'ah count`,
      subtitle: `${r.sunnahBefore} · ${r.farz} · ${r.sunnahAfter}`,
      section: "Namaz",
      to: "/ibadaat",
      extra: `${r.extra} namaz salah`,
    });

  for (const t of TAJWEED_RULES)
    push(out, {
      id: `tajweed-${t.title}`,
      title: t.title,
      subtitle: t.rules[0] ?? "",
      section: "Tajweed",
      to: "/qaida",
      extra: t.rules.join(" "),
    });

  for (const l of QAIDA_LESSONS)
    push(out, {
      id: `qaida-${l.n}`,
      title: `Lesson ${l.n} — ${l.title}`,
      subtitle: l.note,
      section: "Noorani Qaida",
      to: "/qaida",
      extra: l.letters.join(" "),
    });

  for (const t of TASBEEH_PRESETS)
    push(out, {
      id: `tasbeeh-${t.name}`,
      title: t.name,
      subtitle: `${t.arabic} · target ${t.target}`,
      section: "Tasbeeh",
      to: "/tasbeeh",
      extra: t.arabic,
    });

  for (const t of SEERAH_TIMELINE)
    push(out, {
      id: `seerah-${t.year}-${t.title}`,
      title: t.title,
      subtitle: `${t.year} — ${t.text.slice(0, 120)}`,
      section: "Seerah",
      to: "/seerah",
      extra: t.text,
    });

  for (const f of SEERAH_FAMILY)
    push(out, {
      id: `family-${f.name}`,
      title: f.name,
      subtitle: `${f.role} · ${f.life}`,
      section: "Seerah · Family",
      to: "/seerah",
    });

  for (const n of PROPHET_NAMES)
    push(out, {
      id: `pname-${n.tr}`,
      title: `${n.tr} — ${n.ar}`,
      subtitle: n.en,
      section: "Names of the Prophet ﷺ",
      to: "/seerah",
    });

  /* Halal / haram — every single item, so "haram meat", "oreo", "burger"
     or "chocolate" all resolve straight from the home search bar. */
  for (const i of HALAL_ITEMS)
    push(out, {
      id: `halal-${i.id}`,
      title: `${i.name} — ${RULING_LABEL[i.ruling]}`,
      subtitle: i.why,
      section: `Halal or Haram · ${i.category}`,
      to: "/halal",
      extra: `${i.ruling} ${RULING_LABEL[i.ruling]} ${(i.aka ?? []).join(" ")} ${i.ur ?? ""} ${i.urWhy ?? ""} ${i.evidence ?? ""} halal haram permissible forbidden food eat`,
    });

  for (const c of HALAL_CATEGORIES)
    push(out, {
      id: `halal-cat-${c}`,
      title: c,
      subtitle: `All halal and haram rulings in ${c}`,
      section: "Halal or Haram",
      to: "/halal",
      extra: "halal haram category",
    });

  for (const p of PROPHETS)
    push(out, {
      id: `prophet-${p.n}`,
      title: `${p.name} ${p.arabic}`,
      subtitle: p.note,
      section: "Prophets",
      to: "/prophets",
      extra: `${p.lineage} ${p.family} ${p.bible ?? ""}`,
    });

  for (const w of PROPHET_WIVES)
    push(out, { id: `wife-${w.name}`, title: w.name, subtitle: w.note, section: "Prophet's wives (Ummahat al-Mu'minin)", to: "/prophets" });

  for (const c of PROPHET_CHILDREN)
    push(out, { id: `child-${c.name}`, title: c.name, subtitle: c.note, section: "Prophet's children", to: "/prophets" });

  for (const n of NAATS)
    push(out, {
      id: `naat-${n.id}`,
      title: n.title,
      subtitle: `${n.poet} · ${n.language}`,
      section: "Naats",
      to: "/naats",
      extra: `${n.arabic} ${n.transliteration} ${n.translation}`,
    });

  for (const k of KHULAFA)
    push(out, { id: `khalifa-${k.name}`, title: k.name, subtitle: `${k.role} · ${k.rule}`, section: "Seerah · Caliphs", to: "/seerah", extra: k.life });

  for (const r of RECITERS)
    push(out, { id: `reciter-${r.id}`, title: r.name, subtitle: r.style, section: "Reciter", to: "/settings", extra: "qari recitation audio" });

  for (const t of TRANSLATIONS)
    push(out, { id: `translation-${t.id}`, title: t.name, subtitle: `Quran translation · ${t.lang}`, section: "Quran translation", to: "/settings" });

  for (const t of TAFSIRS)
    push(out, { id: `tafsir-${t.slug}`, title: t.name, subtitle: `Tafseer · ${t.lang}`, section: "Tafseer", to: "/settings" });

  for (const l of LANGUAGES)
    push(out, { id: `lang-${l.code}`, title: `${l.label} (${l.native})`, subtitle: `Use the whole app in ${l.label}`, section: "Language", to: "/settings", extra: "language translate" });

  /* Every surah of the Quran, searchable by name, meaning, Arabic or number. */
  for (const s of SURAH_NAMES)
    push(out, {
      id: `surah-${s.n}`,
      title: `${s.n}. Surah ${s.name}`,
      subtitle: `${s.arabic} · ${s.meaning}`,
      section: "Quran · Surah",
      to: "/quran/$surahId",
      params: { surahId: String(s.n) },
      extra: `surah ${s.n} ${s.arabic} ${s.meaning} quran read listen tafseer translation`,
    });

  for (const n of NASHEEDS)
    push(out, {
      id: `nasheed-${n.id}`,
      title: n.title,
      subtitle: "Nasheed",
      section: "Naats & Nasheeds",
      to: "/naats",
      extra: "nasheed naat salawat audio listen",
    });

  return out;
}

export const SITE_INDEX: SiteResult[] = build();

export function searchSite(query: string, limit = 40): SiteResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return SITE_INDEX.map((item) => {
    let score = 0;
    for (const t of terms) {
      if (item.title.toLowerCase().includes(t)) score += 5;
      if (item.haystack.includes(t)) score += 2;
    }
    return { item, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}
