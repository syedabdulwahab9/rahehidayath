import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Card } from "@/components/AppShell";
import { MushafAudioBar } from "@/components/MushafAudioBar";

import { useSettings } from "@/lib/settings";
import {
  MADANI_PAGES, fetchMushafPage, fetchSurahs, pageForJuz, prefetchMushafPages,
  type MushafLine,
} from "@/lib/madani-mushaf";
import { fetchIndopakPage, prefetchIndopakPages } from "@/lib/indopak-mushaf";

export const Route = createFileRoute("/mushaf/$lines")({
  head: ({ params }) =>
    params.lines === "13"
      ? {
          meta: [
            { title: "13 Line Quran-e-Pak with Audio — Indo-Pak Script | Raah e Hidayath" },
            {
              name: "description",
              content:
                "The complete 13 line Quran-e-Pak in the Indo-Pak script, page by page with recitation for every page — smooth, generous letters made for reading and hifz.",
            },
            { property: "og:title", content: "13 Line Quran-e-Pak with Audio | Raah e Hidayath" },
            { property: "og:description", content: "Thirteen lines a page, Indo-Pak script, with page-by-page recitation." },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
          ],
        }
      : {
          meta: [
            { title: "15 Line Madani Mushaf — Read the Real Quran Page by Page | Raah e Hidayath" },
            {
              name: "description",
              content:
                "The authentic 15 line Madani Mushaf: all 604 pages, each with the same fifteen lines, the same words and the same page breaks as the printed Quran.",
            },
            { property: "og:title", content: "15 Line Madani Mushaf | Raah e Hidayath" },
            { property: "og:description", content: "All 604 pages of the printed Madani Mushaf, one page per screen." },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
          ],
        },
  component: MushafReader,
});

const today = () => new Date().toISOString().slice(0, 10);
const TOTAL_PAGES = MADANI_PAGES;

