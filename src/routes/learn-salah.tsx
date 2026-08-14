import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Droplets, GripVertical, RotateCcw, Sparkles } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";

export const Route = createFileRoute("/learn-salah")({
  head: () => ({
    meta: [
      { title: "Learn Salah & Wudu Step by Step | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Learn every step of Salah with the Arabic, transliteration and meaning, then master Wudu with a drag and drop ordering game — perfect for beginners and children.",
      },
      { property: "og:title", content: "Learn Salah & Wudu Step by Step" },
      { property: "og:description", content: "Every position of prayer explained, plus a drag & drop wudu game." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LearnSalah,
});

type Step = {
  n: number;
  title: string;
  urTitle: string;
  do: string;
  urDo: string;
  /** authentic proof — Quran ayah or hadith reference */
  daleel: string;
  ar?: string;
  tr?: string;
  en?: string;
  urEn?: string;
};

const SALAH_STEPS: Step[] = [
  {
    n: 1,
    title: "Niyyah — Intention",
    urTitle: "نیت",
    do: "Stand facing the Qiblah and intend in your heart which prayer you are praying. The intention is in the heart, not spoken aloud.",
    urDo: "قبلہ رخ کھڑے ہوں اور دل میں نیت کریں کہ کون سی نماز پڑھ رہے ہیں۔ نیت دل کا ارادہ ہے، زبان سے کہنا ضروری نہیں۔",
    daleel: "Bukhari 1, Muslim 1907 — “Actions are but by intentions.”",
  },
  {
    n: 2,
    title: "Takbiratul Ihram",
    urTitle: "تکبیرِ تحریمہ",
    do: "Raise both hands to your ears (or shoulders), palms forward, and say the takbir. From this moment worldly speech is over.",
    urDo: "دونوں ہاتھ کانوں تک (یا کندھوں تک) اٹھائیں، ہتھیلیاں قبلہ رخ ہوں، اور تکبیر کہیں۔ اب دنیاوی بات چیت ختم۔",
    daleel: "Abu Dawud 618 — “The key to prayer is purification, its start is takbir.”",
    ar: "اللَّهُ أَكْبَر",
    tr: "Allahu Akbar",
    en: "Allah is the Greatest.",
    urEn: "اللہ سب سے بڑا ہے۔",
  },
  {
    n: 3,
    title: "Qiyam — Standing & Thana",
    urTitle: "قیام اور ثناء",
    do: "Place your right hand over the left, eyes on the place of sujood, then recite the opening praise.",
    urDo: "دایاں ہاتھ بائیں پر رکھیں، نظر سجدے کی جگہ پر رکھیں، پھر ثناء پڑھیں۔",
    daleel: "Bukhari 740; Abu Dawud 775",
    ar: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ",
    tr: "Subhanaka Allahumma wa bihamdika wa tabarakasmuka wa ta'ala jadduka wa la ilaha ghayruk",
    en: "Glory be to You O Allah, and praise. Blessed is Your name, exalted is Your majesty, and there is no god besides You.",
    urEn: "اے اللہ! تو پاک ہے اور تیری ہی تعریف ہے، تیرا نام برکت والا ہے، تیری شان بلند ہے اور تیرے سوا کوئی معبود نہیں۔",
  },
  {
    n: 4,
    title: "Surah Al-Fatihah",
    urTitle: "سورۃ الفاتحہ",
    do: "Recite Al-Fatihah in every rak'ah — the prayer is not valid without it.",
    urDo: "ہر رکعت میں سورۃ الفاتحہ پڑھیں — اس کے بغیر نماز نہیں ہوتی۔",
    daleel: "Bukhari 756, Muslim 394 — “There is no prayer for the one who does not recite Al-Fatihah.”",
    ar: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
    tr: "Alhamdulillahi rabbil 'alameen…",
    en: "All praise is for Allah, Lord of all the worlds…",
    urEn: "تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا رب ہے…",
  },
  {
    n: 5,
    title: "A short surah",
    urTitle: "کوئی چھوٹی سورت",
    do: "In the first two rak'ah of the fard, and in every rak'ah of sunnah and nafl, add any surah or three ayahs after Al-Fatihah.",
    urDo: "فرض کی پہلی دو رکعتوں میں، اور سنت و نفل کی ہر رکعت میں، فاتحہ کے بعد کوئی سورت یا تین آیات پڑھیں۔",
    daleel: "Bukhari 776, Muslim 451",
  },
  {
    n: 6,
    title: "Ruku — Bowing",
    urTitle: "رکوع",
    do: "Say Allahu Akbar, bow with a straight back, hands gripping the knees, and repeat the tasbih three times.",
    urDo: "اللہ اکبر کہہ کر رکوع میں جائیں، کمر سیدھی رکھیں، ہاتھوں سے گھٹنے پکڑیں اور تین بار تسبیح پڑھیں۔",
    daleel: "Abu Dawud 886; Bukhari 793 (hadith of the man who prayed badly)",
    ar: "سُبْحَانَ رَبِّيَ الْعَظِيم",
    tr: "Subhana Rabbiyal 'Azeem",
    en: "Glory be to my Lord, the Most Great.",
    urEn: "پاک ہے میرا رب جو عظمت والا ہے۔",
  },
  {
    n: 7,
    title: "Qawmah — Rising",
    urTitle: "قومہ",
    do: "Rise fully upright and still before going down to sujood.",
    urDo: "رکوع سے پوری طرح سیدھے کھڑے ہو جائیں اور سکون سے ٹھہریں، پھر سجدے میں جائیں۔",
    daleel: "Bukhari 789, Muslim 392",
    ar: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ · رَبَّنَا لَكَ الْحَمْد",
    tr: "Sami'Allahu liman hamidah — Rabbana lakal hamd",
    en: "Allah hears the one who praises Him — our Lord, all praise is for You.",
    urEn: "اللہ نے سن لی اس کی جس نے اس کی تعریف کی — اے ہمارے رب! تیرے ہی لیے تمام تعریف ہے۔",
  },
  {
    n: 8,
    title: "Sujood — Prostration",
    urTitle: "سجدہ",
    do: "Go down saying Allahu Akbar. Seven parts touch the ground: forehead with nose, both palms, both knees, both feet. Say the tasbih three times.",
    urDo: "اللہ اکبر کہہ کر سجدے میں جائیں۔ سات اعضاء زمین پر لگیں: پیشانی ناک سمیت، دونوں ہتھیلیاں، دونوں گھٹنے، دونوں پاؤں۔ تین بار تسبیح پڑھیں۔",
    daleel: "Bukhari 812, Muslim 490 — “I have been commanded to prostrate on seven bones.”",
    ar: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    tr: "Subhana Rabbiyal A'la",
    en: "Glory be to my Lord, the Most High.",
    urEn: "پاک ہے میرا رب جو سب سے بلند ہے۔",
  },
  {
    n: 9,
    title: "Jalsah — Sitting between the two sujood",
    urTitle: "جلسہ — دو سجدوں کے درمیان بیٹھنا",
    do: "Sit calmly on your left foot with the right foot upright, and ask forgiveness.",
    urDo: "بائیں پاؤں پر سکون سے بیٹھیں، دایاں پاؤں کھڑا رکھیں اور مغفرت مانگیں۔",
    daleel: "Abu Dawud 850; Ibn Majah 898",
    ar: "رَبِّ اغْفِرْ لِي",
    tr: "Rabbighfir li",
    en: "My Lord, forgive me.",
    urEn: "اے میرے رب! مجھے بخش دے۔",
  },
  {
    n: 10,
    title: "Second Sujood",
    urTitle: "دوسرا سجدہ",
    do: "Prostrate again saying Allahu Akbar and repeat the tasbih three times. This completes one rak'ah.",
    urDo: "دوبارہ اللہ اکبر کہہ کر سجدہ کریں اور تین بار تسبیح پڑھیں۔ اس سے ایک رکعت مکمل ہو جاتی ہے۔",
    daleel: "Bukhari 793, Muslim 397",
  },
  {
    n: 11,
    title: "Tashahhud",
    urTitle: "تشہد",
    do: "After the second rak'ah, sit and recite the tashahhud, raising the index finger at 'illa Allah'.",
    urDo: "دوسری رکعت کے بعد بیٹھ کر تشہد پڑھیں اور ’الا اللہ‘ پر شہادت کی انگلی اٹھائیں۔",
    daleel: "Bukhari 831, Muslim 402 (tashahhud of Ibn Mas'ud RA)",
    ar: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَات…",
    tr: "At-tahiyyatu lillahi was-salawatu wat-tayyibat…",
    en: "All greetings, prayers and pure words belong to Allah…",
    urEn: "تمام زبانی، بدنی اور مالی عبادتیں اللہ ہی کے لیے ہیں…",
  },
  {
    n: 12,
    title: "Durood & final dua",
    urTitle: "درود اور آخری دعا",
    do: "In the last sitting, send salawat on the Prophet ﷺ and then make dua before the salam.",
    urDo: "آخری قعدہ میں نبی ﷺ پر درود بھیجیں، پھر سلام سے پہلے دعا مانگیں۔",
    daleel: "Bukhari 3370, Muslim 406; dua before salam — Bukhari 832",
    ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّد",
    tr: "Allahumma salli 'ala Muhammadin wa 'ala aali Muhammad",
    en: "O Allah, send blessings upon Muhammad and the family of Muhammad.",
    urEn: "اے اللہ! محمد ﷺ پر اور آلِ محمد پر رحمت نازل فرما۔",
  },
  {
    n: 13,
    title: "Salam — Ending the prayer",
    urTitle: "سلام — نماز کا اختتام",
    do: "Turn your face to the right, then to the left, giving salam each time.",
    urDo: "پہلے دائیں طرف، پھر بائیں طرف چہرہ پھیر کر سلام پھیریں۔",
    daleel: "Muslim 582; Abu Dawud 996",
    ar: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّه",
    tr: "As-salamu 'alaykum wa rahmatullah",
    en: "Peace and mercy of Allah be upon you.",
    urEn: "تم پر سلامتی اور اللہ کی رحمت ہو۔",
  },
];

const WUDU_ORDER = [
  { id: "niyyah", label: "Make the intention & say Bismillah", urLabel: "نیت کریں اور بسم اللہ کہیں", emoji: "🤍" },
  { id: "hands", label: "Wash both hands up to the wrists — 3 times", urLabel: "دونوں ہاتھ گٹوں تک دھوئیں — تین بار", emoji: "🖐️" },
  { id: "mouth", label: "Rinse the mouth — 3 times", urLabel: "کلی کریں — تین بار", emoji: "💧" },
  { id: "nose", label: "Sniff water into the nose and blow out — 3 times", urLabel: "ناک میں پانی چڑھائیں اور جھاڑیں — تین بار", emoji: "👃" },
  { id: "face", label: "Wash the whole face — 3 times", urLabel: "پورا چہرہ دھوئیں — تین بار", emoji: "😊" },
  { id: "arms", label: "Wash arms to the elbows, right then left — 3 times", urLabel: "کہنیوں سمیت بازو دھوئیں، پہلے دایاں پھر بایاں — تین بار", emoji: "💪" },
  { id: "head", label: "Wipe the head with wet hands — once", urLabel: "گیلے ہاتھوں سے سر کا مسح کریں — ایک بار", emoji: "👦" },
  { id: "ears", label: "Wipe inside and behind the ears — once", urLabel: "کانوں کے اندر اور پیچھے مسح کریں — ایک بار", emoji: "👂" },
  { id: "feet", label: "Wash the feet to the ankles, right then left — 3 times", urLabel: "ٹخنوں سمیت پاؤں دھوئیں، پہلے دایاں پھر بایاں — تین بار", emoji: "🦶" },
  { id: "shahadah", label: "Say the shahadah and the dua after wudu", urLabel: "وضو کے بعد شہادت اور دعا پڑھیں", emoji: "🤲" },
];

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

function LearnSalah() {
  const [tab, setTab] = useState<"salah" | "wudu">("salah");
  const [openStep, setOpenStep] = useState<number>(1);
  const [order, setOrder] = useState(() => shuffle(WUDU_ORDER));
  const [dragId, setDragId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [lang, setLang] = useState<"en" | "ur">("en");
  const ur = lang === "ur";

  const correctCount = useMemo(
    () => order.filter((s, i) => s.id === WUDU_ORDER[i]!.id).length,
    [order],
  );
  const perfect = correctCount === WUDU_ORDER.length;

  const move = (from: number, to: number) => {
    if (from === to) return;
    setOrder((cur) => {
      const next = [...cur];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
    setChecked(false);
  };

  const drop = (targetId: string) => {
    if (!dragId) return;
    move(order.findIndex((o) => o.id === dragId), order.findIndex((o) => o.id === targetId));
    setDragId(null);
  };

  const salahDone = openStep >= SALAH_STEPS.length;

  return (
    <div className="space-y-6">
      <SectionTitle
        title={ur ? "نماز اور وضو سیکھیں" : "Learn Salah & Wudu"}
        subtitle={
          ur
            ? "پہلی نماز سے مکمل نماز تک — قدم بہ قدم، صحیح احادیث کے حوالوں کے ساتھ"
            : "From your very first prayer to a perfect one — step by step, with authentic references"
        }
      />

      <div className="flex gap-2">
        {(["en", "ur"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`flex-1 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
              lang === l
                ? "border-transparent gradient-hero text-primary-foreground shadow-soft"
                : "border-border bg-card text-muted-foreground hover:text-primary"
            }`}
          >
            {l === "en" ? "English" : "اردو"}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {(["salah", "wudu"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition ${
              tab === t ? "border-transparent gradient-hero text-primary-foreground shadow-soft" : "border-border bg-card text-muted-foreground hover:text-primary"
            }`}
          >
            {t === "salah"
              ? ur
                ? "🕌 نماز قدم بہ قدم"
                : "🕌 Salah step by step"
              : ur
                ? "💧 وضو کوئز"
                : "💧 Wudu Quiz — drag & drop"}
          </button>
        ))}
      </div>


      {tab === "salah" ? (
        <div className="space-y-3">
          <Card className="gradient-hero text-primary-foreground shadow-glow">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">{ur ? "پیش رفت" : "Progress"}</p>
            <p className="mt-1 font-display text-2xl">
              {openStep}
              <span className="text-primary-foreground/60"> / {SALAH_STEPS.length} {ur ? "مراحل" : "steps"}</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-foreground/15">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(openStep / SALAH_STEPS.length) * 100}%` }} />
            </div>
            {salahDone && (
              <p className="mt-3 text-sm text-accent">
                {ur ? "ماشاءاللہ — آپ نے نماز کے تمام مراحل مکمل کر لیے 🌙" : "MashaAllah — you have completed every step of the prayer 🌙"}
              </p>
            )}
          </Card>

          {SALAH_STEPS.map((s) => {
            const open = s.n === openStep;
            const passed = s.n < openStep;
            return (
              <Card key={s.n} className={`transition ${open ? "border-primary/50 shadow-soft" : ""}`}>
                <button onClick={() => setOpenStep(s.n)} className="flex w-full items-center gap-3 text-left">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${
                      passed ? "bg-primary text-primary-foreground" : open ? "gradient-hero text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {passed ? <Check className="size-4" /> : s.n}
                  </span>
                  <span className={`min-w-0 flex-1 font-semibold ${ur ? "text-right" : ""}`}>{ur ? s.urTitle : s.title}</span>
                </button>

                {open && (
                  <div className="mt-3 space-y-3 animate-rise">
                    <p className={`text-sm leading-relaxed text-muted-foreground ${ur ? "text-right" : ""}`}>
                      {ur ? s.urDo : s.do}
                    </p>
                    {s.ar && (
                      <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                        <p className="arabic-ayah text-2xl leading-loose">{s.ar}</p>
                        <p className="mt-2 text-sm italic text-muted-foreground">{s.tr}</p>
                        <p className={`mt-1 text-sm ${ur ? "text-right" : ""}`}>{ur ? s.urEn : s.en}</p>
                      </div>
                    )}
                    <p className={`text-xs text-muted-foreground ${ur ? "text-right" : ""}`}>
                      <span className="font-semibold text-primary">{ur ? "دلیل: " : "Proof: "}</span>
                      {s.daleel}
                    </p>
                    {s.n < SALAH_STEPS.length && (
                      <button
                        onClick={() => setOpenStep(s.n + 1)}
                        className="rounded-full gradient-hero px-5 py-2 text-sm font-semibold text-primary-foreground"
                      >
                        {ur ? "اگلا مرحلہ ←" : "Next step →"}
                      </button>
                    )}
                  </div>
                )}

              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="gradient-hero text-primary-foreground shadow-glow">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent">
              <Droplets className="size-4" /> {ur ? "وضو کوئز" : "Wudu Quiz"}
            </p>
            <p className="mt-1 font-display text-2xl">
              {ur ? "وضو کی ترتیب کا چیلنج" : "Put every step of wudu in order"}
            </p>
            <p className="mt-2 text-sm text-primary-foreground/85">
              {ur
                ? "کارڈز کو ترتیب دیں (یا اوپر/نیچے کے بٹن استعمال کریں) یہاں تک کہ وضو کے تمام مراحل درست ترتیب میں آ جائیں۔"
                : "Drag a card, or use the up / down buttons, until all steps are in the correct order — then check your answer."}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-foreground/15">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${(correctCount / WUDU_ORDER.length) * 100}%` }}
                />
              </div>
              <span className="shrink-0 rounded-full bg-primary-foreground/15 px-3 py-1 font-display text-sm tabular-nums text-accent">
                {correctCount} / {WUDU_ORDER.length}
              </span>
            </div>
          </Card>

          <ol className="space-y-2">
            {order.map((s, i) => {
              const right = checked && s.id === WUDU_ORDER[i]!.id;
              const wrong = checked && s.id !== WUDU_ORDER[i]!.id;
              return (
                <li
                  key={s.id}
                  draggable
                  onDragStart={() => setDragId(s.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => drop(s.id)}
                  className={`flex items-center gap-2.5 rounded-2xl border-2 bg-card px-3 py-3 shadow-soft transition sm:gap-3 ${
                    right
                      ? "border-primary bg-primary/10"
                      : wrong
                        ? "border-destructive/70 bg-destructive/10"
                        : "border-border hover:border-primary/50"
                  } ${dragId === s.id ? "scale-[0.98] opacity-60" : ""}`}
                >
                  <GripVertical className="size-5 shrink-0 cursor-grab text-primary/70" />
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl gradient-hero text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-[1.4rem] leading-[1.5] [font-family:'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',sans-serif]"
                  >
                    {s.emoji}
                  </span>
                  <span className={`min-w-0 flex-1 text-sm font-medium leading-snug ${ur ? "text-right" : ""}`}>
                    {ur ? s.urLabel : s.label}
                  </span>
                  <span className="flex shrink-0 flex-col gap-1">
                    <button
                      aria-label="Move up"
                      onClick={() => move(i, Math.max(0, i - 1))}
                      className="grid size-8 place-items-center rounded-lg border border-border bg-background text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                      ▲
                    </button>
                    <button
                      aria-label="Move down"
                      onClick={() => move(i, Math.min(order.length - 1, i + 1))}
                      className="grid size-8 place-items-center rounded-lg border border-border bg-background text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                      ▼
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setChecked(true)}
              className="rounded-full gradient-hero px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {ur ? "میرا وضو چیک کریں" : "Check my wudu"}
            </button>
            <button
              onClick={() => {
                setOrder(shuffle(WUDU_ORDER));
                setChecked(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="size-3.5" /> {ur ? "دوبارہ ملائیں" : "Shuffle again"}
            </button>
            {checked && (
              <span className={`text-sm font-semibold ${perfect ? "text-primary" : "text-muted-foreground"}`}>
                {perfect
                  ? ur
                    ? "مکمل وضو — سو فیصد درست 🌸"
                    : "Perfect wudu — 100% correct 🌸"
                  : ur
                    ? `${correctCount} / ${WUDU_ORDER.length} درست جگہ پر`
                    : `${correctCount} / ${WUDU_ORDER.length} in the right place`}
              </span>
            )}
          </div>

          {checked && perfect && (
            <Card className="animate-rise">
              <p className="flex items-center gap-2 font-display text-lg">
                <Sparkles className="size-4 text-primary" /> {ur ? "وضو کے بعد کی دعا" : "Dua after wudu"}
              </p>
              <p className="arabic-ayah mt-3 text-2xl leading-loose">
                أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ
              </p>
              <p className={`mt-2 text-sm text-muted-foreground ${ur ? "text-right" : ""}`}>
                {ur
                  ? "”جو شخص اچھی طرح وضو کرے اور پھر یہ کلمات کہے، اس کے لیے جنت کے آٹھوں دروازے کھول دیے جاتے ہیں۔“ — مسلم ۲۳۴"
                  : "“Whoever performs wudu perfectly and says this, the eight gates of Jannah are opened for him.” — Muslim 234"}
              </p>
            </Card>
          )}
        </div>
      )}

    </div>
  );
}
