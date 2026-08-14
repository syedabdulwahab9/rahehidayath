import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Flame,
  ListChecks,
  Plus,
  Sparkles,
  Target,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import {
  DEED_CATEGORIES,
  ENCOURAGEMENTS,
  TOTAL_DEEDS,
  dayIso,
  useDeedTracker,
} from "@/lib/deeds-tracker";

export const Route = createFileRoute("/deeds")({
  head: () => ({
    meta: [
      { title: "Daily Good Deeds Tracker — Sunnah of Every Day | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Tick every good deed and Sunnah you complete today — morning adhkar, salah, eating sunnahs, character, family and worship — with references, history and personal goals.",
      },
      { property: "og:title", content: "Daily Good Deeds Tracker | Raah e Hidayath" },
      { property: "og:description", content: "A gentle daily tracker for sunnahs and good deeds — no scores, no rankings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeedsPage,
});

const fmtTime = (at: number) =>
  new Date(at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

function DeedsPage() {
  const t = useDeedTracker();
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [tab, setTab] = useState<"week" | "month" | "year">("week");
  const [goalText, setGoalText] = useState("");
  const [reward, setReward] = useState<string | null>(null);

  const encouragement = useMemo(
    () => ENCOURAGEMENTS[Math.floor((t.summary.total + 1) % ENCOURAGEMENTS.length)],
    [t.summary.total],
  );

  function onToggle(id: string) {
    const wasDone = Boolean(t.todayRecord[id]);
    t.toggle(id);
    if (!wasDone) {
      setReward(id);
      window.setTimeout(() => setReward((r) => (r === id ? null : r)), 900);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(12);
    }
  }

  const series = t.history[tab];
  const max = Math.max(1, ...series.map((d) => d.n));

  /* calendar of the current month */
  const calendar = useMemo(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const lead = first.getDay();
    const cells: Array<{ key: string; day: number; n: number } | null> = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d++) {
      const key = dayIso(new Date(now.getFullYear(), now.getMonth(), d));
      cells.push({ key, day: d, n: t.history.totalsByDay.get(key) ?? 0 });
    }
    return cells;
  }, [t.history]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Daily Good Deeds Tracker"
        subtitle="Tick every deed as you do it — sincerity first, never scores"
      />

      {/* ------------------------------------------------- daily summary */}
      <Card className="deed-summary relative overflow-hidden">
        <span aria-hidden className="deed-summary-glow" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Today</p>
            <p className="font-display text-4xl leading-none tabular-nums">
              {t.summary.total}
              <span className="ml-1 text-base text-muted-foreground">/ {TOTAL_DEEDS}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.summary.total > 0
                ? `Alhamdulillah! You completed ${t.summary.total} good deed${t.summary.total === 1 ? "" : "s"} today.`
                : "Begin with one small deed — Allah loves what is constant."}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Completion</p>
            <p className="font-display text-3xl tabular-nums text-primary">{t.summary.percent}%</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="size-3.5 text-accent" /> {t.history.streak} day streak
            </p>
          </div>
        </div>
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full gradient-hero transition-[width] duration-700" style={{ width: `${t.summary.percent}%` }} />
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { k: "Salah", v: t.summary.salah },
            { k: "Sunnahs", v: t.summary.sunnah },
            { k: "Worship", v: t.summary.worship },
            { k: "Character", v: t.summary.character },
            { k: "Family", v: t.summary.family },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-border/70 bg-secondary/40 p-2 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.k}</p>
              <p className="font-semibold tabular-nums text-primary">{s.v}</p>
            </div>
          ))}
        </div>
        <p className="relative mt-4 text-center text-xs italic text-muted-foreground">{encouragement}</p>
      </Card>

      {/* ---------------------------------------------------- categories */}
      {DEED_CATEGORIES.map((cat) => {
        const done = cat.deeds.filter((d) => t.todayRecord[d.id]).length;
        return (
          <section key={cat.id} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <span aria-hidden className="text-lg">{cat.emoji}</span> {cat.title}
              </h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary tabular-nums">
                {done}/{cat.deeds.length}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {cat.deeds.map((d, i) => {
                const entry = t.todayRecord[d.id];
                const isDone = Boolean(entry);
                return (
                  <div
                    key={d.id}
                    style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                    className={`deed-row animate-rise ${isDone ? "deed-row-done" : ""}`}
                  >
                    <button
                      onClick={() => onToggle(d.id)}
                      aria-pressed={isDone}
                      aria-label={`${isDone ? "Untick" : "Tick"} ${d.label}`}
                      className={`deed-tick ${isDone ? "deed-tick-on" : ""}`}
                    >
                      <Check className="size-4" aria-hidden />
                      {reward === d.id && <span aria-hidden className="deed-reward" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">{d.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{d.why}</p>
                      {d.ref && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.18em] text-accent">
                          <BookOpen className="size-3" aria-hidden /> {d.ref}
                        </p>
                      )}
                      {isDone && (
                        <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-primary">
                          Completed at {fmtTime(entry!.at)}
                        </p>
                      )}
                      {openNote === d.id ? (
                        <input
                          autoFocus
                          defaultValue={entry?.note ?? ""}
                          placeholder="Note (optional)"
                          onBlur={(e) => {
                            t.setNote(d.id, e.currentTarget.value);
                            setOpenNote(null);
                          }}
                          className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary/50"
                        />
                      ) : (
                        <button
                          onClick={() => setOpenNote(d.id)}
                          className="mt-1 text-[0.65rem] uppercase tracking-widest text-muted-foreground hover:text-primary"
                        >
                          {entry?.note ? `Note: ${entry.note}` : "Add note"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* --------------------------------------------------- daily reset */}
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg">Daily reset</p>
          <p className="text-xs text-muted-foreground">
            The list clears each new day — every day before it is kept in your history.
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { v: true, label: "At midnight" },
            { v: false, label: "At Maghrib (Islamic day)" },
          ].map((o) => (
            <button
              key={String(o.v)}
              onClick={() => t.setResetPref(o.v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                t.resetAtMidnight === o.v
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-primary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      {/* --------------------------------------------------- personal goals */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-xl">
          <Target className="size-5 text-primary" aria-hidden /> Personal Goals
        </h2>
        <Card className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = goalText.trim();
              if (!value) return;
              t.addGoal(value);
              setGoalText("");
            }}
            className="flex gap-2"
          >
            <input
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="Read 5 pages of Qur'an…"
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
            <button className="inline-flex items-center gap-1 rounded-xl gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Plus className="size-4" aria-hidden /> Add
            </button>
          </form>
          {t.goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Try: 1,000 dhikr · give charity · pray every salah on time · visit parents · learn one hadith.
            </p>
          ) : (
            <ul className="space-y-2">
              {t.goals.map((g) => (
                <li key={g.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2">
                  <button
                    onClick={() => t.toggleGoal(g.id)}
                    aria-pressed={g.done}
                    className={`deed-tick ${g.done ? "deed-tick-on" : ""}`}
                  >
                    <Check className="size-4" aria-hidden />
                  </button>
                  <span className={`min-w-0 flex-1 text-sm ${g.done ? "text-muted-foreground line-through" : ""}`}>
                    {g.label}
                  </span>
                  <button
                    onClick={() => t.removeGoal(g.id)}
                    aria-label={`Remove ${g.label}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* -------------------------------------------------------- history */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-xl">
          <ListChecks className="size-5 text-primary" aria-hidden /> History
        </h2>
        <Card className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["week", "month", "year"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  tab === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-primary"
                }`}
              >
                {k === "week" ? "7 days" : k === "month" ? "30 days" : "12 months"}
              </button>
            ))}
          </div>

          <div className="flex h-28 items-end gap-[3px]">
            {series.map((d) => (
              <div
                key={d.date}
                title={`${d.date} — ${d.n} deeds`}
                className="flex-1 rounded-t gradient-hero opacity-80 transition-all hover:opacity-100"
                style={{ height: `${Math.max(3, (d.n / max) * 100)}%` }}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-border/70 bg-secondary/40 p-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Longest streak</p>
              <p className="font-semibold tabular-nums text-primary">{t.history.streak}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-secondary/40 p-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Days recorded</p>
              <p className="font-semibold tabular-nums text-primary">{t.history.totalDays}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-secondary/40 p-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">All-time deeds</p>
              <p className="font-semibold tabular-nums text-primary">{t.history.allTime}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="size-4 text-primary" aria-hidden /> This month
            </p>
            <div className="grid grid-cols-7 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="text-center text-[10px] uppercase text-muted-foreground">{d}</span>
              ))}
              {calendar.map((c, i) =>
                c ? (
                  <span
                    key={c.key}
                    title={`${c.key} — ${c.n} deeds`}
                    className="grid aspect-square place-items-center rounded-md text-[10px] tabular-nums"
                    style={{
                      background: `color-mix(in oklab, var(--primary) ${Math.min(80, c.n * 6)}%, var(--secondary))`,
                      color: c.n > 8 ? "var(--primary-foreground)" : undefined,
                    }}
                  >
                    {c.day}
                  </span>
                ) : (
                  <span key={`e${i}`} />
                ),
              )}
            </div>
          </div>

          {t.history.mostConsistent.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">Most consistent deeds</p>
                <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                  {t.history.mostConsistent.map((m) => (
                    <li key={m.label}>
                      {m.label} — <span className="tabular-nums text-primary">{m.n} days</span>
                    </li>
                  ))}
                </ul>
              </div>
              {t.history.missed.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Not yet started</p>
                  <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {t.history.missed.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      </section>

      <Card className="text-center text-sm text-muted-foreground">
        <Sparkles className="mx-auto mb-2 size-4 text-accent" aria-hidden />
        No points, no rankings — only sincerity. May Allah accept every hidden deed.
      </Card>
    </div>
  );
}
