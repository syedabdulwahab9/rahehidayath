import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Languages } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { useSiteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/wheel")({
  head: () => ({
    meta: [
      { title: "Good Deed Wheel — Spin for Today's Good Deed | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Spin the wheel and receive a good deed for today — a calm, bilingual English and Urdu companion that turns kindness into a daily habit.",
      },
      { property: "og:title", content: "Good Deed Wheel | Raah e Hidayath" },
      { property: "og:description", content: "Spin, receive a good deed, and complete it today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Wheel,
});

const SIZE = 400;
const C = SIZE / 2;
const R = 186;
const SPIN_MS = 5200;
const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

function point(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [C + radius * Math.cos(rad), C + radius * Math.sin(rad)] as const;
}

function slicePath(start: number, end: number) {
  const [x1, y1] = point(start, R);
  const [x2, y2] = point(end, R);
  const large = end - start > 180 ? 1 : 0;
  return `M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
}

function Wheel() {
  const [site] = useSiteConfig();
  const deeds = site.wheelDeeds.length ? site.wheelDeeds : [];
  const [lang, setLang] = useState<"en" | "ur">("en");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const segAngle = 360 / Math.max(deeds.length, 1);
  const urdu = lang === "ur";

  const slices = useMemo(
    () =>
      deeds.map((deed, i) => ({
        deed,
        index: i,
        path: slicePath(i * segAngle, (i + 1) * segAngle),
        mid: i * segAngle + segAngle / 2,
        deep: i % 2 === 0,
      })),
    [deeds, segAngle],
  );

  const spin = () => {
    if (spinning || !deeds.length) return;
    setSpinning(true);
    setResult(null);
    const index = Math.floor(Math.random() * deeds.length);
    const target = 360 - (index * segAngle + segAngle / 2); /* pointer sits at the top */
    const turns = 6 + Math.floor(Math.random() * 3);
    const next = rotation + turns * 360 + ((((target - rotation) % 360) + 360) % 360);
    setRotation(next);
    timer.current = window.setTimeout(() => {
      setSpinning(false);
      setResult(index);
    }, SPIN_MS);
  };

  const markDone = () => {
    if (result === null) return;
    const label = deeds[result]?.en;
    if (!label) return;
    setDone((prev) => (prev.includes(label) ? prev : [...prev, label]));
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title={urdu ? "نیکیوں کا پہیہ" : "Good Deed Wheel"}
        subtitle={
          urdu
            ? "پہیہ گھمائیں اور آج کی نیکی حاصل کریں"
            : "Spin the wheel and receive your good deed for today"
        }
      />

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
          <Languages className="mx-2 size-4 text-muted-foreground" aria-hidden />
          {(["en", "ur"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`min-h-10 rounded-full px-5 text-sm font-semibold transition ${
                lang === l
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l === "en" ? "English" : "اردو"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(18rem,25rem)_1fr]">
        {/* Wheel */}
        <div className="relative mx-auto w-full max-w-sm lg:sticky lg:top-24">
          <div
            aria-hidden
            className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1"
            style={{
              width: 0,
              height: 0,
              borderLeft: "11px solid transparent",
              borderRight: "11px solid transparent",
              borderTop: "20px solid var(--wheel-rim)",
              filter: "drop-shadow(0 2px 3px rgb(0 0 0 / 0.25))",
            }}
          />
          <div
            className="relative aspect-square"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? `transform ${SPIN_MS}ms ${EASING}` : "none",
              willChange: "transform",
            }}
          >
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="size-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
              role="img"
              aria-label={urdu ? "نیکیوں کا پہیہ" : "Good deed wheel"}
            >
              <circle cx={C} cy={C} r={R + 10} fill="var(--wheel-rim)" opacity="0.25" />
              <circle
                cx={C}
                cy={C}
                r={R + 5}
                fill="none"
                stroke="var(--wheel-rim)"
                strokeWidth="6"
              />
              {slices.map((s) => (
                <path
                  key={`slice-${s.index}`}
                  d={s.path}
                  fill={s.deep ? "var(--wheel-deep)" : "var(--wheel-soft)"}
                  stroke="var(--wheel-line)"
                  strokeWidth="1"
                />
              ))}
              {slices.map((s) => {
                /* Labels read outward along their slice, so long names never
                 * cross a divider or collide near the hub. */
                const flip = s.mid > 180;
                const label = urdu ? s.deed.shortUr : s.deed.short;
                const ty = C - R * 0.58;
                return (
                  <g
                    key={`label-${s.index}`}
                    transform={`rotate(${s.mid} ${C} ${C}) rotate(${flip ? -90 : 90} ${C} ${ty})`}
                  >

                    <text
                      x={C}
                      y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={s.deep ? "var(--wheel-deep-ink)" : "var(--wheel-soft-ink)"}
                      style={{
                        fontSize: urdu ? 12 : 11,
                        fontWeight: 600,
                        letterSpacing: urdu ? 0 : 0.2,
                      }}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
              <circle
                cx={C}
                cy={C}
                r={54}
                fill="var(--wheel-soft)"
                stroke="var(--wheel-rim)"
                strokeWidth="3"
              />
            </svg>
          </div>
          <button
            onClick={spin}
            disabled={spinning || !deeds.length}
            className="absolute left-1/2 top-1/2 z-10 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-accent/50 bg-card font-display text-base tracking-wide text-primary shadow-soft transition hover:bg-secondary disabled:opacity-70"
          >
            {spinning ? (urdu ? "…" : "SPINNING") : urdu ? "گھمائیں" : "SPIN"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result !== null && (
        <Card className="animate-rise space-y-3 border-accent/50 py-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {urdu ? "آج کی نیکی" : "Your deed for today"}
          </p>
          <p className={`font-display text-2xl leading-relaxed ${urdu ? "urdu-text" : ""}`}>
            {urdu ? deeds[result]?.ur : deeds[result]?.en}
          </p>
          <button
            onClick={markDone}
            disabled={deeds[result] ? done.includes(deeds[result].en) : true}
            className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            <Check className="size-4" aria-hidden />
            {deeds[result] && done.includes(deeds[result].en)
              ? urdu
                ? "الحمدللہ، مکمل!"
                : "Alhamdulillah, done!"
              : urdu
                ? "مکمل کر لیا"
                : "I completed it"}
          </button>
        </Card>
      )}

      {/* Today's completed deeds */}
      <Card>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg">
            {urdu ? "آج کی مکمل نیکیاں" : "Completed today"}
          </h2>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {done.length}
          </span>
        </div>
        {done.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {urdu
              ? "ابھی کچھ مکمل نہیں ہوا — پہیہ گھما کر آغاز کریں۔"
              : "Nothing yet — spin the wheel to begin."}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {done.map((d) => (
              <li key={d} className="flex items-center gap-2 text-sm">
                <Check className="size-4 shrink-0 text-primary" aria-hidden />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
