import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Ellipsis, Home, Layers, Moon, Scroll, Settings as SettingsIcon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useSettings } from "@/lib/settings";
import { useAutoLocation } from "@/lib/auto-location";
import { useSiteConfig } from "@/lib/site-config";
import { useFeatureFlags, isOn } from "@/lib/feature-flags";
import { LiveAnnouncements, LiveSeo } from "@/components/LiveAnnouncements";


const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/quran", label: "Quran", icon: BookOpen },
  { to: "/hadith", label: "Hadith", icon: Scroll },
  { to: "/ibadaat", label: "Ibadaat", icon: Layers },
  { to: "/more", label: "More", icon: Ellipsis },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { settings, update } = useSettings();
  useAutoLocation();
  const [site] = useSiteConfig();
  const flags = useFeatureFlags();
  const navLabels = site.navigationLabels.split(",").map((label) => label.trim());
  const nav = NAV.map((item, index) => ({ ...item, label: navLabels[index] || item.label })).filter((n) => n.to === "/" || isOn(flags, n.to));

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackdropOrnaments />
      <header className="sticky top-0 z-40 glass-card border-b border-border/60">
        <div className="app-container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <Logo src={site.logoUrl} />
            <span className="leading-tight">
              <span className="block font-display text-lg tracking-wide text-foreground">{site.siteName}</span>
              <span className="block text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                {site.tagline}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={() => update({ theme: settings.theme === "dark" ? "light" : "dark" })}
              className="rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:text-primary"
            >
              {settings.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Link
              to="/settings"
              className="rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:text-primary"
              aria-label="Settings"
            >
              <SettingsIcon className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <LiveSeo />
      <LiveAnnouncements />
      <main className="app-container px-4 pt-6 pb-28">{children}</main>


      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 glass-card">
        <div className="app-container flex items-stretch justify-between px-2 py-1.5">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 -z-10 rounded-xl bg-primary/10 animate-rise" aria-hidden />
                )}
                <Icon className={`size-5 transition ${active ? "scale-110" : ""}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Logo({ className = "", src = "" }: { className?: string; src?: string }) {
  return (
    <span className={`relative inline-flex size-10 items-center justify-center ${className}`}>
      {src ? <img src={src} alt="" className="relative z-10 size-10 rounded-2xl object-cover" /> : null}
      {!src && <>
      <span className="absolute inset-0 rounded-2xl gradient-hero shadow-soft" />
      <span className="absolute inset-0 rounded-2xl border border-accent/40 animate-spin-slow" />
      <svg viewBox="0 0 48 48" className="relative size-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M32 10a15 15 0 1 0 0 28 18 18 0 0 1 0-28Z" strokeLinejoin="round" />
        <path d="M38 16l1.6 4.4L44 22l-4.4 1.6L38 28l-1.6-4.4L32 22l4.4-1.6L38 16Z" strokeLinejoin="round" />
      </svg>
      </>}
    </span>
  );
}

function BackdropOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden gradient-soft">
      <div className="absolute -top-24 -left-24 size-72 rounded-full bg-primary/[0.035] blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-28 size-80 rounded-full bg-accent/[0.05] blur-3xl animate-float [animation-delay:1.6s]" />
      <svg
        className="absolute bottom-10 left-1/2 size-[520px] -translate-x-1/2 animate-spin-slow"
        style={{
          color: "var(--backdrop-circle, var(--primary))",
          opacity: "var(--backdrop-circle-opacity, 0.05)",
        }}
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} cx="100" cy="100" r="70" transform={`rotate(${i * 15} 100 100)`} strokeWidth="0.7" />
        ))}
      </svg>
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string | undefined }) {
  return (
    <div className="animate-rise">
      <h1 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-3 h-px w-24 gradient-gold" />
    </div>
  );
}

export function Card({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition hover:shadow-glow ${className}`}>
      {children}
    </div>
  );
}