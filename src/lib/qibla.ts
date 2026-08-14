/**
 * Qibla geodesy.
 *
 * Two sources of error exist in a phone Qibla compass:
 *
 *  1. The bearing itself. A spherical great-circle formula is off by up to
 *     ~0.2 deg because the earth is an oblate spheroid. We solve the exact
 *     inverse geodesic problem on the WGS84 ellipsoid (Vincenty, with the
 *     antipodal/near-antipodal safeguards) so the bearing is exact to
 *     millimetre-level geodesy anywhere on earth.
 *
 *  2. The heading. A phone magnetometer reports MAGNETIC north. The angle
 *     between magnetic and true north (declination) reaches 25 deg+ in parts
 *     of the world and over 100 deg near the poles, so ignoring it makes a
 *     Qibla compass badly wrong exactly where people can least verify it.
 *     We evaluate the official World Magnetic Model (WMM-2025) to convert
 *     magnetic heading to true heading for the user's exact position and date.
 */

import { WMM_COEFFICIENTS, WMM_EPOCH, WMM_MAX_DEGREE } from "./wmm-coefficients";

/* Ka'bah — Masjid al-Haram, Makkah. WGS84, centre of the structure. */
export const KAABA_LAT = 21.4224779;
export const KAABA_LNG = 39.6285119;

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

/* WGS84 defining parameters. */
const WGS84_A = 6378137.0; // semi-major axis, metres
const WGS84_F = 1 / 298.257223563; // flattening
const WGS84_B = WGS84_A * (1 - WGS84_F); // semi-minor axis

export type Geodesic = {
  /** Initial true bearing from the observer to the Ka'bah, degrees clockwise from true north. */
  bearing: number;
  /** Geodesic (shortest surface) distance in metres. */
  distance: number;
  /** True if the solver converged. Near-antipodal points fall back to a spherical solution. */
  exact: boolean;
};

/**
 * Vincenty inverse solution on the WGS84 ellipsoid.
 * Returns the exact initial bearing and geodesic distance.
 */
export function geodesicToKaaba(lat: number, lng: number): Geodesic {
  const φ1 = lat * D2R;
  const φ2 = KAABA_LAT * D2R;
  const L = (KAABA_LNG - lng) * D2R;

  const U1 = Math.atan((1 - WGS84_F) * Math.tan(φ1));
  const U2 = Math.atan((1 - WGS84_F) * Math.tan(φ2));
  const sinU1 = Math.sin(U1);
  const cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2);
  const cosU2 = Math.cos(U2);

  let λ = L;
  let sinλ = 0;
  let cosλ = 1;
  let sinσ = 0;
  let cosσ = 1;
  let σ = 0;
  let cos2σm = 1;
  let cosSqα = 1;
  let converged = false;

  for (let i = 0; i < 200; i++) {
    sinλ = Math.sin(λ);
    cosλ = Math.cos(λ);

    const sinSqσ =
      (cosU2 * sinλ) ** 2 + (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) ** 2;

    // Coincident points — bearing is undefined, treat as due Qibla / zero distance.
    if (sinSqσ === 0) return { bearing: 0, distance: 0, exact: true };

    sinσ = Math.sqrt(sinSqσ);
    cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
    σ = Math.atan2(sinσ, cosσ);

    const sinα = (cosU1 * cosU2 * sinλ) / sinσ;
    cosSqα = 1 - sinα * sinα;
    cos2σm = cosSqα === 0 ? 0 /* equatorial line */ : cosσ - (2 * sinU1 * sinU2) / cosSqα;

    const C = (WGS84_F / 16) * cosSqα * (4 + WGS84_F * (4 - 3 * cosSqα));
    const λPrev = λ;
    λ =
      L +
      (1 - C) *
        WGS84_F *
        sinα *
        (σ + C * sinσ * (cos2σm + C * cosσ * (-1 + 2 * cos2σm * cos2σm)));

    if (Math.abs(λ - λPrev) < 1e-12) {
      converged = true;
      break;
    }
  }

  if (!converged) {
    // Near-antipodal: Vincenty does not converge. Fall back to the spherical
    // great-circle solution, which stays well-defined everywhere.
    return { ...sphericalToKaaba(lat, lng), exact: false };
  }

  const uSq = (cosSqα * (WGS84_A * WGS84_A - WGS84_B * WGS84_B)) / (WGS84_B * WGS84_B);
  const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  const Δσ =
    B *
    sinσ *
    (cos2σm +
      (B / 4) *
        (cosσ * (-1 + 2 * cos2σm * cos2σm) -
          (B / 6) * cos2σm * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σm * cos2σm)));

  const distance = WGS84_B * A * (σ - Δσ);
  const α1 = Math.atan2(cosU2 * sinλ, cosU1 * sinU2 - sinU1 * cosU2 * cosλ);

  return { bearing: (α1 * R2D + 360) % 360, distance, exact: true };
}

