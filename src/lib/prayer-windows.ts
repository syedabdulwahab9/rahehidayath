/**
 * Live prayer windows — turns the day's timings into start/end windows and
 * drives the countdown, automatic status changes and notifications.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Timings } from "./quran-api";
import { PRAYERS, iso, markMissed, statusOf, type PrayerName, type PrayerStatus, type SalahState } from "./salah-log";

export type PrayerWindow = { prayer: PrayerName; start: Date; end: Date };

const toDate = (day: Date, hhmm: string | undefined, fallback: string) => {
  const [h, m] = (hhmm ?? fallback).slice(0, 5).split(":");
  const d = new Date(day);
  d.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
  return d;
};

/** Fajr→Sunrise, Dhuhr→Asr, Asr→Maghrib, Maghrib→Isha, Isha→next Fajr. */
export function buildWindows(timings: Timings | undefined, day = new Date()): PrayerWindow[] {
  if (!timings) return [];
  const fajr = toDate(day, timings["Fajr"], "05:00");
  const sunrise = toDate(day, timings["Sunrise"], "06:20");
  const dhuhr = toDate(day, timings["Dhuhr"], "12:30");
  const asr = toDate(day, timings["Asr"], "16:00");
  const maghrib = toDate(day, timings["Maghrib"], "18:30");
  const isha = toDate(day, timings["Isha"], "20:00");
  const nextFajr = new Date(fajr);
  nextFajr.setDate(nextFajr.getDate() + 1);

  return [
    { prayer: "Fajr", start: fajr, end: sunrise },
    { prayer: "Dhuhr", start: dhuhr, end: asr },
    { prayer: "Asr", start: asr, end: maghrib },
    { prayer: "Maghrib", start: maghrib, end: isha },
    { prayer: "Isha", start: isha, end: nextFajr },
  ];
}

export const windowFor = (windows: PrayerWindow[], prayer: PrayerName) => windows.find((w) => w.prayer === prayer);

/** the prayer whose window contains "now" (or the next one that starts) */
export function currentWindow(windows: PrayerWindow[], now = Date.now()): PrayerWindow | undefined {
  return (
    windows.find((w) => now >= w.start.getTime() && now <= w.end.getTime()) ??
    windows.find((w) => now < w.start.getTime())
  );
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export const formatClock = (d: Date) =>
  d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** ticking clock, re-renders every `ms` */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

/* ---------------- notifications ---------------- */

const SENT_KEY = "reh-salah-notified";

function sentKeys(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function remember(keys: Set<string>) {
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify([...keys].slice(-60)));
  } catch {
    /* ignore */
  }
}

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

function send(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico", tag: title });
  } catch {
    /* ignore */
  }
}

const REMINDERS: Array<{ minutes: number; label: string }> = [
  { minutes: 30, label: "30 minutes" },
  { minutes: 10, label: "10 minutes" },
  { minutes: 5, label: "5 minutes" },
];

/**
 * Watches the day's windows: flips Pending → Missed automatically and sends
 * begin / 30 / 10 / 5 minute reminders plus a missed-prayer message. Never
 * repeats a notification.
 */
export function usePrayerWatcher(windows: PrayerWindow[], state: SalahState, enabled: boolean) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const windowsRef = useRef(windows);
  windowsRef.current = windows;

  useEffect(() => {
    if (!windows.length) return;
    const tick = () => {
      const now = Date.now();
      const day = iso(new Date());
      const keys = sentKeys();
      let changed = false;

      for (const w of windowsRef.current) {
        const status = statusOf(stateRef.current, day, w.prayer, w);
        if (status === "prayed") continue;

        // auto-miss once the window closes
        if (now > w.end.getTime()) {
          if (status !== "missed") markMissed(day, w.prayer);
          const key = `${day}|${w.prayer}|missed`;
          if (enabled && !keys.has(key)) {
            send(
              `${w.prayer} missed`,
              `You have missed ${w.prayer} prayer. May Allah make it easy for you to stay consistent.`,
            );
            keys.add(key);
            changed = true;
          }
          continue;
        }

        if (!enabled || now < w.start.getTime()) continue;

        const beginKey = `${day}|${w.prayer}|start`;
        if (!keys.has(beginKey)) {
          send(`${w.prayer} time has begun`, `It is now time for ${w.prayer}. Hayya 'ala as-salah.`);
          keys.add(beginKey);
          changed = true;
        }

        const left = w.end.getTime() - now;
        for (const r of REMINDERS) {
          const key = `${day}|${w.prayer}|${r.minutes}`;
          if (left <= r.minutes * 60_000 && left > 0 && !keys.has(key)) {
            send(`${w.prayer} ends in ${r.label}`, `Only ${r.label} left to pray ${w.prayer}.`);
            keys.add(key);
            changed = true;
          }
        }
      }

      if (changed) remember(keys);
    };

    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [windows, enabled]);
}

/** live statuses for today, recomputed on every tick */
export function useTodayStatuses(state: SalahState, windows: PrayerWindow[], now: number) {
  return useMemo(() => {
    const day = iso(new Date());
    return PRAYERS.map((prayer) => {
      const w = windowFor(windows, prayer);
      const status: PrayerStatus = statusOf(state, day, prayer, w);
      return { prayer, window: w, status, at: state.meta[day]?.[prayer]?.at };
    });
    // `now` intentionally drives recomputation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, windows, now]);
}
