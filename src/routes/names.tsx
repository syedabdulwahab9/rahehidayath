import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, RefreshCw, Search } from "lucide-react";
import { SectionTitle } from "@/components/AppShell";
import { fetchAsmaUlHusna, type AsmaName } from "@/lib/quran-api";
import { NamesHero } from "@/components/names/NamesHero";
import { NameSpotlight } from "@/components/names/NameSpotlight";
import { NameCard } from "@/components/names/NameCard";
import { NameDialog } from "@/components/names/NameDialog";

export const Route = createFileRoute("/names")({
  head: () => ({
    meta: [
      { title: "99 Names of Allah — Asma ul Husna | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Explore the 99 beautiful names of Allah (Asma ul Husna) with Arabic calligraphy, transliteration, meanings, dhikr phrasing and a memorisation mode.",
      },
      { property: "og:title", content: "Asma ul Husna — The 99 Beautiful Names of Allah" },
      {
        property: "og:description",
        content: "Search, reflect on and memorise the 99 names of Allah with a beautiful, smooth experience.",
      },
    ],
  }),
  component: Names,
});

const MEMORISE_KEY = "rah-e-hidayath-names-memorise";

function Names() {
  const [q, setQ] = useState("");
  const [memorise, setMemorise] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<AsmaName | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["asma"],
    queryFn: fetchAsmaUlHusna,
    staleTime: Infinity,
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(MEMORISE_KEY);
      if (raw) setMemorise(raw === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMemorise = () => {
    setMemorise((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(MEMORISE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (next) setRevealed(new Set());
      return next;
    });
  };

  const list = useMemo(() => {
    const names = data ?? [];
    if (!q.trim()) return names;
    const needle = q.trim().toLowerCase();
    return names.filter(
      (n) =>
        n.name.includes(q) ||
        n.transliteration.toLowerCase().includes(needle) ||
        n.en.meaning.toLowerCase().includes(needle),
    );
  }, [data, q]);

  return (
    <div className="space-y-6">
      <SectionTitle title="Asma ul Husna" subtitle="The 99 beautiful names of Allah with their meanings" />

      <NamesHero />

      {!isLoading && !error && data && data.length > 0 && <NameSpotlight names={data} />}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Arabic, transliteration or meaning…"
            className="w-full min-w-0 rounded-2xl border border-border bg-card py-3 pr-4 pl-10 text-sm shadow-soft outline-none transition focus:shadow-glow"
          />
        </div>
        <button
          type="button"
          onClick={toggleMemorise}
          aria-pressed={memorise}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-soft transition ${
            memorise
              ? "border-accent/50 gradient-gold text-accent-foreground"
              : "border-border bg-card text-foreground hover:shadow-glow"
          }`}
        >
          <BrainCircuit className="size-4" />
          {memorise ? "Memorise mode: On" : "Memorise mode"}
        </button>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl border border-border bg-card shimmer" />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card p-8 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">
            Couldn't load the 99 names right now. Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-2xl gradient-gold px-4 py-2 text-sm font-medium text-accent-foreground shadow-soft transition hover:shadow-glow disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No name matches "{q}".</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((n, i) => (
                <NameCard
                  key={n.number}
                  name={n}
                  index={i}
                  memorise={memorise}
                  revealed={revealed.has(n.number)}
                  onToggleReveal={() =>
                    setRevealed((prev) => {
                      const next = new Set(prev);
                      next.add(n.number);
                      return next;
                    })
                  }
                  onOpen={() => setSelected(n)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <NameDialog name={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
