import { useEffect, useState } from "react";
import type { AsmaName } from "@/lib/quran-api";
import { reflectionFor } from "@/lib/asma-data";

export function NameSpotlight({ names }: { names: AsmaName[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (names.length === 0) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % names.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(id);
  }, [names.length]);

  const name = names[index];
  if (!name) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-card p-6 text-center shadow-soft">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">Name of the moment</p>
      <div
        className={`mt-3 transition-all duration-500 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        <p className="arabic-ayah text-5xl text-primary">{name.name}</p>
        <p className="mt-3 font-semibold">{name.transliteration}</p>
        <p className="mt-1 text-sm text-muted-foreground">{name.en.meaning}</p>
        <p className="mx-auto mt-3 max-w-md text-xs italic text-muted-foreground">
          {reflectionFor(name.number, name.en.meaning)}
        </p>
      </div>
    </div>
  );
}
