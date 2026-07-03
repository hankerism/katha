/* ---------------------------------------------------------------------------
 * KATHA · Bookmark selectors (content-aware helpers)
 * lib/bookmark-selectors.ts
 *
 * The content-aware companion to the pure persistence layer (lib/bookmarks.ts).
 * It owns the BOOKMARK-specific concerns — reading-order sorting and grouping —
 * and builds on the shared location helpers in lib/reading-location-selectors.ts
 * (chapter index/number, preview resolution), which it re-exports so the
 * Bookmarks UI imports everything bookmark-related from this one module.
 *
 * Kept separate on purpose: lib/bookmarks.ts stays a pure persistence layer
 * (safe to swap for an API / cloud sync), while all book-content coupling lives
 * in the selector layer. UI consumes selectors, never lib/books.ts directly.
 * ------------------------------------------------------------------------- */

import { getBookBySlug } from './books';
import { getChapterIndex } from './reading-location-selectors';
import type { Bookmark } from './bookmarks';

// Shared, location-level helpers — re-exported so the Bookmarks UI has a single
// import surface. Implementations live in reading-location-selectors.
export { getChapterNumber, resolvePreview } from './reading-location-selectors';

/** A book's worth of bookmarks, in reading order, plus the metadata the
 *  Bookmarks page needs to render a group header and order the groups. */
export interface BookmarkGroup {
  bookSlug: string;
  bookTitle: string;
  /** True when the book is no longer present in lib/books.ts (orphaned). */
  isOrphan: boolean;
  /** Bookmarks sorted by reading order: chapter index, then paragraph index. */
  bookmarks: Bookmark[];
  /** The most recent createdAt in the group — used to order the groups. */
  lastActivity: string;
}

/** Sort a flat bookmark list into reading order (chapter index → paragraph
 *  index). Orphaned chapters (index -1) sort to the end, then by paragraph.
 *
 *  Each chapter's order is resolved ONCE (memoized per book+chapter, then
 *  attached to each item) rather than recomputed inside the comparator — so the
 *  cost stays linear in getChapterIndex lookups as bookmark counts grow. */
export function sortReadingOrder(bookmarks: Bookmark[]): Bookmark[] {
  const orderCache = new Map<string, number>();
  const chapterOrder = (bookmark: Bookmark): number => {
    const key = `${bookmark.bookSlug}\u0000${bookmark.chapterSlug}`;
    let order = orderCache.get(key);
    if (order === undefined) {
      const index = getChapterIndex(bookmark.bookSlug, bookmark.chapterSlug);
      order = index === -1 ? Number.POSITIVE_INFINITY : index;
      orderCache.set(key, order);
    }
    return order;
  };

  return bookmarks
    .map((bookmark) => ({ bookmark, order: chapterOrder(bookmark) }))
    .sort((a, b) =>
      a.order !== b.order
        ? a.order - b.order
        : a.bookmark.paragraphIndex - b.bookmark.paragraphIndex,
    )
    .map((entry) => entry.bookmark);
}

/** Parse an ISO timestamp to epoch milliseconds; unparseable → 0 (treated as
 *  oldest). Used so activity is compared numerically, not by string order. */
function toEpoch(iso: string): number {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? 0 : time;
}

/** Group bookmarks by book — each group in reading order, groups ordered by
 *  most-recent activity (newest first). Orphaned books sort last. */
export function groupBookmarksByBook(bookmarks: Bookmark[]): BookmarkGroup[] {
  const byBook = new Map<string, Bookmark[]>();
  for (const bookmark of bookmarks) {
    const list = byBook.get(bookmark.bookSlug);
    if (list) list.push(bookmark);
    else byBook.set(bookmark.bookSlug, [bookmark]);
  }

  const groups: BookmarkGroup[] = [];
  for (const [bookSlug, list] of byBook) {
    const book = getBookBySlug(bookSlug);

    // Most-recent activity in the group, chosen by epoch time (not ISO string
    // ordering) so the intent is explicit for future maintainers.
    let lastActivity = '';
    let lastActivityTime = Number.NEGATIVE_INFINITY;
    for (const b of list) {
      const time = toEpoch(b.createdAt);
      if (time > lastActivityTime) {
        lastActivityTime = time;
        lastActivity = b.createdAt;
      }
    }

    groups.push({
      bookSlug,
      bookTitle: book?.title ?? list[0]?.bookTitle ?? bookSlug,
      isOrphan: !book,
      bookmarks: sortReadingOrder(list),
      lastActivity,
    });
  }

  // Present books by most-recent activity (numeric time); orphaned books last.
  return groups.sort((a, b) => {
    if (a.isOrphan !== b.isOrphan) return a.isOrphan ? 1 : -1;
    return toEpoch(b.lastActivity) - toEpoch(a.lastActivity);
  });
}