import { useEffect, useState } from "react";
import { AlertTriangle, Bell, BellOff, Check, Clock3, Undo2 } from "lucide-react";
import { Card } from "@/components/AppShell";
import {
  currentWindow,
  formatClock,
  formatCountdown,
  notificationsSupported,
  requestNotificationPermission,
  useNow,
  usePrayerWatcher,
  useTodayStatuses,
  type PrayerWindow,
} from "@/lib/prayer-windows";
import { blueprintFor, requiredRakahIds } from "@/lib/prayer-guide-data";
import {
  clearPrayer,
  getRakah,
  markPrayed,
  todayIso,
  type PrayerName,
  type PrayerStatus,
  type SalahState,
} from "@/lib/salah-log";

const NOTIF_KEY = "reh-salah-notify";

const STATUS_STYLE: Record<PrayerStatus, { label: string; chip: string }> = {
  upcoming: { label: "Upcoming", chip: "border-border bg-muted/50 text-muted-foreground" },
  pending: { label: "Pending", chip: "border-accent/50 bg-accent/15 text-accent-foreground" },
  prayed: { label: "Prayed", chip: "border-primary/40 bg-primary/15 text-primary" },
  missed: { label: "Missed", chip: "border-destructive/40 bg-destructive/10 text-destructive" },
};

export function TodayPanel({
  state,
  windows,
  loading,
  error,
  onOpenGuide,
}: {
  state: SalahState;
  windows: PrayerWindow[];
  loading: boolean;
  error: boolean;
  onOpenGuide: (p: PrayerName) => void;
}) {
  const now = useNow(1000);
  const day = todayIso();
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    setNotify(localStorage.getItem(NOTIF_KEY) === "on" && notificationsSupported() && Notification.permission === "granted");
  }, []);

  usePrayerWatcher(windows, state, notify);

  const statuses = useTodayStatuses(state, windows, now);
  const active = currentWindow(windows, now);
  const prayed = statuses.filter((s) => s.status === "prayed").length;
  const missed = statuses.filter((s) => s.status === "missed").length;

  const toggleNotify = async () => {
    if (notify) {
      setNotify(false);
      localStorage.setItem(NOTIF_KEY, "off");
      return;
    }
    const permission = await requestNotificationPermission();
    const on = permission === "granted";
    setNotify(on);
    localStorage.setItem(NOTIF_KEY, on ? "on" : "off");
  };

  return (
    <div className="space-y-4">
      {/* live banner */}
      <Card className="relative overflow-hidden border-transparent gradient-hero p-5 text-primary-foreground animate-rise">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/20 blur-2xl" aria-hidden />
        {loading ? (
          <p className="text-sm opacity-90">Loading today's prayer times…</p>
        ) : error || !active ? (
          <p className="text-sm opacity-90">
            Prayer times are unavailable right now. You can still mark prayers manually below.
          </p>
        ) : (
          <LiveBanner window={active} now={now} />
        )}
        <div className="relative mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-background/15 px-3 py-1">{prayed}/5 prayed</span>
          {missed > 0 && <span className="rounded-full bg-background/15 px-3 py-1">{missed} missed</span>}
          <button
            onClick={() => void toggleNotify()}
            className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full bg-background/15 px-3 font-semibold transition hover:bg-background/25"
          >
            {notify ? <Bell className="size-3.5" aria-hidden /> : <BellOff className="size-3.5" aria-hidden />}
            {notify ? "Reminders on" : "Turn on reminders"}
          </button>
        </div>
      </Card>

      {missed > 0 && (
        <Card className="flex items-start gap-3 border-destructive/40 bg-destructive/5 animate-rise">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
          <p className="text-xs leading-relaxed text-muted-foreground">
            You have missed {missed} prayer{missed > 1 ? "s" : ""} today. Make them up as qadha as soon as you are able —
            marking them here keeps your record honest.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {statuses.map(({ prayer, window: w, status, at }, i) => {
          const bp = blueprintFor(prayer);
          const required = requiredRakahIds(bp.units);
          const done = getRakah(state, day, prayer).filter((r) => required.includes(r)).length;
          const guidePercent = required.length ? Math.round((done / required.length) * 100) : 0;
          const style = STATUS_STYLE[status];
          const remaining = w ? w.end.getTime() - now : 0;

          return (
            <Card key={prayer} className="animate-rise" >
              <div style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-display text-lg">
                      {prayer}
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${style.chip}`}>
                        {style.label}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {w ? (
                        <>
                          {formatClock(w.start)} – {formatClock(w.end)}
                          {status === "pending" && remaining > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 text-accent-foreground">
                              <Clock3 className="size-3" aria-hidden /> {formatCountdown(remaining)} left
                            </span>
                          )}
                        </>
                      ) : (
                        "Times unavailable"
                      )}
                      {status === "prayed" && at && (
                        <span className="ml-2">· prayed at {formatClock(new Date(at))}</span>
                      )}
                    </p>
                  </div>

                  {status === "prayed" ? (
                    <button
                      onClick={() => clearPrayer(day, prayer)}
                      aria-label={`Undo ${prayer}`}
                      className="grid min-h-11 min-w-11 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary"
                    >
                      <Undo2 className="size-4" aria-hidden />
                    </button>
                  ) : (
                    <button
                      onClick={() => markPrayed(day, prayer)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full gradient-hero px-4 text-xs font-semibold text-primary-foreground active:scale-95"
                    >
                      <Check className="size-3.5" aria-hidden /> Mark prayed
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full gradient-gold transition-[width] duration-500"
                      style={{ width: `${status === "prayed" ? 100 : guidePercent}%` }}
                    />
                  </div>
                  <button
                    onClick={() => onOpenGuide(prayer)}
                    className="shrink-0 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Prayer guide
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LiveBanner({ window: w, now }: { window: PrayerWindow; now: number }) {
  const started = now >= w.start.getTime();
  const total = w.end.getTime() - w.start.getTime();
  const elapsed = Math.min(Math.max(now - w.start.getTime(), 0), total);
  const percent = total > 0 ? (elapsed / total) * 100 : 0;

  return (
    <div className="relative">
      <p className="text-[11px] uppercase tracking-[0.22em] opacity-80">
        {started ? "Current prayer" : "Next prayer"}
      </p>
      <p className="mt-1 font-display text-3xl">{w.prayer}</p>
      <p className="mt-1 text-sm opacity-90">
        {started
          ? `Ends at ${formatClock(w.end)} · ${formatCountdown(w.end.getTime() - now)} remaining`
          : `Begins at ${formatClock(w.start)} · in ${formatCountdown(w.start.getTime() - now)}`}
      </p>
      {started && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/20">
          <div className="h-full rounded-full bg-accent transition-[width] duration-1000" style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  );
}
