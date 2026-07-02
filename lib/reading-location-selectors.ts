/* ---------------------------------------------------------------------------
 * KATHA · ReadingLocation selectors (shared content-aware helpers)
 * lib/reading-location-selectors.ts
 *
 * The content-aware helpers that operate on ANY reading location — shared by
 * bookmarks and history. They read book data from lib/books.ts to DERIVE things
 * the stored location deliberately does not hold: chapter order, chapter number,
 * and a preview fallback.
 *
 * This mirrors the shared type layer (lib/reading-location.ts): just as every
 * feature's persistence extends ReadingLocation, every feature's selector layer
 * builds on these. Feature-specific concerns (grouping, ordering) live in
 * lib/bookmark-selectors.ts and lib/history-selectors.ts, which re-export these
 * so each page imports from a single feature selector.
 *
 * Book-content coupling is quarantined here; UI consumes selectors, never
 * lib/books.ts directly.
 * ------------------------------------------------------------------------- */

import { getBookBySlug } from './books';
import type { ReadingLocation } from './reading-location';

/** 0-based index of a chapter within its book, or -1 if the book/chapter is
 *  unknown (e.g. an orphaned location whose content was removed). */
export function getChapterIndex(bookSlug: string, chapterSlug: string): number {
  const book = getBookBySlug(bookSlug);
  if (!book) return -1;
  return book.chapters.findIndex((c) => c.slug === chapterSlug);
}

/** 1-based chapter number for display, or 0 when the chapter is unknown. */
export function getChapterNumber(
  location: Pick<ReadingLocation, 'bookSlug' | 'chapterSlug'>,
): number {
  const index = getChapterIndex(location.bookSlug, location.chapterSlug);
  return index === -1 ? 0 : index + 1;
}

/** The passage text to show. Prefers the stored preview, then falls back to the
 *  paragraph's text from book content, then the chapter's first paragraph, then
 *  the chapter title. Never throws on missing content. */
export function resolvePreview(location: ReadingLocation): string {
  if (location.preview.trim()) return location.preview;
  const book = getBookBySlug(location.bookSlug);
  const chapter = book?.chapters.find((c) => c.slug === location.chapterSlug);
  if (!chapter) return location.chapterTitle;
  return (
    chapter.content[location.paragraphIndex] ??
    chapter.content[0] ??
    location.chapterTitle
  );
}