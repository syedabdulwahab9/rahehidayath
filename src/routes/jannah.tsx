import { createFileRoute } from "@tanstack/react-router";
import { Home, Sparkles, Trophy } from "lucide-react";
import { Card } from "@/components/AppShell";

import { JannahHouse } from "@/components/JourneyBoxes";
import { JourneyHeader, Stat } from "@/components/JourneyPage";
import { useIbadahLog } from "@/lib/ibadah-log";

export const Route = createFileRoute("/jannah")({
  head: () => ({
    meta: [
      { title: "The House in Jannah — Build It Deed by Deed | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Every milestone of worship places another block — foundation, pillars, walls, dome, garden and lanterns — of a house built with your good deeds.",
      },
      { property: "og:title", content: "The House in Jannah | Raah e Hidayath" },
      { property: "og:description", content: "A house built block by block from your worship." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JannahPage,
});

function JannahPage() {
  const { builtBlocks, milestones, streak } = useIbadahLog();
  const next = milestones.find((m) => !m.done);

  return (
    <div className="space-y-6">
      <JourneyHeader
        eyebrow="Journey"
        title="The House in Jannah"
        subtitle="Each milestone you reach lays another block — foundation, pillars, dome and lanterns."
        icon={<Home className="size-6" />}
      />

      <JannahHouse built={builtBlocks} milestones={milestones} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Blocks placed" value={`${builtBlocks} / ${milestones.length}`} icon={<Home className="size-4" />} />
        <Stat label="Perfect-day streak" value={`${streak}`} icon={<Sparkles className="size-4" />} />
        <Stat label="Next milestone" value={next ? next.label : "Complete"} icon={<Trophy className="size-4" />} />
      </div>



      <Card className="space-y-3">
        <p className="font-display text-lg">Milestones</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {milestones.map((m) => (
            <li
              key={m.label}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                m.done
                  ? "border-transparent gradient-hero text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span
                className={`grid size-6 place-items-center rounded-full text-[11px] ${m.done ? "bg-accent/20 text-accent" : "bg-secondary text-primary"}`}
              >
                {m.done ? "✓" : "•"}
              </span>
              {m.label}
            </li>
          ))}
        </ul>
        <p className="arabic-ayah pt-1 text-lg">مَنْ بَنَىٰ لِلَّهِ مَسْجِدًا بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ</p>
        <p className="text-xs text-muted-foreground">
          “Whoever builds a mosque for Allah, Allah will build for him a house in Paradise.” — Bukhari &amp; Muslim
        </p>
      </Card>

    </div>
  );
}
