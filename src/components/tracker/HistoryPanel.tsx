import { useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/AppShell";
import { PRAYERS, iso, statusOf, todayIso, type PrayerName, type SalahState } from "@/lib/salah-log";

type Filter = "all" | "prayed" | "missed";

const dayLabel = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

function lastDays(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(iso(d));
    d.setDate(d.getDate() - 1);
  }
  return out;
}

const countPrayed = (state: SalahState, day: string) => (state.log[day] ?? []).length;

const countMissed = (state: SalahState, day: string) =>
  PRAYERS.filter((p) => statusOf(state, day, p) === "missed").length;

export function HistoryPanel({ state }: { state: SalahState }) {
  const today = todayIso();
  const [filter, setFilter] = useState<Filter>("all");

  const years = useMemo(() => {
    const set = new Set<string>(Object.keys(state.log).map((d) => d.slice(0, 4)));
    set.add(today.slice(0, 4));
    return [...set].sort().reverse();
  }, [state.log, today]);

  const [year, setYear] = useState(today.slice(0, 4));

  const week = lastDays(7).reverse();
  const month = lastDays(30);

  const totals = useMemo(() => {
    const sum = (days: string[]) => days.reduce((s, d) => s + countPrayed(state, d), 0);
    const yearDays = Object.keys(state.log).filter((d) => d.startsWith(`${year}-`));
    return {
      today: countPrayed(state, today),
      week: sum(week),
      month: sum(month),
      year: yearDays.reduce((s, d) => s + countPrayed(state, d), 0),
      yearDays: yearDays.length,
    };
  }, [state, year, today, week, month]);

  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    if (countPrayed(state, iso(d)) < 5) d.setDate(d.getDate() - 1);
    while (countPrayed(state, iso(d)) === 5) {
      s += 1;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [state]);

  const perPrayer = useMemo(
    () =>
      PRAYERS.map((p) => {
        const days = month.filter((d) => d <= today);
        const done = days.filter((d) => (state.log[d] ?? []).includes(p)).length;
        return { prayer: p as PrayerName, percent: days.length ? Math.round((done / days.length) * 100) : 0, done };
      }),
    [state, month, today],
  );

  const listDays = useMemo(() => {
    const days = Object.keys(state.log)
      .concat(Object.keys(state.meta))
      .filter((d, i, a) => d.startsWith(`${year}-`) && d <= today && a.indexOf(d) === i)
      .sort()
      .reverse();
    if (filter === "prayed") return days.filter((d) => countPrayed(state, d) > 0);
    if (filter === "missed") return days.filter((d) => countMissed(state, d) > 0);
    return days;
  }, [state, year, filter, today]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Today" value={`${totals.today}/5`} />
        <Stat label="This week" value={`${totals.week}/35`} />
        <Stat label="Last 30 days" value={`${totals.month}/150`} />
        <Stat
          label="Perfect-day streak"
          value={
            <span className="inline-flex items-center gap-1">
              <Flame className="size-5 text-accent" aria-hidden /> {streak}
            </span>
          }
        />
      </div>

      {/* weekly consistency */}
      <Card className="animate-rise">
        <h2 className="font-display text-lg">Weekly consistency</h2>
        <div className="mt-4 flex items-end justify-between gap-2">
          {week.map((d) => {
            const done = countPrayed(state, d);
            const height = Math.max(6, (done / 5) * 100);
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end rounded-xl bg-muted/50 p-1">
                  <div
                    className={`w-full rounded-lg transition-[height] duration-700 ${done === 5 ? "gradient-gold" : "gradient-hero"}`}
                    style={{ height: `${height}%` }}
                    title={`${done}/5`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
                <span className="text-[10px] font-semibold">{done}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* per prayer */}
      <Card className="space-y-3 animate-rise">
        <h2 className="font-display text-lg">Consistency by prayer</h2>
        <p className="text-xs text-muted-foreground">Across the last 30 days</p>
        {perPrayer.map((p) => (
          <div key={p.prayer} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-sm">{p.prayer}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full gradient-hero transition-[width] duration-700" style={{ width: `${p.percent}%` }} />
            </div>
            <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">{p.percent}%</span>
          </div>
        ))}
      </Card>

      {/* year archive */}
      <Card className="space-y-4 animate-rise">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg">Prayer history</h2>
            <p className="text-xs text-muted-foreground">
              {totals.year} prayers logged across {totals.yearDays} days in {year}
            </p>
          </div>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-label="Select year"
            className="min-h-10 rounded-full border border-border bg-card px-4 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "prayed", "missed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`min-h-9 rounded-full border px-4 text-xs font-semibold capitalize transition ${
                filter === f
                  ? "border-transparent gradient-hero text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {listDays.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No records yet for {year}. Every prayer you mark will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {listDays.slice(0, 120).map((d) => {
              const done = countPrayed(state, d);
              const miss = countMissed(state, d);
              return (
                <li
                  key={d}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/40 px-3 py-2"
                >
                  <span className="text-sm">{dayLabel(d)}</span>
                  <span className="flex items-center gap-1.5">
                    {PRAYERS.map((p) => {
                      const prayed = (state.log[d] ?? []).includes(p);
                      const missed = !prayed && statusOf(state, d, p) === "missed";
                      return (
                        <span
                          key={p}
                          title={`${p}: ${prayed ? "prayed" : missed ? "missed" : "not recorded"}`}
                          className={`grid size-6 place-items-center rounded-lg text-[10px] font-semibold ${
                            prayed
                              ? "gradient-hero text-primary-foreground"
                              : missed
                                ? "bg-destructive/15 text-destructive"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {p[0]}
                        </span>
                      );
                    })}
                    <span className="ml-1 w-9 text-right text-xs text-muted-foreground">
                      {done}/5{miss ? "" : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="text-center animate-rise">
      <p className="font-display text-2xl">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}
