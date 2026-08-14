import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { MushafAudioBar } from "@/components/MushafAudioBar";
import { buildPages, fetchFullQuran, fetchTransliteration, type MushafPage } from "@/lib/mushaf";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/quran/roman")({
  head: () => ({
    meta: [
      { title: "Roman English Quran — 15 Lines Per Page | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Read the whole Quran in Roman English transliteration, 15 lines to a page like the printed mushaf, with the English meaning — perfect if you cannot read Arabic yet.",
      },
      { property: "og:title", content: "Roman English Quran — 15 Lines Per Page" },
      { property: "og:description", content: "The complete Quran in easy Roman English, page by page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RomanQuran,
});

const RESUME_KEY = "reh-roman-quran-page";
const RESUME_SCROLL_KEY = "reh-roman-quran-scroll";

/** Reads the saved page + scroll offset, tolerating any older/broken value. */
function readResume(): { page: number; scroll: number } {
  if (typeof window === "undefined") return { page: 1, scroll: 0 };
  const savedPage = Number(window.localStorage.getItem(RESUME_KEY) ?? "1");
  const savedScroll = Number(window.localStorage.getItem(RESUME_SCROLL_KEY) ?? "0");
  return {
    page: Number.isFinite(savedPage) && savedPage > 0 ? Math.floor(savedPage) : 1,
    scroll: Number.isFinite(savedScroll) && savedScroll > 0 ? savedScroll : 0,
  };
}

function RomanQuran() {
  const { settings } = useSettings();
  const [pages, setPages] = useState<MushafPage[]>([]);
  const [translit, setTranslit] = useState<Map<number, string>>(new Map());
  const [page, setPage] = useState(1);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMeaning, setShowMeaning] = useState(true);
  /* Where inside the page the reader stopped — restored once the page renders. */
  const pendingScroll = useRef(0);
  const restored = useRef(false);

  /* resume exactly where the reader left off */
  useEffect(() => {
    const saved = readResume();
    pendingScroll.current = saved.scroll;
    setPage(saved.page);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [ayahs, map] = await Promise.all([
          fetchFullQuran(settings.lang, settings.translationEdition),
          fetchTransliteration(),
        ]);
        if (!alive) return;
        setPages(buildPages(ayahs, 15));
        setTranslit(map);
        setReady(true);
      } catch {
        if (alive) setError("Couldn't load the Roman English Quran. Check your connection and try again.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [settings.lang, settings.translationEdition]);

  const total = pages.length || 604;
  const current = useMemo(() => pages.find((p) => p.page === page) ?? pages[0], [pages, page]);

  /* Keep the exact spot saved while reading — so leaving mid-page and coming
     back later lands on the same line, not the top of the page. */
  useEffect(() => {
    if (!ready) return;
    let frame = 0;
    const save = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        window.localStorage.setItem(RESUME_SCROLL_KEY, String(Math.round(window.scrollY)));
      });
    };
    const flush = () => {
      window.localStorage.setItem(RESUME_SCROLL_KEY, String(Math.round(window.scrollY)));
    };
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("scroll", save, { passive: true } as EventListenerOptions);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
      if (frame) window.cancelAnimationFrame(frame);
      flush();
    };
  }, [ready]);

  /* Once the saved page has actually rendered, glide back to the saved line. */
  useEffect(() => {
    if (!ready || !current || restored.current) return;
    restored.current = true;
    const target = pendingScroll.current;
    if (target <= 0) return;
    const settle = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const max = Math.max(0, document.body.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(target, max), behavior: "smooth" });
      });
    });
    return () => window.cancelAnimationFrame(settle);
  }, [ready, current]);

  function go(next: number) {
    const clamped = Math.min(Math.max(1, next), total);
    setPage(clamped);
    pendingScroll.current = 0;
    restored.current = true;
    window.localStorage.setItem(RESUME_KEY, String(clamped));
    window.localStorage.setItem(RESUME_SCROLL_KEY, "0");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  return (
    <div className="space-y-5">
      <SectionTitle
        title="Roman English Quran"
        subtitle="The whole Quran in easy Roman English — 15 lines to a page, just like the printed mushaf"
      />

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span className="grid size-8 place-items-center rounded-xl bg-primary/10 font-display text-xs text-primary">
            15
          </span>
          Page <span className="font-semibold tabular-nums text-primary">{page}</span> of {total}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMeaning((v) => !v)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              showMeaning ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            Meaning
          </button>
          <button
            onClick={() => go(1)}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Start
          </button>
        </div>
      </Card>

      {/* Listen to the very same printed page, in any qari's voice */}
      <MushafAudioBar page={page} onPageEnd={() => go(page + 1)} />

      {error && <Card className="text-sm text-destructive">{error}</Card>}

      {!ready && !error && (
        <Card className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Preparing the Roman English mushaf…
        </Card>
      )}

      {ready && current && (
        <div className="mushaf-frame bg-card p-3 sm:p-6">
          <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <span>{current.ayahs[0]?.surahEnglish}</span>
            <span>Juz {current.ayahs[0]?.juz}</span>
            <span>Page {current.page}</span>
          </div>

          {/* All fifteen lines of the page first — exactly like the printed mushaf */}
          <div className="roman-page roman-sheet">
            {current.ayahs.map((a) => (
              <p key={a.number} className="roman-text roman-line">
                <span className="roman-num">{a.numberInSurah}</span>
                {translit.get(a.number) ?? a.arabic}
              </p>
            ))}
          </div>

          {/* Then the meaning of the whole page underneath */}
          {showMeaning && current.ayahs.some((a) => a.translation) && (
            <div className="roman-translation">
              <p className="roman-translation-title">Translation</p>
              <div className="roman-translation-body">
                {current.ayahs.map((a) =>
                  a.translation ? (
                    <p key={a.number} className="roman-meaning">
                      <span className="roman-num">{a.numberInSurah}</span>
                      {a.translation}
                    </p>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </div>
      )}


      <div className="sticky bottom-24 z-10 flex items-center justify-between gap-3">
        <button
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-soft disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden /> Previous
        </button>
        <button
          onClick={() => go(page + 1)}
          disabled={page >= total}
          className="inline-flex items-center gap-1 rounded-full gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-40"
        >
          Next <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
