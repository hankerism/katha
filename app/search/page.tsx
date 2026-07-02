import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchExperience from '@/components/search/SearchExperience';

/* ---------------------------------------------------------------------------
 * KATHA · Search page
 * app/search/page.tsx
 *
 * The destination behind the Navbar's search action. Mirrors the library
 * page's shape: a server-component shell (metadata + the calm editorial hero)
 * around the one interactive region. All search behavior lives in
 * SearchExperience and the lib layers beneath it; this file is assembly only.
 *
 * The <Suspense> boundary is required by useSearchParams inside the client
 * experience (the initial query arrives via ?q=), and keeps the shell
 * prerenderable.
 * ------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Search',
  description:
    'Search the KATHA library — find books, authors, categories, and chapters across a curated shelf of Filipino-inspired fiction, poetry, and short stories.',
};

export default function SearchPage() {
  return (
    <section
      aria-labelledby="search-hero-heading"
      className="relative overflow-hidden"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 right-[-6rem] h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-12 left-[-8rem] h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="container-katha py-16 pb-24 md:py-24 md:pb-32">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Search KATHA
        </p>

        <h1
          id="search-hero-heading"
          className="mt-4 max-w-3xl font-heading text-4xl leading-[1.1] text-foreground sm:text-5xl"
        >
          Find it on the shelves.
        </h1>

        <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
          Books, authors, categories, and chapters — as you type, with room
          for the occasional typo.
        </p>

        <div className="mt-9">
          <Suspense fallback={null}>
            <SearchExperience />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
