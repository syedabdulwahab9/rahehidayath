import { useMemo, useState } from "react";
import { Check, ChevronDown, Clock3, Sparkles } from "lucide-react";
import { Card } from "@/components/AppShell";
import {
  KIND_META,
  PRAYER_BLUEPRINTS,
  allRakahIds,
  estimateMinutes,
  rakahIds,
  requiredRakahIds,
  type PrayerBlueprint,
} from "@/lib/prayer-guide-data";
import { getRakah, markPrayed, setRakah, toggleRakah, type PrayerName, type SalahState } from "@/lib/salah-log";

function kindBadge(kind: keyof typeof KIND_META) {
  switch (kind) {
    case "fard":
      return "border-primary/40 bg-primary/10 text-primary";
    case "witr":
      return "border-primary/30 bg-primary/5 text-primary";
    case "sunnah-m":
      return "border-accent/50 bg-accent/10 text-accent-foreground";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

export function PrayerGuide({
  state,
  day,
  focus,
  onFocusChange,
}: {
  state: SalahState;
  day: string;
  focus?: PrayerName | null;
  onFocusChange?: (p: PrayerName | null) => void;
}) {
  const [openLocal, setOpenLocal] = useState<PrayerName | null>(null);
  const open = focus !== undefined ? focus : openLocal;
  const setOpen = (p: PrayerName | null) => (onFocusChange ? onFocusChange(p) : setOpenLocal(p));

  return (
    <div className="space-y-3">
      {PRAYER_BLUEPRINTS.map((bp, i) => (
        <GuideCard
          key={bp.prayer}
          bp={bp}
          state={state}
          day={day}
          index={i}
          open={open === bp.prayer}
          onToggle={() => setOpen(open === bp.prayer ? null : bp.prayer)}
        />
      ))}
      <Card className="bg-muted/30">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Optional rak'ah are never required to complete a prayer — they are extra light upon light. Progress is saved
          on this device and starts fresh with each new prayer time.
        </p>
      </Card>
    </div>
  );
}

function GuideCard({
  bp,
  state,
  day,
  open,
  onToggle,
  index,
}: {
  bp: PrayerBlueprint;
  state: SalahState;
  day: string;
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  const done = getRakah(state, day, bp.prayer);
  const required = useMemo(() => requiredRakahIds(bp.units), [bp.units]);
  const all = useMemo(() => allRakahIds(bp.units), [bp.units]);
  const requiredDone = required.filter((r) => done.includes(r)).length;
  const percent = required.length ? Math.round((requiredDone / required.length) * 100) : 0;
  const completed = requiredDone === required.length && required.length > 0;
  const minutes = estimateMinutes(bp.units);

  return (
    <Card
      className={`overflow-hidden p-0 animate-rise ${completed ? "border-primary/50 shadow-glow" : ""}`}
      // stagger the entrance
    >
      <div style={{ animationDelay: `${index * 60}ms` }}>
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center gap-3 p-4 text-left"
        >
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-2xl text-lg transition ${
              completed ? "gradient-hero text-primary-foreground" : "bg-primary/10 text-primary"
            }`}
            aria-hidden
          >
            {completed ? <Check className="size-5" /> : <span className="font-display text-base">{bp.prayer[0]}</span>}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
              <span className="font-display text-lg">{bp.prayer}</span>
              <span className="arabic-ayah text-base text-accent">{bp.arabic}</span>
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {bp.units.map((u) => `${u.count} ${KIND_META[u.kind].short}`).join(" · ")}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1">
            <span className={`text-xs font-semibold ${completed ? "text-primary" : "text-muted-foreground"}`}>
              {percent}%
            </span>
            <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </button>

        <div className="px-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full gradient-hero transition-[width] duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div
          className={`grid transition-all duration-500 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 p-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" aria-hidden /> about {minutes} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-accent" aria-hidden /> {all.length} rak'ah in total
                </span>
              </div>

              <ol className="space-y-3">
                {bp.units.map((unit, ui) => {
                  const meta = KIND_META[unit.kind];
                  return (
                    <li key={unit.id} className="rounded-2xl border border-border/70 bg-background/40 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">{ui + 1}.</span>
                        <span className="font-medium">
                          {unit.count} {meta.label}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${kindBadge(unit.kind)}`}>
                          {unit.required ? "Required" : meta.optional ? "Optional" : "Recommended"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{meta.explain}</p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {rakahIds(unit).map((rid, ri) => {
                          const checked = done.includes(rid);
                          return (
                            <button
                              key={rid}
                              role="checkbox"
                              aria-checked={checked}
                              aria-label={`${meta.short} rak'ah ${ri + 1}`}
                              onClick={() => toggleRakah(day, bp.prayer, rid)}
                              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs transition-all duration-300 active:scale-95 ${
                                checked
                                  ? "border-transparent gradient-hero text-primary-foreground shadow-soft"
                                  : "border-border bg-card text-muted-foreground hover:text-primary"
                              }`}
                            >
                              <span
                                className={`grid size-4 place-items-center rounded-full border transition ${
                                  checked ? "border-accent bg-accent/90 text-accent-foreground" : "border-border"
                                }`}
                                aria-hidden
                              >
                                {checked && <Check className="size-3" />}
                              </span>
                              Rak'ah {ri + 1}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {completed ? (
                <div className="rounded-2xl border border-primary/40 bg-primary/10 p-3 text-center animate-rise">
                  <p className="font-display text-base text-primary">Prayer Completed</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Alhamdulillah! May Allah accept your Salah.
                  </p>
                  <button
                    onClick={() => markPrayed(day, bp.prayer)}
                    className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full gradient-gold px-5 text-xs font-semibold text-accent-foreground"
                  >
                    Mark {bp.prayer} as prayed
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRakah(day, bp.prayer, all)}
                    className="min-h-10 rounded-full border border-border px-4 text-xs font-semibold hover:text-primary"
                  >
                    Check all
                  </button>
                  <button
                    onClick={() => setRakah(day, bp.prayer, [])}
                    className="min-h-10 rounded-full border border-border px-4 text-xs font-semibold text-muted-foreground hover:text-primary"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
