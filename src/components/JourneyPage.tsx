import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Droplets, Home, Mountain, TreeDeciduous } from "lucide-react";
import { Card } from "@/components/AppShell";

export function JourneyHeader({
  eyebrow,
  title,
  subtitle,
  icon,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl gradient-hero p-6 text-primary-foreground shadow-glow animate-rise sm:p-8">
      <div className="absolute -right-12 -top-12 size-48 rounded-full bg-accent/20 blur-3xl animate-float" aria-hidden />
      <div className="relative flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">{icon}</span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-lg text-sm text-primary-foreground/80">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}

export function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <Card className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <span>
        <span className="block text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="block font-display text-lg">{value}</span>
      </span>
    </Card>
  );
}

const JOURNEY = [
  { to: "/tree", label: "The Ibadah Tree", note: "Log today's deeds", icon: TreeDeciduous },
  { to: "/trail", label: "The Hidayah Trail", note: "Five prayers, every day", icon: Mountain },
  { to: "/lake", label: "The Sadaqah Lake", note: "Dhikr & charity drops", icon: Droplets },
  { to: "/jannah", label: "The House in Jannah", note: "Built milestone by milestone", icon: Home },
] as const;

export function JourneyLinks({ current }: { current: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {JOURNEY.filter((j) => j.to !== current).map(({ to, label, note, icon: Icon }) => (
        <Link key={to} to={to}>
          <Card className="group flex h-full items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="block truncate text-xs text-muted-foreground">{note}</span>
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
}
