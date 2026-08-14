import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { PROPHETS, PROPHET_CHILDREN, PROPHET_WIVES } from "@/lib/extra-data";

export const Route = createFileRoute("/prophets")({
  head: () => ({
    meta: [
      { title: "Prophets of Islam — Adam AS to Muhammad ﷺ | Raah e Hidayath" },
      {
        name: "description",
        content:
          "The 25 prophets named in the Qur'an from Adam AS to Muhammad ﷺ with their lineage and families, plus the wives and children of the Prophet ﷺ.",
      },
      { property: "og:title", content: "Prophets of Islam & Their Families | Raah e Hidayath" },
      { property: "og:description", content: "Lineage and family of every prophet named in the Qur'an." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Prophets,
});

function Prophets() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return PROPHETS;
    return PROPHETS.filter((p) =>
      [p.name, p.arabic, p.bible ?? "", p.lineage, p.family].join(" ").toLowerCase().includes(t),
    );
  }, [q]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Prophets & Their Families"
        subtitle="From Adam AS to Muhammad ﷺ — lineage, wives and children"
      />

      <Card>
        <label htmlFor="prophet-search" className="block text-sm font-medium">
          Search prophets
        </label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="prophet-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, lineage or family"
            className="min-h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <p aria-live="polite" className="mt-2 text-xs text-muted-foreground">
          {list.length} of {PROPHETS.length} prophets shown
        </p>
      </Card>

      <ol className="relative space-y-4 border-l border-border pl-6">
        {list.map((p, i) => (
          <li key={p.n} style={{ animationDelay: `${i * 30}ms` }} className="animate-rise relative">
            <span aria-hidden className="absolute -left-[31px] top-4 size-3 rounded-full gradient-gold shadow-glow" />
            <Card className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-lg">
                  <span className="mr-2 text-xs font-semibold text-primary">{p.n}</span>
                  {p.name}
                </h2>
                <span dir="rtl" lang="ar" className="arabic-ayah text-xl">
                  {p.arabic}
                </span>
              </div>
              {p.bible && p.bible !== "—" && (
                <p className="text-xs text-muted-foreground">Also known as: {p.bible}</p>
              )}
              <p className="text-sm">
                <span className="font-semibold">Lineage: </span>
                {p.lineage}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Family: </span>
                {p.family}
              </p>
              <p className="text-sm text-muted-foreground">{p.note}</p>
            </Card>
          </li>
        ))}
      </ol>

      <section aria-labelledby="wives" className="space-y-3">
        <h2 id="wives" className="flex items-center gap-2 font-display text-xl">
          <Users className="size-5 text-primary" aria-hidden /> Wives of the Prophet ﷺ — Mothers of the Believers
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PROPHET_WIVES.map((w) => (
            <li key={w.name}>
              <Card>
                <p className="font-semibold">{w.name} <span className="text-xs text-muted-foreground">RA</span></p>
                <p className="mt-1 text-sm text-muted-foreground">{w.note}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="children" className="space-y-3">
        <h2 id="children" className="font-display text-xl">
          Children of the Prophet ﷺ
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PROPHET_CHILDREN.map((c) => (
            <li key={c.name}>
              <Card>
                <p className="font-semibold">{c.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
