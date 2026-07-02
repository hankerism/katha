'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import BookCard from '@/components/ui/BookCard';
import { ArrowRightIcon } from '@/components/ui/icons';
import type {
  MatchRange,
  SearchResults as SearchResultsModel,
} from '@/lib/search';

/* ---------------------------------------------------------------------------
 * KATHA · SearchResults
 * components/search/SearchResults.tsx
 *
 * Grouped search results. PURE PRESENTATIONAL: the engine (lib/search.ts) has
 * already matched, ranked, and computed highlight ranges — this only renders.
 *
 *   Books      → the existing BookCard grid (straight reuse)
 *   Chapters   → quiet row links deep into the reader, "Chapter N · Book"
 *   Categories → row links to the existing /library?genre= convention
 *   Authors    → row links to the author profile (/authors/[slug])
 *
 * Highlights render the engine's MatchRanges through <mark> — no matching
 * logic is re-derived here. All rows are real links in DOM order, so keyboard
 * navigation is native. Tokens only.
 * ------------------------------------------------------------------------- */

/** Render text with the engine's match ranges wrapped in <mark>. */
function Highlighted({
  text,
  ranges,
}: {
  text: string;
  ranges: MatchRange[];
}) {
  if (ranges.length === 0) return <>{text}</>;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) parts.push(text.slice(cursor, range.start));
    parts.push(
      <mark
        key={range.start}
        className="rounded-[3px] bg-accent/25 px-0.5 text-inherit"
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function GroupHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="font-body text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
    >
      {children}
    </h2>
  );
}

/** Shared row shell for the non-book groups. */
const rowClass =
  'group flex w-full items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-5 py-4 text-left shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-border-strong hover:shadow-md motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export interface SearchResultsProps {
  results: SearchResultsModel;
  /** A result link was chosen — the caller records the search as recent. */
  onCommit: () => void;
}

export default function SearchResults({
  results,
  onCommit,
}: SearchResultsProps) {
  const { books, authors, categories, chapters } = results;

  return (
    <div className="space-y-12">
      {/* Books — the hero group, as the existing discovery cards */}
      {books.length > 0 && (
        <section aria-labelledby="search-books-heading">
          <GroupHeading id="search-books-heading">Books</GroupHeading>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {books.map((book) => (
              <div key={book.id} onClick={onCommit}>
                <BookCard
                  title={book.title}
                  author={book.author}
                  category={book.category}
                  chapters={book.chapterCount}
                  href={book.href}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Authors — into their profiles */}
      {authors.length > 0 && (
        <section aria-labelledby="search-authors-heading">
          <GroupHeading id="search-authors-heading">Authors</GroupHeading>
          <ul className="mt-5 space-y-3">
            {authors.map((author) => (
              <li key={author.id}>
                <Link
                  href={author.href}
                  onClick={onCommit}
                  aria-label={`View ${author.title}'s profile`}
                  className={rowClass}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-heading text-lg text-foreground">
                      <Highlighted
                        text={author.title}
                        ranges={author.titleRanges}
                      />
                    </span>
                    <span className="mt-0.5 block font-body text-sm text-muted-foreground">
                      {author.bookCount}{' '}
                      {author.bookCount === 1 ? 'book' : 'books'} on KATHA
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 font-body text-[0.78rem] font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    View profile
                    <ArrowRightIcon className="size-[15px] transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Categories — into the filtered library */}
      {categories.length > 0 && (
        <section aria-labelledby="search-categories-heading">
          <GroupHeading id="search-categories-heading">
            Categories
          </GroupHeading>
          <ul className="mt-5 space-y-3">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={category.href}
                  onClick={onCommit}
                  className={rowClass}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-heading text-lg text-foreground">
                      <Highlighted
                        text={category.title}
                        ranges={category.titleRanges}
                      />
                    </span>
                    <span className="mt-0.5 block font-body text-sm text-muted-foreground">
                      {category.bookCount}{' '}
                      {category.bookCount === 1 ? 'book' : 'books'}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 font-body text-[0.78rem] font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    Browse
                    <ArrowRightIcon className="size-[15px] transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Chapters — deep links into the reader */}
      {chapters.length > 0 && (
        <section aria-labelledby="search-chapters-heading">
          <GroupHeading id="search-chapters-heading">Chapters</GroupHeading>
          <ul className="mt-5 space-y-3">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={chapter.href}
                  onClick={onCommit}
                  aria-label={`Read ${chapter.title}, chapter ${chapter.chapterNumber} of ${chapter.bookTitle}`}
                  className={rowClass}
                >
                  <span className="min-w-0">
                    <span className="block font-body text-[0.68rem] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Chapter {chapter.chapterNumber} · {chapter.bookTitle}
                    </span>
                    <span className="mt-1 block truncate font-heading text-lg text-foreground">
                      <Highlighted
                        text={chapter.title}
                        ranges={chapter.titleRanges}
                      />
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 font-body text-[0.78rem] font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    Read
                    <ArrowRightIcon className="size-[15px] transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
