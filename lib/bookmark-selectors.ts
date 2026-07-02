/* ---------------------------------------------------------------------------
 * KATHA · Bookmark selectors (content-aware helpers)
 * lib/bookmark-selectors.ts
 *
 * The content-aware companion to the pure persistence layer (lib/bookmarks.ts).
 * Everything here reads book data from lib/books.ts to DERIVE things the stored
 * bookmark deliberately does not hold: chapter order, chapter number, a preview
 * fallback, grouping, and reading-order sorting.
 *
 * Kept separate on purpose: lib/bookmarks.ts stays a pure persistence layer
 * (safe to swap for an API / cloud sync), while all book-content coupling is
 * quarantined here. UI (the future ReadingLocationCard, Bookmarks page, History,
 * Continue Reading) consumes these selectors, never lib/books.ts directly.
 * ------------------------------------------------------------------------- */

import { getBookBySlug } from './books';
import type { Bookmark } from './bookmarks';

/** 0-based index of a chapter within its book, or -1 if the book/chapter is
 *  unknown (e.g. an orphaned bookmark whose content was removed). */
export function getChapterIndex(bookSlug: string, chapterSlug: string): number {
  const book = getBookBySlug(bookSlug);
  if (!book) return -1;
  return book.chapters.findIndex((c) => c.slug === chapterSlug);
}

/** 1-based chapter number for display, or 0 when the chapter is unknown. */
export function getChapterNumber(
  bookmark: Pick<Bookmark, 'bookSlug' | 'chapterSlug'>,
): number {
  const index = getChapterIndex(bookmark.bookSlug, bookmark.chapterSlug);
  return index === -1 ? 0 : index + 1;
}

/** The passage text to show. Prefers the stored preview, then falls back to the
 *  paragraph's text from book content, then the chapter's first paragraph, then
 *  the chapter title. Never throws on missing content. */
export function resolvePreview(bookmark: Bookmark): string {
  if (bookmark.preview.trim()) return bookmark.preview;
  const book = getBookBySlug(bookmark.bookSlug);
  const chapter = book?.chapters.find((c) => c.slug === bookmark.chapterSlug);
  if (!chapter) return bookmark.chapterTitle;
  return (
    chapter.content[bookmark.paragraphIndex] ??
    chapter.content[0] ??
    bookmark.chapterTitle
  );
}

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