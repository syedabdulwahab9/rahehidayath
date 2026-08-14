import { useState } from "react";
import { Building2, CloudUpload, Loader2, Music4, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Card } from "@/components/AppShell";
import { useCloudSection } from "@/lib/cloud-state";
import { DEFAULT_SITE, spotifyEmbed, type SiteConfig, type SpotifyEntry } from "@/lib/site-config";

const FIELD =
  "min-h-11 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";
const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary";
const LABEL = "mb-1 block text-xs font-medium text-muted-foreground";

const TEXT_FIELDS: Array<{ key: keyof SiteConfig; label: string; hint?: string; area?: boolean }> = [
  { key: "siteName", label: "Website name" },
  { key: "tagline", label: "Tagline" },
  { key: "homeHeroTitle", label: "Home heading" },
  { key: "homeHeroSubtitle", label: "Home subheading", area: true },
  { key: "naatsTitle", label: "Naats & Nasheeds heading" },
  { key: "naatsSubtitle", label: "Naats & Nasheeds subheading" },
  { key: "naatsIntro", label: "Naats intro paragraph", area: true },
  { key: "naatsVerse", label: "Naats page Arabic verse", area: true },
  { key: "naatsVerseRef", label: "Verse translation & reference", area: true },
  { key: "footerNote", label: "Footer note" },
  { key: "creators", label: "Footer names (separate each name with a comma)", area: true },
  { key: "homeCreditsTitle", label: "Home footer heading (above the names)" },
  { key: "homeCreators", label: "Home footer names (comma separated — leave empty to use the shared list)", area: true },
  { key: "moreCreditsTitle", label: "More page footer heading" },
  { key: "moreCreators", label: "More page footer names (comma separated — leave empty to use the shared list)", area: true },
  { key: "settingsCreditsTitle", label: "Settings page footer heading" },
  { key: "settingsCreators", label: "Settings page footer names (comma separated — leave empty to use the shared list)", area: true },
  { key: "contactEmail", label: "Contact email (shown on the More page)" },
  { key: "contactPhone", label: "Phone number" },
  { key: "contactAddress", label: "Address", area: true },
  { key: "whatsappLink", label: "WhatsApp link" },
  { key: "socialLinks", label: "Social media links (one per line)", area: true },
  { key: "aboutText", label: "About us text", area: true },
  { key: "copyrightText", label: "Copyright text" },
  { key: "logoUrl", label: "Logo image URL" },
  { key: "faviconUrl", label: "Favicon image URL" },
  { key: "navigationLabels", label: "Navigation labels (Home, Quran, Hadith, Ibadaat, More)" },
  { key: "announcement", label: "Global announcement", area: true },
];

