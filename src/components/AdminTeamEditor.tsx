import { useState } from "react";
import { Mail, Plus, Trash2, Users } from "lucide-react";
import { Card } from "@/components/AppShell";
import { creatorList, useSiteConfig } from "@/lib/site-config";

const FIELD =
  "min-h-11 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";
const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary";
const LABEL = "mb-1 block text-xs font-medium text-muted-foreground";

/**
 * Last card of the admin panel — change the contact email address and the
 * developer names shown in the "Created by" boxes, one name per row.
 */
export function AdminTeamEditor() {
  const [site, save] = useSiteConfig();
  const [status, setStatus] = useState("");
  const names = creatorList(site);

  const writeNames = (next: string[], message: string) => {
    save({ ...site, creators: next.filter((n) => n.trim()).join(", ") });
    setStatus(message);
  };

  const setName = (i: number, value: string) => {
    const next = [...names];
    next[i] = value;
    save({ ...site, creators: next.join(", ") });
    setStatus("Saved — the name updated everywhere.");
  };

  return (
    <section aria-labelledby="team-editor-heading" className="space-y-3">
      <h2 id="team-editor-heading" className="flex items-center gap-2 font-display text-xl">
        <Users className="size-5 text-primary" aria-hidden /> Developers &amp; contact email
      </h2>

      <Card className="space-y-4">
        <p className="text-sm text-muted-foreground">
          These names appear in the “Created by” box on the home page and the “Developed by” box in the More section.
          The email is the support address shown across the app.
        </p>

        {status && (
          <p role="status" className="text-sm text-primary">
            {status}
          </p>
        )}

        <label className="block">
          <span className={LABEL}>
            <Mail className="mr-1 inline size-3.5 align-[-2px]" aria-hidden /> Contact email address
          </span>
          <input
            className={FIELD}
            type="email"
            inputMode="email"
            value={site.contactEmail}
            onChange={(e) => {
              save({ ...site, contactEmail: e.target.value });
              setStatus("Saved — the contact email updated.");
            }}
            placeholder="you@example.com"
          />
        </label>

        <div className="space-y-2">
          <span className={LABEL}>Developer names</span>
          {names.length === 0 && <p className="text-sm text-muted-foreground">No names yet — add the first one.</p>}
          {names.map((n, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={FIELD}
                value={n}
                aria-label={`Developer ${i + 1}`}
                onChange={(e) => setName(i, e.target.value)}
              />
              <button
                onClick={() => writeNames(names.filter((_, j) => j !== i), "Name removed.")}
                aria-label={`Remove ${n}`}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => writeNames([...names, "New developer"], "Name added — edit it above.")}
          className={`${BTN} gradient-hero text-primary-foreground`}
        >
          <Plus className="size-4" aria-hidden /> Add a developer
        </button>
      </Card>
    </section>
  );
}
