/**
 * Prayer Guide data — the full rak'ah structure of every daily prayer,
 * in the order they are performed.
 */

import type { PrayerName } from "./salah-log";

export type RakahKind = "sunnah-m" | "sunnah-g" | "fard" | "nafl" | "witr";

export type RakahUnit = {
  /** stable id used for saved progress */
  id: string;
  kind: RakahKind;
  /** number of rak'ah in this set */
  count: number;
  /** required to mark the prayer completed */
  required: boolean;
};

export type PrayerBlueprint = {
  prayer: PrayerName;
  arabic: string;
  note: string;
  units: RakahUnit[];
};

export const KIND_META: Record<
  RakahKind,
  { label: string; short: string; explain: string; optional?: boolean }
> = {
  "sunnah-m": {
    label: "Sunnah Mu'akkadah",
    short: "Sunnah",
    explain:
      "Emphasised sunnah — the Prophet ﷺ prayed these regularly and rarely left them. Highly rewarding, though not obligatory.",
  },
  "sunnah-g": {
    label: "Sunnah Ghair Mu'akkadah",
    short: "Sunnah (optional)",
    explain:
      "Non-emphasised sunnah — the Prophet ﷺ prayed these sometimes. A beautiful extra, and no blame for leaving them.",
    optional: true,
  },
  fard: {
    label: "Fard",
    short: "Fard",
    explain: "Obligatory. These rak'ah must be prayed — the prayer is not complete without them.",
  },
  nafl: {
    label: "Nafl",
    short: "Nafl (optional)",
    explain: "Voluntary rak'ah offered purely for extra reward and closeness to Allah.",
    optional: true,
  },
  witr: {
    label: "Witr",
    short: "Witr",
    explain:
      "Prayed after Isha in an odd number of rak'ah, with Dua-e-Qunoot in the last rak'ah. Wajib in the Hanafi school.",
  },
};

/** roughly how long one rak'ah takes, in minutes */
const MINUTES_PER_RAKAH = 1.5;

export const estimateMinutes = (units: RakahUnit[]) =>
  Math.max(1, Math.round(units.reduce((s, u) => s + u.count, 0) * MINUTES_PER_RAKAH));

export const PRAYER_BLUEPRINTS: PrayerBlueprint[] = [
  {
    prayer: "Fajr",
    arabic: "الفجر",
    note: "The two sunnah of Fajr are the most emphasised of all voluntary prayers.",
    units: [
      { id: "fajr-sm", kind: "sunnah-m", count: 2, required: false },
      { id: "fajr-fard", kind: "fard", count: 2, required: true },
    ],
  },
  {
    prayer: "Dhuhr",
    arabic: "الظهر",
    note: "On Friday, Dhuhr is replaced by Jumu'ah for those attending the masjid.",
    units: [
      { id: "dhuhr-sm1", kind: "sunnah-m", count: 4, required: false },
      { id: "dhuhr-fard", kind: "fard", count: 4, required: true },
      { id: "dhuhr-sm2", kind: "sunnah-m", count: 2, required: false },
      { id: "dhuhr-nafl", kind: "nafl", count: 2, required: false },
    ],
  },
  {
    prayer: "Asr",
    arabic: "العصر",
    note: "No voluntary prayer is offered after Asr until Maghrib.",
    units: [
      { id: "asr-sg", kind: "sunnah-g", count: 4, required: false },
      { id: "asr-fard", kind: "fard", count: 4, required: true },
    ],
  },
  {
    prayer: "Maghrib",
    arabic: "المغرب",
    note: "Six extra nafl rak'ah after Maghrib are known as Salatul Awwabeen.",
    units: [
      { id: "maghrib-fard", kind: "fard", count: 3, required: true },
      { id: "maghrib-sm", kind: "sunnah-m", count: 2, required: false },
      { id: "maghrib-nafl", kind: "nafl", count: 2, required: false },
    ],
  },
  {
    prayer: "Isha",
    arabic: "العشاء",
    note: "Witr closes the day — never sleep before praying it.",
    units: [
      { id: "isha-sg", kind: "sunnah-g", count: 4, required: false },
      { id: "isha-fard", kind: "fard", count: 4, required: true },
      { id: "isha-sm", kind: "sunnah-m", count: 2, required: false },
      { id: "isha-nafl", kind: "nafl", count: 2, required: false },
      { id: "isha-witr", kind: "witr", count: 3, required: true },
    ],
  },
];

export const blueprintFor = (prayer: PrayerName) =>
  PRAYER_BLUEPRINTS.find((b) => b.prayer === prayer) ?? PRAYER_BLUEPRINTS[0]!;

/** every individual rak'ah of a unit, e.g. "fajr-fard#1" */
export const rakahIds = (unit: RakahUnit) => Array.from({ length: unit.count }, (_, i) => `${unit.id}#${i + 1}`);

export const requiredRakahIds = (units: RakahUnit[]) => units.filter((u) => u.required).flatMap(rakahIds);

export const allRakahIds = (units: RakahUnit[]) => units.flatMap(rakahIds);
