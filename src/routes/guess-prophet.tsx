import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Sparkles, Timer, Trophy, X } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { GuessProphetLogo } from "@/components/AiLogo";


export const Route = createFileRoute("/guess-prophet")({
  head: () => ({
    meta: [
      { title: "Guess the Prophet — Islamic Riddle Game | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Read three clues and guess which Prophet of Allah it is. A beautiful riddle game about Adam, Nuh, Ibrahim, Musa, Isa, Yusuf, Yunus and Muhammad ﷺ.",
      },
      { property: "og:title", content: "Guess the Prophet — Islamic Riddle Game" },
      { property: "og:description", content: "Three clues, four names — how many Prophets can you name?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuessProphet,
});

type Riddle = {
  answer: string;
  urAnswer: string;
  arabic: string;
  clues: [string, string, string];
  urClues: [string, string, string];
  options: string[];
  fact: string;
  urFact: string;
};

const RIDDLES: Riddle[] = [
  {
    answer: "Nuh",
    urAnswer: "نوح علیہ السلام",
    arabic: "نُوحٌ عَلَيْهِ السَّلَام",
    clues: ["I called my people for 950 years.", "I built something huge on dry land.", "Every animal came to me in pairs."],
    urClues: [
      "میں نے اپنی قوم کو ساڑھے نو سو سال تک دعوت دی۔",
      "میں نے خشک زمین پر ایک بہت بڑی چیز بنائی۔",
      "ہر جانور میرے پاس جوڑے جوڑے آیا۔",
    ],
    options: ["Hud", "Nuh", "Salih", "Idris"],
    fact: "Prophet Nuh AS preached for 950 years, yet only a few believed with him.",
    urFact: "نوح علیہ السلام نے ساڑھے نو سو سال تبلیغ کی، پھر بھی صرف چند لوگ ایمان لائے۔",
  },
  {
    answer: "Ibrahim",
    urAnswer: "ابراہیم علیہ السلام",
    arabic: "إِبْرَاهِيمُ عَلَيْهِ السَّلَام",
    clues: ["The fire became cool and safe for me.", "I broke the idols of my people.", "I raised the walls of the Ka'bah with my son."],
    urClues: [
      "آگ میرے لیے ٹھنڈی اور سلامتی والی بن گئی۔",
      "میں نے اپنی قوم کے بتوں کو توڑ دیا۔",
      "میں نے اپنے بیٹے کے ساتھ کعبہ کی دیواریں بلند کیں۔",
    ],
    options: ["Ibrahim", "Lut", "Ismail", "Yaqub"],
    fact: "Allah called him Khalilullah — the intimate friend of Allah.",
    urFact: "اللہ نے انہیں خلیل اللہ یعنی اللہ کا گہرا دوست کہا۔",
  },
  {
    answer: "Yusuf",
    urAnswer: "یوسف علیہ السلام",
    arabic: "يُوسُفُ عَلَيْهِ السَّلَام",
    clues: ["My brothers threw me into a well.", "I explained the dream of the king.", "My father wept until his sight went."],
    urClues: [
      "میرے بھائیوں نے مجھے کنویں میں ڈال دیا۔",
      "میں نے بادشاہ کے خواب کی تعبیر بتائی۔",
      "میرے والد اتنا روئے کہ ان کی بینائی چلی گئی۔",
    ],
    options: ["Yusuf", "Yaqub", "Dawud", "Sulaiman"],
    fact: "His story is called Ahsan al-Qasas — the most beautiful of stories.",
    urFact: "ان کے قصے کو احسن القصص یعنی سب سے بہترین قصہ کہا گیا ہے۔",
  },
  {
    answer: "Musa",
    urAnswer: "موسیٰ علیہ السلام",
    arabic: "مُوسَىٰ عَلَيْهِ السَّلَام",
    clues: ["I was placed in a basket on a river.", "My staff became a serpent.", "The sea split into two for my people."],
    urClues: [
      "مجھے صندوق میں رکھ کر دریا میں ڈالا گیا۔",
      "میری لاٹھی اژدہا بن گئی۔",
      "میری قوم کے لیے سمندر دو حصوں میں پھٹ گیا۔",
    ],
    options: ["Harun", "Musa", "Yusha", "Shu'ayb"],
    fact: "Allah spoke to him directly, so he is called Kalimullah.",
    urFact: "اللہ نے ان سے براہِ راست کلام فرمایا، اسی لیے انہیں کلیم اللہ کہا جاتا ہے۔",
  },
  {
    answer: "Yunus",
    urAnswer: "یونس علیہ السلام",
    arabic: "يُونُسُ عَلَيْهِ السَّلَام",
    clues: ["I left my people in anger.", "I was swallowed in the darkness of the sea.", "My dua is repeated by millions in distress."],
    urClues: [
      "میں اپنی قوم کو ناراض ہو کر چھوڑ آیا۔",
      "مجھے سمندر کی تاریکیوں میں نگل لیا گیا۔",
      "پریشانی میں لاکھوں لوگ آج بھی میری دعا پڑھتے ہیں۔",
    ],
    options: ["Ilyas", "Yunus", "Alyasa", "Zakariya"],
    fact: "His dua: La ilaha illa anta subhanaka inni kuntu minaz-zalimin.",
    urFact: "ان کی دعا: لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ۔",
  },
  {
    answer: "Sulaiman",
    urAnswer: "سلیمان علیہ السلام",
    arabic: "سُلَيْمَانُ عَلَيْهِ السَّلَام",
    clues: ["I understood the speech of birds and ants.", "The wind carried my throne.", "A hoopoe brought me news of a queen."],
    urClues: [
      "میں پرندوں اور چیونٹیوں کی بات سمجھتا تھا۔",
      "ہوا میرے تخت کو اٹھا کر لے جاتی تھی۔",
      "ہدہد میرے پاس ایک ملکہ کی خبر لایا۔",
    ],
    options: ["Dawud", "Sulaiman", "Ayyub", "Luqman"],
    fact: "Allah gave him a kingdom no one after him would have.",
    urFact: "اللہ نے انہیں ایسی بادشاہت دی جو ان کے بعد کسی کو نہ ملی۔",
  },
  {
    answer: "Isa",
    urAnswer: "عیسیٰ علیہ السلام",
    arabic: "عِيسَىٰ عَلَيْهِ السَّلَام",
    clues: ["I spoke while still a baby in the cradle.", "I healed the blind by Allah's permission.", "I was raised up, and I will return."],
    urClues: [
      "میں نے گہوارے میں بچپن ہی میں کلام کیا۔",
      "میں نے اللہ کے حکم سے اندھوں کو شفا دی۔",
      "مجھے آسمان کی طرف اٹھا لیا گیا اور میں واپس آؤں گا۔",
    ],
    options: ["Yahya", "Isa", "Zakariya", "Idris"],
    fact: "He was born miraculously to Maryam AS without a father.",
    urFact: "وہ مریم علیہا السلام سے بغیر باپ کے معجزانہ طور پر پیدا ہوئے۔",
  },
  {
    answer: "Ayyub",
    urAnswer: "ایوب علیہ السلام",
    arabic: "أَيُّوبُ عَلَيْهِ السَّلَام",
    clues: ["I lost my wealth, my children and my health.", "I never complained to anyone but Allah.", "A spring of water healed me."],
    urClues: [
      "میں نے اپنا مال، اولاد اور صحت سب کھو دی۔",
      "میں نے اللہ کے سوا کسی سے شکایت نہ کی۔",
      "ایک چشمے کے پانی سے مجھے شفا ملی۔",
    ],
    options: ["Ayyub", "Yaqub", "Harun", "Nuh"],
    fact: "He is the timeless example of sabr — beautiful patience.",
    urFact: "وہ صبرِ جمیل کی ہمیشہ رہنے والی مثال ہیں۔",
  },
  {
    answer: "Adam",
    urAnswer: "آدم علیہ السلام",
    arabic: "آدَمُ عَلَيْهِ السَّلَام",
    clues: ["The angels prostrated to me.", "I was taught the names of all things.", "I am the father of all humanity."],
    urClues: [
      "فرشتوں نے مجھے سجدہ کیا۔",
      "مجھے تمام چیزوں کے نام سکھائے گئے۔",
      "میں تمام انسانوں کا باپ ہوں۔",
    ],
    options: ["Idris", "Shith", "Adam", "Nuh"],
    fact: "He was the first human and the first Prophet.",
    urFact: "وہ پہلے انسان اور پہلے نبی تھے۔",
  },
  {
    answer: "Muhammad ﷺ",
    urAnswer: "محمد ﷺ",
    arabic: "مُحَمَّدٌ ﷺ",
    clues: ["I was called Al-Amin before prophethood.", "I journeyed by night to Jerusalem and the heavens.", "I am the seal of all the Prophets."],
    urClues: [
      "نبوت سے پہلے مجھے الامین کہا جاتا تھا۔",
      "میں رات کو بیت المقدس اور آسمانوں کی سیر پر لے جایا گیا۔",
      "میں تمام انبیاء کا خاتم ہوں۔",
    ],
    options: ["Muhammad ﷺ", "Ismail", "Isa", "Musa"],
    fact: "He is a mercy sent to all the worlds — Rahmatan lil-'alameen.",
    urFact: "وہ تمام جہانوں کے لیے رحمت بنا کر بھیجے گئے — رحمۃ للعالمین۔",
  },
  {
    answer: "Dawud",
    urAnswer: "داؤد علیہ السلام",
    arabic: "دَاوُدُ عَلَيْهِ السَّلَام",
    clues: ["I defeated a giant when I was still young.", "Iron became soft in my hands.", "The mountains and birds echoed my praise of Allah."],
    urClues: [
      "میں نے نوجوانی میں ایک دیو کو شکست دی۔",
      "لوہا میرے ہاتھ میں نرم ہو جاتا تھا۔",
      "پہاڑ اور پرندے میرے ساتھ تسبیح کرتے تھے۔",
    ],
    options: ["Dawud", "Sulaiman", "Talut", "Harun"],
    fact: "Allah gave him the Zabur and the most beautiful voice in recitation.",
    urFact: "اللہ نے انہیں زبور اور نہایت خوبصورت آواز عطا فرمائی۔",
  },
  {
    answer: "Zakariyya",
    urAnswer: "زکریا علیہ السلام",
    arabic: "زَكَرِيَّا عَلَيْهِ السَّلَام",
    clues: ["I prayed for a child in my old age.", "My sign was not to speak for three days.", "My son was given a name no one carried before."],
    urClues: [
      "میں نے بڑھاپے میں اولاد کی دعا کی۔",
      "میری نشانی یہ تھی کہ میں تین دن بات نہ کر سکوں۔",
      "میرے بیٹے کو ایسا نام دیا گیا جو پہلے کسی کا نہ تھا۔",
    ],
    options: ["Zakariyya", "Yahya", "Isa", "Ilyas"],
    fact: "Allah answered his quiet, private dua with Yahya AS.",
    urFact: "اللہ نے ان کی خاموش دعا کے جواب میں یحییٰ علیہ السلام عطا فرمائے۔",
  },
  {
    answer: "Yahya",
    urAnswer: "یحییٰ علیہ السلام",
    arabic: "يَحْيَى عَلَيْهِ السَّلَام",
    clues: ["I was given wisdom while still a child.", "My name was chosen by Allah Himself.", "I confirmed the word of Allah given to Maryam's son."],
    urClues: [
      "مجھے بچپن ہی میں حکمت دی گئی۔",
      "میرا نام خود اللہ نے چنا۔",
      "میں نے مریم کے بیٹے کے بارے میں اللہ کے کلمے کی تصدیق کی۔",
    ],
    options: ["Yahya", "Zakariyya", "Isa", "Idris"],
    fact: "Allah gave him purity, tenderness of heart and taqwa.",
    urFact: "اللہ نے انہیں پاکیزگی، نرمِ دل اور تقویٰ عطا کیا۔",
  },
  {
    answer: "Hud",
    urAnswer: "ہود علیہ السلام",
    arabic: "هُودٌ عَلَيْهِ السَّلَام",
    clues: ["My people were the mighty tribe of 'Ad.", "They built high pillars and boasted of their strength.", "A furious wind destroyed them for seven nights."],
    urClues: [
      "میری قوم طاقتور قومِ عاد تھی۔",
      "انہوں نے بلند ستون بنائے اور اپنی طاقت پر فخر کیا۔",
      "سات راتوں تک چلنے والی تیز آندھی نے انہیں تباہ کر دیا۔",
    ],
    options: ["Hud", "Salih", "Shu'ayb", "Lut"],
    fact: "'Ad were told: build what you will, Allah's power is greater.",
    urFact: "قومِ عاد سے کہا گیا: جو چاہو بنا لو، اللہ کی قوت سب سے بڑی ہے۔",
  },
  {
    answer: "Salih",
    urAnswer: "صالح علیہ السلام",
    arabic: "صَالِحٌ عَلَيْهِ السَّلَام",
    clues: ["A she-camel came out of the rock as a sign.", "My people carved homes into the mountains.", "They hamstrung the camel and the blast seized them."],
    urClues: [
      "نشانی کے طور پر چٹان سے ایک اونٹنی نکلی۔",
      "میری قوم پہاڑوں کو تراش کر گھر بناتی تھی۔",
      "انہوں نے اونٹنی کو مار ڈالا اور چیخ نے انہیں پکڑ لیا۔",
    ],
    options: ["Salih", "Hud", "Lut", "Shu'ayb"],
    fact: "The people of Thamud rejected a clear miracle they had asked for themselves.",
    urFact: "قومِ ثمود نے وہی معجزہ جھٹلایا جو انہوں نے خود مانگا تھا۔",
  },
  {
    answer: "Shu'ayb",
    urAnswer: "شعیب علیہ السلام",
    arabic: "شُعَيْبٌ عَلَيْهِ السَّلَام",
    clues: ["I warned my people about cheating in weights.", "Musa worked for me for eight years.", "I am called the orator of the Prophets."],
    urClues: [
      "میں نے اپنی قوم کو ناپ تول میں کمی سے روکا۔",
      "موسیٰ علیہ السلام نے آٹھ سال میرے ہاں کام کیا۔",
      "مجھے خطیب الانبیاء کہا جاتا ہے۔",
    ],
    options: ["Shu'ayb", "Musa", "Lut", "Yusuf"],
    fact: "Honesty in trade is a matter of iman, not only of business.",
    urFact: "تجارت میں دیانت ایمان کا حصہ ہے، صرف کاروبار کی بات نہیں۔",
  },
  {
    answer: "Ismail",
    urAnswer: "اسماعیل علیہ السلام",
    arabic: "إِسْمَاعِيلُ عَلَيْهِ السَّلَام",
    clues: ["Zamzam sprang from beneath my feet.", "I told my father to do what he was commanded.", "I helped raise the walls of the Ka'bah."],
    urClues: [
      "میرے قدموں کے نیچے سے زم زم پھوٹا۔",
      "میں نے اپنے والد سے کہا کہ جو حکم ہوا ہے وہ کر گزریں۔",
      "میں نے کعبہ کی دیواریں اٹھانے میں مدد کی۔",
    ],
    options: ["Ismail", "Ishaq", "Ibrahim", "Yaqub"],
    fact: "He was patient and true to his promise — as Allah describes him in the Quran.",
    urFact: "قرآن انہیں صادق الوعد اور صابر کہتا ہے۔",
  },
  {
    answer: "Lut",
    urAnswer: "لوط علیہ السلام",
    arabic: "لُوطٌ عَلَيْهِ السَّلَام",
    clues: ["I migrated with Ibrahim AS.", "My people committed a sin no nation had done before.", "Angels came to me as guests and warned of dawn."],
    urClues: [
      "میں نے ابراہیم علیہ السلام کے ساتھ ہجرت کی۔",
      "میری قوم نے وہ گناہ کیا جو پہلے کسی نے نہ کیا تھا۔",
      "فرشتے مہمان بن کر آئے اور صبح کی خبر دی۔",
    ],
    options: ["Lut", "Ibrahim", "Salih", "Hud"],
    fact: "He was saved with his believing family at the break of dawn.",
    urFact: "انہیں ان کے مومن گھر والوں سمیت صبح کے وقت بچا لیا گیا۔",
  },
  {
    answer: "Yaqub",
    urAnswer: "یعقوب علیہ السلام",
    arabic: "يَعْقُوبُ عَلَيْهِ السَّلَام",
    clues: ["I am also known as Israel.", "I wept until my eyes turned white.", "I told my sons never to despair of Allah's mercy."],
    urClues: [
      "مجھے اسرائیل بھی کہا جاتا ہے۔",
      "میں اتنا رویا کہ میری آنکھیں سفید ہو گئیں۔",
      "میں نے بیٹوں سے کہا کہ اللہ کی رحمت سے کبھی مایوس نہ ہوں۔",
    ],
    options: ["Yaqub", "Ishaq", "Yusuf", "Ibrahim"],
    fact: "Beautiful patience — sabrun jameel — is his lasting lesson.",
    urFact: "صبرِ جمیل ان کا ہمیشہ رہنے والا سبق ہے۔",
  },
  {
    answer: "Idris",
    urAnswer: "ادریس علیہ السلام",
    arabic: "إِدْرِيسُ عَلَيْهِ السَّلَام",
    clues: ["I was the first to write with the pen.", "Allah raised me to a high station.", "I came after Adam AS and before Nuh AS."],
    urClues: [
      "میں پہلا شخص تھا جس نے قلم سے لکھا۔",
      "اللہ نے مجھے بلند مقام عطا فرمایا۔",
      "میں آدم علیہ السلام کے بعد اور نوح علیہ السلام سے پہلے آیا۔",
    ],
    options: ["Idris", "Adam", "Shith", "Nuh"],
    fact: "The Quran describes him as a man of truth and a Prophet.",
    urFact: "قرآن انہیں صدیق اور نبی کہتا ہے۔",
  },
];

const ROUND_SECONDS = 20;
const TOTAL_ROUNDS = 12;

/** Urdu names for every option that can appear in the four answer buttons. */
const UR_NAMES: Record<string, string> = {
  Adam: "آدم علیہ السلام",
  Shith: "شیث علیہ السلام",
  Idris: "ادریس علیہ السلام",
  Nuh: "نوح علیہ السلام",
  Hud: "ہود علیہ السلام",
  Salih: "صالح علیہ السلام",
  Ibrahim: "ابراہیم علیہ السلام",
  Lut: "لوط علیہ السلام",
  Ismail: "اسماعیل علیہ السلام",
  Ishaq: "اسحاق علیہ السلام",
  Yaqub: "یعقوب علیہ السلام",
  Yusuf: "یوسف علیہ السلام",
  Ayyub: "ایوب علیہ السلام",
  "Shu'ayb": "شعیب علیہ السلام",
  Musa: "موسیٰ علیہ السلام",
  Harun: "ہارون علیہ السلام",
  Yusha: "یوشع علیہ السلام",
  Dawud: "داؤد علیہ السلام",
  Sulaiman: "سلیمان علیہ السلام",
  Ilyas: "الیاس علیہ السلام",
  Alyasa: "الیسع علیہ السلام",
  Yunus: "یونس علیہ السلام",
  Zakariya: "زکریا علیہ السلام",
  Zakariyya: "زکریا علیہ السلام",
  Talut: "طالوت",
  Zulkifl: "ذوالکفل علیہ السلام",
  "Al-Yasa": "الیسع علیہ السلام",
  Yahya: "یحییٰ علیہ السلام",
  Isa: "عیسیٰ علیہ السلام",
  Luqman: "لقمان علیہ السلام",
  "Muhammad ﷺ": "محمد ﷺ",
};

/** Display an option in the game's current language. */
const optionLabel = (name: string, urdu: boolean) => (urdu ? (UR_NAMES[name] ?? name) : name);

/** Fisher-Yates — a fresh order of riddles and options every game. */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function GuessProphet() {
  const [order, setOrder] = useState<number[]>(() => [...RIDDLES.keys()]);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [lang, setLang] = useState<"en" | "ur">("en");
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [started, setStarted] = useState(false);
  const ur = lang === "ur";

  /* Only shuffle in the browser so SSR and hydration agree. */
  useEffect(() => {
    setOrder(shuffle([...RIDDLES.keys()]).slice(0, TOTAL_ROUNDS));
    setStarted(true);
  }, []);

  const rounds = order.length;
  const r = RIDDLES[order[i] ?? 0]!;
  const answered = choice !== null;
  const timedOut = choice === "__timeout__";
  const correct = choice === r.answer;
  const done = i >= rounds - 1 && answered;
  const clues = ur ? r.urClues : r.clues;

  /* Keep the server order until the browser takes over, so hydration matches. */
  const options = useMemo(() => (started ? shuffle(r.options) : [...r.options]), [r, started]);

  /* countdown — one tick a second while the riddle is still open */
  useEffect(() => {
    if (answered || !started) return;
    if (left <= 0) {
      setChoice("__timeout__");
      setStreak(0);
      return;
    }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left, answered, started]);

  /* Quiz pacing — the next riddle arrives on its own, no extra tap needed. */
  useEffect(() => {
    if (!answered || done) return;
    const t = window.setTimeout(() => next(), 2600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, done]);

  const pick = (opt: string) => {
    if (answered) return;
    setChoice(opt);
    if (opt === r.answer) {
      const speedBonus = left > ROUND_SECONDS / 2 ? 1 : 0;
      const points = 3 - revealed + speedBonus;
      setScore((s) => s + Math.max(1, points));
      setStreak((s) => {
        const n = s + 1;
        setBest((b) => Math.max(b, n));
        return n;
      });
    } else setStreak(0);
  };

  const next = () => {
    setI((n) => (n + 1) % Math.max(1, rounds));
    setRevealed(0);
    setChoice(null);
    setLeft(ROUND_SECONDS);
  };

  const restart = () => {
    setOrder(shuffle([...RIDDLES.keys()]).slice(0, TOTAL_ROUNDS));
    setI(0);
    setRevealed(0);
    setChoice(null);
    setScore(0);
    setStreak(0);
    setLeft(ROUND_SECONDS);
  };

  void revealed;
  const pct = Math.max(0, left) / ROUND_SECONDS;
  const dash = 2 * Math.PI * 26;


  return (
    <div className="space-y-6" dir={ur ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <GuessProphetLogo className="size-7" />
        </span>
        <SectionTitle
          title={ur ? "نبی کو پہچانیں" : "Guess the Prophet"}
          subtitle={ur ? "تین اشارے۔ ایک نبی۔ بیس سیکنڈ۔" : "Three clues. One Prophet. Twenty seconds."}
        />
      </div>

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

      <Card className="relative overflow-hidden gradient-hero text-primary-foreground shadow-glow">
        <div className="absolute -left-12 -bottom-14 size-48 rounded-full bg-accent/25 blur-3xl animate-float" aria-hidden />
        <div className="relative flex items-center justify-between gap-3 text-xs">
          <span className="uppercase tracking-[0.3em] text-accent">
            {ur ? "سوال" : "Question"} {i + 1} / {rounds}
          </span>
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Trophy className="size-3.5 text-accent" /> {score}
            </span>
            <span className="inline-flex items-center gap-1">🔥 {streak}</span>
          </span>
        </div>

        {/* countdown ring */}
        <div className="relative mt-4 flex items-center gap-4">
          <div className="relative grid size-16 shrink-0 place-items-center">
            <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary-foreground/15" />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={dash * (1 - pct)}
                className={left <= 7 && !answered ? "stroke-destructive" : "stroke-accent"}
                style={{ transition: "stroke-dashoffset 950ms linear" }}
              />
            </svg>
            <span
              className={`relative font-display text-lg tabular-nums ${
                left <= 7 && !answered ? "animate-pulse text-destructive" : "text-accent"
              }`}
            >
              {Math.max(0, left)}
            </span>
          </div>
          <p className="inline-flex items-center gap-2 text-xs text-primary-foreground/75">
            <Timer className="size-3.5 text-accent" aria-hidden />
            {answered
              ? timedOut
                ? ur
                  ? "وقت ختم ہو گیا۔"
                  : "Time is up."
                : ur
                  ? "جواب درج ہو گیا۔"
                  : "Answer locked in."
              : ur
                ? "جلدی جواب دیں — آدھے وقت میں جواب دینے پر ایک اضافی پوائنٹ۔"
                : "Answer fast — beat the halfway mark for a bonus point."}
          </p>
        </div>


        <ul className="relative mt-5 space-y-2" dir={ur ? "rtl" : "ltr"}>
          {clues.map((c, idx) => {
            const open = true;
            return (
              <li
                key={c}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  open ? "border-accent/40 bg-primary-foreground/10" : "border-primary-foreground/10 bg-primary-foreground/5 text-primary-foreground/40"
                }`}
              >
                {open ? c : ur ? `اشارہ ${idx + 1} — بند ہے` : `Clue ${idx + 1} — locked`}
              </li>
            );
          })}
        </ul>


        {/* progress through the quiz */}
        <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-primary-foreground/15">
          <span
            className="block h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${((i + (answered ? 1 : 0)) / Math.max(1, rounds)) * 100}%` }}
          />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const isAnswer = opt === r.answer;
          const state = !answered ? "idle" : isAnswer ? "right" : opt === choice ? "wrong" : "dim";
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={answered}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left font-semibold transition ${
                state === "idle"
                  ? "border-border bg-card hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                  : state === "right"
                    ? "border-primary bg-primary/10 text-primary"
                    : state === "wrong"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border/50 bg-card/50 text-muted-foreground"
              }`}
            >
              {optionLabel(opt, ur)}
              {state === "right" && <Check className="size-4" />}
              {state === "wrong" && <X className="size-4" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <Card className={`animate-rise space-y-2 ${ur ? "text-right" : ""}`}>
          <p className="arabic-ayah text-2xl">{r.arabic}</p>
          <p className={`text-sm font-semibold ${correct ? "text-primary" : "text-destructive"}`}>
            {correct
              ? ur
                ? "ماشاءاللہ — درست جواب!"
                : "MashaAllah — correct!"
              : ur
                ? `صحیح جواب ${r.urAnswer} تھا۔`
                : `The answer was ${r.answer}.`}
          </p>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> {ur ? r.urFact : r.fact}
          </p>
          <div className="flex gap-2 pt-2">
            <button onClick={next} className="rounded-full gradient-hero px-5 py-2 text-sm font-semibold text-primary-foreground">
              {done ? (ur ? "دوبارہ کھیلیں" : "Play again") : ur ? "اگلی پہیلی" : "Next riddle"}
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="size-3.5" /> {ur ? "اسکور ری سیٹ کریں" : "Reset score"}
            </button>
          </div>
        </Card>
      )}

      <Card className="text-center text-xs text-muted-foreground">
        {ur ? `اس نشست کی بہترین لڑی: ${best} 🔥` : `Best streak this session: ${best} 🔥`}
      </Card>
    </div>
  );
}
