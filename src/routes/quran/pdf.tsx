import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { BookOpenCheck, Check, ChevronLeft, Headphones, Maximize2, Minimize2, ScrollText } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { QURAN_PDFS, type QuranPdf } from "@/lib/quran-pdf";

export const Route = createFileRoute("/quran/pdf")({
  head: () => ({
    meta: [
      { title: "13 Line & 15 Line Quran PDF — Read Full Quran Online | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Read the complete 13 line Quran-e-Pak and the 15 line Madani Mushaf as real printed PDF pages, fully inside this website — free, unlimited and without leaving the site.",
      },
      { property: "og:title", content: "13 & 15 Line Quran PDF | Raah e Hidayath" },
      { property: "og:description", content: "The real printed mushaf, read page by page inside our own reader." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuranPdfPage,
});

function EditionCard({ pdf, active, onSelect }: { pdf: QuranPdf; active: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="group block w-full text-left">
      <Card
        className={`relative h-full overflow-hidden p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow ${
          active ? "border-primary/60 shadow-glow ring-1 ring-primary/40" : "border-border"
        }`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-primary/10 blur-2xl"
        />
        <div className="relative flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 font-display text-lg text-primary">
            {pdf.lines}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-xl">{pdf.title}</p>
            <p className="text-xs text-muted-foreground">{pdf.subtitle}</p>
          </div>
          {active && <Check className="ml-auto size-5 shrink-0 text-primary" />}
        </div>
        <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{pdf.detail}</p>
        <div className="relative mt-4 flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-wider">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{pdf.pages} pages</span>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-accent">{pdf.script} script</span>
          <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">Free · full access</span>
        </div>
      </Card>
    </button>
  );
}

function QuranPdfPage() {
  const [active, setActive] = useState<QuranPdf>(QURAN_PDFS[1]!);
  const [wide, setWide] = useState(false);
  const frameWrap = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = () => {
    const el = frameWrap.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => setWide((w) => !w));
  };

  return (
    <div className="space-y-6">
      <Link to="/quran" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Al Quran
      </Link>

      <SectionTitle
        title="Quran PDF Reader"
        subtitle="The authentic printed mushaf — 13 lines and 15 lines, read completely inside this website"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {QURAN_PDFS.map((pdf) => (
          <EditionCard key={pdf.id} pdf={pdf} active={pdf.id === active.id} onSelect={() => setActive(pdf)} />
        ))}
      </div>

      {/* The printed pages, read here — never on another website */}
      <div
        ref={frameWrap}
        className={`overflow-hidden rounded-3xl border border-border bg-card shadow-soft ${
          wide ? "fixed inset-2 z-50 rounded-2xl shadow-glow" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
          <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
            <BookOpenCheck className="size-4 shrink-0 text-primary" />
            <span className="truncate">{active.title}</span>
            <span className="hidden shrink-0 text-xs font-normal text-muted-foreground sm:inline">
              · {active.pages} printed pages
            </span>
          </p>
          <button
            onClick={toggleFullscreen}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition hover:border-primary/50 hover:text-primary"
          >
            {wide ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            {wide ? "Exit full screen" : "Full screen"}
          </button>
        </div>
        <iframe
          key={active.id}
          title={`${active.title} — printed pages`}
          src={active.embedUrl}
          loading="lazy"
          allowFullScreen
          className={`w-full bg-muted ${wide ? "h-[calc(100%-3.25rem)]" : "h-[78vh] min-h-[460px]"}`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/mushaf/$lines" params={{ lines: "15" }} className="block">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-glow">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Headphones className="size-4 text-primary" /> Full Quran with audio
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The same 15 line Madani pages in our digital mushaf, with recitation for every page.
            </p>
          </Card>
        </Link>
        <Link to="/quran" className="block">
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-glow">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ScrollText className="size-4 text-primary" /> All 114 surahs
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Arabic, translation, tafseer and recitation, surah by surah.
            </p>
          </Card>
        </Link>
      </div>

      <Card className="space-y-2 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">About these copies</p>
        <p>
          Both editions are complete, unabridged and freely distributable copies of the Noble Quran. Nothing is
          altered — the 13 line copy follows the Indo-Pak script, and the 15 line copy is the Madani Mushaf in Uthmani
          script where every page ends on the same ayah as the printed book. Every page is readable here, free and in
          full, with no download and no other website.
        </p>
      </Card>
    </div>
  );
}
