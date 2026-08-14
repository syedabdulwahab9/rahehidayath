import { useId } from "react";

/**
 * Islamic AI mark — a simple crescent of light cradling a four-point spark.
 * Uses currentColor so it inherits the theme in light and dark mode.
 */
export function AiLogo({ className = "size-5" }: { className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const halo = `noor-halo-${uid}`;
  const glow = `noor-glow-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      role="img"
      aria-label="Islamic AI"
      focusable="false"
    >
      <defs>
        <radialGradient id={halo} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={glow} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* soft halo of light — "noor" */}
      <circle cx="16" cy="16" r="14" fill={`url(#${halo})`} />

      {/* clean crescent */}
      <path
        d="M20.6 6.6a10.4 10.4 0 1 0 4.6 16.6A11.6 11.6 0 0 1 20.6 6.6Z"
        fill={`url(#${glow})`}
      />

      {/* four-point spark */}
      <path
        d="M22.6 10.2c.35 2.1.9 2.65 3 3-2.1.35-2.65.9-3 3-.35-2.1-.9-2.65-3-3 2.1-.35 2.65-.9 3-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Learn Salah & Wudu mark — a worshipper in sujood on a prayer rug beneath a
 * mihrab arch, with a drop of water for wudu.
 */
export function SalahWuduLogo({ className = "size-5" }: { className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const arch = `salah-arch-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      role="img"
      aria-label="Learn Salah and Wudu"
      focusable="false"
    >
      <defs>
        <linearGradient id={arch} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* mihrab arch */}
      <path
        d="M7 27V14a9 9 0 0 1 18 0v13"
        stroke={`url(#${arch})`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* worshipper in sujood */}
      <g fill="currentColor">
        <circle cx="12.2" cy="20.1" r="2.5" />
        <path d="M14.4 21.8c2.4-.2 4.4.6 6.1 2.4.5.5.1 1.3-.6 1.3H10c-.7 0-1-.8-.6-1.3.9-1 1.5-1.8 2.2-2.5 1-.1 1.9-.05 2.8.1Z" />
      </g>

      {/* prayer rug line */}
      <path
        d="M6.5 26.6h19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* wudu drop */}
      <path
        d="M22.4 8.4c1.6 1.9 2.4 3.2 2.4 4.3a2.4 2.4 0 1 1-4.8 0c0-1.1.8-2.4 2.4-4.3Z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="21.6" cy="12.6" r="0.6" className="fill-background" opacity="0.7" />
    </svg>
  );
}

/**
 * Guess the Prophet mark — a lantern-lit riddle inside a countdown timer ring,
 * with the sweeping hand of the clock.
 */
export function GuessProphetLogo({ className = "size-5" }: { className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const ring = `riddle-ring-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      role="img"
      aria-label="Guess the Prophet — timed riddle"
      focusable="false"
    >
      <defs>
        <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* timer crown */}
      <path
        d="M13 2.9h6M16 2.9v2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* timer ring */}
      <circle cx="16" cy="18.2" r="11.4" stroke="currentColor" strokeWidth="1.2" opacity="0.28" />
      <circle
        cx="16"
        cy="18.2"
        r="11.4"
        stroke={`url(#${ring})`}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeDasharray="53 72"
        transform="rotate(-90 16 18.2)"
      />

      {/* ticks */}
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5">
        <path d="M16 8.6v1.6M25.6 18.2H24M16 27.8v-1.6M6.4 18.2H8" />
      </g>

      {/* clock hand */}
      <path
        d="M16 18.2 21 14.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* the riddle: a question mark shaped from the crescent's light */}
      <path
        d="M13.4 15.1a2.7 2.7 0 1 1 4.1 2.3c-.9.6-1.4 1.1-1.4 2.1"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="16.1" cy="22.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

/**
 * Asma ul Husna mark — a 99 inscribed inside an eight-point Islamic star
 * medallion, crowned with a small crescent of light.
 */
export function NamesLogo({ className = "size-5" }: { className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const star = `asma-star-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      role="img"
      aria-label="99 Names of Allah"
      focusable="false"
    >
      <defs>
        <linearGradient id={star} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* eight-point star medallion (two rotated squares) */}
      <g stroke={`url(#${star})`} strokeWidth="1.4" strokeLinejoin="round">
        <rect x="7" y="7" width="18" height="18" rx="2.5" />
        <rect x="7" y="7" width="18" height="18" rx="2.5" transform="rotate(45 16 16)" />
      </g>

      {/* inner ring */}
      <circle cx="16" cy="16" r="7.2" stroke="currentColor" strokeWidth="1" opacity="0.35" />

      {/* the 99 */}
      <text
        x="16"
        y="19.4"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="currentColor"
        fontFamily="inherit"
      >
        99
      </text>
    </svg>
  );
}

/**
 * Daily Good Deeds mark — a heart of intention held in an open hand, with a
 * tick of completion and a rising spark of reward.
 */
export function GoodDeedsLogo({ className = "size-5" }: { className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const fade = `deeds-fade-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      role="img"
      aria-label="Daily good deeds"
      focusable="false"
    >
      <defs>
        <linearGradient id={fade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* open giving hand */}
      <path
        d="M6.5 20.5c0-1 .8-1.8 1.8-1.8h15.4c1 0 1.8.8 1.8 1.8 0 3.5-3.6 6.3-9.5 6.3S6.5 24 6.5 20.5Z"
        fill={`url(#${fade})`}
      />
      <path
        d="M6.5 20.5h19"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* heart of intention */}
      <path
        d="M16 16.6c-3.6-2.3-5.4-4-5.4-6a3 3 0 0 1 5.4-1.8A3 3 0 0 1 21.4 10.6c0 2-1.8 3.7-5.4 6Z"
        fill="currentColor"
      />

      {/* tick of completion */}
      <path
        d="M13.3 12.2l1.7 1.7 3.5-3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-background"
      />

      {/* rising spark of reward */}
      <path
        d="M25 5.4c.3 1.6.7 2 2.3 2.3-1.6.3-2 .7-2.3 2.3-.3-1.6-.7-2-2.3-2.3 1.6-.3 2-.7 2.3-2.3Z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}
