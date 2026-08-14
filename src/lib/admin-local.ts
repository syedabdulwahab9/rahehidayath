/**
 * Browser-only administrator gate.
 *
 * There is no database and no server environment variable involved: the owner
 * chooses a username and password once, on their own device. The password is
 * never stored in plain text — only a salted SHA-256 digest lives in this
 * browser's localStorage. Every admin edit is already device-only, so the panel
 * (and everything changed inside it) belongs to this browser alone and survives
 * refreshes, closed tabs and restarts.
 */

const CRED_KEY = "rah.admin.credentials.v1";
const SESSION_KEY = "rah.admin.unlocked.v1";

type StoredCredentials = { user: string; salt: string; hash: string };

function ls(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function digest(salt: string, password: string) {
  const bytes = new TextEncoder().encode(`${salt}::${password}`);
  return toHex(await crypto.subtle.digest("SHA-256", bytes));
}

function readCredentials(): StoredCredentials | null {
  const store = ls();
  if (!store) return null;
  try {
    const raw = store.getItem(CRED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCredentials;
    return parsed && parsed.user && parsed.hash && parsed.salt ? parsed : null;
  } catch {
    return null;
  }
}

/** True once this browser has an owner account set up. */
export function hasAdminAccount() {
  return readCredentials() !== null;
}

/** True while this browser is signed in — remembered across refreshes. */
export function isAdminUnlocked() {
  const store = ls();
  return store?.getItem(SESSION_KEY) === "1" && hasAdminAccount();
}

/** Creates the one and only owner account for this browser. */
export async function createAdminAccount(username: string, password: string) {
  const store = ls();
  if (!store) return { ok: false as const, message: "This browser cannot store the admin account." };
  const user = username.trim().toLowerCase();
  if (user.length < 3) return { ok: false as const, message: "Choose a username of at least 3 characters." };
  if (password.length < 6) return { ok: false as const, message: "Choose a password of at least 6 characters." };

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const hash = await digest(salt, password);
  store.setItem(CRED_KEY, JSON.stringify({ user, salt, hash } satisfies StoredCredentials));
  store.setItem(SESSION_KEY, "1");
  return { ok: true as const };
}

/** Verifies the typed credentials against this browser's stored digest. */
export async function adminSignIn(username: string, password: string) {
  const stored = readCredentials();
  if (!stored) return { ok: false as const, message: "No administrator account exists on this browser yet." };
  const hash = await digest(stored.salt, password);
  const match = stored.user === username.trim().toLowerCase() && hash === stored.hash;
  /* Small constant delay so guesses cannot be hammered instantly. */
  await new Promise((r) => setTimeout(r, 350));
  if (!match) return { ok: false as const, message: "Incorrect username or password." };
  ls()?.setItem(SESSION_KEY, "1");
  return { ok: true as const };
}

/** Ends the session but keeps the account on this browser. */
export function adminSignOut() {
  ls()?.removeItem(SESSION_KEY);
}

/** Removes the account entirely from this browser. */
export function forgetAdminAccount() {
  const store = ls();
  store?.removeItem(CRED_KEY);
  store?.removeItem(SESSION_KEY);
}
