/* ---------------------------------------------------------------------------
 * KATHA · Reading History — persistence layer
 * lib/history.ts
 *
 * Records where the reader has been. Mirrors lib/bookmarks.ts intentionally:
 * the same ReadingLocation model, the same SSR-safe accessors, and the same
 * "pure persistence" boundary — it just answers a different question ("what
 * have I read, most recent first?" rather than "what have I marked?").
 *
 * A history entry is a ReadingLocation plus a deterministic id and a visitedAt
 * timestamp. Identity (and de-dupe key) is the deterministic id
 * `${bookSlug}:${chapterSlug}:${paragraphIndex}` — one entry per location, and
 * the most recent visit wins. The list is newest-first and capped at
 * HISTORY_LIMIT; older visits fall off the end.
 *
 * Like the bookmark store, this layer is INDEPENDENT of book content
 * (lib/books.ts): no chapter ordering, grouping, or preview fallback lives here
 * — those content-aware concerns belong in a selector layer. Keeping
 * persistence pure means it can move to an API / cloud sync unchanged.
 *
 * SSR-safe: every accessor no-ops (returns [] / does nothing) without a window.
 * ------------------------------------------------------------------------- */

import type {
  ReadingLocation,
  ReadingLocationIdentity,
} from './reading-location';

export interface HistoryEntry extends ReadingLocation {
  /** Deterministic: `${bookSlug}:${chapterSlug}:${paragraphIndex}`. */
  id: string;
  /** ISO timestamp of the most recent visit to this location. */
  visitedAt: string;
}

export const HISTORY_STORAGE_KEY = 'katha:reading-history';

/** Maximum number of entries retained; older visits fall off the end. */
export const HISTORY_LIMIT = 100;

/* ── Identity ────────────────────────────────────────────────────────────── */

/** The deterministic id / de-dupe key for a location. */
export function historyEntryId(location: ReadingLocationIdentity): string {
  return `${location.bookSlug}:${location.chapterSlug}:${location.paragraphIndex}`;
}

/* ── Validation ──────────────────────────────────────────────────────────── */

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.bookSlug === 'string' &&
    typeof e.bookTitle === 'string' &&
    typeof e.chapterSlug === 'string' &&
    typeof e.chapterTitle === 'string' &&
    typeof e.paragraphIndex === 'number' &&
    typeof e.preview === 'string' &&
    typeof e.href === 'string' &&
    typeof e.visitedAt === 'string'
  );
}

/* ── Read / write ────────────────────────────────────────────────────────── */

/** All history entries, newest first. Drops unrecognizable entries, de-dupes by
 *  id (keeping the newest occurrence, since the list is newest-first), enforces
 *  the cap, and writes the cleaned list back once if anything changed. Returns
 *  [] on the server. */
export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    let changed = false;
    const entries: HistoryEntry[] = [];

    for (const item of parsed) {
      if (!isHistoryEntry(item)) {
        changed = true; // dropped unrecognizable entry
        continue;
      }
      if (seen.has(item.id)) {
        changed = true; // dropped older duplicate
        continue;
      }
      seen.add(item.id);
      entries.push(item);
    }

    if (entries.length > HISTORY_LIMIT) {
      entries.length = HISTORY_LIMIT; // enforce the cap
      changed = true;
    }

    if (changed) saveHistory(entries); // persist the cleanup once
    return entries;
  } catch {
    return [];
  }
}

/** Persist the full list. No-op on the server / when storage is unavailable. */
export function saveHistory(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable (private mode, disabled, quota) — best-effort.
  }
}

/* ── Lookups ─────────────────────────────────────────────────────────────── */

/** Is this location already in history? Pass a list to avoid re-reading. */
export function isInHistory(
  location: ReadingLocationIdentity,
  entries: HistoryEntry[] = getHistory(),
): boolean {
  const id = historyEntryId(location);
  return entries.some((e) => e.id === id);
}

/* ── Mutations ───────────────────────────────────────────────────────────── */

/** Record a visit to a location. De-dupes by id (any previous visit to the same
 *  location is removed), prepends a fresh entry with the current timestamp so
 *  the list stays newest-first, then enforces the cap. Returns the updated list. */
export function recordVisit(
  location: ReadingLocation,
  entries: HistoryEntry[] = getHistory(),
): HistoryEntry[] {
  const id = historyEntryId(location);
  const entry: HistoryEntry = {
    ...location,
    id,
    visitedAt: new Date().toISOString(),
  };
  const next = [entry, ...entries.filter((e) => e.id !== id)];
  if (next.length > HISTORY_LIMIT) next.length = HISTORY_LIMIT;
  saveHistory(next);
  return next;
}

/** Remove a single entry by location (or by its id). Returns the updated list. */
export function removeHistoryEntry(
  target: ReadingLocationIdentity | string,
  entries: HistoryEntry[] = getHistory(),
): HistoryEntry[] {
  const id = typeof target === 'string' ? target : historyEntryId(target);
  const next = entries.filter((e) => e.id !== id);
  saveHistory(next);
  return next;
}

/** Clear all history. */
export function clearHistory(): void {
  saveHistory([]);
}