/* ---------------------------------------------------------------------------
 * KATHA · Bookmarks — persistence layer
 * lib/bookmarks.ts
 *
 * The ONLY responsibilities here: persist, validate, migrate, and add / remove /
 * look up bookmarks in localStorage under "katha:bookmarks". A bookmark is a
 * ReadingLocation plus a deterministic id and a createdAt timestamp.
 *
 * Identity (and de-dupe key) is the deterministic id
 * `${bookSlug}:${chapterSlug}:${paragraphIndex}` — one bookmark per paragraph.
 *
 * This layer is intentionally INDEPENDENT of book content (lib/books.ts): no
 * chapter ordering, grouping, preview fallback, or reading-order sorting lives
 * here. Those are content-aware concerns and live in lib/bookmark-selectors.ts.
 * Keeping persistence pure means it can move to an API / cloud sync unchanged.
 *
 * SSR-safe: every accessor no-ops (returns [] / does nothing) without a window.
 * ------------------------------------------------------------------------- */

import type {
  ReadingLocation,
  ReadingLocationIdentity,
} from './reading-location';
import { withParagraphAnchor } from './reading-location';

export interface Bookmark extends ReadingLocation {
  /** Deterministic: `${bookSlug}:${chapterSlug}:${paragraphIndex}`. */
  id: string;
  /** ISO timestamp of when the bookmark was created. */
  createdAt: string;
}

export const BOOKMARKS_STORAGE_KEY = 'katha:bookmarks';

/* ── Identity ────────────────────────────────────────────────────────────── */

/** The deterministic id / de-dupe key for a location. */
export function bookmarkId(location: ReadingLocationIdentity): string {
  return `${location.bookSlug}:${location.chapterSlug}:${location.paragraphIndex}`;
}

/* ── Validation ──────────────────────────────────────────────────────────── */

function isBookmark(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b.id === 'string' &&
    typeof b.bookSlug === 'string' &&
    typeof b.bookTitle === 'string' &&
    typeof b.chapterSlug === 'string' &&
    typeof b.chapterTitle === 'string' &&
    typeof b.paragraphIndex === 'number' &&
    typeof b.preview === 'string' &&
    typeof b.href === 'string' &&
    typeof b.createdAt === 'string'
  );
}

/* ── Migration (legacy chapter bookmarks → paragraph-0 location bookmarks) ─── */
/* Legacy shape (pre-2.1): { bookSlug, bookTitle, chapterSlug, chapterTitle,
 * chapterNumber, href, bookmarkedAt }. We upgrade in place: paragraph 0, empty
 * preview (the selector layer fills a fallback from book content at render),
 * createdAt <- bookmarkedAt, id from the triple, href gains the #p-0 anchor.
 * No book-content lookups happen here — this stays a pure transform.          */

interface LegacyBookmark {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  href: string;
  bookmarkedAt: string;
}

function isLegacyBookmark(value: unknown): value is LegacyBookmark {
  if (!value || typeof value !== 'object') return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b.bookSlug === 'string' &&
    typeof b.bookTitle === 'string' &&
    typeof b.chapterSlug === 'string' &&
    typeof b.chapterTitle === 'string' &&
    typeof b.href === 'string' &&
    typeof b.bookmarkedAt === 'string' &&
    // The new shape is distinguished by a numeric paragraphIndex; its absence
    // marks this as a legacy record.
    typeof b.paragraphIndex !== 'number'
  );
}

function migrateLegacyBookmark(legacy: LegacyBookmark): Bookmark {
  const paragraphIndex = 0;
  return {
    id: bookmarkId({
      bookSlug: legacy.bookSlug,
      chapterSlug: legacy.chapterSlug,
      paragraphIndex,
    }),
    bookSlug: legacy.bookSlug,
    bookTitle: legacy.bookTitle,
    chapterSlug: legacy.chapterSlug,
    chapterTitle: legacy.chapterTitle,
    paragraphIndex,
    preview: '',
    href: withParagraphAnchor(legacy.href, paragraphIndex),
    createdAt: legacy.bookmarkedAt,
  };
}

/** Normalize any stored value into a Bookmark, or null if unusable. Returns the
 *  SAME reference when already valid, so callers can detect whether a rewrite
 *  is needed. */
function normalize(value: unknown): Bookmark | null {
  if (isBookmark(value)) return value;
  if (isLegacyBookmark(value)) return migrateLegacyBookmark(value);
  return null;
}

/* ── Read / write ────────────────────────────────────────────────────────── */

/** All saved bookmarks (newest first). Migrates legacy records on read, drops
 *  garbage and duplicates, and writes the upgraded list back once. Returns []
 *  on the server. */
export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    let changed = false;
    const bookmarks: Bookmark[] = [];

    for (const item of parsed) {
      const bookmark = normalize(item);
      if (!bookmark) {
        changed = true; // dropped unrecognizable entry
        continue;
      }
      if (bookmark !== item) changed = true; // migrated from legacy
      if (seen.has(bookmark.id)) {
        changed = true; // dropped duplicate id
        continue;
      }
      seen.add(bookmark.id);
      bookmarks.push(bookmark);
    }

    if (changed) saveBookmarks(bookmarks); // persist the upgrade / cleanup once
    return bookmarks;
  } catch {
    return [];
  }
}

/** Persist the full list. No-op on the server / when storage is unavailable. */
export function saveBookmarks(bookmarks: Bookmark[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      BOOKMARKS_STORAGE_KEY,
      JSON.stringify(bookmarks),
    );
  } catch {
    // Storage unavailable (private mode, disabled, quota) — best-effort.
  }
}

/* ── Lookups ─────────────────────────────────────────────────────────────── */

/** Is this exact location bookmarked? Pass a list to avoid re-reading storage. */
export function isBookmarked(
  location: ReadingLocationIdentity,
  bookmarks: Bookmark[] = getBookmarks(),
): boolean {
  const id = bookmarkId(location);
  return bookmarks.some((b) => b.id === id);
}

/* ── Mutations ───────────────────────────────────────────────────────────── */

/** Add a bookmark for a location (id + createdAt stamped here). De-duped by id:
 *  if the location is already bookmarked, the list is returned unchanged. */
export function addBookmark(
  location: ReadingLocation,
  bookmarks: Bookmark[] = getBookmarks(),
): Bookmark[] {
  const id = bookmarkId(location);
  if (bookmarks.some((b) => b.id === id)) return bookmarks;
  const bookmark: Bookmark = {
    ...location,
    id,
    createdAt: new Date().toISOString(),
  };
  const next = [bookmark, ...bookmarks];
  saveBookmarks(next);
  return next;
}

/** Remove a bookmark by location (or by its id). Returns the updated list. */
export function removeBookmark(
  target: ReadingLocationIdentity | string,
  bookmarks: Bookmark[] = getBookmarks(),
): Bookmark[] {
  const id = typeof target === 'string' ? target : bookmarkId(target);
  const next = bookmarks.filter((b) => b.id !== id);
  saveBookmarks(next);
  return next;
}

/** Convenience: add the location if absent, remove it if present. Built on
 *  add/remove. Used by the toolbar toggle (which marks paragraph 0 for now). */
export function toggleBookmark(location: ReadingLocation): Bookmark[] {
  const current = getBookmarks();
  return isBookmarked(location, current)
    ? removeBookmark(location, current)
    : addBookmark(location, current);
}