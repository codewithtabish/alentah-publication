// src/lib/newsletter/subscriber-memory.ts
// ============================================================
// Subscriber memory — ALENTAH
// Remembers which emails have already subscribed on this browser.
//
// Uses localStorage so it persists across:
//   - Page reloads
//   - Tab close / reopen
//   - Same-browser navigation
//
// Does NOT persist across:
//   - Different browsers
//   - Different devices
//   - Private / incognito windows
//
// This is a UX layer, not a security layer. The real dedupe
// happens server-side (Prisma unique constraint + Resend).
// ============================================================

const STORAGE_KEY = "alentah.newsletter.subscribed";

// How long the "already subscribed" memory lasts.
// 30 days is a good balance — long enough that people don't
// get nagged, short enough that a stale state clears itself.
const MEMORY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type SubscriberMap = Record<string, number>; // { [email]: timestamp }

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readMap(): SubscriberMap {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SubscriberMap;
    if (!parsed || typeof parsed !== "object") return {};

    // Prune expired entries
    const now = Date.now();
    const fresh: SubscriberMap = {};
    for (const [email, ts] of Object.entries(parsed)) {
      if (typeof ts === "number" && now - ts < MEMORY_TTL_MS) {
        fresh[email] = ts;
      }
    }
    return fresh;
  } catch {
    return {};
  }
}

function writeMap(map: SubscriberMap): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota or disabled — ignore */
  }
}

/** Normalize an email so lookups always match. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Has this browser already subscribed this email? */
export function hasSubscribed(email: string): boolean {
  const key = normalizeEmail(email);
  if (!key) return false;
  const map = readMap();
  return key in map;
}

/** Remember that this email subscribed on this browser. */
export function rememberSubscribed(email: string): void {
  const key = normalizeEmail(email);
  if (!key) return;
  const map = readMap();
  map[key] = Date.now();
  writeMap(map);
}

/** Has ANY email subscribed on this browser? */
export function hasAnySubscription(): boolean {
  const map = readMap();
  return Object.keys(map).length > 0;
}

/** Forget a single email (e.g. after unsubscribe). */
export function forgetSubscribed(email: string): void {
  const key = normalizeEmail(email);
  if (!key) return;
  const map = readMap();
  delete map[key];
  writeMap(map);
}