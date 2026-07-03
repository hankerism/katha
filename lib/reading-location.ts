/* ---------------------------------------------------------------------------
 * KATHA · ReadingLocation
 * lib/reading-location.ts
 *
 * The shared "reading location" atom — a precise position inside a book
 * (book → chapter → paragraph) together with the human-facing fields needed to
 * render it: titles, a short text preview, and a deep-link href.
 *
 * Bookmarks, Reading History, and Continue Reading all build on THIS shape and
 * (later) all render through the same ReadingLocationCard — even though each
 * feature keeps its own independent storage. This module is the single source
 * of truth for the shape they share.
 *
 * Pure types + pure string helpers only. No runtime state, no persistence, and
 * deliberately NO dependency on book content (lib/books.ts). Anything that must
 * read book data lives in the selector layer, never here.
 * ------------------------------------------------------------------------- */

export interface ReadingLocation {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  /** 0-based index of the paragraph within the chapter's content array. */
  paragraphIndex: number;
  /** Short passage text — the primary content of a location card. May be empty
   *  (e.g. a legacy whole-chapter mark); the selector layer supplies a fallback. */
  preview: string;
  /** Deep link into the reader, including the paragraph anchor (see helpers). */
  href: string;
}

/** The minimal triple that uniquely identifies a location within a book. */
export type ReadingLocationIdentity = Pick<
  ReadingLocation,
  'bookSlug' | 'chapterSlug' | 'paragraphIndex'
>;

/** Stable DOM id for a paragraph anchor inside the reader (e.g. "p-12").
 *  Phase 4 will stamp these onto <p> elements so hrefs can scroll-restore. */
export function paragraphAnchorId(paragraphIndex: number): string {
  return `p-${paragraphIndex}`;
}

/** Append (or replace) the paragraph anchor on a reader href:
 *  `/library/x/read/y` + 3 → `/library/x/read/y#p-3`. Pure string op. */
export function withParagraphAnchor(baseHref: string, paragraphIndex: number): string {
  const hashIndex = baseHref.indexOf('#');
  const clean = hashIndex === -1 ? baseHref : baseHref.slice(0, hashIndex);
  return `${clean}#${paragraphAnchorId(paragraphIndex)}`;
}