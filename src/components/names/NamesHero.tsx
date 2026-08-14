export function NamesHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 shadow-soft sm:p-8">
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full opacity-[0.08]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx="100" cy="100" r={10 + i * 10} strokeWidth="0.6" />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={`l-${i}`}
            x1="100"
            y1="100"
            x2={100 + 95 * Math.cos((i * Math.PI) / 8)}
            y2={100 + 95 * Math.sin((i * Math.PI) / 8)}
            strokeWidth="0.4"
          />
        ))}
      </svg>
      <div className="relative animate-rise text-center text-primary-foreground">
        <p className="arabic-ayah text-3xl leading-relaxed sm:text-4xl">أَسْمَاءُ اللهِ الْحُسْنَى</p>
        <h1 className="mt-2 font-display text-xl tracking-wide sm:text-2xl">The 99 Beautiful Names of Allah</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/85">
          Every name is a doorway into His nature — recite them, reflect upon them, and call upon Allah by them.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-xs text-primary-foreground/70">
          <span className="italic">"Allah has ninety-nine names; whoever memorises them will enter Paradise."</span>{" "}
          — Sahih al-Bukhari 2736
        </p>
      </div>
    </div>
  );
}
