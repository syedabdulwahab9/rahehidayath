import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
  Droplets,
  Search,
  Share2,
  Sparkles,
  Languages,
  Loader2,
  Moon,
  Heart,
  HandHeart,
  Coins,
  Landmark,
  Star,
  Users,
  GraduationCap,
  HelpCircle,
  ScrollText,
  Compass,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/AppShell";
import { GoodDeedsLogo } from "@/components/AiLogo";
import { IBADAAT_SECTIONS, IBADAAT_URDU, LANGUAGES, SHAHADAH, TAJWEED_RULES } from "@/lib/islamic-data";
import { IBADAAT_EXTRA, type IbadahSection } from "@/lib/ibadah-extra";
import { useCustomContentSnapshot } from "@/lib/content-store";
import { useSettings } from "@/lib/settings";
import { useTranslate } from "@/lib/translate";

export const Route = createFileRoute("/ibadaat")({
  head: () => ({
    meta: [
      { title: "Ibadah — Salah, Wudu, Quran, Dua, Dhikr & More | Raah e Hidayath" },
      {
        name: "description",
        content:
          "A premium guide to Islamic worship: salah, wudu, Quran, dua, dhikr, fasting, zakat, Hajj & Umrah, akhlaq, the pillars, rights and common questions — in every language.",
      },
      { property: "og:title", content: "Ibadah — The Complete Worship Guide | Raah e Hidayath" },
      { property: "og:description", content: "Every act of worship explained step by step, in your language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ibadaat,
});

/* ------------------------------------------------------------------ data */

const ALL_SECTIONS: IbadahSection[] = [...IBADAAT_SECTIONS, ...IBADAAT_EXTRA];

type Group = "worship" | "knowledge" | "character";

const META: Record<string, { icon: LucideIcon; group: Group }> = {
  salah: { icon: Compass, group: "worship" },
  wudu: { icon: Droplets, group: "worship" },
  taharah: { icon: Droplets, group: "worship" },
  quran: { icon: BookOpen, group: "knowledge" },
  dua: { icon: HandHeart, group: "worship" },
  dhikr: { icon: Heart, group: "worship" },
  sawm: { icon: Moon, group: "worship" },
  zakat: { icon: Coins, group: "worship" },
  hajj: { icon: Landmark, group: "worship" },
  umrah: { icon: Landmark, group: "worship" },
  janazah: { icon: ScrollText, group: "worship" },
  aqeedah: { icon: Sparkles, group: "knowledge" },
  akhlaq: { icon: Sparkles, group: "character" },
  pillars: { icon: Star, group: "knowledge" },
  rights: { icon: Users, group: "character" },
  learning: { icon: GraduationCap, group: "knowledge" },
  faq: { icon: HelpCircle, group: "knowledge" },
};

/* Order the cards the way the section is meant to be read. */
const ORDER = [
  "salah",
  "wudu",
  "quran",
  "dua",
  "dhikr",
  "sawm",
  "zakat",
  "hajj",
  "umrah",
  "taharah",
  "janazah",
  "akhlaq",
  "pillars",
  "aqeedah",
  "rights",
  "learning",
  "faq",
];

const SECTIONS: IbadahSection[] = [...ALL_SECTIONS].sort(
  (a, b) => (ORDER.indexOf(a.id) + 1 || 99) - (ORDER.indexOf(b.id) + 1 || 99),
);

const FILTERS: Array<{ key: Group | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "worship", label: "Worship" },
  { key: "knowledge", label: "Knowledge" },
  { key: "character", label: "Character" },
];

/* --------------------------------------------------------- tiny storage */

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value.slice(0, 20)));
  } catch {
    /* storage unavailable — the section still works, it just won't remember */
  }
}

function useStoredList(key: string) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => setList(readList(key)), [key]);
  const update = useCallback(
    (next: string[]) => {
      setList(next);
      writeList(key, next);
    },
    [key],
  );
  return [list, update] as const;
}

/* ------------------------------------------------------------ component */

