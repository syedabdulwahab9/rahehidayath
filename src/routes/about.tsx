import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  ChevronLeft,
  Code2,
  Compass,
  Crown,
  ExternalLink,
  Gem,
  Globe,
  Heart,
  Mail,
  MessageCircle,
  Rocket,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";

import { SawaaLogo } from "@/components/SawaaLogo";
import uplearnLogo from "@/assets/uplearn360-logo.jpeg";
import heartsLogo from "@/assets/hearts-of-islam-logo.jpeg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Raah e Hidayath by Sawaa Enterprise" },
      {
        name: "description",
        content:
          "Raah e Hidayath is built by Sawaa Enterprise, led by CEO Syed Abdul Wahab — with UpLearn 360°, Hearts of Islam and the team behind the platform.",
      },
      { property: "og:title", content: "About Us — Raah e Hidayath" },
      { property: "og:description", content: "The people, the craft and the intention behind Raah e Hidayath." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const TEAM: Array<{ name: string; role: string; badge: string; icon: LucideIcon }> = [
  { name: "Syed Abdul Rahman", role: "Chairman of the Board", badge: "Chairman", icon: Crown },
  { name: "Syed Basharath Ali", role: "Director", badge: "Director", icon: Compass },
  { name: "Mohd Sufyaan Sayeed", role: "Founder", badge: "Founder", icon: Rocket },
  { name: "Syed Ahmed Ali", role: "Chief Executive Officer", badge: "CEO", icon: Gem },
  { name: "Syed Atif Ammar", role: "President", badge: "President", icon: Award },
  { name: "Mohammed Waji Hyder", role: "Chief Operating Officer", badge: "COO", icon: Briefcase },
];



const COMMUNITY_LINK = "https://chat.whatsapp.com/Hkxbh6nq7shCRCaXtD5Ka3";

function About() {
  return (
    <div className="space-y-8">
      <Link to="/more" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> More
      </Link>

      <SectionTitle title="About Us" subtitle="The intention, the craft and the people behind Raah e Hidayath" />

      {/* ---------------------------------------------------------- opening */}
      <section className="relative overflow-hidden rounded-3xl gradient-hero p-6 text-primary-foreground shadow-glow animate-rise sm:p-9">
        <span aria-hidden className="absolute -right-12 -top-12 size-52 rounded-full bg-accent/20 blur-3xl animate-float" />
        <p className="relative text-[0.65rem] uppercase tracking-[0.35em] text-accent">Bismillah</p>
        <h2 className="relative mt-3 font-display text-2xl leading-snug sm:text-3xl">
          A path of guidance, built with the care a sacred trust deserves.
        </h2>
        <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/85">
          <strong className="font-semibold text-accent">Raah e Hidayath</strong> exists for one reason: to place the
          Quran, the Sunnah and the daily practice of Islam within reach of every person, in every language, on any
          device, at no cost and with no distraction. Every surah, every hadith, every dua and every prayer time on
          this platform is verified, sourced and presented with the reverence it deserves.
        </p>
        <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/85">
          This platform is designed, engineered and maintained by{" "}
          <strong className="font-semibold text-accent">Sawaa Enterprise</strong> — a company that builds digital
          products the way craftsmen build monuments: slowly, exactly, and to last.
        </p>
      </section>

      {/* ------------------------------------------------------ the collab */}
      <section className="space-y-3">
        <h3 className="font-display text-xl">The Collaboration</h3>
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/12" />
          <div className="relative grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
            <div className="collab-drift flex flex-col items-center gap-3 text-center">
              <SawaaLogo size="size-32" />
              <span>
                <span className="block font-display text-lg">Sawaa Enterprise</span>
                <span className="block text-xs text-muted-foreground">Builders of digital excellence</span>
              </span>
            </div>


            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-3xl text-accent animate-spin-slow">✕</span>
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">Collaboration</span>
            </div>

            <div className="collab-drift-late flex flex-col items-center gap-3 text-center">
              <span className="brand-pulse grid size-24 place-items-center overflow-hidden rounded-3xl border border-primary/40 bg-background p-2 shadow-soft">
                <img src="/logo.png" alt="Raah e Hidayath logo" className="size-full object-contain" />
              </span>
              <span>
                <span className="block font-display text-lg">Raah e Hidayath</span>
                <span className="block text-xs text-muted-foreground">The Path of Guidance</span>
              </span>
            </div>
          </div>
          <p className="relative mt-6 text-center text-sm leading-relaxed text-muted-foreground">
            Two companies, one mission. Sawaa Enterprise brings the engineering and the finish; Raah e Hidayath brings
            the knowledge and the service to the ummah.
          </p>

        </Card>
      </section>

      {/* --------------------------------------------------------- the CEO */}
      <section className="space-y-3">
        <h3 className="font-display text-xl">Leadership</h3>
        <Card className="owner-card relative overflow-hidden p-7 text-center sm:p-10">
          <span aria-hidden className="owner-card-frame" />
          <div className="logo-still relative mx-auto mb-6 grid w-fit place-items-center rounded-full border border-accent/30 bg-background/60 p-1.5 shadow-soft">
            <SawaaLogo size="size-24" className="relative z-10" />
          </div>
          <p className="owner-badge relative inline-flex items-center gap-2">
            <Crown className="size-3.5" /> Owner
          </p>

          <h4 className="relative mt-5 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Syed Abdul Wahab
          </h4>
          <span aria-hidden className="owner-underline" />
          <p className="relative mt-3 text-xs uppercase tracking-[0.32em] text-muted-foreground">
            Founder · Sawaa Enterprise
          </p>
          <p className="relative mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The vision behind Sawaa Enterprise and Raah e Hidayath. A builder who believes that technology in the
            service of deen must be flawless — because anything carrying the words of Allah deserves nothing less than
            the very best a person can give.
          </p>
        </Card>

      </section>

      {/* ------------------------------------------------ sawaa enterprise */}
      <section className="space-y-3">
        <h3 className="font-display text-xl">Sawaa Enterprise</h3>
        <Card className="relative overflow-hidden p-6 sm:p-9">
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/14" />
          <span aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-accent/12 blur-3xl animate-float" />
          <span aria-hidden className="pointer-events-none absolute -left-20 -bottom-20 size-56 rounded-full bg-primary/12 blur-3xl animate-float [animation-delay:1.6s]" />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
            <div className="logo-halo relative grid shrink-0 place-items-center rounded-full p-1">
              <span aria-hidden className="logo-halo-glow" />
              <span aria-hidden className="logo-halo-ring" />
              <SawaaLogo size="size-32" className="relative z-10" />
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <p className="inline-flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-accent">
                  <Sparkles className="size-3.5" /> Builders of digital excellence
                </p>
                <h4 className="name-shine mt-2 font-display text-3xl leading-tight">Sawaa Enterprise</h4>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="font-display text-lg leading-tight">Syed Abdul Wahab</span>
                <span className="inline-flex items-center gap-1 rounded-full gradient-gold px-2.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-accent-foreground shadow-soft brand-pulse">
                  <Shield className="size-3" /> Owner
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <a
                  href="mailto:sawaaenterprise1@gmail.com"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-background/70 px-4 py-2 text-sm font-medium text-foreground shadow-soft transition hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                >
                  <Mail className="size-4 text-primary" />
                  sawaaenterprise1@gmail.com
                </a>
                <a
                  href="https://sawaaenterprise.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-full gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  <Globe className="size-4" />
                  sawaaenterprise
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/25 transition group-hover:bg-primary-foreground/25">
                    <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ------------------------------------------------------ uplearn 360 */}
      <section className="space-y-3">
        <h3 className="font-display text-xl">In Partnership With</h3>
        <a
          href="https://uplearn360.online"
          target="_blank"
          rel="noreferrer"
          className="group block animate-rise"
        >
          <Card className="relative overflow-hidden p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow">
            <span aria-hidden className="surah-card-sheen" />
            <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <span className="collab-drift grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/30 bg-background shadow-soft">
                <img src={uplearnLogo} alt="UpLearn 360 logo" className="size-full object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-primary">
                  <Code2 className="size-3.5" /> Education platform for coding
                </span>
                <span className="mt-1 block font-display text-2xl">UpLearn 360°</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  Founded by <strong className="font-semibold text-foreground">Mohd Aslam Ayaaz</strong> — a
                  learning platform that takes people from their first line of code to real, working software.
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full gradient-hero px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition group-hover:brightness-110">
                uplearn360.online
                <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Card>
        </a>
      </section>

      {/* --------------------------------------------------- hearts of islam */}
      <section className="space-y-3">
        <h3 className="font-display text-xl">Hearts of Islam</h3>
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/12 via-transparent to-primary/10" />
          <span aria-hidden className="pointer-events-none absolute -right-14 -top-14 size-48 rounded-full bg-accent/15 blur-3xl animate-float" />
          <div className="relative flex flex-col items-center gap-5 text-center">
            <span className="brand-pulse grid size-28 place-items-center overflow-hidden rounded-full border-2 border-accent/45 bg-background shadow-glow">
              <img src={heartsLogo} alt="Hearts of Islam logo" className="size-full object-cover" />
            </span>
            <div>
              <p className="inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-accent">
                <Heart className="size-3.5" /> Daily Islamic content
              </p>
              <h4 className="mt-2 font-display text-3xl">Hearts of Islam</h4>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                A community built around remembrance — an ayah, a hadith, a reminder and a dua reaching your heart
                every single day. Free, gentle and always authentic.
              </p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">Founded & led by</span>
              <span className="name-shine font-display text-2xl">Syed Abdul Wahab</span>
            </div>

            <a
              href={COMMUNITY_LINK}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:brightness-105 active:scale-95"
            >
              <MessageCircle className="size-4" />
              Join the WhatsApp community
              <ExternalLink className="size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </Card>
      </section>

      {/* -------------------------------------------------------- the team */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 font-display text-xl">
            <Users className="size-5 text-primary" /> The Raah e Hidayath Team
          </h3>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Leadership</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {TEAM.map((m, i) => {
            const Icon = m.icon;
            return (
            <div key={m.name} style={{ animationDelay: `${i * 70}ms` }} className="animate-rise">
              <article className="leader-card group">
                <span aria-hidden className="leader-rule" />
                <div className="flex items-center gap-4">
                  <span className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 rounded-full gradient-gold px-2 py-[0.15rem] text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-accent-foreground shadow-soft">
                      <Icon className="size-[0.6rem]" /> {m.badge}
                    </span>
                    <span className="mt-1.5 block font-display text-[1.08rem] leading-tight tracking-tight">
                      {m.name}
                    </span>
                    <span className="mt-1 block text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-primary/85">
                      {m.role}
                    </span>
                  </span>
                  <span className="leader-index font-display tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </article>
            </div>
            );
          })}


        </div>
      </section>

      {/* ------------------------------------------------- founders collab */}
      <section className="space-y-3">
        <h3 className="font-display text-xl">A Collaboration of Founders</h3>
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/12" />
          <span aria-hidden className="pointer-events-none absolute -left-16 -bottom-16 size-52 rounded-full bg-primary/10 blur-3xl animate-float" />
          <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-accent/12 blur-3xl animate-float [animation-delay:1.2s]" />

          <div className="relative grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
            <div className="collab-drift flex items-center gap-3 sm:justify-end sm:text-right">
              <SawaaLogo size="size-16" className="shrink-0 sm:order-2" />
              <span className="min-w-0 sm:order-1">
                <span className="block truncate font-display text-base">Syed Abdul Wahab</span>
                <span className="block text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Founder · Sawaa Enterprise
                </span>
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span aria-hidden className="collab-link-line" />
              <span className="grid size-9 place-items-center rounded-full gradient-gold text-sm font-semibold text-accent-foreground shadow-soft brand-pulse">
                ✕
              </span>
              <span className="text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">Collab</span>
            </div>

            <div className="collab-drift-late flex items-center gap-3">
              <span className="logo-halo relative grid size-14 shrink-0 place-items-center rounded-full p-1">
                <span aria-hidden className="logo-halo-glow" />
                <span aria-hidden className="logo-halo-ring" />
                <img src={uplearnLogo} alt="UpLearn 360 logo" className="relative z-10 size-full rounded-full object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-base">Mohd Aslam Ayaaz</span>
                <span className="block text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Founder · UpLearn 360°
                </span>
              </span>
            </div>
          </div>

          <p className="relative mt-5 text-center text-xs leading-relaxed text-muted-foreground">
            Two founders, one intention — craft that serves the deen, and learning that opens doors.
          </p>
        </Card>
      </section>



    </div>
  );
}