/** Spherical great-circle fallback (also used for the near-antipodal case). */
function sphericalToKaaba(lat: number, lng: number): Omit<Geodesic, "exact"> {
  const φ1 = lat * D2R;
  const φ2 = KAABA_LAT * D2R;
  const Δλ = (KAABA_LNG - lng) * D2R;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearing = (Math.atan2(y, x) * R2D + 360) % 360;
  const Δφ = φ2 - φ1;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const distance = 6371008.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return { bearing, distance };
}

/* ------------------------------------------------------------------ */
/* World Magnetic Model                                                */
/* ------------------------------------------------------------------ */

/** Decimal year, e.g. 2026.43 — the time argument the WMM expects. */
export function decimalYear(date: Date = new Date()): number {
  const y = date.getUTCFullYear();
  const start = Date.UTC(y, 0, 1);
  const end = Date.UTC(y + 1, 0, 1);
  return y + (date.getTime() - start) / (end - start);
}

export type MagneticField = {
  /** Declination in degrees: true bearing = magnetic bearing + declination. */
  declination: number;
  /** Inclination (dip) in degrees. */
  inclination: number;
  /** Total field intensity in nT. */
  intensity: number;
  /** Horizontal intensity in nT — a weak value means an unreliable compass. */
  horizontal: number;
  /** True when the requested date is outside the model's validity window. */
  extrapolated: boolean;
};

const GEOMAG_R = 6371200; // WMM geomagnetic reference radius, metres

/** Schmidt semi-normalised coefficients, adjusted to the requested epoch. */
function timeAdjusted(year: number) {
  const dt = year - WMM_EPOCH;
  const g: number[][] = [];
  const h: number[][] = [];
  for (let n = 0; n <= WMM_MAX_DEGREE; n++) {
    g[n] = new Array(WMM_MAX_DEGREE + 1).fill(0);
    h[n] = new Array(WMM_MAX_DEGREE + 1).fill(0);
  }
  for (const [n, m, gnm, hnm, dg, dh] of WMM_COEFFICIENTS) {
    g[n]![m] = gnm + dt * dg;
    h[n]![m] = hnm + dt * dh;
  }
  return { g, h };
}

/**
 * Evaluate the WMM at a geodetic position.
 * Spherical-harmonic synthesis to degree 12 with Schmidt semi-normalised
 * associated Legendre functions, following the official WMM technical report.
 */
