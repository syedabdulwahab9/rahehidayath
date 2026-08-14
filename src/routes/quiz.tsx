import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Brain, Check, Languages, RotateCcw, Timer, Trophy, X } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { useCustomContentSnapshot } from "@/lib/content-store";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Islamic Quiz — 20 Question Game in English & Urdu | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Play a 20-question Islamic knowledge game with a timer, streaks and scoring — available in English and Urdu.",
      },
      { property: "og:title", content: "Islamic Quiz Game | Raah e Hidayath" },
      { property: "og:description", content: "Test your Islamic knowledge — a timed 20-question game." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Quiz,
});

type Q = { en: string; ur: string; options: [string, string, string, string]; optionsUr: [string, string, string, string]; answer: number };

const QUESTIONS: Q[] = [
  { en: "How many pillars of Islam are there?", ur: "اسلام کے کتنے ارکان ہیں؟", options: ["Four", "Five", "Six", "Seven"], optionsUr: ["چار", "پانچ", "چھ", "سات"], answer: 1 },
  { en: "Which was the first surah revealed?", ur: "سب سے پہلے کون سی سورت نازل ہوئی؟", options: ["Al-Fatiha", "An-Nas", "Al-Alaq", "Al-Ikhlas"], optionsUr: ["سورۃ فاتحہ", "سورۃ ناس", "سورۃ علاق", "سورۃ اخلاص"], answer: 2 },
  { en: "How many surahs are in the Qur'an?", ur: "قرآن میں کل کتنی سورتیں ہیں؟", options: ["110", "114", "120", "99"], optionsUr: ["۱۱۰", "۱۱۴", "۱۲۰", "۹۹"], answer: 1 },
  { en: "Which is the longest surah of the Qur'an?", ur: "قرآن کی سب سے لمبی سورت کون سی ہے؟", options: ["Aal-Imran", "An-Nisa", "Al-Maidah", "Al-Baqarah"], optionsUr: ["آل عمران", "النساء", "المائدہ", "البقرہ"], answer: 3 },
  { en: "Who was the first muezzin of Islam?", ur: "اسلام کے پہلے مؤذن کون تھے؟", options: ["Umar RA", "Bilal RA", "Ali RA", "Uthman RA"], optionsUr: ["حضرت عمرؓ", "حضرت بلالؓ", "حضرت علیؓ", "حضرت عثمانؓ"], answer: 1 },
  { en: "Which prophet built the Ark?", ur: "کشتی کس نبی نے بنائی؟", options: ["Musa AS", "Ibrahim AS", "Nuh AS", "Isa AS"], optionsUr: ["موسیٰؑ", "ابراہیمؑ", "نوحؑ", "عیسیٰؑ"], answer: 2 },
  { en: "Which angel brought the revelation?", ur: "وحی کون سے فرشتے لاتے تھے؟", options: ["Mikail", "Israfil", "Izrail", "Jibreel"], optionsUr: ["میکائیل", "اسرافیل", "عزرائیل", "جبرائیل"], answer: 3 },
  { en: "How many obligatory prayers are there each day?", ur: "دن میں کتنی نمازیں فرض ہیں؟", options: ["Three", "Five", "Seven", "Six"], optionsUr: ["تین", "پانچ", "سات", "چھ"], answer: 1 },
  { en: "In which month do Muslims fast?", ur: "مسلمان کس مہینے میں روزے رکھتے ہیں؟", options: ["Shawwal", "Rajab", "Ramadan", "Muharram"], optionsUr: ["شوال", "رجب", "رمضان", "محرم"], answer: 2 },
  { en: "Which night is better than a thousand months?", ur: "کون سی رات ہزار مہینوں سے بہتر ہے؟", options: ["Laylatul Qadr", "Shab e Barat", "Shab e Meraj", "First night of Hajj"], optionsUr: ["لیلۃ القدر", "شب برات", "شب معراج", "حج کی پہلی رات"], answer: 0 },
  { en: "Who was the first wife of the Prophet ﷺ?", ur: "نبی کریم ﷺ کی پہلی زوجہ کون تھیں؟", options: ["Aisha RA", "Hafsah RA", "Khadijah RA", "Zaynab RA"], optionsUr: ["حضرت عائشہؓ", "حضرت حفصہؓ", "حضرت خدیجہؓ", "حضرت زینبؓ"], answer: 2 },
  { en: "To which city did the Prophet ﷺ migrate?", ur: "نبی کریم ﷺ نے کس شہر ہجرت فرمائی؟", options: ["Taif", "Madinah", "Jerusalem", "Yemen"], optionsUr: ["طائف", "مدینہ", "بیت المقدس", "یمن"], answer: 1 },
  { en: "Which prophet was swallowed by a great fish?", ur: "کس نبی کو مچھلی نے نگل لیا تھا؟", options: ["Yusuf AS", "Yunus AS", "Ayyub AS", "Dawud AS"], optionsUr: ["یوسفؑ", "یونسؑ", "ایوبؑ", "داؤدؑ"], answer: 1 },
  { en: "What is the rate of zakat on savings?", ur: "جمع شدہ مال پر زکوٰۃ کی شرح کتنی ہے؟", options: ["1%", "5%", "10%", "2.5%"], optionsUr: ["۱٪", "۵٪", "۱۰٪", "۲.۵٪"], answer: 3 },
  { en: "What do Muslims face during salah?", ur: "نماز میں مسلمان کس طرف رخ کرتے ہیں؟", options: ["The sunrise", "Al-Aqsa", "The Ka'bah", "The moon"], optionsUr: ["طلوعِ آفتاب", "مسجد اقصیٰ", "کعبہ", "چاند"], answer: 2 },
  { en: "Hajj is performed in which month?", ur: "حج کس مہینے میں ادا کیا جاتا ہے؟", options: ["Ramadan", "Dhul Hijjah", "Safar", "Shaban"], optionsUr: ["رمضان", "ذوالحجہ", "صفر", "شعبان"], answer: 1 },
  { en: "Which prophet is called Khalilullah (Friend of Allah)?", ur: "کس نبی کو خلیل اللہ کہا جاتا ہے؟", options: ["Ibrahim AS", "Yaqub AS", "Ishaq AS", "Ismail AS"], optionsUr: ["ابراہیمؑ", "یعقوبؑ", "اسحاقؑ", "اسماعیلؑ"], answer: 0 },
  { en: "Which book was revealed to Musa AS?", ur: "موسیٰؑ پر کون سی کتاب نازل ہوئی؟", options: ["Zabur", "Injil", "Tawrat", "Qur'an"], optionsUr: ["زبور", "انجیل", "توریت", "قرآن"], answer: 2 },
  { en: "How many names of Allah (Asma ul Husna) are there?", ur: "اللہ کے کتنے نام (اسماء الحسنیٰ) ہیں؟", options: ["40", "99", "100", "66"], optionsUr: ["۴۰", "۹۹", "۱۰۰", "۶۶"], answer: 1 },
  { en: "Which wife of the Prophet ﷺ narrated the most hadith?", ur: "نبی ﷺ کی کس زوجہ سے سب سے زیادہ احادیث مروی ہیں؟", options: ["Aisha RA", "Khadijah RA", "Maimunah RA", "Juwairiyah RA"], optionsUr: ["حضرت عائشہؓ", "حضرت خدیجہؓ", "حضرت میمونہؓ", "حضرت جویریہؓ"], answer: 0 },
];