function Ibadaat() {
  const customIbadaat = useCustomContentSnapshot().ibadaat;
  const { settings } = useSettings();

  const [lang, setLang] = useState<string>(settings.lang);
  const rtl = LANGUAGES.find((l) => l.code === lang)?.rtl ?? false;

  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Group | "all">("all");
  const [urdu, setUrdu] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const [bookmarks, setBookmarks] = useStoredList("rah.ibadah.bookmarks");
  const [recents, setRecents] = useStoredList("rah.ibadah.recents");
  const [searches, setSearches] = useStoredList("rah.ibadah.searches");

  const readerRef = useRef<HTMLDivElement | null>(null);

  const { tr, ready } = useTranslate(
    [
      "Ibadah",
      "The Path of Worship",
      "Every act of worship — explained gently, sourced authentically, in your language.",
      "Language",
      "Translating this section into your language…",
      "Search worship topics, duas, rulings…",
      "Continue reading",
      "Saved",
      "Recent searches",
      "No topic matches that search yet.",
      "Explore",
      "Related topics",
      "Back to Ibadah",
      "Save",
      "Saved to bookmarks",
      "Share",
      "Link copied",
      "Added by the admin",
      "Tajweed — Pronunciation & Rules of Stopping",
      "lessons",
      SHAHADAH.english,
      ...SECTIONS.map((s) => s.title),
      ...SECTIONS.map((s) => s.summary),
      ...SECTIONS.flatMap((s) => s.items.map((i) => i.h)),
      ...SECTIONS.flatMap((s) => s.items.map((i) => i.b)),
      ...TAJWEED_RULES.map((t) => t.title),
      ...TAJWEED_RULES.flatMap((t) => t.rules),
      ...FILTERS.map((f) => f.label),
    ],
    lang,
  );

  const translating = !ready && lang !== "en";

  useEffect(() => {
    setUrdu(lang === "ur" ? Object.fromEntries(Object.keys(IBADAAT_URDU).map((id) => [id, true])) : {});
  }, [lang]);

  const open = useMemo(() => SECTIONS.find((s) => s.id === openId) ?? null, [openId]);

  /* reading progress for the open topic */
  useEffect(() => {
    if (!open) return;
    const onScroll = () => {
      const el = readerRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight + el.offsetTop;
      const done = total > 0 ? (window.scrollY - el.offsetTop) / total : 1;
      setProgress(Math.min(100, Math.max(0, done * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const openTopic = (id: string) => {
    setOpenId(id);
    setProgress(0);
    setRecents([id, ...recents.filter((r) => r !== id)]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleBookmark = (id: string) =>
    setBookmarks(bookmarks.includes(id) ? bookmarks.filter((b) => b !== id) : [id, ...bookmarks]);

  const share = async (s: IbadahSection) => {
    const url = `${window.location.origin}/ibadaat#${s.id}`;
    try {
      if (navigator.share) await navigator.share({ title: s.title, url });
      else await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* the user dismissed the share sheet */
    }
  };

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    return SECTIONS.filter((s) => {
      const inGroup = filter === "all" || META[s.id]?.group === filter;
      if (!inGroup) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.items.some((i) => i.h.toLowerCase().includes(q) || i.b.toLowerCase().includes(q))
      );
    });
  }, [q, filter]);

  const commitSearch = () => {
    if (q.length < 2) return;
    setSearches([query.trim(), ...searches.filter((s) => s.toLowerCase() !== q)]);
  };

  /* ------------------------------------------------------------ reader */

  if (open) {
    const saved = bookmarks.includes(open.id);
    const showUrdu = Boolean(urdu[open.id] && IBADAAT_URDU[open.id]);
    const related = SECTIONS.filter((s) => s.id !== open.id && META[s.id]?.group === META[open.id]?.group).slice(0, 4);

    return (
      <div dir={rtl ? "rtl" : "ltr"} ref={readerRef} className="space-y-6">
        <div className="fixed inset-x-0 top-0 z-40 h-[3px] bg-transparent">
          <span className="ibadah-progress block h-full" style={{ width: `${progress}%` }} aria-hidden />
        </div>

        <button
          onClick={() => setOpenId(null)}
          className="ripple inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur transition hover:text-primary"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" /> {tr("Back to Ibadah")}
        </button>

        <section className="ibadah-hero relative overflow-hidden rounded-3xl gradient-hero p-6 text-primary-foreground shadow-glow animate-rise sm:p-8">
          <span aria-hidden className="ibadah-orb -right-16 -top-20 size-56 bg-accent/25" />
          <span aria-hidden className="ibadah-orb -left-20 -bottom-24 size-56 bg-primary-foreground/10 [animation-delay:1.6s]" />
          <TopicIcon id={open.id} className="relative size-10 text-accent" />
          <h1 className="relative mt-4 font-display text-3xl leading-tight sm:text-4xl">{tr(open.title)}</h1>
          <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-primary-foreground/85">
            {tr(open.summary)}
          </p>
          <div className="relative mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => toggleBookmark(open.id)}
              className="ripple inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 text-xs font-semibold backdrop-blur transition hover:bg-background/25"
            >
              {saved ? <BookmarkCheck className="size-4 text-accent" /> : <Bookmark className="size-4" />}
              {saved ? tr("Saved to bookmarks") : tr("Save")}
            </button>
            <button
              onClick={() => void share(open)}
              className="ripple inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 text-xs font-semibold backdrop-blur transition hover:bg-background/25"
            >
              {copied ? <Check className="size-4 text-accent" /> : <Share2 className="size-4" />}
              {copied ? tr("Link copied") : tr("Share")}
            </button>
            {IBADAAT_URDU[open.id] && (
              <UrduToggle on={Boolean(urdu[open.id])} set={(v) => setUrdu((p) => ({ ...p, [open.id]: v }))} />
            )}
          </div>
        </section>

        {showUrdu ? (
          <Card className="animate-rise">
            <p dir="rtl" className="urdu-text text-right text-[0.95rem] leading-loose">{IBADAAT_URDU[open.id]}</p>
          </Card>

        ) : (
          <div className="space-y-3">
            {open.items.map((it, i) => (
              <article
                key={it.h}
                style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}
                className="ibadah-lesson animate-rise"
              >
                <span aria-hidden className="ibadah-lesson-rule" />
                <p className="font-display text-lg leading-snug text-primary">{tr(it.h)}</p>
                <p className="mt-2 text-[0.94rem] leading-relaxed text-foreground/90">{tr(it.b)}</p>
              </article>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-display text-xl">{tr("Related topics")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((s) => (
                <button key={s.id} onClick={() => openTopic(s.id)} className="ripple ibadah-related text-start">
                  <TopicIcon id={s.id} className="size-5 text-accent" />
                  <span className="min-w-0">
                    <span className="block font-display text-base leading-tight">{tr(s.title)}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{tr(s.summary)}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  /* -------------------------------------------------------------- list */

  const saveList = SECTIONS.filter((s) => bookmarks.includes(s.id));
  const recentList = SECTIONS.filter((s) => recents.includes(s.id)).sort(
    (a, b) => recents.indexOf(a.id) - recents.indexOf(b.id),
  );

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="space-y-7">
      {/* ------------------------------------------------------ hero */}
      <section className="ibadah-hero relative overflow-hidden rounded-3xl gradient-hero p-6 text-primary-foreground shadow-glow animate-rise sm:p-10">
        <span aria-hidden className="ibadah-pattern" />
        <span aria-hidden className="ibadah-orb -right-20 -top-24 size-64 bg-accent/25" />
        <span aria-hidden className="ibadah-orb -left-24 -bottom-24 size-64 bg-primary-foreground/10 [animation-delay:1.8s]" />

        <h1 className="relative font-display text-4xl leading-tight sm:text-5xl">{tr("Ibadah")}</h1>
        <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/85">
          {tr("Every act of worship — explained gently, sourced authentically, in your language.")}
        </p>
      </section>

      {/* -------------------------------------------------- language */}
      <div className="sticky top-2 z-20 space-y-3 rounded-2xl border border-border bg-card/85 p-3 shadow-soft backdrop-blur">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Languages className="size-3.5" />
          {tr("Language")}
          {translating && (
            <span className="ms-auto inline-flex items-center gap-1 text-accent">
              <Loader2 className="size-3 animate-spin" />
              {tr("Translating this section into your language…")}
            </span>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              aria-pressed={lang === l.code}
              className={`ripple shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                lang === l.code
                  ? "gradient-hero text-primary-foreground shadow-glow"
                  : "border border-border bg-background/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- search */}
      <section className="space-y-3">
        <div className="ibadah-search">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={commitSearch}
            onKeyDown={(e) => e.key === "Enter" && commitSearch()}
            placeholder={tr("Search worship topics, duas, rulings…")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="text-muted-foreground hover:text-primary">
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`ripple shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === f.key
                  ? "gradient-gold text-accent-foreground shadow-soft"
                  : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tr(f.label)}
            </button>
          ))}
        </div>

        {!query && searches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">
              <Clock className="size-3" /> {tr("Recent searches")}
            </span>
            {searches.slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="rounded-full border border-border bg-card/60 px-3 py-1 text-[0.7rem] text-muted-foreground transition hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Daily good deeds & sunnah tracker */}
      <a href="/deeds" className="group block animate-rise">
        <Card className="flex items-center gap-4 border-primary/30 transition group-hover:-translate-y-0.5 group-hover:shadow-glow">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl gradient-hero text-primary-foreground transition group-hover:scale-105">
            <GoodDeedsLogo className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg leading-tight">{tr("Daily Good Deeds Tracker")}</span>
            <span className="block text-xs text-muted-foreground">
              {tr("Tick every sunnah and good deed you complete today — with references and history.")}
            </span>
          </span>
        </Card>
      </a>

      {/* --------------------------------------- continue & bookmarks */}
      {!query && (recentList.length > 0 || saveList.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {recentList.length > 0 && (
            <ShelfCard
              title={tr("Continue reading")}
              icon={Clock}
              items={recentList.slice(0, 4)}
              onOpen={openTopic}
              tr={tr}
            />
          )}
          {saveList.length > 0 && (
            <ShelfCard title={tr("Saved")} icon={BookmarkCheck} items={saveList.slice(0, 4)} onOpen={openTopic} tr={tr} />
          )}
        </div>
      )}

      {/* ------------------------------------------------- categories */}
      <section className="space-y-3">
        <h2 className="font-display text-xl">{tr("Explore")}</h2>
        {results.length === 0 ? (
          <Card className="text-center text-sm text-muted-foreground">{tr("No topic matches that search yet.")}</Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((s) => (
              <button key={s.id} onClick={() => openTopic(s.id)} className="ibadah-box text-start">
                <span className="ibadah-box-icon">
                  <TopicIcon id={s.id} className="size-5" />
                </span>
                <span className="mt-3 block font-display text-base leading-tight sm:text-lg">{tr(s.title)}</span>
                <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{tr(s.summary)}</span>
                <span className="mt-3 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] text-primary/80">
                  {s.items.length} {tr("lessons")}
                  {bookmarks.includes(s.id) && <BookmarkCheck className="size-3.5 text-accent" />}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* --------------------------------------- admin-added sections */}
      {customIbadaat.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="size-4 text-accent" /> {tr("Added by the admin")}
          </h2>
          {customIbadaat.map((s) => {
            const isOpen = openId === `custom:${s.id}`;
            const showUr = Boolean(urdu[s.id] && s.urdu);
            return (
              <Card key={s.id} className={`transition ${isOpen ? "ring-1 ring-primary/30" : "hover:border-primary/30"}`}>
                <button
                  onClick={() => setOpenId(isOpen ? null : `custom:${s.id}`)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 text-start"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-lg">{s.title}</span>
                    {s.summary && <span className="block truncate text-xs text-muted-foreground">{s.summary}</span>}
                  </span>
                  <Sparkles className={`size-4 shrink-0 text-accent transition ${isOpen ? "rotate-90" : ""}`} />
                </button>
                {isOpen && (
                  <div className="mt-4 space-y-3">
                    {s.urdu && <UrduToggle on={Boolean(urdu[s.id])} set={(v) => setUrdu((p) => ({ ...p, [s.id]: v }))} />}
                    <div dir={showUr ? "rtl" : "ltr"} className="rounded-2xl border border-border/60 bg-secondary/40 p-4">
                      <p className={`text-sm leading-relaxed ${showUr ? "urdu-text text-right leading-loose" : ""}`}>
                        {showUr ? s.urdu : s.body}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </section>
      )}

      {/* ---------------------------------------------------- tajweed */}
      <section className="space-y-3">
        <h2 className="font-display text-xl">{tr("Tajweed — Pronunciation & Rules of Stopping")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TAJWEED_RULES.map((t, i) => (
            <Card
              key={t.title}
              className="animate-rise transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow"
            >
              <span style={{ animationDelay: `${i * 40}ms` }} />
              <p className="font-semibold text-primary">{tr(t.title)}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {t.rules.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    <span>{tr(r)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------- small parts */

function TopicIcon({ id, className = "" }: { id: string; className?: string }) {
  const Icon = META[id]?.icon ?? BookOpen;
  return <Icon className={className} />;
}

function ShelfCard({
  title,
  icon: Icon,
  items,
  onOpen,
  tr,
}: {
  title: string;
  icon: LucideIcon;
  items: IbadahSection[];
  onOpen: (id: string) => void;
  tr: (s: string) => string;
}) {
  return (
    <Card className="animate-rise">
      <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground">
        <Icon className="size-3.5 text-accent" /> {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((s) => (
          <button
            key={s.id}
            onClick={() => onOpen(s.id)}
            className="ripple inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium transition hover:border-primary/40 hover:text-primary"
          >
            <TopicIcon id={s.id} className="size-3.5 text-primary" />
            {tr(s.title)}
          </button>
        ))}
      </div>
    </Card>
  );
}

function UrduToggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-full border border-border/60 text-[11px] font-medium"
      role="group"
      aria-label="Section language"
    >
      <button
        onClick={() => set(false)}
        aria-pressed={!on}
        className={`px-3 py-1.5 transition ${!on ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
      >
        EN
      </button>
      <button
        onClick={() => set(true)}
        aria-pressed={on}
        className={`urdu-text px-3 py-1.5 transition ${on ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
      >
        اردو
      </button>
    </div>
  );
}
