import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartPulse, Sparkles } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";

export const Route = createFileRoute("/mood")({
  head: () => ({
    meta: [
      { title: "Heal Your Heart — Islamic Mood Tracker | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Tell us how your heart feels today and receive the ayah, dua and hadith that answers it — sadness, anxiety, anger, loneliness, gratitude and more.",
      },
      { property: "og:title", content: "Heal Your Heart — Islamic Mood Tracker" },
      { property: "og:description", content: "An ayah, a dua and a hadith for exactly how you feel today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MoodPage,
});

const KEY = "reh-mood-log";

type Mood = {
  id: string;
  emoji: string;
  label: string;
  line: string;
  ayah: { ar: string; en: string; ref: string };
  dua: { ar: string; tr: string; en: string };
  hadith: string;
  action: string;
  hue: string;
};

const MOODS: Mood[] = [
  {
    id: "sad",
    emoji: "😢",
    label: "Sad",
    line: "Your sadness is seen by the One who never sleeps.",
    ayah: { ar: "وَلَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا", en: "Do not grieve; indeed Allah is with us.", ref: "At-Tawbah 9:40" },
    dua: {
      ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
      tr: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
      en: "O Allah, I seek refuge in You from anxiety and sorrow.",
    },
    hadith: "“No fatigue, illness, worry or grief befalls a Muslim except that Allah erases some of his sins by it.” — Bukhari",
    action: "Say Alhamdulillah three times, then read Surah Ad-Duha slowly.",
    hue: "from-sky-500/20 to-indigo-500/10",
  },
  {
    id: "anxious",
    emoji: "😟",
    label: "Anxious",
    line: "Nothing reaches you except what He wrote for you.",
    ayah: { ar: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", en: "Truly, in the remembrance of Allah do hearts find rest.", ref: "Ar-Ra'd 13:28" },
    dua: {
      ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      tr: "Hasbunallahu wa ni'mal wakeel",
      en: "Allah is sufficient for us and He is the best Disposer of affairs.",
    },
    hadith: "“Whoever makes the Hereafter his concern, Allah places contentment in his heart.” — Tirmidhi",
    action: "Take a slow breath and repeat the dua above 7 times.",
    hue: "from-teal-500/20 to-emerald-500/10",
  },
  {
    id: "angry",
    emoji: "😠",
    label: "Angry",
    line: "The strong one is the one who controls himself when angry.",
    ayah: { ar: "وَٱلْكَٰظِمِينَ ٱلْغَيْظَ وَٱلْعَافِينَ عَنِ ٱلنَّاسِ", en: "Those who restrain anger and pardon people.", ref: "Aal-Imran 3:134" },
    dua: {
      ar: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
      tr: "A'udhu billahi minash-shaytanir-rajeem",
      en: "I seek refuge in Allah from the accursed Shaytan.",
    },
    hadith: "“If one of you becomes angry while standing, let him sit down.” — Abu Dawud",
    action: "Sit down, drink water, and delay your reply by ten minutes.",
    hue: "from-rose-500/20 to-orange-500/10",
  },
  {
    id: "lonely",
    emoji: "😔",
    label: "Lonely",
    line: "He is closer to you than your jugular vein.",
    ayah: { ar: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ ٱلْوَرِيدِ", en: "And We are closer to him than his jugular vein.", ref: "Qaf 50:16" },
    dua: {
      ar: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنْتَ خَيْرُ الْوَارِثِينَ",
      tr: "Rabbi la tadharni fardan wa anta khayrul warithin",
      en: "My Lord, do not leave me alone, and You are the best of inheritors.",
    },
    hadith: "“Allah says: I am as My servant thinks of Me, and I am with him when he remembers Me.” — Bukhari",
    action: "Send salam to one person today and make dua for them silently.",
    hue: "from-violet-500/20 to-fuchsia-500/10",
  },
  {
    id: "tired",
    emoji: "😴",
    label: "Tired",
    line: "Rest is worship too, when the intention is to return stronger.",
    ayah: { ar: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا", en: "Allah does not burden a soul beyond what it can bear.", ref: "Al-Baqarah 2:286" },
    dua: {
      ar: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      tr: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
      en: "O Allah, help me to remember You, thank You and worship You well.",
    },
    hadith: "“Take advantage of your health before your illness.” — Al-Hakim",
    action: "Pray two rak'ah slowly — quality over quantity today.",
    hue: "from-amber-500/20 to-yellow-500/10",
  },
  {
    id: "grateful",
    emoji: "🙏",
    label: "Grateful",
    line: "Gratitude is the door that opens more.",
    ayah: { ar: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ", en: "If you are grateful, I will surely increase you.", ref: "Ibrahim 14:7" },
    dua: {
      ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      tr: "Alhamdulillahi rabbil 'alameen",
      en: "All praise is for Allah, Lord of all the worlds.",
    },
    hadith: "“He who does not thank people has not thanked Allah.” — Tirmidhi",
    action: "Write down three blessings, then give a small sadaqah.",
    hue: "from-emerald-500/20 to-lime-500/10",
  },
  {
    id: "hopeless",
    emoji: "💔",
    label: "Hopeless",
    line: "Despair is never the end of the story.",
    ayah: { ar: "لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ", en: "Do not despair of the mercy of Allah.", ref: "Az-Zumar 39:53" },
    dua: {
      ar: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
      tr: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
      en: "There is no god but You, glory be to You. Indeed I was among the wrongdoers.",
    },
    hadith: "“Allah is more merciful to His servant than a mother to her child.” — Bukhari",
    action: "Make wudu, raise your hands, and speak to Allah in your own words.",
    hue: "from-slate-500/20 to-cyan-500/10",
  },
  {
    id: "happy",
    emoji: "😊",
    label: "Happy",
    line: "Seal your joy with dhikr so it stays.",
    ayah: { ar: "قُلْ بِفَضْلِ ٱللَّهِ وَبِرَحْمَتِهِۦ فَبِذَٰلِكَ فَلْيَفْرَحُوا۟", en: "Say: in the bounty of Allah and His mercy — in that let them rejoice.", ref: "Yunus 10:58" },
    dua: {
      ar: "اللَّهُمَّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ",
      tr: "Allahumma lakal hamdu kama yanbaghi li jalali wajhik",
      en: "O Allah, all praise is Yours as befits the majesty of Your Face.",
    },
    hadith: "“Your smile for your brother is charity.” — Tirmidhi",
    action: "Share your happiness — make someone else smile today.",
    hue: "from-pink-500/20 to-amber-500/10",
  },
];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function MoodPage() {
  const [picked, setPicked] = useState<Mood | null>(null);
  const [log, setLog] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLog(JSON.parse(raw) as Record<string, string>);
    } catch {
      /* ignore */
    }
  }, []);

  const choose = (m: Mood) => {
    setPicked(m);
    const next = { ...log, [iso(new Date())]: m.id };
    setLog(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = iso(d);
    return { key, label: d.toLocaleDateString(undefined, { weekday: "narrow" }), mood: MOODS.find((m) => m.id === log[key]) };
  });

  return (
    <div className="space-y-6">
      <SectionTitle title="Heal Your Heart" subtitle="How does your heart feel right now? Islam has an answer for it." />

      <Card className="relative overflow-hidden gradient-hero text-primary-foreground shadow-glow">
        <div className="absolute -right-12 -top-12 size-44 rounded-full bg-accent/25 blur-3xl animate-float" aria-hidden />
        <p className="relative flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent">
          <HeartPulse className="size-4" /> Mood check-in
        </p>
        <p className="relative mt-2 font-display text-2xl">Choose the feeling closest to your heart</p>
        <div className="relative mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => choose(m)}
              aria-pressed={picked?.id === m.id}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition hover:-translate-y-0.5 ${
                picked?.id === m.id
                  ? "border-accent bg-accent/20 shadow-soft"
                  : "border-primary-foreground/15 bg-primary-foreground/5 hover:bg-primary-foreground/10"
              }`}
            >
              <span
                aria-hidden
                className="block text-[1.75rem] leading-[1.5] [font-family:'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',sans-serif]"
              >
                {m.emoji}
              </span>
              <span className="block w-full text-[11px] font-medium leading-tight">{m.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {picked && (
        <div className="space-y-4 animate-rise">
          <Card className={`bg-gradient-to-br ${picked.hue}`}>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">{picked.label}</p>
            <p className="mt-1 font-display text-xl">{picked.line}</p>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Ayah for you</p>
            <p className="arabic-ayah mt-3 text-2xl leading-loose">{picked.ayah.ar}</p>
            <p className="mt-2 text-sm">{picked.ayah.en}</p>
            <p className="mt-1 text-xs text-muted-foreground">{picked.ayah.ref}</p>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Dua to say now</p>
            <p className="arabic-ayah mt-3 text-2xl leading-loose">{picked.dua.ar}</p>
            <p className="mt-2 text-sm italic text-muted-foreground">{picked.dua.tr}</p>
            <p className="mt-1 text-sm">{picked.dua.en}</p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <p className="text-xs uppercase tracking-[0.25em] text-primary">Hadith</p>
              <p className="mt-2 text-sm leading-relaxed">{picked.hadith}</p>
            </Card>
            <Card>
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
                <Sparkles className="size-3.5" /> One small step
              </p>
              <p className="mt-2 text-sm leading-relaxed">{picked.action}</p>
              <Link to="/duas" className="mt-3 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline">
                Open more duas →
              </Link>
            </Card>
          </div>
        </div>
      )}

      <section>
        <SectionTitle title="Your last 7 days" subtitle="Stored privately on this device only" />
        <Card className="overflow-hidden px-3 sm:px-4">
          <div className="flex w-full flex-nowrap items-start justify-between gap-1 sm:gap-2">
            {week.map((d) => (
              <div key={d.key} className="flex min-w-0 flex-1 shrink flex-col items-center gap-1">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/50 text-[1.05rem] leading-none sm:size-11 sm:text-[1.3rem] [font-family:'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',sans-serif]">
                  {d.mood?.emoji ?? "·"}
                </div>
                <span className="w-full truncate text-center text-[9px] text-muted-foreground sm:text-[10px]">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </section>
    </div>
  );
}
