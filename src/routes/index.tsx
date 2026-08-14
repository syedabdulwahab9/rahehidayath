import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Compass, Ellipsis, Heart, ListChecks, Scroll,
  Rose, Baby, CalendarDays, TreeDeciduous,
  CalendarHeart,
} from "lucide-react";
import { Card } from "@/components/AppShell";
import { GoodDeedsLogo, NamesLogo } from "@/components/AiLogo";

import { useSettings } from "@/lib/settings";
import { usePrayerDay, prettyTime } from "@/lib/prayer-times";
import { SearchBar } from "@/components/SearchBar";
import { useFeatureFlags, isOn } from "@/lib/feature-flags";
import { useSiteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Raah e Hidayath — The Path of Guidance" },
      { name: "description", content: "Quran with audio, translation and tafseer, hadith books, prayer times, Qibla, duas and Islamic learning in many languages." },
      { property: "og:title", content: "Raah e Hidayath — The Path of Guidance" },
      { property: "og:description", content: "Quran with audio, translation and tafseer, hadith books, prayer times, Qibla, duas and Islamic learning in many languages." },
    ],
  }),
  component: Index,
});

const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

/** Minutes since midnight for a "HH:MM" timing string, or null. */
function toMinutes(value: string | undefined) {
  const m = /^(\d{1,2}):(\d{2})/.exec((value ?? "").trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const QUICK = [
  { to: "/deeds", label: "Daily Good Deeds", icon: GoodDeedsLogo, note: "Tick every deed you do" },
  { to: "/qibla", label: "Qibla", icon: Compass, note: "Live direction" },

  { to: "/names", label: "99 Names", icon: NamesLogo, note: "Asma ul Husna" },
  { to: "/tasbeeh", label: "Tasbeeh", icon: ListChecks, note: "Digital counter" },
  { to: "/duas", label: "Duas", icon: Heart, note: "With meaning" },
  { to: "/qaida", label: "Noorani Qaida", icon: Baby, note: "Learn to read" },
  { to: "/seerah", label: "Seerat un Nabi ﷺ", icon: Rose, note: "Life & family" },
  { to: "/calendar", label: "Hijri Calendar", icon: CalendarDays, note: "Islamic dates" },
  { to: "/tree", label: "Ibadah Tree", icon: TreeDeciduous, note: "Grow with every deed" },
  { to: "/tracker", label: "Salah Tracker", icon: CalendarHeart, note: "Daily habit" },
  { to: "/more", label: "More", icon: Ellipsis, note: "Everything else" },
];

function Index() {
  const { settings } = useSettings();
  const flags = useFeatureFlags();
  const [site] = useSiteConfig();
  const { data, isLoading, error } = usePrayerDay();

  /* Live clock — ticks every second so the highlight and countdown stay true. */
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const live = useMemo(() => {
    if (!data || !now) return null;
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const slots = PRAYERS.map((p) => ({ name: p, at: toMinutes(data.timings[p]) })).filter(
      (s): s is { name: string; at: number } => s.at !== null,
    );
    if (slots.length === 0) return null;
    const upcoming = slots.find((s) => s.at > minutesNow) ?? slots[0]!;
    const passed = [...slots].reverse().find((s) => s.at <= minutesNow) ?? slots[slots.length - 1]!;
    const secondsLeft =
      (upcoming.at > minutesNow ? upcoming.at - minutesNow : 24 * 60 - minutesNow + upcoming.at) * 60 -
      now.getSeconds();
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    return {
      current: passed.name,
      next: upcoming.name,
      countdown: h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`,
      clock: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    };
  }, [data, now]);

  return (
    <div className="space-y-8">
      {site.announcement && (
        <div role="status" className="flex items-center justify-center rounded-xl border border-accent/50 bg-accent/10 px-4 py-3 text-center text-sm font-semibold text-foreground animate-rise">
          {site.announcement}
        </div>
      )}
      {isOn(flags, "home:hero") && (
      <section className="relative overflow-hidden rounded-3xl gradient-hero p-6 text-primary-foreground shadow-glow animate-rise sm:p-9">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-accent/20 blur-2xl animate-float" aria-hidden />
        <svg aria-hidden viewBox="0 0 100 100" className="absolute -bottom-10 -left-8 size-56 text-accent/20 animate-spin-slow" fill="none" stroke="currentColor">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="25" y="25" width="50" height="50" transform={`rotate(${i * 11} 50 50)`} strokeWidth="0.6" />
          ))}
        </svg>
        <p className="relative text-xs uppercase tracking-[0.3em] text-accent">Bismillah</p>
        <p className="relative mt-3 arabic-ayah text-3xl text-accent sm:text-4xl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        <h1 className="relative mt-4 font-display text-2xl sm:text-3xl">{site.homeHeroTitle}</h1>
        <p className="relative mt-2 max-w-lg text-sm text-primary-foreground/80">
          {site.homeHeroSubtitle}
        </p>
        <div className="relative mt-5 flex flex-wrap gap-3">
          <Link to="/quran" className="rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft transition hover:brightness-105">
            Open the Quran
          </Link>
          <Link to="/hadith" className="rounded-full border border-accent/40 px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10">
            Browse Hadith
          </Link>
        </div>
      </section>
      )}

      {isOn(flags, "home:search") && <SearchBar />}

      {isOn(flags, "home:prayer") && (
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h3 className="font-display text-xl">Today's Prayer Times</h3>
          <span className="text-xs text-muted-foreground">
            {settings.city}, {settings.country}
          </span>
        </div>
        {isLoading && <div className="h-24 rounded-2xl border border-border bg-card shimmer" />}
        {error && <Card className="text-sm text-destructive">Couldn't load prayer times. Check your city in Settings.</Card>}
        {data && (
          <Card className="space-y-4">
            <div className="dateline">
              <span className="dateline-greg">
                <span className="dateline-label">Today</span>
                {data.date.readable}
              </span>
              <span className="dateline-hijri">
                <span className="dateline-label">Hijri</span>
                {data.date.hijri.day} {data.date.hijri.month.en} {data.date.hijri.year} AH
              </span>
            </div>

            {live && (
              <div className="relative overflow-hidden rounded-2xl gradient-hero p-4 text-primary-foreground shadow-glow">
                <div className="absolute -right-8 -top-8 size-32 rounded-full bg-accent/25 blur-2xl animate-float" aria-hidden />
                <div className="relative flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Now</p>
                    <p className="font-display text-3xl tabular-nums leading-none">{live.clock}</p>
                    <p className="mt-1 text-xs text-primary-foreground/80">
                      Current period · <span className="font-semibold text-accent">{live.current}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-accent">{live.next} in</p>
                    <p className="font-display text-2xl tabular-nums leading-none">{live.countdown}</p>
                    <p className="mt-1 text-xs text-primary-foreground/80">
                      at {prettyTime(data.timings[live.next])}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {PRAYERS.map((p, i) => {
                const isNext = live?.next === p;
                const isCurrent = live?.current === p;
                return (
                  <div
                    key={p}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className={`animate-rise rounded-xl border p-3 text-center transition ${
                      isNext
                        ? "border-accent bg-accent/15 shadow-glow ring-2 ring-accent/50"
                        : isCurrent
                          ? "border-primary/60 bg-primary/10"
                          : "border-border/70 bg-secondary/50"
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{p}</p>
                    <p className={`mt-1 font-semibold tabular-nums ${isNext ? "text-foreground" : "text-primary"}`}>
                      {prettyTime(data.timings[p])}
                    </p>
                    {isNext && <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">Next</p>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </section>
      )}

      {isOn(flags, "home:explore") && (
      <section className="space-y-3">
        <h3 className="font-display text-xl">Explore</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {QUICK.filter((item) => isOn(flags, item.to)).map(({ to, label, icon: Icon, note }, i) => (
            <Link key={to + label} to={to} style={{ animationDelay: `${i * 40}ms` }} className="animate-rise">
              <Card className="group h-full">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{note}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      )}


    </div>
  );
}