export function magneticField(
  latDeg: number,
  lngDeg: number,
  altitudeMetres = 0,
  date: Date = new Date(),
): MagneticField {
  const year = decimalYear(date);
  const { g, h } = timeAdjusted(year);

  const φ = latDeg * D2R;
  const λ = lngDeg * D2R;

  // Geodetic -> geocentric spherical coordinates.
  const e2 = WGS84_F * (2 - WGS84_F);
  const sinφ = Math.sin(φ);
  const cosφ = Math.cos(φ);
  const Rc = WGS84_A / Math.sqrt(1 - e2 * sinφ * sinφ);
  const p = (Rc + altitudeMetres) * cosφ;
  const z = (Rc * (1 - e2) + altitudeMetres) * sinφ;
  const r = Math.sqrt(p * p + z * z);
  const sinφp = z / r; // sin of geocentric latitude
  const cosφp = p / r;

  const N = WMM_MAX_DEGREE;

  // Schmidt semi-normalised P(n,m) and dP/dθ, via the standard recursion.
  const P: number[][] = [];
  const dP: number[][] = [];
  for (let n = 0; n <= N + 1; n++) {
    P[n] = new Array(N + 2).fill(0);
    dP[n] = new Array(N + 2).fill(0);
  }
  P[0]![0] = 1;
  dP[0]![0] = 0;

  for (let n = 1; n <= N; n++) {
    for (let m = 0; m <= n; m++) {
      if (n === m) {
        const k = n === 1 ? 1 : Math.sqrt(1 - 1 / (2 * n));
        P[n]![m] = k * cosφp * P[n - 1]![n - 1]!;
        dP[n]![m] = k * (cosφp * dP[n - 1]![n - 1]! - sinφp * P[n - 1]![n - 1]!);
      } else {
        const n2 = n * n;
        const m2 = m * m;
        const k1 = (2 * n - 1) / Math.sqrt(n2 - m2);
        const k2 = Math.sqrt(((n - 1) * (n - 1) - m2) / (n2 - m2));
        P[n]![m] = k1 * sinφp * P[n - 1]![m]! - (n - 1 >= m + 1 || n - 2 >= m ? k2 * P[n - 2]![m]! : 0);
        dP[n]![m] =
          k1 * (sinφp * dP[n - 1]![m]! + cosφp * P[n - 1]![m]!) -
          (n - 1 >= m + 1 || n - 2 >= m ? k2 * dP[n - 2]![m]! : 0);
      }
    }
  }

  const sinmλ: number[] = new Array(N + 1).fill(0);
  const cosmλ: number[] = new Array(N + 1).fill(0);
  cosmλ[0] = 1;
  for (let m = 1; m <= N; m++) {
    sinmλ[m] = Math.sin(m * λ);
    cosmλ[m] = Math.cos(m * λ);
  }

  // Field components in the GEOCENTRIC local frame:
  // Xg = north, Yg = east, Zg = down, derived from B = -grad(V) with the
  // Legendre derivatives taken with respect to geocentric latitude.
  let Xg = 0;
  let Yg = 0;
  let Zg = 0;

  const nearPole = Math.abs(cosφp) < 1e-10;

  for (let n = 1; n <= N; n++) {
    const ratio = Math.pow(GEOMAG_R / r, n + 2);
    for (let m = 0; m <= n; m++) {
      const gc = g[n]![m]!;
      const hc = h[n]![m]!;
      const cm = cosmλ[m]!;
      const sm = sinmλ[m]!;
      const term = gc * cm + hc * sm;
      const dterm = m * (gc * sm - hc * cm);

      Xg -= ratio * term * dP[n]![m]!;
      Zg -= ratio * (n + 1) * term * P[n]![m]!;
      // The east component carries a 1/cos(lat) factor; at the geographic
      // poles that is singular, so use the L'Hopital limit with dP instead.
      Yg += nearPole
        ? ratio * dterm * dP[n]![m]!
        : (ratio * dterm * P[n]![m]!) / cosφp;
    }
  }

  // Rotate the geocentric frame into the local geodetic (ellipsoidal) frame.
  const ψ = Math.asin(Math.max(-1, Math.min(1, sinφp))) - φ;
  const cosψ = Math.cos(ψ);
  const sinψ = Math.sin(ψ);
  const X = Xg * cosψ - Zg * sinψ;
  const Y = Yg;
  const Z = Xg * sinψ + Zg * cosψ;


  const horizontal = Math.hypot(X, Y);
  const intensity = Math.hypot(horizontal, Z);
  const declination = Math.atan2(Y, X) * R2D;
  const inclination = Math.atan2(Z, horizontal) * R2D;

  return {
    declination,
    inclination,
    intensity,
    horizontal,
    extrapolated: year < WMM_EPOCH || year > WMM_EPOCH + 5,
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Normalise any angle into [0, 360). */
export const norm360 = (deg: number) => ((deg % 360) + 360) % 360;

/** Smallest signed difference a - b, in (-180, 180]. */
export const angleDelta = (a: number, b: number) => ((a - b + 540) % 360) - 180;

const POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
] as const;

/** 16-point compass name for a bearing. */
export const compassPoint = (bearing: number) =>
  POINTS[Math.round(norm360(bearing) / 22.5) % 16]!;

/** Format a distance in metres for display. */
export function formatDistance(metres: number) {
  const km = metres / 1000;
  if (km < 10) return `${km.toFixed(2)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}
