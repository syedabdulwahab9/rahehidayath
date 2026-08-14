import { useEffect, useRef, useState } from "react";
import { Droplets, Flag, Home, Mountain, Sparkles } from "lucide-react";
import { Card } from "@/components/AppShell";

/* ------------------------------------------------------------------ */
/*  1. The Hidayah Trail                                              */
/* ------------------------------------------------------------------ */

/** Winding path up a rocky hill. Each stone = one day of all 5 prayers. */
const STONES = [
  { x: 30, y: 148 },
  { x: 56, y: 132 },
  { x: 48, y: 112 },
  { x: 74, y: 98 },
  { x: 100, y: 88 },
  { x: 124, y: 72 },
  { x: 150, y: 56 },
];

export function HidayahTrail({
  stones,
  todayPrayers,
}: {
  /** oldest → newest, one entry per day: true when all 5 prayers were prayed */
  stones: boolean[];
  todayPrayers: number;
}) {
  const lit = stones.filter(Boolean).length;
  const summitReached = lit >= STONES.length;

  return (
    <Card className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(222_58%_16%),hsl(206_46%_26%))] p-0 text-primary-foreground shadow-glow">
      <div className="absolute -right-14 -top-16 size-52 rounded-full bg-accent/20 blur-3xl animate-float" aria-hidden />

      <div className="relative flex items-start justify-between gap-3 px-6 pt-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">The Hidayah Trail</p>
          <p className="mt-1 font-display text-2xl">
            {lit}
            <span className="text-primary-foreground/60"> / {STONES.length} steps climbed</span>
          </p>
        </div>
        <Mountain className="size-6 shrink-0 text-accent/80" aria-hidden />
      </div>

      <svg
        viewBox="0 0 200 170"
        role="img"
        aria-label={`Mountain trail with ${lit} of ${STONES.length} stepping stones lit`}
        className="relative mx-auto block w-full max-w-md"
      >
        <defs>
          <linearGradient id="trail-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(222 60% 18%)" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(206 46% 26%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trail-rock-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(210 26% 42%)" />
            <stop offset="100%" stopColor="hsl(214 32% 24%)" />
          </linearGradient>
          <linearGradient id="trail-rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(212 22% 52%)" />
            <stop offset="100%" stopColor="hsl(216 30% 20%)" />
          </linearGradient>
          <radialGradient id="trail-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(45 90% 88%)" />
            <stop offset="100%" stopColor="hsl(45 90% 70%)" />
          </radialGradient>
        </defs>

        <rect width="200" height="170" fill="url(#trail-sky)" />

        {/* stars */}
        {[
          [22, 26],
          [58, 18],
          [96, 30],
          [140, 22],
          [176, 38],
          [120, 14],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="1.1"
            className="fill-primary-foreground/70 animate-pulse"
            style={{ animationDelay: `${i * 400}ms` }}
          />
        ))}

        {/* moon */}
        <circle cx="164" cy="24" r="9" fill="url(#trail-moon)" opacity="0.9" />

        {/* far ridges */}
        <path d="M0 120 L40 76 L74 108 L104 66 L140 104 L176 62 L200 96 L200 170 L0 170 Z" fill="url(#trail-rock-far)" opacity="0.55" />
        {/* near hill */}
        <path d="M0 170 L0 146 L34 132 L62 112 L92 98 L126 74 L164 44 L200 60 L200 170 Z" fill="url(#trail-rock)" />

        {/* winding path */}
        <path
          d="M30 150 C50 142 44 122 54 112 C68 100 84 96 100 88 C118 80 130 68 150 56"
          fill="none"
          stroke="hsl(38 40% 78%)"
          strokeOpacity="0.28"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="1 6"
        />

        {/* stepping stones */}
        {STONES.map((s, i) => {
          const on = stones[i] === true;
          return (
            <g key={i} transform={`translate(${s.x} ${s.y})`}>
              <circle
                r={on ? 9 : 0}
                className="fill-accent/25"
                style={{ transition: `r 600ms cubic-bezier(0.22,1.4,0.36,1) ${i * 90}ms` }}
              />
              <ellipse
                rx="5.6"
                ry="3.4"
                fill={on ? "hsl(150 62% 52%)" : "hsl(214 16% 40%)"}
                stroke={on ? "hsl(150 70% 76%)" : "hsl(214 16% 52%)"}
                strokeWidth="0.7"
                style={{
                  transition: `fill 520ms ease ${i * 90}ms, stroke 520ms ease ${i * 90}ms, transform 520ms cubic-bezier(0.22,1.4,0.36,1) ${i * 90}ms`,
                  transform: on ? "scale(1.12)" : "scale(1)",
                }}
              />
            </g>
          );
        })}

        {/* summit flag */}
        <g transform="translate(166 44)" opacity={summitReached ? 1 : 0.35} style={{ transition: "opacity 600ms ease" }}>
          <path d="M0 0 L0 -18" stroke="hsl(38 40% 82%)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M0 -18 L11 -14 L0 -10 Z" className="fill-accent" />
        </g>
      </svg>

      <div className="relative flex items-center justify-between gap-3 border-t border-primary-foreground/10 px-6 py-4 text-xs">
        <span className="inline-flex items-center gap-1.5 text-accent">
          <Flag className="size-4" aria-hidden />
          {summitReached ? "Summit reached — keep walking" : `${STONES.length - lit} steps to the summit`}
        </span>
        <span className="text-primary-foreground/70">{todayPrayers}/5 prayers today</span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  2. The Sadaqah Lake                                               */
