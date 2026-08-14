import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Headphones, Mic2, Music4, Play, Quote, Search } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { NasheedPlayer } from "@/components/NasheedPlayer";
import { spotifyEmbed, useSiteConfig } from "@/lib/site-config";
import { NASHEED_TRACKS, TRACK_THEMES, type NasheedTrack } from "@/lib/nasheed-tracks";
import { NASHEEDS } from "@/lib/nasheed-data";

export const Route = createFileRoute("/naats")({
  head: () => ({
    meta: [
      { title: "Urdu Naats & Nasheeds — Full Audio, Human Voice | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Listen to beautiful Urdu naats and Arabic nasheeds in full — Tajdar-e-Haram, Mustafa Jaan-e-Rehmat, Qasida Burda Sharif and more, with a smooth in-page player.",
      },
      { property: "og:title", content: "Urdu Naats & Nasheeds — Full Audio | Raah e Hidayath" },
      {
        property: "og:description",
        content:
          "A curated library of Urdu naats and Arabic nasheeds that play in full, right on the page.",
      },
      { property: "og:type", content: "music.playlist" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Naats,
});

type LangTab = "Urdu" | "Arabic" | "All";
const LANG_TABS: LangTab[] = ["Urdu", "Arabic", "All"];

function Naats() {
  const [site] = useSiteConfig();

  const [lang, setLang] = useState<LangTab>("Urdu");
  const [theme, setTheme] = useState<(typeof TRACK_THEMES)[number]>("All");
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<number | null>(null);

  const queue = useMemo<NasheedTrack[]>(() => {
    const q = query.trim().toLowerCase();
    return NASHEED_TRACKS.filter((t) => {
      if (lang !== "All" && t.lang !== lang) return false;
      if (theme !== "All" && t.theme !== theme) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.native ?? "").includes(query.trim())
      );
    });
  }, [lang, theme, query]);

  /** The 100-entry reference library (kalam, refrains and translations). */
  const reference = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NASHEEDS.filter((n) => {
      if (lang !== "All" && n.language !== lang) return false;
      if (!q) return true;
      return n.title.toLowerCase().includes(q) || n.artist.toLowerCase().includes(q);
    }).slice(0, 60);
  }, [lang, query]);

  const spotifyCards = site.spotify
    .map((entry) => ({ entry, embed: spotifyEmbed(entry) }))
    .filter(
      (x): x is { entry: (typeof site.spotify)[number]; embed: { embed: string; open: string } } =>
        Boolean(x.embed),
    );

  return (
    <div className="space-y-6 pb-40">
      <SectionTitle title={site.naatsTitle} subtitle={site.naatsSubtitle} />

      <Card className="gradient-hero text-primary-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Quote className="size-10 shrink-0 text-accent" aria-hidden />
          <div>
            <p dir="rtl" lang="ar" className="font-display text-xl leading-loose">
              {site.naatsVerse}
            </p>
            <p className="mt-2 text-sm text-primary-foreground/85">{site.naatsVerseRef}</p>
            <p className="mt-3 text-xs text-primary-foreground/75">{site.naatsIntro}</p>
          </div>
        </div>
      </Card>

      {/* ---------------- Playable library ---------------- */}
      <section aria-labelledby="library-heading" className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Headphones className="size-5 text-primary" aria-hidden />
          <h2 id="library-heading" className="font-display text-xl">
            Nasheed & Naat library — plays in full
          </h2>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {NASHEED_TRACKS.length} recordings
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Tap any title and it streams from beginning to end — seek, pause, repeat, or let the next
          one flow automatically.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-2xl border border-border bg-card p-1 text-sm font-medium shadow-soft">
            {LANG_TABS.map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  setPlaying(null);
                }}
                aria-pressed={lang === l}
                className={`rounded-xl px-3.5 py-1.5 transition ${
                  lang === l
                    ? "gradient-hero text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "Urdu" ? "اردو Urdu" : l === "Arabic" ? "عربي Arabic" : "All"}
              </button>
            ))}
          </div>

          <div className="relative min-w-[13rem] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search naats, nasheeds or reciters…"
              className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none shadow-soft transition focus:border-primary/40"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TRACK_THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              aria-pressed={theme === t}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                theme === t
                  ? "border-primary/40 bg-primary/12 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {queue.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">
              Nothing matches that search yet — try another title or clear the filters.
            </p>
          </Card>
        ) : (
          <ul className="nasheed-grid list-none p-0">
            {queue.map((t, i) => {
              const active = playing === i;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setPlaying(i)}
                    className={`nasheed-tile ${active ? "nasheed-tile--active" : ""}`}
                  >
                    <span className="nasheed-tile__play" aria-hidden>
                      <Play className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate font-display text-base leading-snug">
                        {t.title}
                      </span>
                      {t.native && (
                        <span dir="rtl" className="urdu-text block truncate text-sm text-primary">
                          {t.native}
                        </span>
                      )}
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {t.artist} · {t.theme}
                      </span>
                    </span>
                    <span className="nasheed-chip">{t.lang}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------------- Kalam reference ---------------- */}
      <section aria-labelledby="kalam-heading" className="space-y-3">
        <div className="flex items-center gap-2">
          <Music4 className="size-5 text-primary" aria-hidden />
          <h2 id="kalam-heading" className="font-display text-xl">
            Kalam & refrains
          </h2>
        </div>
        <ul className="nasheed-grid list-none p-0">
          {reference.map((n) => (
            <li key={n.id}>
              <Card className="nasheed-card gap-2">
                <h3 className="font-display text-base leading-snug">{n.title}</h3>
                <p className="text-[11px] text-muted-foreground">
                  {n.artist} · {n.language} · {n.theme}
                </p>
                {n.refrain && (
                  <p dir="rtl" className="urdu-text text-base leading-loose text-primary">
                    {n.refrain}
                  </p>
                )}
                {n.translation && (
                  <p className="text-xs italic text-muted-foreground">{n.translation}</p>
                )}
                <p className="mt-auto text-xs text-muted-foreground">{n.about}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Spotify: full players, vocals only ---------------- */}
      {spotifyCards.length > 0 && (
        <section aria-labelledby="spotify-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <Mic2 className="size-5 text-primary" aria-hidden />
            <h2 id="spotify-heading" className="font-display text-xl">
              Listen on Spotify — voice only
            </h2>
          </div>

          <ul className="nasheed-grid list-none p-0">
            {spotifyCards.map(({ entry, embed }) => (
              <li key={entry.id}>
                <Card className="nasheed-card gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-base leading-snug">{entry.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
                    </div>
                    <span className="nasheed-chip">No music</span>
                  </div>

                  <div className="nasheed-embed mt-auto border border-border">
                    <iframe
                      src={embed.embed}
                      title={`${entry.title} — vocals only Spotify player`}
                      height={entry.kind === "track" ? 152 : 352}
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      style={{ height: entry.kind === "track" ? 152 : 352 }}
                    />
                  </div>

                  <a
                    href={embed.open}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    Open in Spotify <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {playing !== null && queue[playing] && (
        <NasheedPlayer
          queue={queue}
          index={playing}
          onIndexChange={setPlaying}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  );
}
