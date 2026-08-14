import { createFileRoute } from "@tanstack/react-router";
import { Footprints, Mountain, Sunrise } from "lucide-react";
import { Card } from "@/components/AppShell";

import { HidayahTrail } from "@/components/JourneyBoxes";
import { JourneyHeader, Stat } from "@/components/JourneyPage";
import { useIbadahLog } from "@/lib/ibadah-log";

export const Route = createFileRoute("/trail")({
  head: () => ({
    meta: [
      { title: "The Hidayah Trail — Climb One Day at a Time | Raah e Hidayath" },
      {
        name: "description",
        content:
          "A mountain trail that lights one stepping stone for every day you complete all five prayers. Walk the path of guidance, one day at a time.",
      },
      { property: "og:title", content: "The Hidayah Trail | Raah e Hidayath" },
      { property: "og:description", content: "One stone for every day of all five prayers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrailPage,
});

function TrailPage() {
  const { trailStones, todayPrayers } = useIbadahLog();
  const lit = trailStones.filter(Boolean).length;

  return (
    <div className="space-y-6">
      <JourneyHeader
        eyebrow="Journey"
        title="The Hidayah Trail"
        subtitle="Every day of all five prayers lights one stone on the climb."
        icon={<Mountain className="size-6" />}
      />

      <HidayahTrail stones={trailStones} todayPrayers={todayPrayers} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Stones lit" value={`${lit} / 7`} icon={<Footprints className="size-4" />} />
        <Stat label="Prayers today" value={`${todayPrayers} / 5`} icon={<Sunrise className="size-4" />} />
        <Stat label="To the summit" value={`${Math.max(0, 7 - lit)} days`} icon={<Mountain className="size-4" />} />
      </div>




      <Card className="space-y-2">
        <p className="font-display text-lg">How the trail grows</p>
        <p className="text-sm text-muted-foreground">
          Log your prayers in the Ibadah Tree. Whenever a day holds all five, that day&apos;s stone lights up on the
          trail. Seven lit stones and you reach the summit — then the climb begins again.
        </p>
        <p className="arabic-ayah pt-2 text-lg">اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ</p>
        <p className="text-xs text-muted-foreground">“Guide us to the straight path.” — Al-Fātiḥah 1:6</p>
      </Card>

    </div>
  );
}
