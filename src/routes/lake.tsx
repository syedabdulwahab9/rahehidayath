import { createFileRoute } from "@tanstack/react-router";
import { Droplets, HandHeart, Sparkles } from "lucide-react";
import { Card } from "@/components/AppShell";
import { GoodDeedPanel } from "@/components/GoodDeedPanel";
import { SadaqahLake } from "@/components/JourneyBoxes";
import { JourneyHeader, Stat } from "@/components/JourneyPage";
import { useIbadahLog } from "@/lib/ibadah-log";

export const Route = createFileRoute("/lake")({
  head: () => ({
    meta: [
      { title: "The Sadaqah Lake — Every Drop of Charity Counts | Raah e Hidayath" },
      {
        name: "description",
        content:
          "A quiet lake that fills with a drop for every dhikr and every act of charity you log. Watch your kindness rise.",
      },
      { property: "og:title", content: "The Sadaqah Lake | Raah e Hidayath" },
      { property: "og:description", content: "A drop for every dhikr and every kindness." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LakePage,
});

const GOAL = 40;

function LakePage() {
  const { deedDrops, done } = useIbadahLog();
  const pct = Math.round(Math.min(1, deedDrops / GOAL) * 100);

  return (
    <div className="space-y-6">
      <JourneyHeader
        eyebrow="Journey"
        title="The Sadaqah Lake"
        subtitle="Every dhikr and every kindness adds one drop. Small deeds, done often, fill it."
        icon={<Droplets className="size-6" />}
      />

      <SadaqahLake deeds={deedDrops} goal={GOAL} />

      <GoodDeedPanel />


      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Drops collected" value={`${deedDrops}`} icon={<Droplets className="size-4" />} />
        <Stat label="Lake level" value={`${pct}%`} icon={<Sparkles className="size-4" />} />
        <Stat
          label="Today"
          value={`${["dhikr", "sadaqah"].filter((h) => done.includes(h)).length} / 2`}
          icon={<HandHeart className="size-4" />}
        />
      </div>

      <Card className="space-y-2">
        <p className="font-display text-lg">How the lake fills</p>
        <p className="text-sm text-muted-foreground">
          Each day you tap <strong>Dhikr</strong> or <strong>Sadaqah</strong> in the Ibadah Tree, a drop falls into
          the lake. Nothing is ever lost — the water only rises.
        </p>
        <p className="arabic-ayah pt-2 text-lg">وَمَا تُنفِقُوا مِنْ خَيْرٍ يُوَفَّ إِلَيْكُمْ</p>
        <p className="text-xs text-muted-foreground">
          “Whatever good you spend will be repaid to you in full.” — Al-Baqarah 2:272
        </p>
      </Card>

    </div>
  );
}
