/**
 * Device-only website state.
 *
 * Everything the admin panel edits is stored in *this browser*, on *this
 * device*, and nowhere else. Nothing is written to the database and nothing is
 * broadcast to other visitors — a change made here is visible only to the
 * person who made it, and it survives a reload, a tab close and a restart
 * because it lives in localStorage.
 */

import type { AppStateKey } from "./app-state";

const PREFIX = "rah.device.";
const EVENT = "rah-device-state";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function readDeviceState<T>(key: AppStateKey): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeDeviceState<T>(key: AppStateKey, value: T): string {
  const updatedAt = new Date().toISOString();
  if (!isBrowser()) return updatedAt;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.localStorage.setItem(`${PREFIX}${key}.updatedAt`, updatedAt);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
  } catch {
    /* Storage full or blocked — the draft simply stays in memory. */
  }
  return updatedAt;
}

export function clearDeviceState(key: AppStateKey) {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PREFIX + key);
  window.localStorage.removeItem(`${PREFIX}${key}.updatedAt`);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
}

/** Notifies every component on this device when a section is saved. */
export function subscribeDeviceState(key: AppStateKey, onChange: () => void) {
  if (!isBrowser()) return () => {};
  const local = (e: Event) => {
    const detail = (e as CustomEvent<{ key: string }>).detail;
    if (!detail || detail.key === key) onChange();
  };
  const cross = (e: StorageEvent) => {
    if (!e.key || e.key === PREFIX + key) onChange();
  };
  window.addEventListener(EVENT, local);
  window.addEventListener("storage", cross);
  return () => {
    window.removeEventListener(EVENT, local);
    window.removeEventListener("storage", cross);
  };
}
