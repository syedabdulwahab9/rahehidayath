/**
 * Device-only app state.
 *
 * Everything the admin panel edits — website text, custom content and the
 * visibility switches — is stored in *this browser only*. It is never written
 * to the database and never shared with other visitors, but it survives a
 * reload, a closed tab and a restart, so the person who made the change always
 * sees their own version of the site.
 */

import { readDeviceState, subscribeDeviceState, writeDeviceState } from "./device-state";

export type AppStateKey =
  | "site"
  | "content"
  | "flags"
  | "seo"
  | "announcements"
  | "media"
  | "prayer";

/** Reads this device's copy. Returns null when there is nothing saved yet. */
export async function fetchAppState<T>(key: AppStateKey): Promise<T | null> {
  return readDeviceState<T>(key);
}

/** Saves an admin change to this device only. */
export async function pushAppState(key: AppStateKey, data: unknown) {
  writeDeviceState(key, data);
}

/** Notifies this device (and its other tabs) when a section changes. */
export function subscribeAppState<T>(key: AppStateKey, onChange: (data: T) => void) {
  return subscribeDeviceState(key, () => {
    const value = readDeviceState<T>(key);
    if (value !== null) onChange(value);
  });
}
