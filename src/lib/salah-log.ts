/**
 * Salah log store.
 *
 * Single source of truth for prayer completion, statuses, and rak'ah progress.
 * Everything is persisted to localStorage so nothing is lost on refresh, and the
 * legacy `reh-salah-tracker` shape is preserved so existing backups and the
 * month calendar keep working exactly as before.
 */

import { useSyncExternalStore } from "react";

export const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerName = (typeof PRAYERS)[number];

export type PrayerStatus = "upcoming" | "pending" | "prayed" | "missed";

export type PrayerMeta = { status: "prayed" | "missed"; at?: string };
/** day (YYYY-MM-DD) -> prayer -> meta */
export type MetaLog = Record<string, Partial<Record<PrayerName, PrayerMeta>>>;
/** `${day}|${prayer}` -> completed rak'ah unit ids */
export type RakahLog = Record<string, string[]>;

const LOG_KEY = "reh-salah-tracker"; // legacy: day -> prayer names
const META_KEY = "reh-salah-meta"; // day -> prayer -> { status, at }
const RAKAH_KEY = "reh-salah-rakah"; // day|prayer -> unit ids

export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const todayIso = () => iso(new Date());

export type SalahState = { log: Record<string, string[]>; meta: MetaLog; rakah: RakahLog };

const EMPTY: SalahState = { log: {}, meta: {}, rakah: {} };

let state: SalahState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = {
    log: readJson<Record<string, string[]>>(LOG_KEY, {}),
    meta: readJson<MetaLog>(META_KEY, {}),
    rakah: readJson<RakahLog>(RAKAH_KEY, {}),
  };
  emit();
}

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: SalahState) {
  state = next;
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(next.log));
    localStorage.setItem(META_KEY, JSON.stringify(next.meta));
    localStorage.setItem(RAKAH_KEY, JSON.stringify(next.rakah));
  } catch {
    /* storage full or blocked — keep working in memory */
  }
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LOG_KEY || e.key === META_KEY || e.key === RAKAH_KEY) {
      hydrated = false;
      hydrate();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/* ---------------- mutations ---------------- */

export function markPrayed(day: string, prayer: PrayerName, at = new Date()) {
  const list = state.log[day] ?? [];
  const log = { ...state.log, [day]: list.includes(prayer) ? list : [...list, prayer] };
  const meta: MetaLog = {
    ...state.meta,
    [day]: { ...(state.meta[day] ?? {}), [prayer]: { status: "prayed", at: at.toISOString() } },
  };
  persist({ ...state, log, meta });
}

export function markMissed(day: string, prayer: PrayerName) {
  const already = state.meta[day]?.[prayer];
  if (already?.status === "missed" || already?.status === "prayed") return;
  const meta: MetaLog = {
    ...state.meta,
    [day]: { ...(state.meta[day] ?? {}), [prayer]: { status: "missed" } },
  };
  persist({ ...state, meta });
}

export function clearPrayer(day: string, prayer: PrayerName) {
  const log = { ...state.log, [day]: (state.log[day] ?? []).filter((p) => p !== prayer) };
  const dayMeta = { ...(state.meta[day] ?? {}) };
  delete dayMeta[prayer];
  persist({ ...state, log, meta: { ...state.meta, [day]: dayMeta } });
}

export function togglePrayer(day: string, prayer: PrayerName) {
  if ((state.log[day] ?? []).includes(prayer)) clearPrayer(day, prayer);
  else markPrayed(day, prayer);
}

export function setRakah(day: string, prayer: PrayerName, unitIds: string[]) {
  persist({ ...state, rakah: { ...state.rakah, [`${day}|${prayer}`]: unitIds } });
}

export function toggleRakah(day: string, prayer: PrayerName, unitId: string) {
  const key = `${day}|${prayer}`;
  const current = state.rakah[key] ?? [];
  const next = current.includes(unitId) ? current.filter((u) => u !== unitId) : [...current, unitId];
  persist({ ...state, rakah: { ...state.rakah, [key]: next } });
}

export function replaceLog(log: Record<string, string[]>) {
  persist({ ...state, log });
}

/* ---------------- reads ---------------- */

export function getRakah(s: SalahState, day: string, prayer: PrayerName): string[] {
  return s.rakah[`${day}|${prayer}`] ?? [];
}

export function statusOf(
  s: SalahState,
  day: string,
  prayer: PrayerName,
  window?: { start: Date; end: Date },
): PrayerStatus {
  const meta = s.meta[day]?.[prayer];
  if (meta?.status === "prayed" || (s.log[day] ?? []).includes(prayer)) return "prayed";
  if (meta?.status === "missed") return "missed";
  if (!window) return day < todayIso() ? "missed" : "upcoming";
  const now = Date.now();
  if (now < window.start.getTime()) return "upcoming";
  if (now > window.end.getTime()) return "missed";
  return "pending";
}

export function useSalahLog(): SalahState {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrate();
      return state;
    },
    () => EMPTY,
  );
}
