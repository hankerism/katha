'use client';

import Link from 'next/link';
import type { SVGProps } from 'react';
import type { RecentSearch } from '@/lib/recent-searches';
import type { CategorySuggestion } from '@/lib/search';

/* ---------------------------------------------------------------------------
 * KATHA · SearchSuggestions
 * components/search/SearchSuggestions.tsx
 *
 * The search page's EMPTY state — what a reader sees before typing: their
 * recent searches (removable chips + clear all) and the catalogue's categories
 * as browse tiles (the PopularCategories register at search scale, but derived
 * from the real catalogue via collectCategories, never hardcoded — so it grows
 * with the data).
 *
 * PURE PRESENTATIONAL: the caller owns the recent-searches state and passes
 * handlers; category tiles are plain links into the existing /library?genre=
 * convention. A recent-search chip is a pair of SIBLING buttons (search +
 * remove), never nested interactive elements. Tokens only.
 * ------------------------------------------------------------------------- */

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export interface SearchSuggestionsProps {
  recent: RecentSearch[];
  categories: CategorySuggestion[];
  /** Run a recent search again. */
  onPick: (query: string) => void;
  /** Remove one recent search. */
  onRemove: (query: string) => void;
  /** Forget all recent searches. */
  onClearAll: () => void;
}

export default function SearchSuggestions({
  recent,
  categories,
  onPick,
  onRemove,
  onClearAll,
}: SearchSuggestionsProps) {
  return (
    <div className="space-y-12">
      {/* Recent searches */}
      {recent.length > 0 && (
        <section aria-labelledby="recent-searches-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="recent-searches-heading"
              className="font-heading text-xl text-foreground sm:text-2xl"
            >
              Recent searches
            </h2>
            <button
              type="button"
              onClick={onClearAll}
              className="shrink-0 font-body text-[0.78rem] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Clear all
            </button>
          </div>

          <ul className="mt-5 flex flex-wrap gap-2.5">
            {recent.map((search) => (
              <li
                key={search.query}
                className="group flex items-center overflow-hidden rounded-full border border-border bg-card shadow-sm transition-colors hover:border-border-strong"
              >
                <button
                  type="button"
                  onClick={() => onPick(search.query)}
                  className="inline-flex items-center gap-2 py-2 pl-4 pr-1.5 font-body text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <ClockIcon className="size-3.5 text-muted-foreground" />
                  {search.query}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(search.query)}
                  aria-label={`Remove recent search: ${search.query}`}
                  className="grid size-7 place-items-center rounded-full text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset mr-1.5"
                >
                  <CloseIcon className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Browse by genre — derived from the catalogue */}
      {categories.length > 0 && (
        <section aria-labelledby="search-genres-heading">
          <h2
            id="search-genres-heading"
            className="font-heading text-xl text-foreground sm:text-2xl"
          >
            Browse by genre
          </h2>
          <p className="mt-1.5 font-body text-sm text-muted-foreground">
            Or start from a shelf instead.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={category.href}
                aria-label={`Browse ${category.name} books`}
                className="group relative flex h-full min-h-[6.5rem] flex-col justify-between overflow-hidden rounded-[18px] border border-border bg-card p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 select-none font-logo text-6xl font-semibold leading-none text-accent/10 transition-all duration-300 ease-out group-hover:-top-2 group-hover:text-accent/20"
                >
                  {category.name.charAt(0)}
                </span>

                <h3 className="relative font-heading text-lg font-semibold leading-snug text-foreground">
                  {category.name}
                </h3>

                <span className="relative mt-4 font-body text-sm text-muted-foreground">
                  {category.bookCount} {category.bookCount === 1 ? 'book' : 'books'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
