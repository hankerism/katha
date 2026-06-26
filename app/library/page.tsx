import type { Metadata } from 'next';
import type { SVGProps } from 'react';
import BookCard, { type BookCardProps } from '@/components/ui/BookCard';

/* ---------------------------------------------------------------------------
 * KATHA · Library
 * app/library/page.tsx
 *
 * The browse surface for the whole catalogue, in the same Apple Books /
 * Kinokuniya / Aesop editorial register as the homepage: a calm hero, a single
 * search field, a row of genre pills, a featured shelf, then the full grid.
 *
 * Server component (no 'use client') — it is purely presentational and renders
 * BookCard (itself an RSC) inside the standard 1 / 2 / 4 responsive grid. The
 * search input and genre pills are intentionally visual-only for now; wiring
 * them to real query state will move that interactive slice into a small client
 * child later, leaving this shell untouched.
 *
 * Tokens only — no new colours. Static sample data lives at module scope in
 * ALL_CAPS so swapping to `const books = await prisma.book.findMany(...)`
 * needs no markup changes.
 * ------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Library',
  description:
    'Browse the KATHA library — a curated shelf of Filipino-inspired fiction, poetry, and short stories, set in type made for slow, beautiful reading.',
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/* -- Sample data (temporary; replace with fetched data later) -------------- */

const GENRES = [
  'All',
  'Romance',
  'Fantasy',
  'Mystery',
  'Poetry',
  'Short Stories',
  'Historical Fiction',
  'Young Adult',
] as const;

const FEATURED_BOOKS: BookCardProps[] = [
  {
    title: 'Ang Huling Tag-araw',
    author: 'Lakambini Reyes',
    category: 'Literary Fiction',
    chapters: 7,
    featured: true,
    href: '/library/ang-huling-tag-araw',
  },
  {
    title: 'Mga Liham sa Dilim',
    author: 'J. Salvador',
    category: 'Poetry',
    chapters: 24,
    featured: true,
    href: '/library/mga-liham-sa-dilim',
  },
  {
    title: 'Ang Bahay sa Buwan',
    author: 'Noemi Bautista',
    category: 'Magical Realism',
    chapters: 15,
    featured: true,
    href: '/library/ang-bahay-sa-buwan',
  },
  {
    title: 'Sa Ilalim ng Sampaguita',
    author: 'Clara Mendoza',
    category: 'Romance',
    chapters: 18,
    featured: true,
    href: '/library/sa-ilalim-ng-sampaguita',
  },
];

const LIBRARY_BOOKS: BookCardProps[] = [
  {
    title: 'Ang Huling Tag-araw',
    author: 'Lakambini Reyes',
    category: 'Literary Fiction',
    chapters: 7,
    href: '/library/ang-huling-tag-araw',
  },
  {
    title: 'Mga Liham sa Dilim',
    author: 'J. Salvador',
    category: 'Poetry',
    chapters: 24,
    href: '/library/mga-liham-sa-dilim',
  },
  {
    title: 'Ang Bahay sa Buwan',
    author: 'Noemi Bautista',
    category: 'Magical Realism',
    chapters: 15,
    href: '/library/ang-bahay-sa-buwan',
  },
  {
    title: 'Huling Tren Pauwi',
    author: 'Rafael Lim',
    category: 'Short Stories',
    chapters: 9,
    href: '/library/huling-tren-pauwi',
  },
  {
    title: 'Sa Ilalim ng Sampaguita',
    author: 'Clara Mendoza',
    category: 'Romance',
    chapters: 18,
    href: '/library/sa-ilalim-ng-sampaguita',
  },
  {
    title: 'Mga Tala sa Ulan',
    author: 'Isa Navarro',
    category: 'Young Adult',
    chapters: 12,
    href: '/library/mga-tala-sa-ulan',
  },
  {
    title: 'Bayan ng mga Alon',
    author: 'Tomas Reyes',
    category: 'Historical Fiction',
    chapters: 20,
    href: '/library/bayan-ng-mga-alon',
  },
  {
    title: 'Ang Mahiwagang Estasyon',
    author: 'Mila Cruz',
    category: 'Fantasy',
    chapters: 16,
    href: '/library/ang-mahiwagang-estasyon',
  },
];

/* -- Icons ----------------------------------------------------------------- */

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

/* -- Page ------------------------------------------------------------------ */

export default function LibraryPage() {
  return (
    <>
      {/* Hero ------------------------------------------------------------- */}
      <section
        aria-labelledby="library-hero-heading"
        className="relative overflow-hidden"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 right-[-6rem] h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-12 left-[-8rem] h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
        </div>

        <div className="container-katha py-20 md:py-28">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Browse the Library
          </p>

          <h1
            id="library-hero-heading"
            className="mt-4 max-w-3xl font-heading text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl"
          >
            Find your next beautiful read.
          </h1>

          <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
            KATHA is a calm home for Filipino storytelling. Browse curated shelves of
            fiction, poetry, and short stories — each one set in type made for slow,
            unhurried reading.
          </p>

          {/* Search — visual only for now */}
          <div className="mt-9 max-w-xl">
            <label htmlFor="library-search" className="sr-only">
              Search the library
            </label>
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3.5 shadow-sm transition-shadow duration-300 focus-within:shadow-md">
              <SearchIcon className="size-5 shrink-0 text-muted-foreground" />
              <input
                id="library-search"
                type="search"
                placeholder="Search by title, author, or genre…"
                aria-label="Search the library"
                className="w-full bg-transparent font-body text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Genre filter pills — visual only for now */}
          <div
            role="group"
            aria-label="Filter by genre"
            className="mt-6 flex flex-wrap gap-2.5"
          >
            {GENRES.map((genre, i) => {
              const active = i === 0;
              return (
                <button
                  key={genre}
                  type="button"
                  aria-pressed={active}
                  className={cx(
                    'rounded-full px-4 py-2 font-body text-sm font-medium transition-colors duration-200',
                    active
                      ? 'bg-foreground text-background shadow-sm'
                      : 'border border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground',
                  )}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured shelf --------------------------------------------------- */}
      <section
        aria-labelledby="library-featured-heading"
        className="container-katha"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="library-featured-heading"
              className="font-heading text-2xl text-foreground sm:text-3xl"
            >
              Featured this season
            </h2>
            <p className="mt-1.5 font-body text-sm text-muted-foreground">
              Hand-picked stories our editors keep returning to.
            </p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_BOOKS.map((book) => (
            <BookCard key={book.href} {...book} />
          ))}
        </div>
      </section>

      {/* Full grid -------------------------------------------------------- */}
      <section
        aria-labelledby="library-all-heading"
        className="container-katha py-16 md:py-24"
      >
        <div className="flex items-end justify-between gap-4 border-t border-border pt-12">
          <h2
            id="library-all-heading"
            className="font-heading text-2xl text-foreground sm:text-3xl"
          >
            All books
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            {LIBRARY_BOOKS.length} titles
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LIBRARY_BOOKS.map((book) => (
            <BookCard key={book.href} {...book} />
          ))}
        </div>
      </section>
    </>
  );
}