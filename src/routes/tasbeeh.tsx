import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Vibrate, VibrateOff } from "lucide-react";
import { SectionTitle } from "@/components/AppShell";
import { TASBEEH_PRESETS } from "@/lib/islamic-data";

export const Route = createFileRoute("/tasbeeh")({
  head: () => ({
    meta: [
      { title: "Digital Tasbeeh Counter | Raah e Hidayath" },
      { name: "description", content: "Count SubhanAllah, Alhamdulillah, Allahu Akbar, Durood and Istighfar with a beautiful digital tasbeeh." },
      { property: "og:title", content: "Digital Tasbeeh | Raah e Hidayath" },
      { property: "og:description", content: "Keep your daily dhikr on track." },
    ],
  }),
  component: Tasbeeh,
});

const RING = 2 * Math.PI * 92; // r = 92 in the progress ring below

function Tasbeeh() {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [haptics, setHaptics] = useState(true);
  const [pulse, setPulse] = useState(0);
  const preset = TASBEEH_PRESETS[index]!;
  const done = count >= preset.target;
  const pct = Math.min(100, (count / preset.target) * 100);
  const beadRef = useRef<HTMLButtonElement>(null);

  /* Beads that orbit the counter — one lit bead per ten dhikr. */
  const beads = useMemo(() => Array.from({ length: 33 }, (_, i) => i), []);
  const litBeads = Math.min(beads.length, Math.round((pct / 100) * beads.length));

  useEffect(() => {
    if (!done || !haptics || typeof navigator === "undefined" || !navigator.vibrate) return;
    navigator.vibrate([18, 60, 18]);
  }, [done, haptics]);

  function tap() {
    setCount((c) => {
      const next = c + 1;
      if (next > preset.target) {
        setRounds((r) => r + 1);
        return 1;
      }
      return next;
    });
    setPulse((p) => p + 1);
    if (haptics && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
  }

  function pick(i: number) {
    setIndex(i);
    setCount(0);
    setRounds(0);
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Digital Tasbeeh" subtitle="Tap the bead for every dhikr" />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TASBEEH_PRESETS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => pick(i)}
            aria-pressed={i === index}
            className={`ripple shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              i === index
                ? "border-transparent gradient-hero text-primary-foreground shadow-glow"
                : "border-border bg-card text-muted-foreground hover:text-primary"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <section className="tasbeeh-stage animate-rise">
        <span aria-hidden className="tasbeeh-aura" />
        <p className="arabic-ayah relative text-center text-4xl text-primary">{preset.arabic}</p>
        <p className="relative mt-2 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {preset.name}
        </p>

        <div className="tasbeeh-dial">
          <span aria-hidden className="tasbeeh-beads">
            {beads.map((b) => (
              <span
                key={b}
                className={`tasbeeh-bead ${b < litBeads ? "is-lit" : ""}`}
                style={{ transform: `rotate(${(b / beads.length) * 360}deg) translateY(-7.6rem)` }}
              />
            ))}
          </span>

          <svg viewBox="0 0 200 200" className="tasbeeh-ring" aria-hidden>
            <circle cx="100" cy="100" r="92" className="tasbeeh-ring-track" />
            <circle
              cx="100"
              cy="100"
              r="92"
              className="tasbeeh-ring-progress"
              strokeDasharray={RING}
              strokeDashoffset={RING - (pct / 100) * RING}
            />
          </svg>

          <button
            ref={beadRef}
            onClick={tap}
            aria-label={`Count ${preset.name}`}
            className={`tasbeeh-tap ${done ? "is-done" : ""}`}
          >
            <span key={pulse} aria-hidden className="tasbeeh-pulse" />
            <span className="tasbeeh-count tabular-nums" key={`c-${count}`}>
              {count}
            </span>
            <span className="tasbeeh-target">of {preset.target}</span>
          </button>
        </div>

        <p className="relative mt-6 text-center text-sm text-muted-foreground">
          {done ? "Completed, MashaAllah" : `${preset.target - count} remaining`}
          {rounds > 0 && <span className="tasbeeh-rounds">{rounds} rounds</span>}
        </p>

        <div className="relative mt-5 flex justify-center gap-2">
          <button
            onClick={() => {
              setCount(0);
              setRounds(0);
            }}
            className="ripple inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-primary"
          >
            <RotateCcw className="size-4" /> Reset
          </button>
          <button
            onClick={() => setHaptics((h) => !h)}
            aria-pressed={haptics}
            className="ripple inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-primary"
          >
            {haptics ? <Vibrate className="size-4" /> : <VibrateOff className="size-4" />}
            {haptics ? "Vibration on" : "Vibration off"}
          </button>
        </div>
      </section>
    </div>
  );
}
