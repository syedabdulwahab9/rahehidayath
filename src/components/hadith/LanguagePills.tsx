import { Minus, Plus } from "lucide-react";
import type { LangCode } from "@/lib/islamic-data";
import { HADITH_LANG_PILLS } from "@/lib/hadith-meta";
import { useHadithFontSize } from "@/lib/hadith-storage";

export function HadithLanguagePills({
  value,
  onChange,
  availableCodes,
}: {
  value: LangCode;
  onChange: (code: LangCode) => void;
  availableCodes?: LangCode[];
}) {
  const font = useHadithFontSize();
  return (
    <div className="flex items-center gap-2">
      <div className="scrollbar-none flex flex-1 gap-2 overflow-x-auto scroll-smooth pb-1" role="group" aria-label="Hadith language">
        {HADITH_LANG_PILLS.map((l) => {
          const active = l.code === value;
          const available = !availableCodes || availableCodes.includes(l.code);
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => onChange(l.code)}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition active:scale-95 ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : available
                    ? "border-border bg-card text-foreground hover:border-primary/40"
                    : "border-border/50 bg-card text-muted-foreground/70"
              }`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-1.5 py-1">
        <button
          type="button"
          aria-label="Decrease font size"
          disabled={!font.canDecrease}
          onClick={font.decrease}
          className="grid size-6 place-items-center rounded-full text-muted-foreground transition hover:text-primary disabled:opacity-30"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-4 text-center text-xs font-semibold">A</span>
        <button
          type="button"
          aria-label="Increase font size"
          disabled={!font.canIncrease}
          onClick={font.increase}
          className="grid size-6 place-items-center rounded-full text-muted-foreground transition hover:text-primary disabled:opacity-30"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export { useHadithFontSize };