/* ------------------------------------------------------------------ */

export function SadaqahLake({ deeds, goal = 40 }: { deeds: number; goal?: number }) {
  const level = Math.min(1, deeds / goal);
  const waterY = 150 - level * 92; // 150 = empty, 58 = full
  const [drops, setDrops] = useState<number[]>([]);
  const prev = useRef(deeds);

  useEffect(() => {
    if (deeds > prev.current) {
      const id = Date.now();
      setDrops((d) => [...d, id]);
      setTimeout(() => setDrops((d) => d.filter((x) => x !== id)), 1400);
    }
    prev.current = deeds;
  }, [deeds]);

  return (
    <Card className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(196_60%_14%),hsl(190_54%_24%))] p-0 text-primary-foreground shadow-glow">
      <div className="absolute -left-16 -top-14 size-52 rounded-full bg-accent/15 blur-3xl animate-float" aria-hidden />

      <div className="relative flex items-start justify-between gap-3 px-6 pt-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">The Sadaqah Lake</p>
          <p className="mt-1 font-display text-2xl">
            {deeds}
            <span className="text-primary-foreground/60"> drops of dhikr &amp; charity</span>
          </p>
        </div>
        <Droplets className="size-6 shrink-0 text-accent/80" aria-hidden />
      </div>

      <svg
        viewBox="0 0 200 170"
        role="img"
        aria-label={`Lake filled to ${Math.round(level * 100)} percent by ${deeds} good deeds`}
        className="relative mx-auto block w-full max-w-md"
      >
        <defs>
          <linearGradient id="lake-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(184 76% 62%)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="hsl(202 72% 30%)" stopOpacity="0.95" />
          </linearGradient>
          <clipPath id="lake-basin">
            <path d="M22 78 C22 62 178 62 178 78 L164 150 C160 160 40 160 36 150 Z" />
          </clipPath>
        </defs>

        {/* falling droplets */}
        {drops.map((id, i) => (
          <g key={id}>
            <circle cx={92 + i * 7} cy="0" r="3" className="fill-accent">
              <animate attributeName="cy" from="0" to={waterY} dur="0.85s" fill="freeze" />
              <animate attributeName="opacity" from="1" to="0.2" dur="0.85s" fill="freeze" />
            </circle>
          </g>
        ))}

        {/* basin rim */}
        <path
          d="M22 78 C22 62 178 62 178 78 L164 150 C160 160 40 160 36 150 Z"
          fill="hsl(196 42% 12%)"
          stroke="hsl(186 60% 60%)"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />

        {/* water */}
        <g clipPath="url(#lake-basin)">
          <rect
            x="0"
            y={waterY}
            width="200"
            height="170"
            fill="url(#lake-water)"
            style={{ transition: "y 900ms cubic-bezier(0.22,1,0.36,1)" }}
          />
          {/* surface ripples */}
          <g style={{ transform: `translateY(${waterY}px)`, transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)" }}>
            <path d="M-100 2 Q -75 -3 -50 2 T 0 2 T 50 2 T 100 2 T 150 2 T 200 2 T 250 2 T 300 2 V 12 H -100 Z" fill="hsl(186 90% 78%)" opacity="0.5">
              <animateTransform attributeName="transform" type="translate" from="-100 0" to="0 0" dur="5s" repeatCount="indefinite" />
            </path>
            <path d="M-100 5 Q -70 10 -40 5 T 20 5 T 80 5 T 140 5 T 200 5 T 260 5 T 320 5 V 14 H -100 Z" fill="hsl(190 80% 60%)" opacity="0.35">
              <animateTransform attributeName="transform" type="translate" from="0 0" to="-120 0" dur="7s" repeatCount="indefinite" />
            </path>
          </g>
          {/* glowing motes under water */}
          {[
            [60, 130],
            [104, 142],
            [140, 126],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.6" className="fill-accent animate-pulse" opacity="0.6" style={{ animationDelay: `${i * 600}ms` }} />
          ))}
        </g>

        {/* rim highlight */}
        <path d="M22 78 C22 62 178 62 178 78" fill="none" stroke="hsl(186 90% 82%)" strokeOpacity="0.4" strokeWidth="1.4" />
      </svg>

      <div className="relative flex items-center justify-between gap-3 border-t border-primary-foreground/10 px-6 py-4 text-xs">
        <span className="text-accent">{Math.round(level * 100)}% full</span>
        <span className="text-primary-foreground/70">
          {level >= 1 ? "Overflowing, ma sha Allah" : `${goal - deeds} more drops to fill it`}
        </span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  3. The House in Jannah                                            */