const uid = () => `sp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function AdminSiteEditor() {
  const { draft: site, edit, cancel, publish, dirty, state } = useCloudSection<SiteConfig>("site", DEFAULT_SITE);
  const [status, setStatus] = useState("");
  const [spotifyDraft, setSpotifyDraft] = useState<SpotifyEntry>({ id: "", uri: "", kind: "playlist", title: "", note: "" });

  const patch = (key: keyof SiteConfig, value: string) => {
    edit({ ...site, [key]: value });
    setStatus("");
  };

  const patchSpotify = (list: SpotifyEntry[], message: string) => {
    edit({ ...site, spotify: list });
    setStatus(message);
  };

  const addSpotify = () => {
    if (!spotifyDraft.uri.trim() || !spotifyDraft.title.trim()) {
      setStatus("A title and a Spotify link are both needed.");
      return;
    }
    patchSpotify([...site.spotify, { ...spotifyDraft, id: uid() }], "Spotify player added to the draft.");
    setSpotifyDraft({ id: "", uri: "", kind: "playlist", title: "", note: "" });
  };

  return (
    <section aria-labelledby="site-editor-heading" className="space-y-3">
      <h2 id="site-editor-heading" className="flex items-center gap-2 font-display text-xl">
        <Building2 className="size-5 text-primary" aria-hidden /> Website content & branding
      </h2>

      <Card className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Rewrite any text shown on the website, then use Save Changes to publish it to every visitor and device.
        </p>

        {status && (
          <p role="status" className="text-sm text-primary">
            {status}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {TEXT_FIELDS.map(({ key, label, area }) => (
            <label key={key} className={area ? "sm:col-span-2" : ""}>
              <span className={LABEL}>{label}</span>
              {area ? (
                <textarea
                  className={`${FIELD} min-h-24`}
                  value={String(site[key] ?? "")}
                  onChange={(e) => patch(key, e.target.value)}
                />
              ) : (
                <input className={FIELD} value={String(site[key] ?? "")} onChange={(e) => patch(key, e.target.value)} />
              )}
            </label>
          ))}
        </div>

        <div className="space-y-2 border-t border-border/60 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void publish("Website content & branding", `Website name: ${site.siteName.slice(0, 80)}`)}
              disabled={!dirty || state.status === "saving"}
              className={`${BTN} gradient-hero text-primary-foreground disabled:opacity-60`}
            >
              {state.status === "saving" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CloudUpload className="size-4" aria-hidden />}
              Save Changes
            </button>
            <button onClick={cancel} disabled={!dirty || state.status === "saving"} className={`${BTN} border border-border hover:text-primary disabled:opacity-60`}>
              Cancel
            </button>
            <button
              onClick={() => {
                edit(DEFAULT_SITE);
                setStatus("Defaults loaded as a draft. Save Changes to publish them.");
              }}
              className={`${BTN} border border-border hover:text-primary`}
            >
              <RotateCcw className="size-4" aria-hidden /> Reset to defaults
            </button>
            {dirty && <span className="self-center text-xs text-muted-foreground">Unpublished changes</span>}
          </div>
          <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-destructive" : "text-primary"} ${state.message ? "" : "sr-only"}`}>
            {state.message}{state.publishedAt ? ` Updated ${new Date(state.publishedAt).toLocaleString()}.` : ""}
          </p>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="flex items-center gap-2 font-display text-lg">
          <Music4 className="size-5 text-primary" aria-hidden /> Spotify players on the nasheeds page
        </h3>
        <p className="text-sm text-muted-foreground">
          Paste any Spotify playlist, album or track link — vocals-only nasheeds only, please. Each one becomes a full
          player card on the Naats &amp; Nasheeds page.
        </p>

        {site.spotify.length > 0 && (
          <ul className="divide-y divide-border/60">
            {site.spotify.map((entry) => {
              const parsed = spotifyEmbed(entry);
              return (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block truncate font-medium">{entry.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {entry.kind} · {parsed ? parsed.open : "invalid link"}
                    </span>
                  </span>
                  <button
                    onClick={() =>
                      patchSpotify(
                        site.spotify.filter((s) => s.id !== entry.id),
                        "Removed from the nasheeds page.",
                      )
                    }
                    aria-label={`Delete ${entry.title}`}
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className={LABEL}>Title</span>
            <input
              className={FIELD}
              value={spotifyDraft.title}
              onChange={(e) => setSpotifyDraft({ ...spotifyDraft, title: e.target.value })}
              placeholder="Arabic Nasheeds — Vocals Only"
            />
          </label>
          <label>
            <span className={LABEL}>Type</span>
            <select
              className={FIELD}
              value={spotifyDraft.kind}
              onChange={(e) => setSpotifyDraft({ ...spotifyDraft, kind: e.target.value as SpotifyEntry["kind"] })}
            >
              <option value="playlist">Playlist</option>
              <option value="album">Album</option>
              <option value="track">Single track</option>
              <option value="artist">Artist</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={LABEL}>Spotify link or id</span>
            <input
              className={FIELD}
              value={spotifyDraft.uri}
              onChange={(e) => setSpotifyDraft({ ...spotifyDraft, uri: e.target.value })}
              placeholder="https://open.spotify.com/playlist/…"
            />
          </label>
          <label className="sm:col-span-2">
            <span className={LABEL}>Short description</span>
            <input
              className={FIELD}
              value={spotifyDraft.note}
              onChange={(e) => setSpotifyDraft({ ...spotifyDraft, note: e.target.value })}
              placeholder="A cappella nasheeds — human voice only, no instruments."
            />
          </label>
        </div>

        <button onClick={addSpotify} className={`${BTN} gradient-hero text-primary-foreground`}>
          <Plus className="size-4" aria-hidden /> Add Spotify player
        </button>

        <p className="text-xs text-muted-foreground">
          Defaults shipped with the app: {DEFAULT_SITE.spotify.length} vocals-only playlists.
        </p>
      </Card>
    </section>
  );
}