function MushafReader() {
  const { lines: linesParam } = Route.useParams();
  const mode: 13 | 15 = linesParam === "13" ? 13 : 15;
  const isIndo = mode === 13;

  const { settings, update, pushHistory } = useSettings();
  const qc = useQueryClient();

  const saved = isIndo ? settings.lastRead13 : settings.lastRead;
  const [page, setPage] = useState(() =>
    settings.autoBookmark && saved?.page ? Math.min(Math.max(1, saved.page), TOTAL_PAGES) : 1,
  );
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const touchX = useRef<number | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  /* Switching between the two mushafs resumes that mushaf's own place. */
  useEffect(() => {
    const s = isIndo ? settings.lastRead13 : settings.lastRead;
    setPage(settings.autoBookmark && s?.page ? Math.min(Math.max(1, s.page), TOTAL_PAGES) : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const surahs = useQuery({ queryKey: ["mushaf-surahs"], queryFn: fetchSurahs, staleTime: Infinity });
  const { data: current, isLoading, error } = useQuery({
    queryKey: [isIndo ? "indopak-page" : "madani-page", page],
    queryFn: () => (isIndo ? fetchIndopakPage(page) : fetchMushafPage(page)),
    staleTime: Infinity,
    placeholderData: (prev) => prev,
  });

  const surahName = useMemo(() => {
    const id = current?.surahs[0];
    return surahs.data?.find((s) => s.id === id);
  }, [current, surahs.data]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(1, next || 1), TOTAL_PAGES);
      setPage(clamped);
      setRevealed({});
      frameRef.current?.scrollIntoView({ behavior: settings.autoScroll ? "smooth" : "auto", block: "start" });
    },
    [settings.autoScroll],
  );

  useEffect(() => {
    if (isIndo) {
      prefetchIndopakPages(page);
    } else {
      prefetchMushafPages(page);
      for (const p of [page + 1, page - 1]) {
        if (p >= 1 && p <= TOTAL_PAGES) {
          void qc.prefetchQuery({ queryKey: ["madani-page", p], queryFn: () => fetchMushafPage(p), staleTime: Infinity });
        }
      }
    }
  }, [page, qc, isIndo]);

  /* Bookmark, history and daily goal tracking — kept per mushaf. */
  useEffect(() => {
    if (!current) return;
    const patch: Parameters<typeof update>[0] = {};
    if (settings.autoBookmark) {
      if (isIndo) patch.lastRead13 = { lines: 13, page };
      else patch.lastRead = { lines: 15, page };
    }
    const stamp = today();
    const read = settings.readToday.date === stamp ? settings.readToday : { date: stamp, pages: 0 };
    patch.readToday = { date: stamp, pages: read.pages + 1 };
    update(patch);
    pushHistory({
      label: `${mode} line Quran · page ${page}${surahName ? ` · ${surahName.nameSimple}` : ""}`,
      href: `/mushaf/${mode}?p=${page}`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, current?.page, mode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "PageDown") go(page + 1);
      if (e.key === "ArrowRight" || e.key === "PageUp") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, go]);

  const size = settings.arabicSize;
  const setSize = (v: number) => update({ arabicSize: Math.min(46, Math.max(18, v)) });

  return (
    <div className="space-y-4">
      {/* Top bar — reading only: back, and the size control. */}
      <div className="flex items-center justify-between gap-3">
        <Link to="/quran" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="size-4" /> Quran
        </Link>
        <div className="flex items-center gap-1 rounded-full border border-border px-1 py-0.5 text-xs">
          <button onClick={() => setSize(size - 2)} aria-label="Smaller text" className="rounded-full p-1 hover:text-primary">
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center tabular-nums text-muted-foreground">{size}</span>
          <button onClick={() => setSize(size + 2)} aria-label="Larger text" className="rounded-full p-1 hover:text-primary">
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="text-center">
        <h1 className="font-display text-xl">{isIndo ? "13 Line Quran-e-Pak" : "15 Line Madani Mushaf"}</h1>
        <p className="text-xs text-muted-foreground">
          {isIndo
            ? "Indo-Pak script — thirteen generous lines on every page, with recitation"
            : "The printed 604 page Mushaf — every page has the same fifteen lines as the paper copy"}
        </p>
      </div>

      {/* --- page controls --- */}
      <Card className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <button
          disabled={page <= 1}
          onClick={() => go(page - 1)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 disabled:opacity-40"
        >
          <ChevronRight className="size-4" /> Previous
        </button>
        <input
          type="number"
          min={1}
          max={TOTAL_PAGES}
          value={page}
          onChange={(e) => go(Number(e.target.value))}
          className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-center"
          aria-label="Page number"
        />
        <span className="text-xs text-muted-foreground">/ {TOTAL_PAGES}</span>
        <select
          value=""
          onChange={(e) => e.target.value && go(Number(e.target.value))}
          className="min-w-0 flex-1 basis-[9rem] rounded-lg border border-border bg-background px-2 py-1.5 text-xs sm:flex-none"
          aria-label="Jump to surah"
        >
          <option value="">Jump to surah…</option>
          {(surahs.data ?? []).map((s) => (
            <option key={s.id} value={s.firstPage}>
              {s.id}. {s.nameSimple}
            </option>
          ))}
        </select>
        <select
          value=""
          onChange={(e) => e.target.value && go(pageForJuz(Number(e.target.value)))}
          className="min-w-0 flex-1 basis-[6rem] rounded-lg border border-border bg-background px-2 py-1.5 text-xs sm:flex-none"
          aria-label="Jump to juz"
        >
          <option value="">Juz…</option>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
            <option key={j} value={j}>
              Juz {j}
            </option>
          ))}
        </select>

        <button
          disabled={page >= TOTAL_PAGES}
          onClick={() => go(page + 1)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 disabled:opacity-40"
        >
          Next <ChevronLeft className="size-4" />
        </button>
      </Card>

      {/* --- recitation for the page on screen --- */}
      <MushafAudioBar page={page} onPageEnd={() => go(page + 1)} />

      {isLoading && !current && <div className="h-[36rem] rounded-3xl border border-border bg-card shimmer" />}
      {error && (
        <Card className="space-y-2 text-sm">
          <p className="text-destructive">Couldn't load this mushaf page.</p>
          <button onClick={() => go(page)} className="rounded-full gradient-hero px-4 py-1.5 text-xs font-semibold text-primary-foreground">
            Try again
          </button>
        </Card>
      )}

      {/* --- one printed Quran page, exactly one page of the site --- */}
      {current && (
        <div
          ref={frameRef}
          onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            const start = touchX.current;
            const end = e.changedTouches[0]?.clientX ?? null;
            if (start === null || end === null) return;
            const dx = end - start;
            if (Math.abs(dx) > 55) go(dx < 0 ? page + 1 : page - 1);
            touchX.current = null;
          }}
          className={`mushaf-frame bg-card p-3 sm:p-6 ${isIndo ? "mushaf-indo" : ""} ${
            settings.memorization ? "memorize" : ""
          } ${settings.tajweedColors ? "tajweed-on" : ""} ${settings.animation === "none" ? "" : "animate-rise"}`}
          key={`${mode}-${page}`}
        >
          <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>{surahName?.nameSimple ?? ""}</span>
            <span>Juz {current.juz}</span>
            <span>Page {current.page}</span>
          </div>

          <div
            dir="rtl"
            className={`mushaf-sheet quran-page-text ${isIndo ? "mushaf-sheet-13" : ""}`}
            style={{ "--mushaf-size": `${size}px` } as React.CSSProperties}
          >
            {current.lines.map((l) => (
              <MushafLineRow
                key={`${l.kind}-${l.line}`}
                line={l as MushafLine}
                surahName={surahs.data?.find((s) => s.id === (l.kind === "surah" ? l.surah : -1))?.nameArabic}
                wordByWord={settings.wordByWord}
                memorize={settings.memorization}
                revealed={!!revealed[l.line]}
                onReveal={() => settings.memorization && setRevealed((r) => ({ ...r, [l.line]: !r[l.line] }))}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <button disabled={page <= 1} onClick={() => go(page - 1)} className="hover:text-primary disabled:opacity-40">
              ‹ Previous page
            </button>
            <span>
              {mode} lines · {current.page} / {TOTAL_PAGES}
            </span>
            <button disabled={page >= TOTAL_PAGES} onClick={() => go(page + 1)} className="hover:text-primary disabled:opacity-40">
              Next page ›
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Swipe left or right, or use the ← → keys, to turn pages instantly. Your place is saved automatically.
      </p>

    </div>
  );
}

/** One printed line of the mushaf. */
function MushafLineRow({
  line,
  surahName,
  wordByWord,
  memorize,
  revealed,
  onReveal,
}: {
  line: MushafLine;
  surahName?: string | undefined;
  wordByWord: boolean;
  memorize: boolean;
  revealed: boolean;
  onReveal: () => void;
}) {
  if (line.kind === "surah") {
    return (
      <div className="mushaf-line mushaf-surah-band">
        <span className="mushaf-surah-name">{surahName ? `سُورَةُ ${surahName}` : ""}</span>
      </div>
    );
  }
  if (line.kind === "basmalah") {
    return (
      <div className="mushaf-line mushaf-basmalah">
        <span>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
      </div>
    );
  }
  return (
    <div
      className={`mushaf-line mushaf-words ${line.centered ? "is-centered" : ""} ${memorize ? "memo-line" : ""} ${
        revealed ? "revealed" : ""
      }`}
      onClick={onReveal}
    >
      {line.words.map((w) =>
        w.isAyahMarker ? (
          <span key={w.id} className="ayah-mark">
            {w.text}
          </span>
        ) : (
          <span key={w.id} className={wordByWord ? "wbw-word" : undefined} title={wordByWord ? (w.verseKey ?? "") : undefined}>
            {w.text}
          </span>
        ),
      )}
    </div>
  );
}
