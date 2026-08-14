import { Minus, HandHeart, Plus } from "lucide-react";
import { Card } from "@/components/AppShell";
import { GOOD_DEEDS, useIbadahLog } from "@/lib/ibadah-log";

/**
 * Tap a good deed the moment you do it — as many times as you do it.
 * Every tap fills the Sadaqah Lake, lights the Hidayah Trail and helps
 * build the House in Jannah.
 */
export function GoodDeedPanel({ title = "Good deeds — tap what you did today" }: { title?: string }) {
  const { addDeed, removeDeed, deedCounts, goodDeedsToday } = useIbadahLog();

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-lg">
          <HandHeart className="size-5 text-primary" aria-hidden /> {title}
        </p>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {goodDeedsToday} today
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        “Every act of kindness is charity.” — Bukhari &amp; Muslim. Tap a deed every time you do it — each tap adds
        one drop to the lake, one stone on the trail and one block of your house.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {GOOD_DEEDS.map((d) => {
          const count = deedCounts[d.id] ?? 0;
          return (
            <div
              key={d.id}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm transition ${
                count > 0 ? "border-primary/60 bg-primary/10" : "border-border bg-card"
              }`}
            >
              <span className="text-lg leading-none" aria-hidden>
                {d.emoji}
              </span>
              <button
                onClick={() => addDeed(d.id)}
                className="min-w-0 flex-1 text-left font-medium hover:text-primary"
                aria-label={`Add one ${d.label}`}
              >
                {d.label}
              </button>
              {count > 0 && (
                <button
                  onClick={() => removeDeed(d.id)}
                  aria-label={`Remove one ${d.label}`}
                  className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary"
                >
                  <Minus className="size-3" aria-hidden />
                </button>
              )}
              <span className="min-w-6 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-center text-xs font-semibold tabular-nums text-primary">
                {count}
              </span>
              <button
                onClick={() => addDeed(d.id)}
                aria-label={`Add one ${d.label}`}
                className="grid size-7 shrink-0 place-items-center rounded-full gradient-hero text-primary-foreground"
              >
                <Plus className="size-3.5" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
