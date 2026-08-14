import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, FileText, Headphones, Mic, Search } from "lucide-react";
import { SectionTitle, Card } from "@/components/AppShell";
import { fetchSurahList } from "@/lib/quran-api";
import { useSettings } from "@/lib/settings";
import { QURAN_PDFS } from "@/lib/quran-pdf";
import { useHadithBookmarks } from "@/lib/hadith-storage";

export const Route = createFileRoute("/quran/")({
  head: () => ({
    meta: [
      { title: "Al Quran — Read, Listen, Translate & Tafseer | Raah e Hidayath" },
      { name: "description", content: "All 114 surahs with Arabic text, recitation audio, translation in many languages, tafseer, and the authentic 13 line and 15 line printed Quran." },
      { property: "og:title", content: "Al Quran — Raah e Hidayath" },
      { property: "og:description", content: "Read, listen and understand the complete Quran in your language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuranIndex,
});

const JUZ_STARTS: Array<{ juz: number; surah: number; ayah: number; label: string }> = [
  { juz: 1, surah: 1, ayah: 1, label: "Al-Fātiḥah 1" },
  { juz: 2, surah: 2, ayah: 142, label: "Al-Baqarah 142" },
  { juz: 3, surah: 2, ayah: 253, label: "Al-Baqarah 253" },
  { juz: 4, surah: 3, ayah: 93, label: "Āli 'Imrān 93" },
  { juz: 5, surah: 4, ayah: 24, label: "An-Nisā' 24" },
  { juz: 6, surah: 4, ayah: 148, label: "An-Nisā' 148" },
  { juz: 7, surah: 5, ayah: 82, label: "Al-Mā'idah 82" },
  { juz: 8, surah: 6, ayah: 111, label: "Al-An'ām 111" },
  { juz: 9, surah: 7, ayah: 88, label: "Al-A'rāf 88" },
  { juz: 10, surah: 8, ayah: 41, label: "Al-Anfāl 41" },
  { juz: 11, surah: 9, ayah: 93, label: "At-Tawbah 93" },
  { juz: 12, surah: 11, ayah: 6, label: "Hūd 6" },
  { juz: 13, surah: 12, ayah: 53, label: "Yūsuf 53" },
  { juz: 14, surah: 15, ayah: 1, label: "Al-Ḥijr 1" },
  { juz: 15, surah: 17, ayah: 1, label: "Al-Isrā' 1" },
  { juz: 16, surah: 18, ayah: 75, label: "Al-Kahf 75" },
  { juz: 17, surah: 21, ayah: 1, label: "Al-Anbiyā' 1" },
  { juz: 18, surah: 23, ayah: 1, label: "Al-Mu'minūn 1" },
  { juz: 19, surah: 25, ayah: 21, label: "Al-Furqān 21" },
  { juz: 20, surah: 27, ayah: 56, label: "An-Naml 56" },
  { juz: 21, surah: 29, ayah: 46, label: "Al-'Ankabūt 46" },
  { juz: 22, surah: 33, ayah: 31, label: "Al-Aḥzāb 31" },
  { juz: 23, surah: 36, ayah: 28, label: "Yā-Sīn 28" },
  { juz: 24, surah: 39, ayah: 32, label: "Az-Zumar 32" },
  { juz: 25, surah: 41, ayah: 47, label: "Fuṣṣilat 47" },
  { juz: 26, surah: 46, ayah: 1, label: "Al-Aḥqāf 1" },
  { juz: 27, surah: 51, ayah: 31, label: "Adh-Dhāriyāt 31" },
  { juz: 28, surah: 58, ayah: 1, label: "Al-Mujādilah 1" },
  { juz: 29, surah: 67, ayah: 1, label: "Al-Mulk 1" },
  { juz: 30, surah: 78, ayah: 1, label: "An-Naba' 1" },
];

type Tab = "surah" | "juz" | "bookmarks";

function QuranIndex() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("surah");
  const { settings } = useSettings();
  const { bookmarks } = useHadithBookmarks();
  const { data, isLoading, error } = useQuery({ queryKey: ["surahs"], queryFn: fetchSurahList, staleTime: Infinity });

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (data ?? []).filter(
      (s) =>
        !query ||
        s.englishName.toLowerCase().includes(query) ||
        s.englishNameTranslation.toLowerCase().includes(query) ||
        String(s.number) === query,
    );
  }, [data, q]);

  const last = settings.lastSurah;

  return (
    <div className="space-y-8">
      <SectionTitle title="Al Quran" subtitle="114 Surahs · Reading · Audio · Translation · Tafseer" />

      {/* Continue where the reader left off */}
      {last ? (
        <Link to="/quran/$surahId" params={{ surahId: String(last.number) }} className="block animate-rise">
          <div className="gradient-hero group relative overflow-hidden rounded-3xl p-5 shadow-glow transition active:scale-[0.99]">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary-foreground/15 text-primary-foreground">
                <BookOpen className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">
                  Last read
                </span>
                <span className="mt-0.5 block truncate font-display text-xl text-primary-foreground">
                  {last.name}
                </span>
                <span className="block truncate text-sm text-primary-foreground/80">
                  Ayah {last.ayah}
                  {last.translation ? ` · ${last.translation}` : ""}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition group-hover:bg-primary-foreground/25">
                Continue <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>
      ) : null}

      {/* Roman English mushaf — for anyone who cannot read Arabic yet */}
      <Link to="/quran/roman" className="group block animate-rise">
        <Card className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-primary/30 p-3 transition group-hover:-translate-y-0.5 group-hover:shadow-glow sm:p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl gradient-gold font-display text-sm text-accent-foreground sm:size-11">
            Ro
          </span>
          <span className="min-w-0">
            <span className="block text-[0.58rem] uppercase tracking-[0.22em] text-primary sm:text-[0.62rem] sm:tracking-[0.28em]">
              New to Arabic?
            </span>
            <span className="mt-0.5 block text-[0.8rem] font-semibold leading-snug sm:text-sm">
              Roman English Quran — 15 lines a page
            </span>
            <span className="block text-[0.7rem] leading-snug text-muted-foreground">
              Read every ayah in easy English letters — continues from where you left off
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
        </Card>
      </Link>

      {/* Continue the printed mushafs, each from its own saved page */}
      {(settings.lastRead || settings.lastRead13) && (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {settings.lastRead && (
            <Link to="/mushaf/$lines" params={{ lines: "15" }} className="group block animate-rise">
              <Card className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-primary/30 p-3 transition group-hover:-translate-y-0.5 group-hover:shadow-glow sm:p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 font-display text-sm text-primary sm:size-11">
                  15
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.58rem] uppercase tracking-[0.22em] text-primary sm:text-[0.62rem] sm:tracking-[0.28em]">
                    Continue reading
                  </span>
                  <span className="mt-0.5 block text-[0.8rem] font-semibold leading-snug sm:text-sm">
                    15 Line Madani
                  </span>
                  <span className="block text-[0.7rem] leading-snug text-muted-foreground">
                    Page {settings.lastRead.page} of 604
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
              </Card>
            </Link>
          )}
          {settings.lastRead13 && (
            <Link to="/mushaf/$lines" params={{ lines: "13" }} className="group block animate-rise">
              <Card className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-accent/40 p-3 transition group-hover:-translate-y-0.5 group-hover:shadow-glow sm:p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/15 font-display text-sm text-accent sm:size-11">
                  13
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.58rem] uppercase tracking-[0.22em] text-accent sm:text-[0.62rem] sm:tracking-[0.28em]">
                    Continue reading
                  </span>
                  <span className="mt-0.5 block text-[0.8rem] font-semibold leading-snug sm:text-sm">
                    13 Line Quran-e-Pak
                  </span>
                  <span className="block text-[0.7rem] leading-snug text-muted-foreground">
                    Page {settings.lastRead13.page} of 604
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-accent transition group-hover:translate-x-0.5" />
              </Card>
            </Link>
          )}
        </div>
      )}


      {/* Reading options — every way to open the complete Quran */}
      <div className="space-y-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Ways to read the complete Quran
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link to="/quran/teacher" className="quran-tile tile-emerald sm:col-span-2">
            <span className="quran-tile-inner">
              <span className="flex items-center gap-3">
                <span className="quran-tile-badge">
                  <Mic className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-primary">
                    Listens to you · corrects you
                  </span>
                  <span className="mt-0.5 block font-display text-lg leading-tight">AI Quran Teacher</span>
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                Recite from the Madani Mushaf while a teacher follows every word, catches each tajweed and
                pronunciation mistake, explains it kindly in your language, and resumes exactly where you stopped.
              </span>
            </span>
          </Link>


          <Link
            to="/mushaf/$lines"
            params={{ lines: "15" }}
            className="quran-tile tile-emerald"
          >
            <span className="quran-tile-inner">
              <span className="flex items-center gap-3">
                <span className="quran-tile-badge font-display text-base">15</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <Headphones className="size-3" /> Full Quran with audio
                  </span>
                  <span className="mt-0.5 block font-display text-lg leading-tight">15 Line Madani Mushaf</span>
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                All 604 printed Uthmani pages with page-by-page recitation, ayah by ayah.
              </span>
            </span>
          </Link>

          <Link
            to="/mushaf/$lines"
            params={{ lines: "13" }}
            className="quran-tile tile-gold"
          >
            <span className="quran-tile-inner">
              <span className="flex items-center gap-3">
                <span className="quran-tile-badge font-display text-base">13</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <Headphones className="size-3" /> Full Quran with audio
                  </span>
                  <span className="mt-0.5 block font-display text-lg leading-tight">13 Line Quran-e-Pak</span>
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                The Indo-Pak script the subcontinent reads — thirteen wide lines a page, with recitation.
              </span>
            </span>
          </Link>

          <Link to="/quran/pdf" className="quran-tile tile-azure">
            <span className="quran-tile-inner">
              <span className="flex items-center gap-3">
                <span className="quran-tile-badge">
                  <FileText className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    PDF library · full access
                  </span>
                  <span className="mt-0.5 block font-display text-lg leading-tight">13 &amp; 15 Line Quran PDF</span>
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                Both real printed mushafs, every page, read completely inside this website.
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                Open the reader <ArrowRight className="size-3.5" />
              </span>
            </span>
          </Link>

          <Link to="/quran/$surahId" params={{ surahId: "1" }} className="quran-tile tile-plum">
            <span className="quran-tile-inner">
              <span className="flex items-center gap-3">
                <span className="quran-tile-badge">
                  <BookOpen className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Study mode
                  </span>
                  <span className="mt-0.5 block font-display text-lg leading-tight">Surah by surah</span>
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                Arabic with translation, transliteration, tafseer and your chosen reciter.
              </span>
            </span>
          </Link>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-border bg-card p-1 text-sm font-medium shadow-soft">
        {([
          ["surah", "Surah"],
          ["juz", "Juz"],
          ["bookmarks", `Bookmarks (${bookmarks.length})`],
        ] as Array<[Tab, string]>).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`flex-1 rounded-xl py-2 transition ${
              tab === id ? "gradient-hero text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "surah" && (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search surah by name or number…"
              className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-4 text-sm shadow-soft outline-none transition focus:border-primary focus:shadow-glow"
            />
          </div>

          {isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl border border-border bg-card shimmer" />
              ))}
            </div>
          )}
          {error && <Card className="text-sm text-destructive">Couldn't load the surah list. Please retry.</Card>}

          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            {list.map((s, i) => (
              <Link
                key={s.number}
                to="/quran/$surahId"
                params={{ surahId: String(s.number) }}
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                className="animate-rise group block focus-visible:outline-none"
              >
                <Card className="relative h-full min-h-[6.5rem] overflow-hidden p-[1px] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow group-active:translate-y-0 group-active:scale-[0.985]">
                  {/* premium gilded frame */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/25 via-transparent to-accent/25 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-accent/10 blur-2xl transition duration-500 group-hover:bg-accent/20"
                  />
                  <span aria-hidden className="surah-card-sheen" />
                  <span className="relative grid h-full grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[inherit] bg-card/90 p-4 backdrop-blur-sm sm:gap-4">
                    <span className="relative grid size-12 shrink-0 place-items-center">
                      <svg
                        viewBox="0 0 40 40"
                        className="absolute inset-0 size-full text-primary/35 transition-colors duration-300 group-hover:text-primary/70"
                        fill="none"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <g className="surah-medallion-ring">
                          <path d="M20 2 34 10v20L20 38 6 30V10L20 2Z" strokeWidth="1.3" />
                        </g>
                        <g className="surah-medallion-ring-alt text-accent/60">
                          <path d="M20 5 32 11.5v17L20 35 8 28.5v-17L20 5Z" strokeWidth="0.7" />
                        </g>
                        <circle cx="20" cy="20" r="12.5" strokeWidth="0.5" className="text-accent/35" />
                      </svg>
                      <span className="surah-number relative font-display text-[0.95rem] font-semibold">
                        {s.number}
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate font-display text-[1.05rem] leading-tight tracking-tight">
                        {s.englishName}
                      </span>
                      <span className="mt-0.5 block truncate text-xs leading-tight text-muted-foreground">
                        {s.englishNameTranslation}
                      </span>
                      <span className="mt-2 flex items-center gap-2 text-[0.68rem] leading-none">
                        <span className="rounded-full bg-secondary px-2 py-0.5 tabular-nums text-muted-foreground">
                          {s.numberOfAyahs} ayahs
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider ${
                            s.revelationType === "Meccan" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent"
                          }`}
                        >
                          {s.revelationType === "Meccan" ? "Meccan" : "Medinan"}
                        </span>
                      </span>
                    </span>

                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      <span
                        dir="rtl"
                        lang="ar"
                        className="arabic-ayah max-w-[7.5rem] truncate text-right text-lg leading-[2] text-primary sm:max-w-[9rem] sm:text-xl"
                      >
                        {s.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground/70 transition group-hover:text-primary">
                        Read <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </span>
                </Card>
              </Link>
            ))}
          </div>

        </>
      )}

      {tab === "juz" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {JUZ_STARTS.map((j, i) => (
            <Link
              key={j.juz}
              to="/quran/$surahId"
              params={{ surahId: String(j.surah) }}
              style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
              className="animate-rise group block"
            >
              <Card className="flex items-center gap-3 p-4 transition group-hover:-translate-y-0.5 group-hover:shadow-glow">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                  {j.juz}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">Juz {j.juz}</span>
                  <span className="block truncate text-xs text-muted-foreground">Begins at {j.label}</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {tab === "bookmarks" && (
        <div className="flex flex-col gap-4">
          {last ? (
            <Link to="/quran/$surahId" params={{ surahId: String(last.number) }} className="group block">
              <Card className="flex items-center justify-between gap-4 border-primary/30 p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-glow">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-primary">Saved place</span>
                    <span className="mt-0.5 block truncate text-sm font-semibold">
                      {last.name} · Ayah {last.ayah}
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
              </Card>
            </Link>
          ) : (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Open any surah — your place is saved automatically and appears here.
            </Card>
          )}

          {settings.lastRead && (
            <Link to="/mushaf/$lines" params={{ lines: "15" }} className="group block">
              <Card className="flex items-center justify-between gap-4 p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-glow">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent/15 font-display text-sm text-accent">
                    15
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-primary">Madani mushaf</span>
                    <span className="mt-0.5 block truncate text-sm font-semibold">
                      Page {settings.lastRead.page} of 604
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
              </Card>
            </Link>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {QURAN_PDFS.map((p) => (
              <Link key={p.id} to="/quran/pdf" className="group block">
                <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-glow">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="size-4 shrink-0 text-primary" /> {p.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.subtitle}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    Read here <ArrowRight className="size-3.5" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