/* ------------------------------------------------------------------ */

const BLOCKS = ["Foundation", "Left pillar", "Right pillar", "Walls", "Dome", "Garden wall", "Lanterns"];

export function JannahHouse({ built, milestones }: { built: number; milestones: { label: string; done: boolean }[] }) {
  const has = (n: number) => built >= n;
  const t = (i: number) => ({
    transition: `opacity 700ms ease ${i * 120}ms, transform 700ms cubic-bezier(0.22,1.4,0.36,1) ${i * 120}ms`,
    transformOrigin: "center bottom",
  });

  return (
    <Card className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(268_46%_16%),hsl(300_32%_26%))] p-0 text-primary-foreground shadow-glow">
      <div className="absolute -right-16 -bottom-20 size-56 rounded-full bg-accent/20 blur-3xl animate-float" aria-hidden />

      <div className="relative flex items-start justify-between gap-3 px-6 pt-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">The House in Jannah</p>
          <p className="mt-1 font-display text-2xl">
            {built}
            <span className="text-primary-foreground/60"> / {BLOCKS.length} blocks built</span>
          </p>
        </div>
        <Home className="size-6 shrink-0 text-accent/80" aria-hidden />
      </div>

      <svg
        viewBox="0 0 200 170"
        role="img"
        aria-label={`A house in Jannah with ${built} of ${BLOCKS.length} architectural blocks placed`}
        className="relative mx-auto block w-full max-w-md"
      >
        <defs>
          <linearGradient id="jan-stone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(44 60% 92%)" />
            <stop offset="100%" stopColor="hsl(36 34% 70%)" />
          </linearGradient>
          <linearGradient id="jan-dome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(48 90% 76%)" />
            <stop offset="100%" stopColor="hsl(36 78% 52%)" />
          </linearGradient>
          <radialGradient id="jan-glow" cx="50%" cy="60%" r="55%">
            <stop offset="0%" stopColor="hsl(48 90% 80%)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="hsl(48 90% 80%)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="112" rx="94" ry="62" fill="url(#jan-glow)" />

        {/* stars */}
        {[
          [26, 28],
          [64, 20],
          [136, 24],
          [172, 34],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.1" className="fill-primary-foreground/70 animate-pulse" style={{ animationDelay: `${i * 500}ms` }} />
        ))}

        {/* empty plot */}
        <ellipse cx="100" cy="150" rx="72" ry="10" fill="hsl(280 30% 12%)" opacity="0.6" />
        <path d="M28 150 L172 150" stroke="hsl(48 70% 80%)" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 5" />

        {/* 1 foundation */}
        <rect x="46" y="140" width="108" height="10" rx="2.5" fill="url(#jan-stone)" style={{ ...t(0), opacity: has(1) ? 1 : 0, transform: has(1) ? "scaleY(1)" : "scaleY(0.1)" }} />

        {/* 2 left pillar */}
        <g style={{ ...t(1), opacity: has(2) ? 1 : 0, transform: has(2) ? "scaleY(1)" : "scaleY(0.05)" }}>
          <rect x="54" y="96" width="10" height="44" rx="4" fill="url(#jan-stone)" />
          <rect x="51" y="92" width="16" height="6" rx="2" fill="url(#jan-stone)" />
        </g>

        {/* 3 right pillar */}
        <g style={{ ...t(2), opacity: has(3) ? 1 : 0, transform: has(3) ? "scaleY(1)" : "scaleY(0.05)" }}>
          <rect x="136" y="96" width="10" height="44" rx="4" fill="url(#jan-stone)" />
          <rect x="133" y="92" width="16" height="6" rx="2" fill="url(#jan-stone)" />
        </g>

        {/* 4 walls + arch door */}
        <g style={{ ...t(3), opacity: has(4) ? 1 : 0, transform: has(4) ? "scaleY(1)" : "scaleY(0.05)" }}>
          <rect x="70" y="92" width="60" height="48" rx="3" fill="url(#jan-stone)" />
          <path d="M92 140 L92 116 C92 106 108 106 108 116 L108 140 Z" fill="hsl(276 44% 22%)" />
          <path d="M92 116 C92 106 108 106 108 116" fill="none" stroke="hsl(40 70% 60%)" strokeWidth="0.8" />
        </g>

        {/* 5 dome + finial */}
        <g style={{ ...t(4), opacity: has(5) ? 1 : 0, transform: has(5) ? "scale(1)" : "scale(0.4)" }}>
          <path d="M70 92 C70 62 130 62 130 92 Z" fill="url(#jan-dome)" />
          <path d="M100 62 L100 52" stroke="hsl(44 80% 70%)" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M100 52 a4 4 0 1 1 3.4 6" fill="none" stroke="hsl(48 90% 76%)" strokeWidth="1.4" strokeLinecap="round" />
        </g>

        {/* 6 garden wall + cypress */}
        <g style={{ ...t(5), opacity: has(6) ? 1 : 0, transform: has(6) ? "scaleY(1)" : "scaleY(0.05)" }}>
          <rect x="20" y="128" width="30" height="12" rx="2" fill="url(#jan-stone)" opacity="0.9" />
          <rect x="150" y="128" width="30" height="12" rx="2" fill="url(#jan-stone)" opacity="0.9" />
          <path d="M34 128 C29 118 34 104 35 100 C36 104 41 118 36 128 Z" fill="hsl(150 46% 40%)" />
          <path d="M164 128 C159 118 164 104 165 100 C166 104 171 118 166 128 Z" fill="hsl(150 46% 40%)" />
        </g>

        {/* 7 lanterns */}
        <g style={{ ...t(6), opacity: has(7) ? 1 : 0, transform: has(7) ? "scale(1)" : "scale(0.4)" }}>
          {[76, 124].map((cx) => (
            <g key={cx}>
              <path d={`M${cx} 84 L${cx} 90`} stroke="hsl(44 70% 74%)" strokeWidth="0.8" />
              <circle cx={cx} cy="94" r="3.4" className="fill-accent animate-pulse" />
              <circle cx={cx} cy="94" r="6.5" className="fill-accent" opacity="0.18" />
            </g>
          ))}
        </g>
      </svg>

      <div className="relative space-y-2 border-t border-primary-foreground/10 px-6 py-4">
        <p className="flex items-center gap-1.5 text-xs text-accent">
          <Sparkles className="size-4" aria-hidden /> Next: {BLOCKS[Math.min(built, BLOCKS.length - 1)]}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {milestones.map((m) => (
            <span
              key={m.label}
              className={`rounded-full px-2.5 py-1 text-[11px] ${
                m.done ? "bg-accent/20 text-accent" : "bg-primary-foreground/10 text-primary-foreground/60"
              }`}
            >
              {m.label}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-primary-foreground/60">
          “Whoever builds a mosque for Allah, Allah will build for him a house in Paradise.”
        </p>
      </div>
    </Card>
  );
}
