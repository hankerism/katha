/* ---------------------------------------------------------------------------
 * KATHA · History selectors (content-aware helpers)
 * lib/history-selectors.ts
 *
 * The content-aware companion to the pure persistence layer (lib/history.ts),
 * mirroring lib/bookmark-selectors.ts. It owns the HISTORY-specific concerns —
 * grouping and recency ordering — and builds on the shared location helpers in
 * lib/reading-location-selectors.ts (chapter number, preview resolution), which
 * it re-exports so the History UI imports everything from this one module.
 *
 * Kept separate on purpose: lib/history.ts stays a pure persistence layer, while
 * all book-content coupling lives in the selector layer. UI consumes selectors,
 * never lib/books.ts directly.
 * ------------------------------------------------------------------------- */

import { getBookBySlug } from './books';
import type { HistoryEntry } from './history';

// Shared, location-level helpers — re-exported so the History UI has a single
// import surface. Implementations live in reading-location-selectors.
export { getChapterNumber, resolvePreview } from './reading-location-selectors';

/** A book's worth of history entries (most-recently-visited first) plus the
 *  metadata the History page needs to render a group header and order groups. */
export interface HistoryGroup {
  bookSlug: string;
  bookTitle: string;
  /** True when the book is no longer present in lib/books.ts (orphaned). */
  isOrphan: boolean;
  /** Entries sorted newest-visited first. */
  entries: HistoryEntry[];
  /** The most recent visitedAt in the group — used to order the groups. */
  lastVisitedAt: string;
}

/** Parse an ISO timestamp to epoch milliseconds; unparseable → 0 (treated as
 *  oldest). Used so recency is compared numerically, not by string order. */
function toEpoch(iso: string): number {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? 0 : time;
}

/** Group history by book — each group most-recently-visited first, groups
 *  ordered by most-recent visit (newest first). Orphaned books sort last. This
 *  owns ordering, so it is robust regardless of the input list's order. */
export function groupHistoryByBook(entries: HistoryEntry[]): HistoryGroup[] {
  const byBook = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const list = byBook.get(entry.bookSlug);
    if (list) list.push(entry);
    else byBook.set(entry.bookSlug, [entry]);
  }

  const groups: HistoryGroup[] = [];
  for (const [bookSlug, list] of byBook) {
    const book = getBookBySlug(bookSlug);
    const sorted = [...list].sort(
      (a, b) => toEpoch(b.visitedAt) - toEpoch(a.visitedAt),
    );

    groups.push({
      bookSlug,
      bookTitle: book?.title ?? sorted[0]?.bookTitle ?? bookSlug,
      isOrphan: !book,
      entries: sorted,
      lastVisitedAt: sorted[0]?.visitedAt ?? '',
    });
  }

  // Present books by most-recent visit (numeric time); orphaned books last.
  return groups.sort((a, b) => {
    if (a.isOrphan !== b.isOrphan) return a.isOrphan ? 1 : -1;
    return toEpoch(b.lastVisitedAt) - toEpoch(a.lastVisitedAt);
  });
}