const TIME_PER_Q = 20;

function Quiz() {
  /* Built-in questions plus everything published from the admin content editor. */
  const custom = useCustomContentSnapshot().quiz;
  const pool = useMemo<Q[]>(() => [...QUESTIONS, ...custom], [custom]);
  const [lang, setLang] = useState<"en" | "ur">("en");
  const [stage, setStage] = useState<"start" | "play" | "done">("start");
  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);

  const start = () => {
    setOrder([...pool.keys()].sort(() => Math.random() - 0.5));
    setIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setPicked(null);
    setTimeLeft(TIME_PER_Q);
    setStage("play");
  };

  const qIndex = order[idx] ?? 0;
  const q = pool[qIndex] ?? pool[0]!;
  const urdu = lang === "ur";

  const answer = useCallback(
    (choice: number | null) => {
      if (picked !== null || stage !== "play") return;
      setPicked(choice ?? -1);
      if (choice === q.answer) {
        const bonus = Math.ceil(timeLeft / 4);
        setScore((s) => s + 10 + bonus + Math.min(streak, 5) * 2);
        setStreak((s) => {
          const n = s + 1;
          setBestStreak((b) => Math.max(b, n));
          return n;
        });
      } else {
        setStreak(0);
      }
      window.setTimeout(() => {
        if (idx + 1 >= pool.length) {
          setStage("done");
        } else {
          setIdx((i) => i + 1);
          setPicked(null);
          setTimeLeft(TIME_PER_Q);
        }
      }, 1100);
    },
    [picked, stage, q.answer, timeLeft, streak, idx],
  );

  useEffect(() => {
    if (stage !== "play" || picked !== null) return;
    if (timeLeft <= 0) {
      answer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, picked, timeLeft, answer]);

  const grade = useMemo(() => {
    const pct = (score / (pool.length * 17)) * 100;
    if (pct >= 80) return urdu ? "ماشاء اللہ! آپ عالم ہیں" : "MashaAllah — scholar level!";
    if (pct >= 55) return urdu ? "بہت خوب! اچھا علم ہے" : "Great — solid knowledge!";
    if (pct >= 30) return urdu ? "اچھی کوشش، سیکھتے رہیں" : "Good try — keep learning!";
    return urdu ? "آغاز اچھا ہے، دوبارہ کھیلیں" : "A start — play again and grow!";
  }, [score, urdu]);

  if (stage === "start") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Islamic Quiz" subtitle="A 20-question knowledge game — beat the timer, build your streak" />
        <Card className="space-y-5 py-10 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-3xl gradient-hero shadow-glow">
            <Brain className="size-10 text-accent" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-2xl">{urdu ? "اسلامی کوئز" : "Ready to play?"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {urdu
                ? "۲۰ سوالات، ہر سوال کے لیے ۲۰ سیکنڈ۔ جلدی جواب دیں اور اسٹریک بنائیں!"
                : "20 questions, 20 seconds each. Answer fast, earn streak bonuses and beat your best score."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Languages className="size-4 text-muted-foreground" aria-hidden />
            {(["en", "ur"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`min-h-11 rounded-full border px-5 text-sm font-semibold transition ${
                  lang === l ? "border-transparent gradient-hero text-primary-foreground" : "border-border hover:text-primary"
                }`}
              >
                {l === "en" ? "English" : "اردو"}
              </button>
            ))}
          </div>
          <button
            onClick={start}
            className="mx-auto block min-h-12 rounded-full gradient-hero px-10 font-display text-lg text-primary-foreground shadow-glow transition hover:scale-105"
          >
            {urdu ? "کھیل شروع کریں" : "Start the game"}
          </button>
        </Card>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Islamic Quiz" subtitle="Game over" />
        <Card className="space-y-4 py-10 text-center animate-rise">
          <span className="mx-auto grid size-20 place-items-center rounded-full gradient-gold shadow-glow">
            <Trophy className="size-9 text-primary" aria-hidden />
          </span>
          <p className="font-display text-5xl tabular-nums">{score}</p>
          <p className="font-display text-lg">{grade}</p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>
              {urdu ? "بہترین اسٹریک" : "Best streak"}: <b className="text-foreground">{bestStreak}</b>
            </span>
            <span>
              {urdu ? "سوالات" : "Questions"}: <b className="text-foreground">{pool.length}</b>
            </span>
          </div>
          <button
            onClick={() => setStage("start")}
            className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-full gradient-hero px-8 font-semibold text-primary-foreground"
          >
            <RotateCcw className="size-4" aria-hidden /> {urdu ? "دوبارہ کھیلیں" : "Play again"}
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir={urdu ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between text-sm">
        <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
          {idx + 1} / {pool.length}
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold tabular-nums ${timeLeft <= 5 ? "bg-destructive/15 text-destructive" : "bg-secondary text-muted-foreground"}`}>
          <Timer className="size-4" aria-hidden /> {timeLeft}s
        </span>
        <span className="rounded-full bg-accent/15 px-3 py-1 font-semibold text-accent tabular-nums">{score} pts</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? "bg-destructive" : "gradient-hero"}`}
          style={{ width: `${(timeLeft / TIME_PER_Q) * 100}%` }}
        />
      </div>

      <Card className="py-8">
        <p className={`text-center font-display text-xl leading-relaxed ${urdu ? "urdu-text" : ""}`}>
          {urdu ? q.ur : q.en}
        </p>
        {streak >= 2 && picked === null && (
          <p className="mt-2 text-center text-sm font-semibold text-accent">
            {urdu ? `${streak} اسٹریک!` : `${streak}× streak!`}
          </p>
        )}
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        {(urdu ? q.optionsUr : q.options).map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = picked === i;
          let cls = "border-border bg-card hover:text-primary";
          if (picked !== null) {
            if (isAnswer) cls = "border-transparent gradient-hero text-primary-foreground";
            else if (isPicked) cls = "border-destructive bg-destructive/10 text-destructive";
            else cls = "border-border bg-card opacity-50";
          }
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={picked !== null}
              className={`flex min-h-14 items-center justify-between gap-2 rounded-2xl border px-5 text-left font-medium transition ${cls} ${urdu ? "urdu-text" : ""}`}
            >
              <span>{opt}</span>
              {picked !== null && isAnswer && <Check className="size-5 shrink-0" aria-hidden />}
              {picked !== null && isPicked && !isAnswer && <X className="size-5 shrink-0" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
