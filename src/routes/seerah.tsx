import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, SectionTitle } from "@/components/AppShell";
import { KHULAFA, LANGUAGES, PROPHET_NAMES, SEERAH_FAMILY, SEERAH_TIMELINE } from "@/lib/islamic-data";
import { useTranslate } from "@/lib/translate";

export const Route = createFileRoute("/seerah")({
  head: () => ({
    meta: [
      { title: "Seerat un Nabi ﷺ — Life, Family, Names & Timeline | Raah e Hidayath" },
      { name: "description", content: "The complete life of Prophet Muhammad ﷺ: a year-by-year timeline, his family and companions, the rightly guided caliphs, and all his blessed names with meanings in every language." },
      { property: "og:title", content: "Seerat un Nabi ﷺ | Raah e Hidayath" },
      { property: "og:description", content: "Timeline, family tree, blessed names and age chart from the blessed life of the Prophet ﷺ." },
    ],
  }),
  component: Seerah,
});

function Seerah() {
  const maxAge = Math.max(...SEERAH_FAMILY.map((f) => f.age));

  /* Language here belongs to this page only: it flips this page between
     right-to-left and left-to-right and never touches the rest of the site
     (home, Ibadaat, the bottom navigation all stay as they are). It also
     resets to English every time the page is opened again. */
  const [pageLang, setPageLang] = useState("en");
  const active = LANGUAGES.find((l) => l.code === pageLang);
  const rtl = active?.rtl ?? false;

  const { tr, ready } = useTranslate(
    [
      "Seerat un Nabi ﷺ",
      "Born 570 CE in Makkah · Passed away 632 CE in Madinah · Age 63",
      "Forty years in Makkah before prophethood, thirteen years of da'wah in Makkah, and ten years building the community in Madinah — a mercy to all the worlds.",
      "Timeline",
      "Family & Companions — Age Chart",
      "The Rightly Guided Caliphs",
      "Blessed Names of the Prophet ﷺ",
      "Every name and title of the Messenger of Allah ﷺ with its meaning",
      "Language for this page",
      "Translating this page into your language…",
      "years",
      ...SEERAH_TIMELINE.map((t) => t.title),
      ...SEERAH_TIMELINE.map((t) => t.text),
      ...SEERAH_FAMILY.map((f) => f.role),
      ...KHULAFA.map((k) => k.role),
      ...PROPHET_NAMES.map((n) => n.en),
    ],
    pageLang,
  );

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="space-y-8">
      <SectionTitle
        title={tr("Seerat un Nabi ﷺ")}
        subtitle={tr("Born 570 CE in Makkah · Passed away 632 CE in Madinah · Age 63")}
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm shadow-soft">
          <span className="text-xs text-muted-foreground">{tr("Language for this page")}</span>
          <select
            value={pageLang}
            onChange={(e) => setPageLang(e.target.value)}
            className="bg-transparent text-sm outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>
        </label>
        {!ready && pageLang !== "en" && (
          <span className="text-xs text-muted-foreground">{tr("Translating this page into your language…")}</span>
        )}
      </div>

      <Card className="gradient-hero text-primary-foreground">
        <p className="arabic-ayah text-2xl text-accent">مُحَمَّدٌ رَسُولُ ٱللَّٰهِ</p>
        <p className="mt-3 text-sm text-primary-foreground/85">
          {tr(
            "Forty years in Makkah before prophethood, thirteen years of da'wah in Makkah, and ten years building the community in Madinah — a mercy to all the worlds.",
          )}
        </p>
      </Card>

      <section className="space-y-4">
        <h2 className="font-display text-xl">{tr("Timeline")}</h2>
        <div className="relative space-y-4 border-l border-border pl-6">
          {SEERAH_TIMELINE.map((t, i) => (
            <div key={`${t.year}-${t.title}`} style={{ animationDelay: `${i * 40}ms` }} className="animate-rise relative">
              <span className="absolute -left-[31px] top-2 size-3 rounded-full gradient-gold shadow-glow" />
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{t.year}</p>
                <p className="mt-1 font-display text-lg">{tr(t.title)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tr(t.text)}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl">{tr("Blessed Names of the Prophet ﷺ")}</h2>
        <p className="text-sm text-muted-foreground">
          {tr("Every name and title of the Messenger of Allah ﷺ with its meaning")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROPHET_NAMES.map((n) => (
            <Card key={n.tr} className="animate-rise text-center">
              <p className="arabic-ayah text-3xl text-primary">{n.ar}</p>
              <p className="mt-2 font-semibold">{n.tr}</p>
              <p className="text-xs text-muted-foreground">{tr(n.en)}</p>
              {pageLang !== "en" && <p className="mt-1 text-[11px] text-muted-foreground/70">{n.en}</p>}
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl">{tr("Family & Companions — Age Chart")}</h2>
        <Card className="space-y-4">
          {SEERAH_FAMILY.map((f) => (
            <div key={f.name}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold">{f.name}</span>
                <span className="text-xs text-muted-foreground">
                  {f.life} · {f.age} {tr("years")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{tr(f.role)}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full gradient-hero" style={{ width: `${(f.age / maxAge) * 100}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl">{tr("The Rightly Guided Caliphs")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {KHULAFA.map((k) => (
            <Card key={k.name}>
              <p className="font-semibold">{k.name}</p>
              <p className="text-xs text-muted-foreground">{tr(k.role)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {k.life} · {k.age} {tr("years")} · {k.rule}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
