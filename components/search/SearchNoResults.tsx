'use client';

import Link from 'next/link';
import type { CategorySuggestion } from '@/lib/search';
import { SearchIcon, ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · SearchNoResults
 * components/search/SearchNoResults.tsx
 *
 * The helpful dead end: a query matched nothing, even fuzzily. Editorial
 * empty-state register (mirrors the Bookmarks / History pages): a quiet glyph,
 * the echoed query, plain-language suggestions, genre chips as immediate ways
 * back in, and the Explore Library CTA. PURE PRESENTATIONAL. Tokens only.
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface SearchNoResultsProps {
  query: string;
  categories: CategorySuggestion[];
}

export default function SearchNoResults({
  query,
  categories,
}: SearchNoResultsProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <SearchIcon strokeWidth={1.5} className="size-8 text-primary/40" />
      <p className="mt-6 font-reader text-2xl text-reader-foreground">
        Nothing found for &ldquo;{query}&rdquo;
      </p>
      <p className="mt-3 max-w-[42ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
        Try a shorter word, a different spelling, or an author&rsquo;s name —
        the search forgives small typos, but it can&rsquo;t find what
        isn&rsquo;t on the shelves yet.
      </p>

      {categories.length > 0 && (
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              className="rounded-full border border-border bg-card px-4 py-2 font-body text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/library"
        className={cx(
          'mt-8 inline-flex items-center gap-2 rounded-full font-body text-[0.85rem] font-medium text-primary',
          'transition-colors hover:text-primary/80',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        Explore the library
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
