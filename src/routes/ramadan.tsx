import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, MapPin, Moon, Sunrise, Sunset } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { useSettings } from "@/lib/settings";
import { fetchPrayerDay, placeForTimings, prettyTime, timeToMinutes } from "@/lib/prayer-times";

export const Route = createFileRoute("/ramadan")({
  head: () => ({
    meta: [
      { title: "Ramadan & Fasting Tracker — Live Suhoor & Iftar Times | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Live countdown to suhoor and iftar for your city, Hijri date, full prayer timetable and a fasting tracker for the whole month.",
      },
      { property: "og:title", content: "Ramadan & Fasting Tracker | Raah e Hidayath" },
      { property: "og:description", content: "Live suhoor and iftar countdown with fasting tracker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ramadan,
});

const LOC_KEY = "reh-ramadan-location";
const DEFAULT_CITY = "Hyderabad";
const DEFAULT_COUNTRY = "IN";
const FAST_KEY = "reh-fasting-log";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const aladhanDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

type DayData = { timings: Record<string, string>; hijri: { day: string; month: string; year: string } };

function Ramadan() {
  const { settings, update } = useSettings();
  const urdu = settings.lang === "ur";

  /* Location lives in settings so home and this page always agree. */
  /* Coordinates give the exact sunrise/Suhoor for this street, not the city hall. */
  const city = placeForTimings(settings) || settings.city || DEFAULT_CITY;
  const country = settings.country || DEFAULT_COUNTRY;
  const [cityInput, setCityInput] = useState(city.startsWith("geo:") ? "" : city);
  const [countryInput, setCountryInput] = useState(country);
  const [dayOffset, setDayOffset] = useState(0);
  const [data, setData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [fastLog, setFastLog] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAST_KEY) ?? "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const date = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const load = useCallback(
    async (c: string, co: string, d: Date) => {
      if (!c) return;
      setLoading(true);
      setError("");
      try {
        const day = await fetchPrayerDay(c, co, settings.method, settings.school ?? 1, d);
        setData({
          timings: day.timings,
          hijri: { day: day.date.hijri.day, month: day.date.hijri.month.en, year: day.date.hijri.year },
        });
      } catch (e) {
        setData(null);
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [settings.method, settings.school],
  );

  useEffect(() => {
    void load(city, country, date);
  }, [city, country, date, load]);

  const saveLocation = (c: string, co: string) => {
    update({ city: c, country: co });
    try {
      localStorage.setItem(LOC_KEY, JSON.stringify({ city: c, country: co }));
    } catch {
      /* ignore */
    }
  };

  const useMyLocation = () => {
    setError("");
    navigator.geolocation?.getCurrentPosition(
      (pos) => saveLocation(`geo:${pos.coords.latitude},${pos.coords.longitude}`, ""),
      () => setError(urdu ? "مقام کی اجازت نہیں ملی — شہر کا نام لکھیں۔" : "Location permission was refused — type your city instead."),
      { timeout: 10000 },
    );
  };

  /* Countdown to the next fasting milestone. */
  const countdown = useMemo(() => {
    if (!data || dayOffset !== 0) return null;
    const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const fajr = timeToMinutes(data.timings["Fajr"]) ?? timeToMinutes("05:00")!;
    const maghrib = timeToMinutes(data.timings["Maghrib"]) ?? timeToMinutes("18:30")!;
    let label = urdu ? "افطار (مغرب) باقی" : "Until Iftar (Maghrib)";
    let target = maghrib;
    if (nowMin < fajr) {
      label = urdu ? "سحری کا خاتمہ (فجر)" : "Suhoor ends (Fajr)";
      target = fajr;
    } else if (nowMin > maghrib) {
      label = urdu ? "کل کی سحری (فجر)" : "Tomorrow's Suhoor (Fajr)";
      target = fajr + 24 * 60;
    }
    const diff = Math.max(0, Math.round((target - nowMin) * 60));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return { label, text: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` };
  }, [data, now, dayOffset, urdu]);

  /* Fasting log for the visible month. */
  const toggleFast = (d: string) => {
    const next = { ...fastLog, [d]: !fastLog[d] };
    setFastLog(next);
    try {
      localStorage.setItem(FAST_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  const monthDays = useMemo(() => {
    const base = new Date(date.getFullYear(), date.getMonth(), 1);
    const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => iso(new Date(base.getFullYear(), base.getMonth(), i + 1)));
  }, [date]);
  const fastedThisMonth = monthDays.filter((d) => fastLog[d]).length;

  const rows = data
    ? [
        { key: "Imsak", label: urdu ? "امساک" : "Imsak (stop eating)", icon: Moon },
        { key: "Fajr", label: urdu ? "فجر" : "Fajr", icon: Sunrise },
        { key: "Dhuhr", label: urdu ? "ظہر" : "Dhuhr", icon: Sunrise },
        { key: "Asr", label: urdu ? "عصر" : "Asr", icon: Sunrise },
        { key: "Maghrib", label: urdu ? "مغرب — افطار" : "Maghrib — Iftar", icon: Sunset },
        { key: "Isha", label: urdu ? "عشاء" : "Isha", icon: Moon },
      ]
    : [];

  return (
    <div className="space-y-6">
      <SectionTitle
        title={urdu ? "رمضان اور روزہ ٹریکر" : "Ramadan & Fasting"}
        subtitle={urdu ? "لائیو سحری و افطار اوقات، ہجری تاریخ اور روزوں کا حساب" : "Live suhoor & iftar times, Hijri date and your fasting log"}
      />

      {/* Location */}
      <Card className="space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1 text-sm">
            <span className="mb-1 block text-muted-foreground">{urdu ? "شہر" : "City"}</span>
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder={urdu ? "مثلاً حیدرآباد" : "e.g. Hyderabad"}
              className="min-h-11 w-full rounded-xl border border-border bg-card px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <label className="w-28 text-sm">
            <span className="mb-1 block text-muted-foreground">{urdu ? "ملک" : "Country"}</span>
            <input
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              placeholder="IN"
              className="min-h-11 w-full rounded-xl border border-border bg-card px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <button
            onClick={() => cityInput.trim() && saveLocation(cityInput.trim(), countryInput.trim() || DEFAULT_COUNTRY)}
            className="min-h-11 rounded-full gradient-hero px-5 text-sm font-semibold text-primary-foreground"
          >
            {urdu ? "مقرر کریں" : "Set"}
          </button>
          <button
            onClick={useMyLocation}
            aria-label="Use my location"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-4 text-sm hover:text-primary"
          >
            <MapPin className="size-4" aria-hidden /> {urdu ? "میرا مقام" : "My location"}
          </button>
        </div>
        {city.startsWith("geo:") && (
          <p className="text-xs text-muted-foreground">{urdu ? "آپ کے موجودہ مقام کے اوقات" : "Using timings for your current location"}</p>
        )}
      </Card>

      {/* Date + countdown */}
      <Card className="gradient-hero text-primary-foreground">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => setDayOffset((o) => o - 1)} aria-label="Previous day" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="font-display text-base sm:text-lg">
              {date.toLocaleDateString(urdu ? "ur-PK" : undefined, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            {data && (
              <p className="hijri-on-hero">
                {data.hijri.day} {data.hijri.month} {data.hijri.year} {urdu ? "ہجری" : "AH"}
              </p>
            )}
          </div>
          <button onClick={() => setDayOffset((o) => o + 1)} aria-label="Next day" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
        {countdown && (
          <div className="mt-4 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-primary-foreground/80">{countdown.label}</p>
            <p className="mt-1 font-display text-5xl tabular-nums tracking-wide" aria-live="off">
              {countdown.text}
            </p>
          </div>
        )}
        {loading && <p className="mt-4 text-center text-sm">{urdu ? "لوڈ ہو رہا ہے…" : "Loading times…"}</p>}
        {error && <p className="mt-4 text-center text-sm">{error}</p>}
        {!city && !loading && (
          <p className="mt-4 text-center text-sm">
            {urdu ? "اوقات دیکھنے کے لیے اپنا شہر منتخب کریں۔" : "Set your city above to see live times."}
          </p>
        )}
      </Card>

      {/* Timetable */}
      {data && (
        <div className="grid gap-2 sm:grid-cols-2">
          {rows.map(({ key, label, icon: Icon }) => (
            <Card
              key={key}
              className={`flex min-w-0 items-center justify-between gap-3 ${key === "Maghrib" || key === "Imsak" ? "border-accent/50" : ""}`}
            >
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="truncate">{label}</span>
              </span>
              <span className="shrink-0 font-display text-lg tabular-nums">{prettyTime(data.timings[key])}</span>
            </Card>
          ))}
        </div>
      )}

      {/* Fasting tracker */}
      <Card className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg">{urdu ? "روزوں کا حساب" : "Fasting tracker"}</h2>
          <p className="text-sm text-muted-foreground">
            {fastedThisMonth}/{monthDays.length} {urdu ? "روزے اس مہینے" : "fasts this month"}
          </p>
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {monthDays.map((d) => {
            const done = fastLog[d];
            const future = d > iso(new Date());
            return (
              <button
                key={d}
                disabled={future}
                onClick={() => toggleFast(d)}
                aria-pressed={done}
                aria-label={`Fast on ${d}: ${done ? "completed" : "not marked"}`}
                className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border text-xs font-semibold leading-none transition ${
                  done
                    ? "border-transparent gradient-hero text-primary-foreground shadow-soft"
                    : "border-border bg-card hover:border-primary/50 hover:text-primary disabled:opacity-40"
                }`}
              >
                <span className="tabular-nums">{Number(d.slice(-2))}</span>
                {done && <Check className="size-3" aria-hidden />}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {urdu
            ? "ہر دن کا روزہ مکمل ہونے پر اس دن کو دبائیں — آپ کا ریکارڈ اسی ڈیوائس پر محفوظ رہتا ہے۔"
            : "Tap a day when you complete its fast — your record stays saved on this device."}
        </p>
      </Card>
    </div>
  );
}
