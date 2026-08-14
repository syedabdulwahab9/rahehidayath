import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, HeartPulse, Lightbulb, ShieldCheck, CalendarDays, CalendarHeart, Compass, Dices, HandCoins, Heart, HeartHandshake, Info, ListChecks, Mail, MoonStar, Music4, ScanBarcode, Search, Settings, Shield, Rose, Mountain, Droplets, Home, Star, TreeDeciduous, Users } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { GuessProphetLogo, SalahWuduLogo } from "@/components/AiLogo";

import { useSiteConfig } from "@/lib/site-config";
import { useFeatureFlags } from "@/lib/feature-flags";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "More — Qibla, Duas, Naats, Barcode Scanner & Seerah | Raah e Hidayath" },
      { name: "description", content: "Qibla direction, 99 Names of Allah, tasbeeh, duas, naats, product barcode origin scanner, prophets' families, Noorani Qaida, Hijri calendar and salah tracker." },
      { property: "og:title", content: "More Islamic Tools | Raah e Hidayath" },
      { property: "og:description", content: "Everything else in one place." },
    ],
  }),
  component: More,
});

const LINKS = [
  { to: "/naats", label: "Naats & Salawat", icon: Music4, note: "Praise of the Prophet ﷺ with meaning" },
  { to: "/scanner", label: "Barcode Scanner", icon: ScanBarcode, note: "Check if a product is Israeli (729)" },
  { to: "/halal", label: "Halal or Haram", icon: ShieldCheck, note: "Every food, animal, bird & insect" },
  { to: "/prophets", label: "Prophets & Families", icon: Users, note: "Adam AS to Muhammad ﷺ, wives & children" },
  { to: "/ramadan", label: "Ramadan & Fasting", icon: MoonStar, note: "Live sehri/iftar and fasting tracker" },
  { to: "/zakat", label: "Zakat Calculator", icon: HandCoins, note: "Gold, silver, savings — every currency" },
  { to: "/quiz", label: "Islamic Quiz", icon: Lightbulb, note: "20 questions — play and learn" },
  { to: "/wheel", label: "Good Deed Wheel", icon: Dices, note: "Spin and do a good deed today" },
  { to: "/trail", label: "The Hidayah Trail", icon: Mountain, note: "A stone lights for every full day of Salah" },
  { to: "/lake", label: "The Sadaqah Lake", icon: Droplets, note: "Fills with every dhikr and charity" },
  { to: "/jannah", label: "The House in Jannah", icon: Home, note: "Built block by block from your milestones" },
  { to: "/mood", label: "Heal Your Heart", icon: HeartPulse, note: "Islamic mood tracker — an ayah for every feeling" },
  { to: "/guess-prophet", label: "Guess the Prophet", icon: GuessProphetLogo, note: "Timed riddle game about the Prophets AS" },
  { to: "/learn-salah", label: "Learn Salah & Wudu", icon: SalahWuduLogo, note: "Step by step + drag & drop wudu" },

  { to: "/search", label: "Search", icon: Search, note: "Search the Quran by voice or text" },
  { to: "/family", label: "Family Connect", icon: HeartHandshake, note: "Grow in worship together, privately" },
  { to: "/admin", label: "Admin Panel", icon: Shield, note: "Manage the app" },
  { to: "/about", label: "About Us", icon: Info, note: "The people behind Raah e Hidayath" },
  { to: "/settings", label: "Settings", icon: Settings, note: "Language, theme, reciter, location" },
];

function More() {
  const flags = useFeatureFlags();
  const [site] = useSiteConfig();

  const visible = LINKS.filter((l) => l.to === "/admin" || l.to === "/about" || flags[l.to] !== false);

  return (
    <div className="space-y-6">
      <SectionTitle title="More" subtitle="Every remaining tool of Raah e Hidayath" />
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map(({ to, label, icon: Icon, note }, i) => (
          <Link key={to} to={to} style={{ animationDelay: `${i * 35}ms` }} className="animate-rise block min-w-0">
            <Card className="group flex w-full items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110">
                <Icon className="size-5" />
              </span>
              <span className="block min-w-0 flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">{note}</span>
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <p className="flex items-center gap-2 font-display text-lg">
          <Mail className="size-4 text-primary" /> Ask a question
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Send us your questions, corrections or suggestions and our team will reply insha'Allah.
        </p>
        <a
          href={`mailto:${site.contactEmail}?subject=Rah%20e%20Hidayath%20Question`}
          className="mt-3 inline-block rounded-full gradient-hero px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          {site.contactEmail}
        </a>
      </Card>



    </div>
  );
}