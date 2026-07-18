/* ---------------------------------------------------------------------------
 * KATHA · Author selectors (the book ↔ author join layer)
 * lib/author-selectors.ts
 *
 * The ONLY place the two domain tables (lib/books.ts, lib/authors.ts) meet.
 * Books store just an authorId; authors store just their own metadata; every
 * derived relationship — display names, bibliographies, profiles with stats,
 * related authors — is computed here, so nothing can drift and an uploaded
 * book (one new KathaBook row with an authorId) updates every surface by
 * derivation.
 *
 * Mirrors the reading-location selector layers: pure functions, orphan-safe
 * fallbacks (an unknown authorId degrades to a humanized name, never a
 * crash), UI consumes these and never joins inline.
 * ------------------------------------------------------------------------- */

import type { KathaBook } from './catalogue-repository';
import { getAuthorById, getAllAuthors, type KathaAuthor } from './authors';

/* ── Names ───────────────────────────────────────────────────────────────── */

/** Humanize an unknown authorId ("auth-lakambini-reyes" → "Lakambini Reyes")
 *  so an orphaned book still shows something readable, never an id. */
function humanizeAuthorId(authorId: string): string {
  return authorId
    .replace(/^auth-/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Display name for an authorId, orphan-safe. */
export function authorName(authorId: string): string {
  return getAuthorById(authorId)?.displayName ?? humanizeAuthorId(authorId);
}

/** The author record behind a book, if the reference resolves. */
export function getAuthorForBook(book: KathaBook): KathaAuthor | undefined {
  return getAuthorById(book.authorId);
}

/* ── Bibliography ────────────────────────────────────────────────────────── */

/** An author's books, in catalogue order, from a caller-supplied catalogue
 *  snapshot (fetched once through CatalogueRepository). */
export function getBibliography(
  authorId: string,
  books: readonly KathaBook[],
): KathaBook[] {
  return books.filter((book) => book.authorId === authorId);
}

/* ── Profiles ────────────────────────────────────────────────────────────── */

/** Everything derivable about an author's body of work. */
export interface AuthorStats {
  bookCount: number;
  /** Distinct categories the author writes in, catalogue order. */
  categories: string[];
  totalChapters: number;
  /** Sum of estimated chapter reading times, in minutes. */
  totalMinutes: number;
}

export interface AuthorProfile {
  author: KathaAuthor;
  books: KathaBook[];
  stats: AuthorStats;
}

function statsFor(books: KathaBook[]): AuthorStats {
  const categories: string[] = [];
  let totalChapters = 0;
  let totalMinutes = 0;
  for (const book of books) {
    if (!categories.includes(book.category)) categories.push(book.category);
    totalChapters += book.chapters.length;
    for (const chapter of book.chapters) {
      totalMinutes += chapter.estimatedReadingTime;
    }
  }
  return { bookCount: books.length, categories, totalChapters, totalMinutes };
}

/** The /authors/[slug] page's one-call join: author + bibliography + stats.
 *  Undefined when the slug is unknown (the page 404s). */
export function getAuthorProfile(
  slug: string,
  catalogue: readonly KathaBook[],
): AuthorProfile | undefined {
  const author = getAllAuthors().find((a) => a.slug === slug);
  if (!author) return undefined;
  const books = getBibliography(author.id, catalogue);
  return { author, books, stats: statsFor(books) };
}

/** Convenience for author cards: profile facts keyed by the author row. */
export function getAuthorStats(
  authorId: string,
  catalogue: readonly KathaBook[],
): AuthorStats {
  return statsFor(getBibliography(authorId, catalogue));
}

/* ── Relationships ───────────────────────────────────────────────────────── */

/** Other authors, those sharing a category first (then the rest, catalogue
 *  order), capped by the caller. Degrades gracefully in a small catalogue:
 *  with no category overlap it simply suggests other authors. */
export function getRelatedAuthors(
  authorId: string,
  catalogue: readonly KathaBook[],
): KathaAuthor[] {
  const ownCategories = new Set(
    getBibliography(authorId, catalogue).map((book) => book.category),
  );
  const others = getAllAuthors().filter((author) => author.id !== authorId);

  const sharesCategory = (author: KathaAuthor) =>
    getBibliography(author.id, catalogue).some((book) =>
      ownCategories.has(book.category),
    );

  return [
    ...others.filter(sharesCategory),
    ...others.filter((author) => !sharesCategory(author)),
  ];
}
