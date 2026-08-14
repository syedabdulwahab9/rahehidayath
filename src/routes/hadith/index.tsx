import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, ChevronRight, Quote, Search, Trash2 } from "lucide-react";
import { SectionTitle, Card } from "@/components/AppShell";
import { HadithLanguagePills } from "@/components/hadith/LanguagePills";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { HADITH_BOOKS } from "@/lib/islamic-data";
import { HADITH_META } from "@/lib/hadith-meta";
import { useHadithBookmarks, useHadithFontSize } from "@/lib/hadith-storage";
import { useCustomContentSnapshot, type CustomHadith } from "@/lib/content-store";
import { useSettings } from "@/lib/settings";
import { useHadithLang } from "@/lib/hadith-lang";
import { useTranslate } from "@/lib/translate";

/** A small, hand-picked garden of the most beloved narrations. */
const FEATURED = [
  {
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    source: "Sahih al-Bukhari 13",
  },
  {
    text: "The best of you are those who are best to their families, and I am the best of you to my family.",
    source: "Sunan al-Tirmidhi 3895",
  },
  {
    text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    source: "Sahih al-Bukhari 6018",
  },
  {
    text: "The strong is not the one who overcomes people by his strength, but the one who controls himself while in anger.",
    source: "Sahih al-Bukhari 6114",
  },
  {
    text: "Make things easy and do not make them difficult, give glad tidings and do not repel people.",
    source: "Sahih al-Bukhari 69",
  },
  {
    text: "A kind word is charity, and smiling in the face of your brother is charity.",
    source: "Sunan al-Tirmidhi 1956",
  },
  {
    text: "Allah is not merciful to the one who is not merciful to people.",
    source: "Sahih Muslim 2319",
  },
];

