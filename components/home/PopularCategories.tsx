import Link from 'next/link';
import { catalogueRepository } from '@/lib/catalogue-repository';
import { collectCategories } from '@/lib/search';

/* ---------------------------------------------------------------------------
 * KATHA · PopularCategories
 * components/home/PopularCategories.tsx
 *
 * A "Browse by Genre" shelf of compact category tiles in the premium-bookstore
 * register: a faded Cormorant initial behind each genre name, a soft hover lift,
 * and a quiet "Browse →" affordance. Each tile links to the filtered library.
 *
 * Server component; the genres derive from the catalogue via
 * collectCategories() (most-stocked first), so every tile lands on a shelf
 * that actually has books — and new categories appear here on their own.
 * ------------------------------------------------------------------------- */

export default async function PopularCategories() {
  const categories = collectCategories(await catalogueRepository.listBooks());
  // No books, no genre tiles — the section stays silent rather than empty.
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="browse-by-genre-heading" className="bg-background">
      <div className="container-katha py-20">
        {/* Header */}
        <div className="max-w-xl">
          <h2
            id="browse-by-genre-heading"
            className="font-heading text-3xl font-bold tracking-tight text-foreground"
          >
            Browse by Genre
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Find your next read by mood and genre—from sweeping romance to quiet, late-night poetry.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              aria-label={`Browse ${category.name} books`}
              className="group relative flex h-full min-h-[7.5rem] flex-col justify-between overflow-hidden rounded-[18px] border border-border bg-card p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out motion-safe:hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* Decorative monogram */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-1 -top-3 select-none font-logo text-7xl font-semibold leading-none text-accent/10 transition-all duration-300 ease-out motion-safe:group-hover:-top-2 group-hover:text-accent/20"
              >
                {category.name.charAt(0)}
              </span>

              <h3 className="relative font-heading text-lg font-semibold leading-snug text-foreground">
                {category.name}
              </h3>

              <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-primary dark:group-hover:text-accent">
                Browse
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}