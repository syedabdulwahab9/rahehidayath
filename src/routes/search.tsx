import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, SectionTitle } from "@/components/AppShell";
import { SearchBar } from "@/components/SearchBar";
import { useSettings } from "@/lib/settings";
import { searchSite, type SiteResult } from "@/lib/search-index";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: typeof search["q"] === "string" ? (search["q"] as string) : "" }),
  head: () => ({
    meta: [
      { title: "Search Everything — Quran, Hadith, Duas & Namaz | Raah e Hidayath" },
      { name: "description", content: "One search bar for the whole app: every ayah, dua, namaz ruling, hadith book, tajweed rule, seerah event and page of Raah e Hidayath." },
      { property: "og:title", content: "Search Everything | Raah e Hidayath" },
      { property: "og:description", content: "Find any ayah, dua, namaz ruling or lesson instantly by text or voice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

type Match = { number: number; text: string; surah: { number: number; englishName: string }; numberInSurah: number };

function SearchPage() {
  const { settings } = useSettings();
  const { q: initialQuery } = Route.useSearch();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Match[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "site" | "quran">("all");

  const siteResults: SiteResult[] = useMemo(() => searchSite(query), [query]);

  const run = useCallback(
    async (q: string) => {
      setQuery(q);
      if (!q.trim()) return;
      setBusy(true);
      setErr(null);
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/${settings.lang}`,
        );
        const json = (await res.json()) as { data?: { matches?: Match[] } };
        setResults(json.data?.matches ?? []);
      } catch {
        setErr("Quran search failed. Please check your connection and try again.");
      } finally {
        setBusy(false);
      }
    },
    [settings.lang],
  );

  useEffect(() => {
    if (initialQuery) void run(initialQuery);
  }, [initialQuery, run]);

  const showSite = tab !== "quran";
  const showQuran = tab !== "site";

  return (
    <div className="space-y-6">
      <SectionTitle title="Search" subtitle="Everything in the app — Quran, hadith, duas, namaz, tajweed, seerah and more" />
      <SearchBar placeholder="Search duas, namaz, surahs, hadith, anything…" initialQuery={initialQuery} onSearch={(v) => void run(v)} />

      <div className="flex flex-wrap gap-2 text-sm">
        {(["all", "site", "quran"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 font-medium capitalize transition ${
              tab === t ? "border-transparent gradient-hero text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-primary"
            }`}
          >
            {t === "site" ? `In the app (${siteResults.length})` : t === "quran" ? `Quran (${results?.length ?? 0})` : "All"}
          </button>
        ))}
      </div>

      {showSite && siteResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg">In the app</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {siteResults.map((r) => (
              <Link key={r.id} to={r.to} params={r.params as never}>
                <Card className="h-full animate-rise">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{r.section}</p>
                  <p className="mt-1 font-semibold">{r.title}</p>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{r.subtitle}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showQuran && (
        <section className="space-y-3">
          <h2 className="font-display text-lg">In the Quran</h2>
          {busy && <div className="h-32 rounded-2xl border border-border bg-card shimmer" />}
          {err && <Card className="text-sm text-destructive">{err}</Card>}
          {!busy && results?.length === 0 && (
            <Card className="text-center text-sm text-muted-foreground">No ayah matched your search.</Card>
          )}
          <div className="space-y-3">
            {results?.slice(0, 60).map((m) => (
              <Link key={m.number} to="/quran/$surahId" params={{ surahId: String(m.surah.number) }}>
                <Card className="animate-rise">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">
                    {m.surah.englishName} · {m.surah.number}:{m.numberInSurah}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{m.text}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!query && (
        <Card className="text-sm text-muted-foreground">
          Try “wudu”, “namaz rakat”, “dua before sleeping”, “Bukhari”, “Badr”, “qalqalah” or any word of the Quran.
        </Card>
      )}
    </div>
  );
}
