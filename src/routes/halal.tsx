import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, Search, ShieldQuestion } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { HALAL_CATEGORIES, HALAL_ITEMS, RULING_LABEL, type Ruling } from "@/lib/halal-data";
import { useSettings } from "@/lib/settings";
import { useTranslate } from "@/lib/translate";
import { LANGUAGES } from "@/lib/islamic-data";

export const Route = createFileRoute("/halal")({
  head: () => ({
    meta: [
      { title: "Halal or Haram Checker — Food, E-Numbers & Daily Life | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Search whether food, E-number additives, drinks, medicine, money matters and everyday things are halal, haram or doubtful, with the reason and the evidence.",
      },
      { property: "og:title", content: "Halal or Haram Checker | Raah e Hidayath" },
      { property: "og:description", content: "Know if it is halal, haram or doubtful — with the evidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Halal,
});

const RULING_STYLE: Record<Ruling, string> = {
  halal: "bg-primary/15 text-primary",
  haram: "bg-destructive/15 text-destructive",
  mushbooh: "bg-accent/20 text-accent-foreground",
};

const RULING_ICON: Record<Ruling, typeof CheckCircle2> = {
  halal: CheckCircle2,
  haram: AlertTriangle,
  mushbooh: ShieldQuestion,
};

const PILL =
  "inline-flex min-h-9 items-center rounded-full border border-border px-3 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-primary";

const RULING_LABEL_UR: Record<Ruling, string> = {
  halal: "حلال",
  haram: "حرام",
  mushbooh: "مشتبہ",
};

/** One result card with its own EN / اردو language switch. */
function HalalCard({
  item,
  tr,
  sectionLang,
}: {
  item: (typeof HALAL_ITEMS)[number];
  tr: (s: string) => string;
  sectionLang: string;
}) {
  const [urdu, setUrdu] = useState(sectionLang === "ur");
  useEffect(() => setUrdu(sectionLang === "ur"), [sectionLang]);
  const Icon = RULING_ICON[item.ruling];
  const hasUr = Boolean(item.ur || item.urWhy);
  const showUr = urdu && hasUr;
  return (
    <Card className="flex h-full flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <h2
          dir={showUr && item.ur ? "rtl" : "ltr"}
          className={`font-display text-base leading-snug ${showUr && item.ur ? "urdu-text text-right" : ""}`}
        >
          {showUr && item.ur ? item.ur : tr(item.name)}
        </h2>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${RULING_STYLE[item.ruling]}`}
        >
          <Icon className="size-3.5" aria-hidden />
          {showUr ? RULING_LABEL_UR[item.ruling] : tr(RULING_LABEL[item.ruling])}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{tr(item.category)}</p>
        <div className="flex overflow-hidden rounded-full border border-border text-[11px] font-medium" role="group" aria-label="Card language">
          <button
            onClick={() => setUrdu(false)}
            aria-pressed={!urdu}
            className={`px-2 py-0.5 transition ${!urdu ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            EN
          </button>
          <button
            onClick={() => setUrdu(true)}
            aria-pressed={urdu}
            className={`urdu-text px-2 py-0.5 transition ${urdu ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            اردو
          </button>
        </div>
      </div>
      {showUr && item.urWhy ? (
        <p dir="rtl" className="urdu-text text-right text-sm leading-loose">
          {item.urWhy}
        </p>
      ) : (
        <p dir="ltr" className="text-sm">
          {tr(item.why)}
        </p>
      )}
      {urdu && !hasUr && (
        <p className="text-[11px] text-muted-foreground">{tr("Urdu translation is not available for this item yet — showing English.")}</p>
      )}
      {item.aka && (
        <p className="text-xs text-muted-foreground">{tr("Also on labels as")}: {item.aka.join(", ")}</p>
      )}
      {item.evidence && <p className="mt-auto text-xs italic text-primary">{item.evidence}</p>}
    </Card>
  );
}

function Halal() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [ruling, setRuling] = useState<string>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HALAL_ITEMS.filter(
      (i) =>
        (category === "All" || i.category === category) &&
        (ruling === "All" || i.ruling === ruling) &&
        (!q ||
          i.name.toLowerCase().includes(q) ||
          i.why.toLowerCase().includes(q) ||
          (i.ur ?? "").includes(query.trim()) ||
          (i.aka ?? []).some((a) => a.toLowerCase().includes(q))),
    );
  }, [query, category, ruling]);

  /* Section-only language. Changing it never touches the app-wide language,
     so the navigation and the rest of the app stay exactly as they were. */
  const { settings } = useSettings();
  const [secLang, setSecLang] = useState<string>(settings.lang);
  const secRtl = Boolean(LANGUAGES.find((l) => l.code === secLang)?.rtl);
  const { tr, ready } = useTranslate([
    "Halal or Haram",
    "Food, additives, medicine, money and daily life — with the reason and the evidence",
    "Language",
    "Translating the rulings into your language…",
    "Search for a product or ingredient",
    "e.g. gelatine, E471, Oreo, burger, chocolate",
    "All rulings",
    "All categories",
    "result",
    "results",
    "Also on labels as",
    "Urdu translation is not available for this item yet — showing English.",
    'Rulings follow the majority position of the four Sunni schools. Where the schools differ this is stated in the card. "Doubtful" means the ruling depends on the source of the ingredient — check the certification or ask your local scholar before deciding.',
    ...Object.values(RULING_LABEL),
    ...HALAL_CATEGORIES,
    ...HALAL_ITEMS.map((i) => i.name),
    ...HALAL_ITEMS.map((i) => i.why),
  ], secLang);

  const counts = useMemo(
    () => ({
      halal: HALAL_ITEMS.filter((i) => i.ruling === "halal").length,
      mushbooh: HALAL_ITEMS.filter((i) => i.ruling === "mushbooh").length,
      haram: HALAL_ITEMS.filter((i) => i.ruling === "haram").length,
    }),
    [],
  );

  return (
    <div
      dir={secRtl ? "rtl" : "ltr"}
      className={`space-y-6 transition-all duration-300 ease-out ${secRtl ? "text-right urdu-text" : "text-left"}`}
    >
      <SectionTitle
        title={tr("Halal or Haram")}
        subtitle={tr("Food, additives, medicine, money and daily life — with the reason and the evidence")}
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm shadow-soft">
          <span className="text-xs text-muted-foreground">{tr("Language")}</span>
          <select
            value={secLang}
            onChange={(e) => setSecLang(e.target.value)}
            className="bg-transparent text-sm outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>
        </label>
        {!ready && secLang !== "en" && (
          <span className="text-xs text-muted-foreground">{tr("Translating the rulings into your language…")}</span>

        )}
      </div>

      <ul className="grid grid-cols-3 gap-3">
        {(["halal", "mushbooh", "haram"] as Ruling[]).map((r) => (
          <li key={r}>
            <Card className="text-center">
              <p className="font-display text-2xl">{counts[r]}</p>
              <p className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${RULING_STYLE[r]}`}>
                {tr(RULING_LABEL[r])}
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="space-y-3">
        <label htmlFor="halal-search" className="sr-only">
          {tr("Search for a product or ingredient")}
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            id="halal-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("e.g. gelatine, E471, Oreo, burger, chocolate")}
            className="min-h-11 w-full bg-transparent text-sm outline-none"
          />
        </div>

        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filter by ruling</legend>
          {["All", "halal", "mushbooh", "haram"].map((r) => (
            <button
              key={r}
              onClick={() => setRuling(r)}
              aria-pressed={ruling === r}
              className={`${PILL} ${ruling === r ? "gradient-hero border-transparent text-primary-foreground" : "hover:text-primary"}`}
            >
              {r === "All" ? tr("All rulings") : tr(RULING_LABEL[r as Ruling])}
            </button>
          ))}
        </fieldset>

        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filter by category</legend>
          {["All", ...HALAL_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`${PILL} ${category === c ? "bg-primary/10 text-primary" : "hover:text-primary"}`}
            >
              {c === "All" ? tr("All categories") : tr(c)}
            </button>
          ))}
        </fieldset>
      </Card>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? tr("result") : tr("results")}.
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {results.map((item) => (
          <li key={item.id}>
            <HalalCard item={item} tr={tr} sectionLang={secLang} />
          </li>
        ))}
      </ul>

      <Card className="flex items-start gap-3 text-sm text-muted-foreground">
        <HelpCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>
          {tr(
            'Rulings follow the majority position of the four Sunni schools. Where the schools differ this is stated in the card. "Doubtful" means the ruling depends on the source of the ingredient — check the certification or ask your local scholar before deciding.',
          )}
        </p>
      </Card>
    </div>
  );
}