/** A hadith published from the admin content editor, with EN / اردو switch. */
function CustomHadithCard({ h }: { h: CustomHadith }) {
  const [urdu, setUrdu] = useState(false);
  const showUr = urdu && h.urdu;
  return (
    <article className="hadith-surface space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{h.source}</p>
        {h.urdu && (
          <div className="flex shrink-0 overflow-hidden rounded-full border border-border/70 text-[11px] font-medium" role="group" aria-label="Hadith language">
            <button onClick={() => setUrdu(false)} aria-pressed={!urdu} className={`px-2 py-0.5 transition ${!urdu ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</button>
            <button onClick={() => setUrdu(true)} aria-pressed={urdu} className={`urdu-text px-2 py-0.5 transition ${urdu ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>اردو</button>
          </div>
        )}
      </div>
      <p dir={showUr ? "rtl" : "ltr"} className={`text-sm leading-loose text-foreground/90 ${showUr ? "urdu-text text-right" : ""}`}>
        {showUr ? h.urdu : h.text}
      </p>
      {h.narrator && <p className="text-xs text-muted-foreground">Narrated by {h.narrator}</p>}
    </article>
  );
}

export const Route = createFileRoute("/hadith/")({
  head: () => ({
    meta: [
      { title: "Hadith Collections — Bukhari, Muslim & more | Raah e Hidayath" },
      { name: "description", content: "Browse Sahih al-Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta Malik and the Forty Hadith collections in many languages." },
      { property: "og:title", content: "Hadith Collections | Raah e Hidayath" },
      { property: "og:description", content: "Every major hadith book, chapter by chapter, in your language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HadithIndex,
});

const RTL = new Set(["ur", "ar", "fa", "ps", "sd"]);

function HadithIndex() {
  const custom = useCustomContentSnapshot().hadiths;
  const { settings } = useSettings();
  // Hadith-only language: the site chrome stays in the user's site language.
  const [lang, setLang] = useHadithLang(settings.lang);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"collections" | "bookmarks">("collections");
  const { bookmarks, remove } = useHadithBookmarks();
  const font = useHadithFontSize();

  // Rotates gently through the day so the greeting narration always feels new.
  const featured = useMemo(() => {
    const idx = Math.floor(Date.now() / (1000 * 60 * 60 * 3)) % FEATURED.length;
    return FEATURED[idx]!;
  }, []);

  const { tr } = useTranslate(
    FEATURED.map((f) => f.text).concat(bookmarks.map((b) => b.text)),
    lang,
  );
  const rtl = RTL.has(lang);

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HADITH_BOOKS;
    return HADITH_BOOKS.filter((b) => b.name.toLowerCase().includes(q) || b.arabic.includes(q));
  }, [query]);

  const filteredBookmarks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookmarks;
    return bookmarks.filter((b) => b.text.toLowerCase().includes(q) || b.bookName.toLowerCase().includes(q));
  }, [bookmarks, query]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Hadith Collection"
        subtitle="The major collections of the Sunnah — chapter by chapter, in your language"
      />

      {/* Hadith of the moment */}
      <div className="gradient-hero relative overflow-hidden rounded-3xl p-6">
        <Quote className="pointer-events-none absolute -right-3 -top-3 size-28 text-primary-foreground/10" />
        <p
          dir={rtl ? "rtl" : "ltr"}
          style={{ fontSize: `${font.size}px` }}
          className={`leading-loose text-primary-foreground ${rtl ? "urdu-text text-right" : ""}`}
        >
          {tr(featured.text)}
        </p>
        <p className="mt-4 text-sm font-medium text-accent">— {featured.source}</p>
      </div>

      {/* Language pills change ONLY the hadith text below */}
      <HadithLanguagePills value={lang} onChange={setLang} />

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search collections or saved hadith…"
          className="w-full rounded-xl border border-border bg-[var(--surface-white)] py-3 pl-11 pr-14 text-sm outline-none transition focus:border-foreground/30"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          <VoiceSearchButton
            onResult={(text) => setQuery(text)}
            lang={lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : `${lang}-${lang.toUpperCase()}`}
            label="Search hadith by voice"
          />
        </span>
      </div>


      <div className="flex gap-1 rounded-2xl border border-border bg-card p-1 text-sm font-medium shadow-soft">
        <button
          onClick={() => setTab("collections")}
          aria-pressed={tab === "collections"}
          className={`flex-1 rounded-xl py-2 transition ${tab === "collections" ? "gradient-hero text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
        >
          Collections
        </button>
        <button
          onClick={() => setTab("bookmarks")}
          aria-pressed={tab === "bookmarks"}
          className={`flex-1 rounded-xl py-2 transition ${tab === "bookmarks" ? "gradient-hero text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
        >
          Bookmarks ({bookmarks.length})
        </button>
      </div>

      {tab === "collections" ? (
        <>
          {custom.length > 0 && (
            <section aria-label="Hadiths added by the admin" className="space-y-3">
              <h2 className="font-display text-xl">Added by the admin</h2>
              {custom.map((h) => (
                <CustomHadithCard key={h.id} h={h} />
              ))}
            </section>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredBooks.map((b) => {
              const meta = HADITH_META[b.id];
              const Icon = meta?.icon;
              return (
                <Link
                  key={b.id}
                  to="/hadith/$bookId"
                  params={{ bookId: b.id }}
                  className="group block focus-visible:outline-none"
                >
                  <article className="hadith-card">
                    <span
                      className={`hadith-card-icon ${meta?.tint ?? "bg-primary/10 text-primary"}`}
                    >
                      {Icon && <Icon className="size-6" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.95rem] font-semibold leading-snug tracking-tight">{b.name}</span>
                      <span dir="rtl" lang="ar" className="arabic-ayah mt-1 block truncate text-base text-primary/80">
                        {b.arabic}
                      </span>
                    </span>
                    <span className="mt-auto flex w-full flex-col items-center gap-1.5 pt-1">
                      <span aria-hidden className="h-px w-10 bg-border" />
                      <span className="text-[0.68rem] font-medium uppercase tracking-[0.16em] tabular-nums text-muted-foreground">
                        {b.count} narrations
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        Open <ChevronRight className="size-3.5" />
                      </span>
                    </span>
                  </article>
                </Link>
              );
            })}
            {filteredBooks.length === 0 && (
              <p className="col-span-full text-center text-sm text-muted-foreground">No collections match "{query}".</p>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {filteredBookmarks.length === 0 && (
            <Card className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <Bookmark className="size-6 text-primary/50" />
              No bookmarks yet — tap the bookmark icon on any hadith and it is saved here forever.
            </Card>
          )}
          {filteredBookmarks.map((b) => (
            <div key={b.id}>
              <article className="hadith-surface space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 font-semibold tabular-nums text-primary">
                    <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                    Hadith {b.hadithnumber}
                  </span>
                  <button
                    onClick={() => remove(b.id)}
                    aria-label="Remove bookmark"
                    className="grid size-9 place-items-center rounded-2xl border border-border/60 text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive active:scale-90"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p
                  dir={rtl ? "rtl" : "ltr"}
                  style={{ fontSize: `${font.size}px` }}
                  className={`leading-loose text-foreground/90 ${rtl ? "urdu-text text-right" : ""}`}
                >
                  {tr(b.text)}
                </p>
                <p className="border-t border-border/50 pt-2.5 text-xs font-semibold text-foreground">
                  {b.bookName}
                  {b.reference ? ` · ${b.reference}` : ""}
                </p>
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
