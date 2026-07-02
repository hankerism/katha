import type { Metadata } from 'next';
import type { SVGProps } from 'react';
import Link from 'next/link';
import BookCard from '@/components/ui/BookCard';
import {
  getAllBooks,
  getBooksByCategory,
  getFeaturedBooks,
  type KathaBook,
} from '@/lib/books';
import { collectCategories } from '@/lib/search';

/* ---------------------------------------------------------------------------
 * KATHA · Library
 * app/library/page.tsx
 *
 * The browse surface for the whole catalogue, in the same Apple Books /
 * Kinokuniya / Aesop editorial register as the homepage: a calm hero, the
 * search doorway, a row of genre pills, a featured shelf, then the full grid.
 *
 * Everything renders from lib/books.ts — no book arrays live here. Genre
 * filtering is URL-driven: the pills are LINKS to /library?genre=<slug>
 * (the convention every other surface already points at), so filters are
 * shareable, back-button-friendly, and keyboard-accessible with zero client
 * state. The page is an async server component reading `searchParams`
 * (a Promise in this Next.js version); categories and counts derive from the
 * catalogue via collectCategories(), so new books grow the pills untouched.
 *
 * The featured shelf shows only on the unfiltered view — a filtered page is
 * an answer, not a storefront.
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

interface LibrarySearchParams {
  genre?: string | string[];
}

/** First value wins when the param repeats; undefined means "All". */
function activeGenreSlug(params: LibrarySearchParams): string | undefined {
  const { genre } = params;
  const value = Array.isArray(genre) ? genre[0] : genre;
  return value?.trim() || undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<LibrarySearchParams>;
}): Promise<Metadata> {
  const slug = activeGenreSlug(await searchParams);
  const category = slug
    ? collectCategories(getAllBooks()).find((c) => c.slug === slug)
    : undefined;

  return {
    title: category ? `${category.name} · Library` : 'Library',
    description:
      'Browse the KATHA library — a curated shelf of Filipino-inspired fiction, poetry, and short stories, set in type made for slow, beautiful reading.',
  };
}

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

function ShelfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 4h4v16H4zM10 4h4v16h-4zM16.5 4.5l4 1-3.5 15-4-1z" />
    </svg>
  );
}

/* -- Card mapping ----------------------------------------------------------- */

function toCard(book: KathaBook) {
  return (
    <BookCard
      key={book.slug}
      title={book.title}
      author={book.author}
      category={book.category}
      chapters={book.chapters.length}
      featured={book.featured}
      href={`/library/${book.slug}`}
    />
  );
}

/* -- Page ------------------------------------------------------------------ */

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<LibrarySearchParams>;
}) {
  const genreSlug = activeGenreSlug(await searchParams);

  const allBooks = getAllBooks();
  const categories = collectCategories(allBooks);
  const activeCategory = genreSlug
    ? categories.find((category) => category.slug === genreSlug)
    : undefined;

  const books = genreSlug ? getBooksByCategory(genreSlug) : allBooks;
  const featured = getFeaturedBooks();
  const isFiltered = genreSlug !== undefined;

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

          {/* Search — a doorway into the dedicated /search experience */}
          <div className="mt-9 max-w-xl">
            <Link
              href="/search"
              aria-label="Search the library"
              className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3.5 shadow-sm transition-shadow duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <SearchIcon className="size-5 shrink-0 text-muted-foreground" />
              <span className="font-body text-base text-muted-foreground">
                Search by title, author, or genre…
              </span>
            </Link>
          </div>

          {/* Genre pills — URL-driven links, derived from the catalogue */}
          <nav
            aria-label="Filter by genre"
            className="mt-6 flex flex-wrap gap-2.5"
          >
            <Link
              href="/library"
              aria-current={!isFiltered ? 'page' : undefined}
              className={cx(
                'rounded-full px-4 py-2 font-body text-sm font-medium transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                !isFiltered
                  ? 'bg-foreground text-background shadow-sm'
                  : 'border border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground',
              )}
            >
              All
            </Link>
            {categories.map((category) => {
              const active = category.slug === genreSlug;
              return (
                <Link
                  key={category.slug}
                  href={category.href}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'rounded-full px-4 py-2 font-body text-sm font-medium transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    active
                      ? 'bg-foreground text-background shadow-sm'
                      : 'border border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground',
                  )}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Featured shelf — unfiltered view only ----------------------------- */}
      {!isFiltered && featured.length > 0 && (
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
            {featured.map(toCard)}
          </div>
        </section>
      )}

      {/* Grid --------------------------------------------------------------- */}
      <section
        aria-labelledby="library-all-heading"
        className="container-katha py-16 md:py-24"
      >
        <div
          className={cx(
            'flex items-end justify-between gap-4',
            !isFiltered && 'border-t border-border pt-12',
          )}
        >
          <h2
            id="library-all-heading"
            className="font-heading text-2xl text-foreground sm:text-3xl"
          >
            {activeCategory ? activeCategory.name : 'All books'}
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            {books.length} {books.length === 1 ? 'title' : 'titles'}
          </p>
        </div>

        {books.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {books.map(toCard)}
          </div>
        ) : (
          /* Empty shelf — unknown or not-yet-stocked genre */
          <div className="mt-14 flex flex-col items-center text-center">
            <ShelfIcon className="size-8 text-primary/40" />
            <p className="mt-6 font-reader text-2xl text-reader-foreground">
              This shelf is still being stocked
            </p>
            <p className="mt-3 max-w-[40ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
              No books live here yet. New titles join the library often —
              in the meantime, the rest of the shelves are open.
            </p>
            <Link
              href="/library"
              className="mt-7 inline-flex items-center gap-2 rounded-full font-body text-[0.85rem] font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Browse all books
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
