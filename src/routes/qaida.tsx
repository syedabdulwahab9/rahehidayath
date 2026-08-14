import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { QAIDA_LESSONS } from "@/lib/islamic-data";
import { useTranslate } from "@/lib/translate";

export const Route = createFileRoute("/qaida")({
  head: () => ({
    meta: [
      { title: "Noorani Qaida — Learn to Read Quran | Raah e Hidayath" },
      { name: "description", content: "Read the complete Noorani Qaida: all 32 lessons from single letters to full surahs — letters, harakaat, tanween, maddah, tashdeed, tajweed and waqf." },
      { property: "og:title", content: "Noorani Qaida | Raah e Hidayath" },
      { property: "og:description", content: "Every Noorani Qaida lesson, from the first letter to reading a surah." },
    ],
  }),
  component: Qaida,
});

function LittleReader() {
  return (
    <svg viewBox="0 0 120 120" className="size-28" aria-hidden>
      <circle cx="60" cy="38" r="20" className="fill-accent/70" />
      <path d="M38 34c0-14 44-14 44 0-6-4-38-4-44 0Z" className="fill-primary" />
      <ellipse cx="52" cy="40" rx="2.6" ry="2.6" className="fill-primary" />
      <ellipse cx="68" cy="40" rx="2.6" ry="2.6" className="fill-primary" />
      <ellipse cx="60" cy="49" rx="3" ry="1.4" className="fill-primary/70" />
      <path d="M32 108c0-18 12-28 28-28s28 10 28 28Z" className="fill-primary" />
      <path d="M36 96h48l-24 12Z" className="fill-accent" />
    </svg>
  );
}

function Qaida() {
  const [lesson, setLesson] = useState(0);
  const [zoom, setZoom] = useState(1);
  const active = QAIDA_LESSONS[lesson]!;

  const { tr } = useTranslate([
    "Noorani Qaida",
    "Read every lesson, from the very first letter to a complete surah",
    "Assalamu Alaikum!",
    "This is a reading Qaida — no audio. Look at each letter, read it slowly with correct makhraj, then move to the next lesson.",
    "Lesson",
    "of",
    "Previous lesson",
    "Next lesson",
    "Letter size",
    "All lessons",
    ...QAIDA_LESSONS.map((l) => l.title),
    ...QAIDA_LESSONS.map((l) => l.note),
  ]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title={tr("Noorani Qaida")}
        subtitle={tr("Read every lesson, from the very first letter to a complete surah")}
      />

      <Card className="flex items-center gap-4 gradient-soft">
        <LittleReader />
        <div>
          <p className="font-display text-lg">{tr("Assalamu Alaikum!")}</p>
          <p className="text-sm text-muted-foreground">
            {tr(
              "This is a reading Qaida — no audio. Look at each letter, read it slowly with correct makhraj, then move to the next lesson.",
            )}
          </p>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">
            {tr("Lesson")} {active.n} {tr("of")} {QAIDA_LESSONS.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLesson((l) => (l - 1 + QAIDA_LESSONS.length) % QAIDA_LESSONS.length)}
              aria-label={tr("Previous lesson")}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:text-primary"
            >
              <ChevronLeft className="size-3.5" /> {tr("Previous lesson")}
            </button>
            <button
              onClick={() => setLesson((l) => (l + 1) % QAIDA_LESSONS.length)}
              aria-label={tr("Next lesson")}
              className="inline-flex items-center gap-1 rounded-full gradient-gold px-3 py-1.5 text-xs font-semibold text-accent-foreground"
            >
              {tr("Next lesson")} <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-muted-foreground">
            {tr("Letter size")} — {zoom.toFixed(2)}×
          </span>
          <input
            type="range"
            min={0.8}
            max={2}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="accent-primary"
          />
        </label>
      </Card>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">{tr("All lessons")}</p>
        <div className="flex flex-wrap gap-2">
          {QAIDA_LESSONS.map((l, i) => (
            <button
              key={l.n}
              onClick={() => setLesson(i)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                i === lesson
                  ? "border-transparent gradient-hero text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-primary"
              }`}
            >
              {tr("Lesson")} {l.n}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <p className="flex items-center gap-2 font-display text-lg">
          <BookOpen className="size-4 text-primary" /> {tr(active.title)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{tr(active.note)}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {active.letters.map((ch, i) => (
            <div
              key={`${ch}-${i}`}
              style={{ animationDelay: `${i * 25}ms`, fontSize: `${zoom * 1.9}rem` }}
              className="animate-rise grid min-h-24 place-items-center rounded-2xl border border-border bg-card p-2 text-center text-primary shadow-soft"
            >
              <span className="arabic-ayah leading-relaxed">{ch}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
