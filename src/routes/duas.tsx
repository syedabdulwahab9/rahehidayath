import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, SectionTitle } from "@/components/AppShell";
import { DUAS, type Dua } from "@/lib/islamic-data";
import { useCustomContentSnapshot } from "@/lib/content-store";

/** One dua card with its own EN / اردو language switch. */
function DuaCard({ d }: { d: Dua }) {
  const [urdu, setUrdu] = useState(false);
  return (
    <Card className="animate-rise">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-primary">
          {d.cat} · {d.title}
        </p>
        {d.ur && (
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
        )}
      </div>
      <p className="arabic-ayah mt-3 text-right text-2xl leading-loose">{d.ar}</p>
      <p className="mt-3 text-sm italic text-muted-foreground">{d.tr}</p>
      <p dir={urdu ? "rtl" : "ltr"} className={`mt-2 text-sm ${urdu ? "urdu-text text-right" : ""}`}>
        {urdu && d.ur ? d.ur : d.en}
      </p>
    </Card>
  );
}

export const Route = createFileRoute("/duas")({
  head: () => ({
    meta: [
      { title: "Duas & Daily Azkar | Raah e Hidayath" },
      { name: "description", content: "Authentic daily duas with Arabic, transliteration, English and Urdu meanings for every occasion." },
      { property: "og:title", content: "Duas & Azkar | Raah e Hidayath" },
      { property: "og:description", content: "Masnoon duas for morning, evening, travel, food, sleep and more." },
    ],
  }),
  component: Duas,
});

function Duas() {
  const [q, setQ] = useState("");
  const custom = useCustomContentSnapshot();
  /* Duas published from the admin panel appear first, then the built-in library. */
  const all = useMemo<Dua[]>(
    () => [
      ...custom.duas.map((d) => ({ cat: d.cat, title: d.title, ar: d.ar, tr: d.tr, en: d.en, ...(d.ur ? { ur: d.ur } : {}) })),
      ...DUAS,
    ],
    [custom],
  );
  const list = all.filter(
    (d) => !q || d.title.toLowerCase().includes(q.toLowerCase()) || d.en.toLowerCase().includes(q.toLowerCase()) || d.cat.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <SectionTitle title="Duas & Azkar" subtitle="Masnoon supplications for every part of your day" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a dua…"
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-soft outline-none focus:shadow-glow"
      />
      <div className="space-y-3">
        {list.map((d, i) => (
          <DuaCard key={`${d.cat}|${d.title}|${i}`} d={d} />
        ))}
        {list.length === 0 && <Card className="text-center text-sm text-muted-foreground">No dua matched your search.</Card>}
      </div>
    </div>
  );
}