/**
 * Single source of truth for prayer timings.
 *
 * Every screen (home, Ramadan/fasting, widgets) must read timings through this
 * module so the numbers can never disagree. The city, country, calculation
 * method and Asr school all come from the user's settings.
 */

import { useQuery } from "@tanstack/react-query";
import { useSettings } from "./settings";

export type Timings = Record<string, string>;

export type PrayerDay = {
  timings: Timings;
  date: {
    readable: string;
    gregorian: { weekday: string };
    hijri: { day: string; month: { en: string }; year: string; weekday: { en: string } };
  };
};

const AL = "https://api.aladhan.com/v1";

const ddmmyyyy = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

/**
 * Turns the saved location into the value the timings API should be asked with.
 *
 * Exact coordinates always win: a `geo:` place gives the true sunrise, Fajr and
 * Maghrib for that street — a city name only gives the city hall's timings, and
 * for large states or unnamed towns it can be off by many minutes.
 */
export function placeForTimings(settings: {
  coords?: { lat: number; lng: number } | null;
  city?: string;
}) {
  const c = settings.coords;
  if (c && Number.isFinite(c.lat) && Number.isFinite(c.lng)) {
    return `geo:${c.lat.toFixed(5)},${c.lng.toFixed(5)}`;
  }
  return settings.city ?? "";
}

/**
 * Builds the timings URL. `city` may be a plain city name or a
 * `geo:<lat>,<lng>` string captured from the browser's location.
 */
export function prayerTimesUrl(
  city: string,
  country: string,
  method: number,
  school: number,
  date: Date,
) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const common = `method=${method}&school=${school}&timezonestring=${encodeURIComponent(tz)}`;
  if (city.startsWith("geo:")) {
    const [lat = "", lng = ""] = city.slice(4).split(",");
    return `${AL}/timings/${ddmmyyyy(date)}?latitude=${lat}&longitude=${lng}&${common}`;
  }
  return `${AL}/timingsByCity/${ddmmyyyy(date)}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(
    country,
  )}&${common}`;
}

export async function fetchPrayerDay(
  city: string,
  country: string,
  method: number,
  school: number,
  date: Date = new Date(),
): Promise<PrayerDay> {
  const res = await fetch(prayerTimesUrl(city, country, method, school, date));
  const json = (await res.json()) as { code: number; data?: PrayerDay };
  if (!res.ok || json.code !== 200 || !json.data) throw new Error("Could not load prayer times for this place.");
  return json.data;
}

/** Timings for `date` using the saved location + calculation settings. */
export function usePrayerDay(date: Date = new Date()) {
  const { settings } = useSettings();
  const school = settings.school ?? 1;
  const key = ddmmyyyy(date);
  /* Exact coordinates win over the city name — they are timezone accurate. */
  const place = placeForTimings(settings);
  return useQuery({
    queryKey: ["prayer-day", place, settings.country, settings.method, school, key],
    queryFn: () => fetchPrayerDay(place, settings.country, settings.method, school, date),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

/** "05:04 (IST)" → minutes after midnight. */
export const timeToMinutes = (t: string | undefined) => {
  if (!t) return null;
  const [h, m] = t.slice(0, 5).split(":");
  const hh = Number(h);
  const mm = Number(m);
  return Number.isFinite(hh) && Number.isFinite(mm) ? hh * 60 + mm : null;
};

/** "05:04 (IST)" → "5:04 AM" */
export const prettyTime = (t: string | undefined) => {
  const mins = timeToMinutes(t);
  if (mins === null) return "--:--";
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
};
