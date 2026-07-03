/* ---------------------------------------------------------------------------
 * KATHA · Recent searches — persistence layer
 * lib/recent-searches.ts
 *
 * Remembers what the reader has searched for. Mirrors lib/bookmarks.ts /
 * lib/history.ts intentionally: the same SSR-safe accessors, the same
 * validate-clean-write-back read, and the same "pure persistence" boundary —
 * no knowledge of the catalogue or of how matching works.
 *
 * A recent search is the query string plus a searchedAt timestamp. Identity
 * (and de-dupe key) is the case/diacritic-folded query — repeating a search
 * moves it to the front rather than duplicating it. The list is newest-first
 * and capped at RECENT_SEARCHES_LIMIT.
 *
 * SSR-safe: every accessor no-ops (returns [] / does nothing) without a window.
 * ------------------------------------------------------------------------- */

import { foldText } from './text';

export interface RecentSearch {
  query: string;
  /** ISO timestamp of the most recent time this was searched. */
  searchedAt: string;
}

export const RECENT_SEARCHES_STORAGE_KEY = 'katha:recent-searches';

/** Maximum number of entries retained; older searches fall off the end. */
export const RECENT_SEARCHES_LIMIT = 8;

/** Longest query worth remembering; anything larger is truncated on save. */
const MAX_QUERY_LENGTH = 120;

/* ── Identity ────────────────────────────────────────────────────────────── */

/** The de-dupe key for a query (case- and diacritic-insensitive). */
function searchKey(query: string): string {
  return foldText(query.trim());
}

/* ── Validation ──────────────────────────────────────────────────────────── */

function isRecentSearch(value: unknown): value is RecentSearch {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.query === 'string' &&
    s.query.trim().length > 0 &&
    typeof s.searchedAt === 'string'
  );
}

/* ── Read / write ────────────────────────────────────────────────────────── */

/** All recent searches, newest first. Drops unrecognizable entries, de-dupes
 *  by folded query (keeping the newest occurrence, since the list is
 *  newest-first), enforces the cap, and writes the cleaned list back once if
 *  anything changed. Returns [] on the server. */
export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    let changed = false;
    const searches: RecentSearch[] = [];

    for (const item of parsed) {
      if (!isRecentSearch(item)) {
        changed = true; // dropped unrecognizable entry
        continue;
      }
      const key = searchKey(item.query);
      if (seen.has(key)) {
        changed = true; // dropped older duplicate
        continue;
      }
      seen.add(key);
      searches.push(item);
    }

    if (searches.length > RECENT_SEARCHES_LIMIT) {
      searches.length = RECENT_SEARCHES_LIMIT; // enforce the cap
      changed = true;
    }

    if (changed) saveRecentSearches(searches); // persist the cleanup once
    return searches;
  } catch {
    return [];
  }
}

/** Persist the full list. No-op on the server / when storage is unavailable. */
export function saveRecentSearches(searches: RecentSearch[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(searches),
    );
  } catch {
    // Storage unavailable (private mode, disabled, quota) — best-effort.
  }
}

/* ── Mutations ───────────────────────────────────────────────────────────── */

/** Record a committed search. Ignores empty queries; de-dupes by folded query
 *  (any previous occurrence moves to the front with a fresh timestamp), then
 *  enforces the cap. Returns the updated list. */
export function addRecentSearch(
  query: string,
  searches: RecentSearch[] = getRecentSearches(),
): RecentSearch[] {
  const trimmed = query.trim().slice(0, MAX_QUERY_LENGTH);
  if (!trimmed) return searches;

  const key = searchKey(trimmed);
  const entry: RecentSearch = {
    query: trimmed,
    searchedAt: new Date().toISOString(),
  };
  const next = [
    entry,
    ...searches.filter((s) => searchKey(s.query) !== key),
  ];
  if (next.length > RECENT_SEARCHES_LIMIT) next.length = RECENT_SEARCHES_LIMIT;
  saveRecentSearches(next);
  return next;
}

/** Remove a single entry by its query. Returns the updated list. */
export function removeRecentSearch(
  query: string,
  searches: RecentSearch[] = getRecentSearches(),
): RecentSearch[] {
  const key = searchKey(query);
  const next = searches.filter((s) => searchKey(s.query) !== key);
  saveRecentSearches(next);
  return next;
}

/** Clear all recent searches. */
export function clearRecentSearches(): void {
  saveRecentSearches([]);
}
