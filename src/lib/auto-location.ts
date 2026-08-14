/**
 * Automatic, precise location detection.
 *
 * Every visitor — Mumbai, Nagole, London, Toronto — must see their own city,
 * their own country and their own timings. The browser's GPS is asked for first
 * (accurate to the neighbourhood); a coarse IP lookup is only used when the
 * visitor refuses or the device has no location at all, and it is clearly the
 * last resort.
 *
 * The detected place is written to the same settings the whole app reads, so
 * prayer times, sunrise, Ramadan timings and the Qibla always agree.
 */

import { useEffect } from "react";
import { useSettings } from "./settings";

type Place = {
  city: string;
  country: string;
  lat?: number | undefined;
  lng?: number | undefined;
  approximate?: boolean;
};

/** Distance in km between two points (haversine). */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** BigDataCloud — free, no key, returns the local locality (e.g. Nagole). */
async function bigDataCloud(lat: number, lng: number): Promise<Place | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    );
    if (!res.ok) return null;
    const j = (await res.json()) as {
      city?: string;
      locality?: string;
      localityInfo?: { administrative?: { name?: string; adminLevel?: number }[] };
      principalSubdivision?: string;
      countryName?: string;
    };
    const country = j.countryName || "";
    // Prefer the most local name the service knows, then the city/town.
    const admin = j.localityInfo?.administrative ?? [];
    const finest = [...admin].sort((a, b) => (b.adminLevel ?? 0) - (a.adminLevel ?? 0))[0]?.name;
    const city = j.locality || j.city || finest || j.principalSubdivision || "";
    if (!city || !country) return null;
    return { city, country, lat, lng };
  } catch {
    return null;
  }
}

/** OpenStreetMap Nominatim — used when BigDataCloud has no name for the spot. */
async function nominatim(lat: number, lng: number): Promise<Place | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const j = (await res.json()) as {
      address?: Record<string, string>;
    };
    const a = j.address ?? {};
    const city =
      a["suburb"] || a["neighbourhood"] || a["village"] || a["town"] || a["city"] ||
      a["city_district"] || a["county"] || a["state_district"] || a["state"] || "";
    const country = a["country"] || "";
    if (!city || !country) return null;
    return { city, country, lat, lng };
  } catch {
    return null;
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<Place | null> {
  return (await bigDataCloud(lat, lng)) ?? (await nominatim(lat, lng));
}

/** Coarse fallback — only when the device gives us nothing. */
async function ipLookup(): Promise<Place | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const j = (await res.json()) as {
      city?: string;
      country_name?: string;
      latitude?: number;
      longitude?: number;
    };
    if (!j.city || !j.country_name) return null;
    return { city: j.city, country: j.country_name, lat: j.latitude, lng: j.longitude, approximate: true };
  } catch {
    return null;
  }
}

/**
 * Asks the device for a genuinely fresh, high accuracy fix.
 *
 * On phones the first GPS reading is often a coarse cell-tower guess that can be
 * kilometres out, which shifts sunrise by minutes. So we watch the position for
 * a few seconds and keep the sharpest reading (smallest accuracy radius),
 * stopping early as soon as the fix is street-level (≤ 50 m). `maximumAge: 0`
 * stops the browser from handing back a stale position from another city.
 */
function browserPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);

    let settled = false;
    let best: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      if (timer) clearTimeout(timer);
      resolve(best);
    };

    const consider = (pos: GeolocationPosition) => {
      const acc = pos.coords.accuracy ?? Number.POSITIVE_INFINITY;
      const bestAcc = best?.coords.accuracy ?? Number.POSITIVE_INFINITY;
      if (!best || acc <= bestAcc) best = pos;
      if (acc <= 50) finish();
    };

    const relaxed = () => {
      // A high accuracy fix can time out indoors — accept a relaxed one.
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          consider(pos);
          finish();
        },
        () => finish(),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60 * 1000 },
      );
    };

    watchId = navigator.geolocation.watchPosition(consider, () => (best ? finish() : relaxed()), {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    // Never keep the visitor waiting: settle with the sharpest fix so far.
    timer = setTimeout(() => (best ? finish() : relaxed()), 8000);
  });
}

/** Re-detect when the visitor has clearly moved, or once an hour. */
const LAST_KEY = "reh-location-last-fix";
const MOVED_KM = 1;
const MAX_AGE_MS = 60 * 60 * 1000;

/** Detects the visitor's real place and keeps it fresh as they travel. */
export function useAutoLocation() {
  const { settings, update } = useSettings();
  const mode = settings.locationMode;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mode === "manual") return;

    let cancelled = false;

    async function detect() {
      const pos = await browserPosition();
      let place: Place | null = null;

      if (pos) {
        const { latitude: lat, longitude: lng } = pos.coords;
        const last = (() => {
          try {
            return JSON.parse(window.localStorage.getItem(LAST_KEY) ?? "null") as
              | { lat: number; lng: number; at: number; city: string; country: string }
              | null;
          } catch {
            return null;
          }
        })();

        const fresh =
          last &&
          Date.now() - last.at < MAX_AGE_MS &&
          distanceKm({ lat, lng }, { lat: last.lat, lng: last.lng }) < MOVED_KM;

        place = fresh
          ? { city: last.city, country: last.country, lat, lng }
          : await reverseGeocode(lat, lng);

        // Even if naming fails, the exact coordinates already give exact timings.
        if (!place) place = { city: settings.city, country: settings.country, lat, lng };

        window.localStorage.setItem(
          LAST_KEY,
          JSON.stringify({ lat, lng, at: Date.now(), city: place.city, country: place.country }),
        );
      } else {
        place = await ipLookup();
      }

      if (cancelled || !place) return;

      const sameCity = place.city === settings.city && place.country === settings.country;
      const sameCoords =
        settings.coords &&
        place.lat != null &&
        place.lng != null &&
        distanceKm(settings.coords, { lat: place.lat, lng: place.lng }) < 0.5;
      if (sameCity && sameCoords) return;

      update({
        city: place.city,
        country: place.country,
        coords: place.lat != null && place.lng != null ? { lat: place.lat, lng: place.lng } : null,
        locationMode: "auto",
      });
    }

    void detect();

    // Coming back to the tab after travelling should refresh the place too.
    const onFocus = () => void detect();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
}
