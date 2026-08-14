import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, SectionTitle } from "@/components/AppShell";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Hijri Calendar & Islamic Dates | Raah e Hidayath" },
      { name: "description", content: "See today's Hijri date, the full Islamic month and the important dates of the Islamic year." },
      { property: "og:title", content: "Hijri Calendar | Raah e Hidayath" },
      { property: "og:description", content: "Today's Hijri date and the full Islamic month." },
    ],
  }),
  component: CalendarPage,
});

type HDay = {
  gregorian: { day: string; weekday: { en: string } };
  hijri: { day: string; month: { en: string; ar: string }; year: string; holidays: string[] };
};

async function fetchMonth(month: number, year: number): Promise<HDay[]> {
  const res = await fetch(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`);
  if (!res.ok) throw new Error("calendar failed");
  const json = (await res.json()) as { data: HDay[] };
  return json.data;
}

const IMPORTANT = [
  { d: "1 Muharram", t: "Islamic New Year" },
  { d: "10 Muharram", t: "Day of Ashura" },
  { d: "12 Rabi al-Awwal", t: "Birth of the Prophet ﷺ" },
  { d: "27 Rajab", t: "Isra & Mi'raj" },
  { d: "15 Sha'ban", t: "Laylat al-Bara'ah" },
  { d: "1 Ramadan", t: "Start of fasting" },
  { d: "27 Ramadan", t: "Likely Laylat al-Qadr" },
  { d: "1 Shawwal", t: "Eid ul-Fitr" },
  { d: "9 Dhul Hijjah", t: "Day of Arafah" },
  { d: "10 Dhul Hijjah", t: "Eid ul-Adha" },
];

function CalendarPage() {
  const now = new Date();
  const { data, isLoading, error } = useQuery({
    queryKey: ["hijri-month", now.getMonth() + 1, now.getFullYear()],
    queryFn: () => fetchMonth(now.getMonth() + 1, now.getFullYear()),
    staleTime: 1000 * 60 * 60,
  });
  const today = String(now.getDate());

  return (
    <div className="space-y-6">
      <SectionTitle title="Hijri Calendar" subtitle={now.toLocaleDateString(undefined, { month: "long", year: "numeric" })} />

      {isLoading && <div className="h-64 rounded-2xl border border-border bg-card shimmer" />}
      {error && <Card className="text-sm text-destructive">Couldn't load the calendar. Please retry.</Card>}

      {data && (
        <Card>
          <p className="text-sm text-muted-foreground">
            {data[0]?.hijri.month.en} {data[0]?.hijri.year} AH
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {data.map((d) => {
              const isToday = d.gregorian.day.replace(/^0/, "") === today;
              return (
                <div
                  key={d.gregorian.day}
                  className={`rounded-xl border p-2 text-center ${isToday ? "border-transparent gradient-hero text-primary-foreground" : "border-border bg-card"}`}
                >
                  <p className="text-xs opacity-70">{d.gregorian.weekday.en.slice(0, 3)}</p>
                  <p className="font-display text-lg">{d.gregorian.day}</p>
                  <p className="text-[11px] opacity-80">{d.hijri.day} {d.hijri.month.en.slice(0, 6)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <p className="font-display text-lg">Important Islamic Dates</p>
        <ul className="mt-3 space-y-2 text-sm">
          {IMPORTANT.map((i) => (
            <li key={i.d} className="flex justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
              <span className="text-muted-foreground">{i.d}</span>
              <span className="font-medium">{i.t}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}