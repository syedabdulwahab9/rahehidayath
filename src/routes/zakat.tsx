import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpenText, Coins, HandHeart, RefreshCw, Scale, Sparkles, TrendingUp } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/zakat")({
  head: () => ({
    meta: [
      { title: "Zakat Calculator — Every Currency, Gold, Silver & Assets | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Calculate your zakat on cash, gold, silver, investments and business stock in any currency, with live metal prices and the correct nisab threshold.",
      },
      { property: "og:title", content: "Zakat Calculator | Raah e Hidayath" },
      { property: "og:description", content: "Accurate zakat on everything you own, in your currency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Zakat,
});

const CURRENCIES = [
  ["INR", "₹", "Indian Rupee"],
  ["PKR", "₨", "Pakistani Rupee"],
  ["USD", "$", "US Dollar"],
  ["EUR", "€", "Euro"],
  ["GBP", "£", "British Pound"],
  ["AED", "د.إ", "UAE Dirham"],
  ["SAR", "﷼", "Saudi Riyal"],
  ["QAR", "﷼", "Qatari Riyal"],
  ["KWD", "د.ك", "Kuwaiti Dinar"],
  ["BHD", "BD", "Bahraini Dinar"],
  ["OMR", "﷼", "Omani Rial"],
  ["TRY", "₺", "Turkish Lira"],
  ["MYR", "RM", "Malaysian Ringgit"],
  ["IDR", "Rp", "Indonesian Rupiah"],
  ["BDT", "৳", "Bangladeshi Taka"],
  ["EGP", "E£", "Egyptian Pound"],
  ["NGN", "₦", "Nigerian Naira"],
  ["ZAR", "R", "South African Rand"],
  ["CAD", "$", "Canadian Dollar"],
  ["AUD", "$", "Australian Dollar"],
  ["JPY", "¥", "Japanese Yen"],
  ["CNY", "¥", "Chinese Yuan"],
  ["AFN", "؋", "Afghan Afghani"],
  ["IQD", "ع.د", "Iraqi Dinar"],
  ["JOD", "JD", "Jordanian Dinar"],
  ["LBP", "ل.ل", "Lebanese Pound"],
  ["MAD", "DH", "Moroccan Dirham"],
  ["SDG", "£", "Sudanese Pound"],
  ["SYP", "£", "Syrian Pound"],
  ["YER", "﷼", "Yemeni Rial"],
  ["RUB", "₽", "Russian Ruble"],
  ["PHP", "₱", "Philippine Peso"],
  ["LKR", "Rs", "Sri Lankan Rupee"],
  ["NPR", "Rs", "Nepalese Rupee"],
] as const;

const GOLD_NISAB_G = 87.48;
const SILVER_NISAB_G = 612.36;
const OZ_TO_G = 31.1035;

const FIELDS = [
  { key: "cash", en: "Cash in hand", ur: "نقد رقم (ہاتھ میں)" },
  { key: "bank", en: "Bank balance & savings", ur: "بینک بیلنس اور بچت" },
  { key: "gold", en: "Gold you own (grams)", ur: "سونا (گرام میں)" },
  { key: "silver", en: "Silver you own (grams)", ur: "چاندی (گرام میں)" },
  { key: "invest", en: "Shares, funds & investments", ur: "شیئرز اور سرمایہ کاری" },
  { key: "business", en: "Business stock / inventory", ur: "کاروباری مال و اسٹاک" },
  { key: "owed", en: "Money people owe you", ur: "وہ رقم جو دوسروں پر واجب ہے" },
] as const;
const DEBT_FIELD = { key: "debt", en: "Minus: debts you must repay now", ur: "منفی: قرضے جو ابھی ادا کرنے ہیں" };

function Zakat() {
  const { settings } = useSettings();
  const urdu = settings.lang === "ur";

  const [currency, setCurrency] = useState("INR");
  const [values, setValues] = useState<Record<string, string>>({});
  const [goldPrice, setGoldPrice] = useState(""); /* per gram, in selected currency */
  const [silverPrice, setSilverPrice] = useState("");
  const [priceStatus, setPriceStatus] = useState("");
  const [fetching, setFetching] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");
  const [fxRate, setFxRate] = useState(0);
  const [basis, setBasis] = useState<"silver" | "gold" | "lower">("silver");

  const symbol = CURRENCIES.find(([c]) => c === currency)?.[1] ?? currency;
  const num = (s: string | undefined) => {
    const n = parseFloat(s ?? "");
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const fetchPrices = async () => {
    setFetching(true);
    setPriceStatus("");
    try {
      const [goldRes, silverRes, fxRes] = await Promise.all([
        fetch("https://api.gold-api.com/price/XAU").then((r) => r.json()) as Promise<{ price?: number }>,
        fetch("https://api.gold-api.com/price/XAG").then((r) => r.json()) as Promise<{ price?: number }>,
        currency === "USD"
          ? Promise.resolve({ rates: { USD: 1 } })
          : (fetch(`https://open.er-api.com/v6/latest/USD`).then((r) => r.json()) as Promise<{ rates?: Record<string, number> }>),
      ]);
      const rate = currency === "USD" ? 1 : (fxRes as { rates?: Record<string, number> }).rates?.[currency];
      if (!goldRes.price || !silverRes.price || !rate) throw new Error("missing");
      setFxRate(rate);
      setGoldPrice(((goldRes.price / OZ_TO_G) * rate).toFixed(2));
      setSilverPrice(((silverRes.price / OZ_TO_G) * rate).toFixed(2));
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setUpdatedAt(time);
      setPriceStatus(
        urdu
          ? `تازہ لائیو مارکیٹ ریٹس (${time}) — مقامی ریٹ مختلف ہو تو خود بدل دیں۔`
          : `Live market rates loaded at ${time} — edit them if your local rate differs.`,
      );
    } catch {
      setPriceStatus(
        urdu
          ? "لائیو قیمتیں نہیں مل سکیں — براہ کرم اپنی مقامی قیمت فی گرام خود لکھیں۔"
          : "Could not fetch live prices — please type your local price per gram.",
      );
    } finally {
      setFetching(false);
    }
  };

  /* Live gold, silver and currency rates load automatically — on first open
   * and every time the currency changes — so the nisab is always current. */
  useEffect(() => {
    setGoldPrice("");
    setSilverPrice("");
    setUpdatedAt("");
    setPriceStatus("");
    void fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const result = useMemo(() => {
    const gp = num(goldPrice);
    const sp = num(silverPrice);
    const goldValue = num(values["gold"]) * gp;
    const silverValue = num(values["silver"]) * sp;
    const money =
      num(values["cash"]) + num(values["bank"]) + num(values["invest"]) + num(values["business"]) + num(values["owed"]) + goldValue + silverValue;
    const total = Math.max(0, money - num(values["debt"]));
    const goldNisab = gp ? GOLD_NISAB_G * gp : 0;
    const silverNisab = sp ? SILVER_NISAB_G * sp : 0;
    const chosen =
      basis === "gold" ? [goldNisab] : basis === "silver" ? [silverNisab] : [goldNisab, silverNisab];
    const nisabs = chosen.filter((n) => n > 0);
    const nisab = nisabs.length ? Math.min(...nisabs) : 0;
    const eligible = nisab > 0 && total >= nisab;
    return {
      total,
      nisab,
      eligible,
      goldValue,
      silverValue,
      goldNisab,
      silverNisab,
      progress: nisab > 0 ? Math.min(100, (total / nisab) * 100) : 0,
      zakat: eligible ? total * 0.025 : 0,
    };
  }, [values, goldPrice, silverPrice, basis]);

  const fmt = (n: number) =>
    `${symbol} ${n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <SectionTitle
        title={urdu ? "زکوٰۃ کیلکولیٹر" : "Zakat Calculator"}
        subtitle={
          urdu
            ? "نقدی، سونا، چاندی، سرمایہ کاری اور کاروبار — ہر کرنسی میں صحیح حساب"
            : "Cash, gold, silver, investments and business — accurate in every currency"
        }
      />

      <Card className="relative overflow-hidden">
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-primary/20 blur-3xl animate-float" />
        <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 size-52 rounded-full bg-accent/20 blur-3xl animate-float [animation-delay:1.2s]" />
        <div className="relative flex flex-wrap items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl gradient-hero text-primary-foreground shadow-glow">
            <Sparkles className="size-6 animate-pulse" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            {urdu
              ? "لائیو سونا، چاندی اور کرنسی ریٹس کے ساتھ مکمل درست حساب — 2.5% زکوٰۃ۔"
              : "A precise 2.5% calculation using live gold, silver and currency rates."}
          </p>
          {fxRate > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs tabular-nums">
              <TrendingUp className="size-3.5 text-primary" aria-hidden /> 1 USD = {fxRate.toLocaleString(undefined, { maximumFractionDigits: 3 })} {currency}
            </span>
          )}
        </div>
      </Card>

      <Card className="flex flex-wrap items-center gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">{urdu ? "کرنسی" : "Currency"}</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="min-h-11 rounded-xl border border-border bg-card px-3"
          >
            {CURRENCIES.map(([code, sym, name]) => (
              <option key={code} value={code}>
                {code} — {name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-muted-foreground">
          {urdu
            ? "زکوٰۃ اس مال پر ہے جو ایک قمری سال آپ کے پاس رہا۔"
            : "Zakat is due on wealth that stayed with you for one lunar year."}
        </p>
        <div className="w-full">
          <span className="mb-1 block text-sm text-muted-foreground">{urdu ? "نصاب کس بنیاد پر؟" : "Nisab standard"}</span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["silver", urdu ? "چاندی (612.36 گرام) — زیادہ محتاط" : "Silver 612.36g — safest for the poor"],
                ["gold", urdu ? "سونا (87.48 گرام)" : "Gold 87.48g"],
                ["lower", urdu ? "جو کم ہو" : "Whichever is lower"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setBasis(v)}
                aria-pressed={basis === v}
                className={`min-h-11 rounded-full px-4 text-xs font-semibold transition ${
                  basis === v ? "gradient-hero text-primary-foreground shadow-glow" : "border border-border hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Metal prices */}
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-lg">
            <Coins className="size-5 text-primary" aria-hidden /> {urdu ? "سونے چاندی کی قیمت (فی گرام)" : "Metal prices (per gram)"}
          </h2>
          <button
            onClick={() => void fetchPrices()}
            disabled={fetching}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm hover:text-primary disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${fetching ? "animate-spin" : ""}`} aria-hidden />
            {urdu ? "لائیو ریٹس تازہ کریں" : "Refresh live rates"}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">{urdu ? `سونا (${symbol}/گرام)` : `Gold (${symbol}/gram)`}</span>
            <input
              inputMode="decimal"
              value={goldPrice}
              onChange={(e) => setGoldPrice(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="0.00"
              className="min-h-11 w-full rounded-xl border border-border bg-card px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">{urdu ? `چاندی (${symbol}/گرام)` : `Silver (${symbol}/gram)`}</span>
            <input
              inputMode="decimal"
              value={silverPrice}
              onChange={(e) => setSilverPrice(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="0.00"
              className="min-h-11 w-full rounded-xl border border-border bg-card px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
        </div>
        {priceStatus && (
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {priceStatus}
          </p>
        )}
      </Card>

      {/* Assets */}
      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-lg">
          <Scale className="size-5 text-primary" aria-hidden /> {urdu ? "آپ کا مال" : "Your wealth"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map(({ key, en, ur }) => (
            <label key={key} className="text-sm">
              <span className="mb-1 block text-muted-foreground">{urdu ? ur : en}</span>
              <input
                inputMode="decimal"
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value.replace(/[^\d.]/g, "") }))}
                placeholder={key === "gold" || key === "silver" ? "grams" : symbol}
                className="min-h-11 w-full rounded-xl border border-border bg-card px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
          ))}
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-muted-foreground">{urdu ? DEBT_FIELD.ur : DEBT_FIELD.en}</span>
            <input
              inputMode="decimal"
              value={values["debt"] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, debt: e.target.value.replace(/[^\d.]/g, "") }))}
              placeholder={symbol}
              className="min-h-11 w-full rounded-xl border border-border bg-card px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
        </div>
      </Card>

      {/* Result */}
      <Card className="gradient-hero space-y-2 text-primary-foreground">
        <div className="flex justify-between text-sm">
          <span>{urdu ? "کل قابلِ زکوٰۃ مال" : "Total zakatable wealth"}</span>
          <span className="font-semibold tabular-nums">{fmt(result.total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>{urdu ? "نصاب (کم از کم حد)" : "Nisab threshold"}</span>
          <span className="font-semibold tabular-nums">{result.nisab ? fmt(result.nisab) : "—"}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${result.progress}%` }}
          />
        </div>
        <div className="border-t border-white/20 pt-3 text-center">
          {!result.nisab ? (
            <p className="text-sm">{urdu ? "نصاب جاننے کے لیے سونے یا چاندی کی قیمت لکھیں۔" : "Enter a gold or silver price to know the nisab."}</p>
          ) : result.eligible ? (
            <>
              <p className="text-xs uppercase tracking-[0.28em] text-primary-foreground/80">
                {urdu ? "آپ پر زکوٰۃ فرض ہے — واجب رقم" : "Zakat is due on you — payable amount"}
              </p>
                  <p className="mt-1 font-display text-4xl tabular-nums text-accent animate-rise">
                <CountUp value={result.zakat} format={fmt} />
              </p>
              <p className="mt-1 text-xs text-primary-foreground/80">{urdu ? "اپنے کل مال کا ۲.۵٪" : "2.5% of your total wealth"}</p>
            </>
          ) : (
            <p className="text-sm">
              {urdu
                ? "آپ کا مال نصاب سے کم ہے — اس سال زکوٰۃ واجب نہیں، صدقہ جاری رکھیں۔"
                : "Your wealth is below the nisab — no zakat due this year, but sadaqah is always open."}
            </p>
          )}
        </div>
      </Card>

      <SpiritualZakat urdu={urdu} />

      <p className="text-xs text-muted-foreground">
        {urdu
          ? "نوٹ: زیور جو روزانہ پہنا جاتا ہے اس میں علماء کا اختلاف ہے؛ احتیاط اسی میں ہے کہ اسے شامل کیا جائے۔ کسی فقہی سوال پر مقامی عالم سے رجوع کریں۔"
          : "Note: scholars differ on jewellery worn daily; including it is the safer opinion. For fiqh questions, ask a local scholar."}
      </p>
    </div>
  );
}

/* --------------------------------------------------- animated amount */

function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let frame = 0;
    const from = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(from + (value - from) * eased);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{format(shown)}</>;
}

/* ------------------------------------------- ayah, hadith, dua, words */

const AYAH = {
  ar: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ",
  en: "And establish prayer and give zakat. — Surah Al-Baqarah 2:110",
  ur: "اور نماز قائم کرو اور زکوٰۃ ادا کرو۔ — سورۃ البقرہ ۲:۱۱۰",
};

const HADITHS = [
  {
    en: "\u201CCharity does not decrease wealth.\u201D — Sahih Muslim 2588",
    ur: "\u201Cصدقہ مال کو کم نہیں کرتا۔\u201D — صحیح مسلم ۲۵۸۸",
  },
  {
    en: "\u201CProtect yourself from the Fire, even with half a date given in charity.\u201D — Sahih al-Bukhari 1417",
    ur: "\u201Cآگ سے بچو، خواہ کھجور کے ایک ٹکڑے کے صدقے سے ہی سہی۔\u201D — صحیح بخاری ۱۴۱۷",
  },
  {
    en: "\u201CThe believer\u2019s shade on the Day of Judgement will be his charity.\u201D — Sunan al-Tirmidhi 604",
    ur: "\u201Cقیامت کے دن مومن کا سایہ اس کا صدقہ ہوگا۔\u201D — سنن ترمذی ۶۰۴",
  },
];

const DUA = {
  ar: "اللَّهُمَّ اجْعَلْ رِزْقِي حَلَالًا طَيِّبًا مُبَارَكًا",
  en: "O Allah, make my provision lawful, pure and blessed.",
  ur: "اے اللہ! میرے رزق کو حلال، پاکیزہ اور بابرکت بنا دے۔",
};

const GOOD_WORDS = [
  { en: "Give while your hand is still able to give.", ur: "دو جب تک تمہارا ہاتھ دینے کے قابل ہے۔" },
  { en: "Zakat purifies wealth; sadaqah purifies the heart.", ur: "زکوٰۃ مال کو پاک کرتی ہے، صدقہ دل کو۔" },
  { en: "What you keep is spent; what you give is saved.", ur: "جو رکھا وہ خرچ ہو گیا، جو دیا وہ محفوظ ہو گیا۔" },
];

function SpiritualZakat({ urdu }: { urdu: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="relative overflow-hidden">
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/15 blur-2xl animate-float" />
        <h2 className="flex items-center gap-2 font-display text-lg">
          <BookOpenText className="size-5 text-primary" aria-hidden /> {urdu ? "قرآن کریم" : "From the Qur\u2019an"}
        </h2>
        <p dir="rtl" lang="ar" className="mt-3 font-arabic text-2xl leading-loose">
          {AYAH.ar}
        </p>
        <p className="mt-2 text-sm text-muted-foreground" dir={urdu ? "rtl" : "ltr"}>
          {urdu ? AYAH.ur : AYAH.en}
        </p>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-display text-lg">
          <HandHeart className="size-5 text-primary" aria-hidden /> {urdu ? "احادیث" : "Hadith on giving"}
        </h2>
        <ul className="mt-3 space-y-3">
          {HADITHS.map((h, i) => (
            <li
              key={h.en}
              dir={urdu ? "rtl" : "ltr"}
              className="animate-rise rounded-xl border border-border/70 bg-background/50 p-3 text-sm"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {urdu ? h.ur : h.en}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-lg">{urdu ? "دعا" : "Dua"}</h2>
        <p dir="rtl" lang="ar" className="mt-3 font-arabic text-xl leading-loose">
          {DUA.ar}
        </p>
        <p className="mt-2 text-sm text-muted-foreground" dir={urdu ? "rtl" : "ltr"}>
          {urdu ? DUA.ur : DUA.en}
        </p>
      </Card>

      <Card>
        <h2 className="font-display text-lg">{urdu ? "نیک باتیں" : "Good words"}</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {GOOD_WORDS.map((w, i) => (
            <li key={w.en} dir={urdu ? "rtl" : "ltr"} className="animate-rise" style={{ animationDelay: `${i * 120}ms` }}>
              {urdu ? w.ur : w.en}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
