import type { AsmaName } from "@/lib/quran-api";

export function NameCard({
  name,
  index,
  memorise,
  revealed,
  onToggleReveal,
  onOpen,
}: {
  name: AsmaName;
  index: number;
  memorise: boolean;
  revealed: boolean;
  onToggleReveal: () => void;
  onOpen: () => void;
}) {
  const hidden = memorise && !revealed;
  return (
    <button
      type="button"
      onClick={() => (hidden ? onToggleReveal() : onOpen())}
      style={{ animationDelay: `${Math.min(index * 30, 900)}ms` }}
      className="group animate-rise rounded-2xl border border-border/70 bg-card p-4 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow active:translate-y-0 active:scale-[0.98]"
    >
      <span className="mx-auto flex size-7 items-center justify-center rounded-full border-2 border-accent/50 bg-accent/10 text-[11px] font-semibold text-accent">
        {name.number}
      </span>
      <p className="arabic-ayah mt-3 text-3xl text-primary transition group-hover:text-primary/90 sm:text-4xl">
        {name.name}
      </p>
      <p className="mt-2 truncate text-sm font-semibold text-foreground">{name.transliteration}</p>
      {hidden ? (
        <p className="mt-1 text-xs text-muted-foreground/70 italic">Tap to reveal</p>
      ) : (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{name.en.meaning}</p>
      )}
    </button>
  );
}
