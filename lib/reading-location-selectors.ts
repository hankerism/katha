/* ---------------------------------------------------------------------------
 * KATHA · ReadingLocation selectors (shared content-aware helpers)
 * lib/reading-location-selectors.ts
 *
 * The content-aware helpers that operate on ANY reading location — shared by
 * bookmarks and history. They derive things the stored location deliberately
 * does not hold: chapter order, chapter number, and a preview fallback.
 *
 * PURE over passed-in catalogue data: since the catalogue moved behind
 * CatalogueRepository (Sprint 8), these selectors no longer resolve books
 * themselves — the caller fetches the catalogue through the repository once
 * and passes it in. Derivation stays synchronous and testable; resolution
 * (async, storage-aware) belongs to the caller. Orphan-safe as before: an
 * unknown book/chapter degrades to fallbacks, never a crash.
 *
 * This mirrors the shared type layer (lib/reading-location.ts): just as every
 * feature's persistence extends ReadingLocation, every feature's selector
 * layer builds on these. Feature-specific concerns (grouping, ordering) live
 * in lib/bookmark-selectors.ts and lib/history-selectors.ts, which re-export
 * these so each page imports from a single feature selector.
 * ------------------------------------------------------------------------- */

import type { KathaBook } from './catalogue-repository';
import type { ReadingLocation } from './reading-location';

/** Find a book in a caller-supplied catalogue snapshot. */
export function findBook(
  books: readonly KathaBook[],
  bookSlug: string,
): KathaBook | undefined {
  return books.find((book) => book.slug === bookSlug);
}

/** 0-based index of a chapter within its book, or -1 if the book/chapter is
 *  unknown (e.g. an orphaned location whose content was removed). */
export function getChapterIndex(
  books: readonly KathaBook[],
  bookSlug: string,
  chapterSlug: string,
): number {
  const book = findBook(books, bookSlug);
  if (!book) return -1;
  return book.chapters.findIndex((c) => c.slug === chapterSlug);
}

/** 1-based chapter number for display, or 0 when the chapter is unknown. */
export function getChapterNumber(
  location: Pick<ReadingLocation, 'bookSlug' | 'chapterSlug'>,
  books: readonly KathaBook[],
): number {
  const index = getChapterIndex(books, location.bookSlug, location.chapterSlug);
  return index === -1 ? 0 : index + 1;
}

/** The passage text to show. Prefers the stored preview, then falls back to the
 *  paragraph's text from book content, then the chapter's first paragraph, then
 *  the chapter title. Never throws on missing content. */
export function resolvePreview(
  location: ReadingLocation,
  books: readonly KathaBook[],
): string {
  if (location.preview.trim()) return location.preview;
  const book = findBook(books, location.bookSlug);
  const chapter = book?.chapters.find((c) => c.slug === location.chapterSlug);
  if (!chapter) return location.chapterTitle;
  return (
    chapter.content[location.paragraphIndex] ??
    chapter.content[0] ??
    location.chapterTitle
  );
}
