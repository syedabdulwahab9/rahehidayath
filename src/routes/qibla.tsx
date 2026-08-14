import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Compass,
  Crosshair,
  LocateFixed,
  MapPin,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import {
  angleDelta,
  compassPoint,
  formatDistance,
  geodesicToKaaba,
  magneticField,
  norm360,
} from "@/lib/qibla";

export const Route = createFileRoute("/qibla")({
  head: () => ({
    meta: [
      { title: "Qibla Direction — True-North Compass | Raah e Hidayath" },
      {
        name: "description",
        content:
          "The exact direction of the Ka'bah from anywhere on earth: WGS84 ellipsoidal geodesic bearing, live device compass and World Magnetic Model declination correction.",
      },
      { property: "og:title", content: "Qibla Direction | Raah e Hidayath" },
      {
        property: "og:description",
        content:
          "Ellipsoid-accurate Qibla bearing with true-north correction, from your exact location anywhere on earth.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Qibla,
});

type Coords = {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number | null;
  label?: string;
  source: "gps" | "search";
};

/** Adaptive smoothing: snap fast on big turns, glide on small jitter. */
function smoothHeading(prev: number | null, next: number) {
  if (prev == null) return next;
  const delta = angleDelta(next, prev);
  const magnitude = Math.abs(delta);
  const alpha = magnitude > 25 ? 0.85 : magnitude > 8 ? 0.45 : 0.18;
  return norm360(prev + delta * alpha);
}

function Qibla() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState("Requesting your location…");
  const [searchError, setSearchError] = useState("");
  const [magneticHeading, setMagneticHeading] = useState<number | null>(null);
  const [headingIsTrue, setHeadingIsTrue] = useState(false);
  const [needsMotionPermission, setNeedsMotionPermission] = useState(false);
  const [compassAccuracy, setCompassAccuracy] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const smoothed = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);
  const listeners = useRef<Array<() => void>>([]);

  /* ---------------- location ---------------- */

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("Location is not supported on this device — search your city below.");
      return;
    }
    setStatus("Requesting your location…");
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);

    // watchPosition keeps refining the fix, so the bearing converges on the
    // true position instead of freezing on a coarse first reading.
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords((prev) => {
          // Never let a much coarser reading overwrite a precise one.
          if (
            prev?.source === "gps" &&
            prev.accuracy != null &&
            pos.coords.accuracy > prev.accuracy * 2.5
          ) {
            return prev;
          }
          return {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            source: "gps",
          };
        });
        setStatus("");
      },
      () => setStatus("Location permission denied — search your city below instead."),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    locate();
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [locate]);

  /* ---------------- compass ---------------- */

  const stopCompass = useCallback(() => {
    listeners.current.forEach((off) => off());
    listeners.current = [];
  }, []);

  const startCompass = useCallback(async () => {
    type Requestable = { requestPermission?: () => Promise<"granted" | "denied"> };
    const requestable = DeviceOrientationEvent as unknown as Requestable | undefined;
    if (typeof requestable?.requestPermission === "function") {
      try {
        const res = await requestable.requestPermission();
        if (res !== "granted") return;
        setNeedsMotionPermission(false);
      } catch {
        return;
      }
    }

    stopCompass();

    const handler = (
      e: DeviceOrientationEvent & {
        webkitCompassHeading?: number;
        webkitCompassAccuracy?: number;
      },
    ) => {
      let raw: number | null = null;
      let isTrue = false;

      if (typeof e.webkitCompassHeading === "number" && !Number.isNaN(e.webkitCompassHeading)) {
        // iOS already returns a TRUE-north heading (Apple applies declination).
        raw = e.webkitCompassHeading;
        isTrue = true;
        if (typeof e.webkitCompassAccuracy === "number") {
          setCompassAccuracy(e.webkitCompassAccuracy);
        }
      } else if (e.alpha != null && (e.absolute || e.type === "deviceorientationabsolute")) {
        // Android/Chrome: alpha is measured anticlockwise from MAGNETIC north.
        raw = 360 - e.alpha;
      } else {
        return;
      }

      // Compensate for the screen being rotated relative to the device body.
      const screenAngle =
        typeof window !== "undefined"
          ? (window.screen?.orientation?.angle ??
            (window as unknown as { orientation?: number }).orientation ??
            0)
          : 0;

      const value = norm360(raw + screenAngle);
      if (Number.isNaN(value)) return;

      setHeadingIsTrue(isTrue);
      smoothed.current = smoothHeading(smoothed.current, value);
      setMagneticHeading(smoothed.current);
    };

    const add = (type: string) => {
      window.addEventListener(type, handler as EventListener, true);
      listeners.current.push(() =>
        window.removeEventListener(type, handler as EventListener, true),
      );
    };
    add("deviceorientationabsolute");
    add("deviceorientation");
  }, [stopCompass]);

  useEffect(() => {
    type Requestable = { requestPermission?: () => Promise<"granted" | "denied"> };
    const requestable =
      typeof DeviceOrientationEvent !== "undefined"
        ? (DeviceOrientationEvent as unknown as Requestable)
        : undefined;
    if (typeof requestable?.requestPermission === "function") {
      setNeedsMotionPermission(true);
      return;
    }
    void startCompass();
    return stopCompass;
  }, [startCompass, stopCompass]);

  /* ---------------- manual search ---------------- */

  const searchCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query.trim())}`,
      );
      const json = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      const hit = json[0];
      if (!hit) {
        setSearchError("Couldn't find that place — try adding the country.");
        return;
      }
      setCoords({
        lat: Number(hit.lat),
        lng: Number(hit.lon),
        label: hit.display_name.split(",").slice(0, 2).join(",").trim(),
        source: "search",
      });
      setStatus("");
    } catch {
      setSearchError("Search failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  /* ---------------- geodesy ---------------- */

  const solution = useMemo(() => {
    if (!coords) return null;
    const geo = geodesicToKaaba(coords.lat, coords.lng);
    const field = magneticField(coords.lat, coords.lng, coords.altitude ?? 0);
    return { geo, field };
  }, [coords]);

  const bearing = solution?.geo.bearing ?? null;
  const declination = solution?.field.declination ?? 0;

  /**
   * Convert whatever the device gave us into a TRUE-north heading.
   * iOS is already true north; Android reports magnetic north, so we add the
   * World Magnetic Model declination for this exact spot and date.
   */
  const trueHeading = useMemo(() => {
    if (magneticHeading == null) return null;
    if (headingIsTrue || !solution) return magneticHeading;
    return norm360(magneticHeading + declination);
  }, [magneticHeading, headingIsTrue, declination, solution]);

  const offset = bearing == null ? 0 : angleDelta(bearing, trueHeading ?? 0);
  const needleAngle = bearing == null ? 0 : bearing - (trueHeading ?? 0);
  const off = Math.abs(offset);
  const aligned = trueHeading != null && bearing != null && off < 3;
  const close = trueHeading != null && bearing != null && off < 12;

  const weakField = solution != null && solution.field.horizontal < 6000;
  const lowConfidence = compassAccuracy != null && compassAccuracy > 15;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Qibla Direction"
        subtitle="Hold your device flat and turn until the arrow locks on the Ka'bah"
      />

      <Card className="flex flex-col items-center gap-6 py-10">
        <div
          className={`relative grid size-64 shrink-0 place-items-center rounded-full border-2 gradient-soft transition-all duration-300 sm:size-72 ${
            aligned
              ? "border-primary shadow-glow"
              : close
                ? "border-primary/50"
                : "border-border"
          }`}
        >
          {/* Rose counter-rotates with the device so N always shows TRUE north. */}
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(${-(trueHeading ?? 0)}deg)`,
              transition: "transform 180ms linear",
            }}
          >
            <span className="absolute inset-3 rounded-full border border-dashed border-primary/25" />
            {/* Degree ticks every 15°, emphasised every 45°. */}
            {Array.from({ length: 24 }, (_, i) => {
              const major = i % 3 === 0;
              return (
                <span
                  key={i}
                  className="absolute left-1/2 top-0 h-1/2 w-0 origin-bottom"
                  style={{ transform: `rotate(${i * 15}deg)` }}
                >
                  <span
                    className={`absolute left-0 top-1.5 -translate-x-1/2 rounded-full ${
                      major ? "h-2.5 w-0.5 bg-primary/50" : "h-1.5 w-px bg-border"
                    }`}
                  />
                </span>
              );
            })}

            <span className="absolute left-1/2 top-4 -translate-x-1/2 text-xs font-bold tracking-widest text-primary">
              N
            </span>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground">
              S
            </span>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
              W
            </span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
              E
            </span>
          </div>

          <div
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transition: "transform 180ms linear",
            }}
          >
            <svg
              viewBox="0 0 60 120"
              className={`size-40 transition-colors sm:size-44 ${aligned ? "text-primary" : "text-primary/80"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M30 8 L42 44 L30 36 L18 44 Z" fill="currentColor" />
              <rect
                x="22"
                y="76"
                width="16"
                height="14"
                className="text-accent"
                fill="currentColor"
                stroke="none"
              />
              <line x1="30" y1="44" x2="30" y2="76" />
            </svg>
          </div>

          {aligned && (
            <span className="absolute inset-0 animate-pulse rounded-full ring-4 ring-primary/25" />
          )}
        </div>

        {bearing != null && solution ? (
          <div className="w-full max-w-sm text-center">
            <p className="font-display text-4xl tabular-nums text-primary">
              {bearing.toFixed(2)}°
            </p>
            <p className="text-sm text-muted-foreground">
              {compassPoint(bearing)} of true north ·{" "}
              {formatDistance(solution.geo.distance)} to the Ka'bah
            </p>

            {coords?.label && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" /> {coords.label}
              </p>
            )}

            <p
              className={`mt-3 text-sm font-semibold ${
                aligned ? "text-primary" : close ? "text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {trueHeading == null
                ? "No compass detected — face the bearing above using any compass."
                : aligned
                  ? "You are facing the Qibla ✓"
                  : `Turn ${offset > 0 ? "right" : "left"} ${off.toFixed(0)}°`}
            </p>

            {/* Precision readout — every number that feeds the bearing. */}
            <dl className="mt-5 grid grid-cols-2 gap-2 text-left text-xs">
              <Stat
                label="Your position"
                value={`${coords!.lat.toFixed(5)}°, ${coords!.lng.toFixed(5)}°`}
              />
              <Stat
                label="GPS accuracy"
                value={
                  coords?.accuracy != null ? `±${Math.round(coords.accuracy)} m` : "Manual location"
                }
              />
              <Stat
                label="Magnetic declination"
                value={`${declination >= 0 ? "+" : ""}${declination.toFixed(2)}°`}
              />
              <Stat
                label="Heading reference"
                value={
                  trueHeading == null
                    ? "—"
                    : headingIsTrue
                      ? "True north (device)"
                      : "True north (WMM-2025)"
                }
              />
            </dl>

            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0 text-primary" />
              {solution.geo.exact
                ? "WGS84 ellipsoidal geodesic — accurate to the metre worldwide"
                : "Great-circle solution (near-antipodal position)"}
            </p>

            {(weakField || lowConfidence) && (
              <p className="mt-2 inline-flex items-start gap-1.5 text-left text-[11px] text-destructive">
                <TriangleAlert className="mt-px size-3.5 shrink-0" />
                {weakField
                  ? "The magnetic field is weak here, so phone compasses drift. Trust the bearing number above."
                  : "Compass confidence is low — recalibrate with a figure-of-eight motion."}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{status}</p>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={locate}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition hover:bg-accent/10"
          >
            <LocateFixed className="size-3.5 text-primary" /> Use my location
          </button>
          {needsMotionPermission && (
            <button
              onClick={() => void startCompass()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full gradient-hero px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Compass className="size-3.5" /> Enable compass
            </button>
          )}
          <button
            onClick={() => {
              smoothed.current = null;
              setMagneticHeading(null);
              setCompassAccuracy(null);
              void startCompass();
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition hover:bg-accent/10"
          >
            <RefreshCw className="size-3.5 text-primary" /> Recalibrate
          </button>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="font-display text-lg">Anywhere in the world</p>
        <p className="text-sm text-muted-foreground">
          No GPS? Type any city, town or country and we'll solve the exact ellipsoidal Qibla
          bearing for it.
        </p>
        <form onSubmit={searchCity} className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Hyderabad, India"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <button
            type="submit"
            disabled={searching}
            className="min-h-11 rounded-full gradient-hero px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {searching ? "Searching…" : "Find Qibla"}
          </button>
        </form>
        {searchError && <p className="text-xs text-destructive">{searchError}</p>}
        <p className="inline-flex items-start gap-1.5 text-xs text-muted-foreground">
          <Crosshair className="mt-px size-3.5 shrink-0 text-primary" />
          For the sharpest heading, move away from metal, magnets and magnetic phone cases, then
          wave the phone in a figure of eight to calibrate the magnetometer.
        </p>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/70 bg-background/40 px-3 py-2">
      <dt className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-xs font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
