import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BookOpen, Check, Flame, HandHeart, Moon, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";

import { useIbadahLog } from "@/lib/ibadah-log";


export const Route = createFileRoute("/tree")({
  head: () => ({
    meta: [
      { title: "The Ibadah Tree — Grow Your Worship Daily | Raah e Hidayath" },
      {
        name: "description",
        content:
          "A living tree that grows leaves and blossoms as you log your Salah, Quran, dhikr, charity and staying away from haram each day.",
      },
      { property: "og:title", content: "The Ibadah Tree | Raah e Hidayath" },
      { property: "og:description", content: "Log your daily worship and watch a minimalist tree blossom." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IbadahTree,
});



const HABITS = [
  { id: "fajr", label: "Fajr", icon: Sun, hint: "Before sunrise" },
  { id: "dhuhr", label: "Dhuhr", icon: Sun, hint: "Midday" },
  { id: "asr", label: "Asr", icon: Sun, hint: "Afternoon" },
  { id: "maghrib", label: "Maghrib", icon: Moon, hint: "Sunset" },
  { id: "isha", label: "Isha", icon: Moon, hint: "Night" },
  { id: "quran", label: "Quran", icon: BookOpen, hint: "Read or listen" },
  { id: "dhikr", label: "Dhikr", icon: Sparkles, hint: "Remembrance" },
  { id: "sadaqah", label: "Sadaqah", icon: HandHeart, hint: "Any kindness" },
  { id: "haram", label: "Avoided haram", icon: ShieldCheck, hint: "Guarded eyes & tongue" },
] as const;

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* deterministic pseudo-random so the tree looks organic but never jumps around */
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Leaf = { x: number; y: number; r: number; s: number; d: number };

/** Canopy clusters sitting on the branch tips, so leaves always grow on wood. */
const CLUSTERS: { x: number; y: number; r: number }[] = [
  { x: 98, y: 62, r: 22 },
  { x: 68, y: 76, r: 18 },
  { x: 132, y: 74, r: 18 },
  { x: 54, y: 66, r: 13 },
  { x: 146, y: 64, r: 13 },
  { x: 78, y: 54, r: 14 },
  { x: 120, y: 52, r: 14 },
];

const r2 = (n: number) => Math.round(n * 100) / 100;

const makeCanopy = (count: number, seed: number, spread: number): Leaf[] => {
  const out: Leaf[] = [];
  for (let i = 0; i < count; i++) {
    const c = CLUSTERS[i % CLUSTERS.length]!;
    const a = rand(i + seed) * Math.PI * 2;
    const rad = Math.sqrt(rand(i + seed + 90)) * spread;
    out.push({
      x: r2(c.x + Math.cos(a) * c.r * rad),
      y: r2(c.y + Math.sin(a) * c.r * rad * 0.82),
      r: r2(-35 + rand(i + seed + 40) * 70),
      s: r2(0.9 + rand(i + seed + 70) * 0.5),
      d: i * 22,
    });
  }
  return out;
};

const LEAVES: Leaf[] = makeCanopy(63, 0, 1);
const BLOSSOMS: Leaf[] = makeCanopy(14, 500, 0.75).map((b, i) => ({ ...b, d: 300 + i * 55 }));


function IbadahTree() {
  const { log, done, toggle, mounted, goodDeedsToday } = useIbadahLog();

  const habitsDone = HABITS.filter((h) => done.includes(h.id)).length;
  const ratio = habitsDone / HABITS.length;
  const leafCount = Math.round(ratio * LEAVES.length);
  const perfect = habitsDone === HABITS.length;

  const dayHabits = (d: Date) =>
    (log[iso(d)] ?? []).filter((id: string) => HABITS.some((h) => h.id === id)).length;


  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    if (dayHabits(d) < HABITS.length) d.setDate(d.getDate() - 1);
    while (dayHabits(d) === HABITS.length) {
      s += 1;
      d.setDate(d.getDate() - 1);
    }
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);

  /* every good deed tapped today opens another blossom, on top of the streak */
  const blossomCount = Math.min(BLOSSOMS.length, (perfect ? BLOSSOMS.length : Math.max(0, streak)) + goodDeedsToday);

  const week = useMemo(() => {
    const out: { day: string; n: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push({ day: d.toLocaleDateString(undefined, { weekday: "narrow" }), n: dayHabits(d) });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);







  const stage =
    ratio === 0 ? "A quiet seed" : ratio < 0.34 ? "First shoots" : ratio < 0.67 ? "Growing strong" : perfect ? "In full blossom" : "Nearly blooming";

  return (
    <div className="space-y-6">
      <SectionTitle title="The Ibadah Tree" subtitle="Your worship, growing leaf by leaf" />

      {/* ---------- The tree ---------- */}
      <Card className="relative overflow-hidden gradient-hero p-0 text-primary-foreground shadow-glow">
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-accent/20 blur-3xl animate-float" aria-hidden />
        <div className="absolute -bottom-24 -left-16 size-64 rounded-full bg-primary/30 blur-3xl" aria-hidden />

        <div className="relative px-6 pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">{stage}</p>
          <p className="mt-1 font-display text-2xl">
            {habitsDone}

            <span className="text-primary-foreground/60"> / {HABITS.length} today</span>
          </p>
        </div>

        <svg
          viewBox="0 0 200 170"
          role="img"
          aria-label={`Ibadah tree with ${leafCount} leaves and ${blossomCount} blossoms for ${habitsDone} of ${HABITS.length} habits completed`}
          className="relative mx-auto block w-full max-w-md"
        >
          <defs>
            <radialGradient id="tree-glow" cx="50%" cy="42%" r="55%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" className="text-accent" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-accent" />
            </radialGradient>
            <linearGradient id="leaf-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(150 55% 62%)" />
              <stop offset="100%" stopColor="hsl(168 60% 38%)" />
            </linearGradient>
            <linearGradient id="bark-grad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="hsl(28 30% 28%)" />
              <stop offset="100%" stopColor="hsl(30 26% 42%)" />
            </linearGradient>
          </defs>

          <ellipse cx="100" cy="70" rx="95" ry="70" fill="url(#tree-glow)" className="text-accent" />

          {/* ground */}
          <ellipse cx="100" cy="152" rx="58" ry="7" className="fill-accent/20" />

          {/* trunk + branches */}
          <g stroke="url(#bark-grad)" strokeLinecap="round" fill="none">
            <path d="M100 152 C97 128 98 118 100 104" strokeWidth="9" />
            <path d="M100 112 C88 104 78 98 66 92" strokeWidth="4.5" />
            <path d="M100 108 C112 100 124 96 136 90" strokeWidth="4.5" />
            <path d="M100 104 C96 92 94 84 96 72" strokeWidth="5" />
            <path d="M66 92 C58 88 54 82 50 76" strokeWidth="2.6" />
            <path d="M136 90 C144 86 148 80 152 74" strokeWidth="2.6" />
            <path d="M96 76 C88 70 80 66 72 62" strokeWidth="2.4" />
            <path d="M96 76 C104 70 112 66 122 62" strokeWidth="2.4" />
          </g>

          {/* leaves */}
          <g className="origin-bottom">
            {LEAVES.map((l, i) => {
              const on = mounted && i < leafCount;
              return (
                <path
                  key={`l${i}`}
                  d="M0 0 C5 -6 13 -5 14 0.5 C13 6 5 7 0 0 Z"
                  fill="url(#leaf-grad)"
                  transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${on ? l.s : 0.01})`}
                  style={{
                    transition: `transform 620ms cubic-bezier(0.22,1.4,0.36,1) ${on ? l.d : 0}ms, opacity 400ms ease ${on ? l.d : 0}ms`,
                    opacity: on ? 0.95 : 0,
                    transformOrigin: "center",
                  }}
                />
              );
            })}
          </g>

          {/* blossoms */}
          <g>
            {BLOSSOMS.map((b, i) => {
              const on = mounted && i < blossomCount;
              return (
                <g
                  key={`b${i}`}
                  transform={`translate(${b.x} ${b.y}) rotate(${b.r}) scale(${on ? b.s : 0.01})`}
                  style={{
                    transition: `transform 700ms cubic-bezier(0.22,1.4,0.36,1) ${on ? b.d : 0}ms, opacity 500ms ease ${on ? b.d : 0}ms`,
                    opacity: on ? 1 : 0,
                  }}
                >
                  {[0, 72, 144, 216, 288].map((a) => (
                    <ellipse key={a} cx="0" cy="-2.4" rx="1.5" ry="2.5" transform={`rotate(${a})`} className="fill-accent" />
                  ))}
                  <circle r="1" className="fill-primary-foreground" />
                </g>
              );
            })}
          </g>

          {/* falling petals when the day is perfect */}
          {perfect &&
            [0, 1, 2].map((i) => (
              <circle key={`p${i}`} r="1.4" className="fill-accent animate-float" cx={70 + i * 30} cy={100 + i * 8} opacity="0.7" />
            ))}
        </svg>

        <div className="relative flex items-center justify-between gap-3 border-t border-primary-foreground/10 px-6 py-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-accent">
            <Flame className="size-4" aria-hidden /> {streak} perfect-day streak
          </span>
          <span className="text-primary-foreground/70">
            {leafCount} leaves · {blossomCount} blossoms
          </span>
        </div>
      </Card>

      {/* ---------- Other journeys, each on its own page ---------- */}


      {/* ---------- Habits ---------- */}
      <Card className="space-y-4">
        <div>
          <h2 className="font-display text-lg">Today&apos;s deeds</h2>
          <p className="text-xs text-muted-foreground">Every deed you tap grows the tree a little more.</p>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full gradient-gold transition-all duration-500 ease-out"
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {HABITS.map((h) => {
            const on = done.includes(h.id);
            const Icon = h.icon;
            return (
              <button
                key={h.id}
                onClick={() => toggle(h.id)}
                aria-pressed={on}
                className={`group flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-2.5 text-left transition ${
                  on
                    ? "border-transparent gradient-hero text-primary-foreground shadow-soft"
                    : "border-border bg-card hover:border-primary/40 hover:text-primary"
                }`}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
                    on ? "bg-accent/20 text-accent" : "bg-secondary text-primary"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{h.label}</span>
                  <span className={`block text-[11px] ${on ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {h.hint}
                  </span>
                </span>
                {on && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
              </button>
            );
          })}
        </div>
      </Card>






      {/* ---------- Week ---------- */}
      <Card>
        <h2 className="font-display text-lg">This week&apos;s growth</h2>
        <div className="mt-4 flex items-end justify-between gap-2">
          {week.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end justify-center rounded-xl bg-secondary/60 p-1">
                <div
                  className="w-full rounded-lg gradient-hero transition-all duration-700 ease-out"
                  style={{ height: `${Math.max(6, (d.n / HABITS.length) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          “The example of a good word is like a good tree: its root firm and its branches in the sky.” — Surah Ibrahim 14:24
        </p>
      </Card>
    </div>
  );
}
