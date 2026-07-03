import type { Metadata } from 'next';
import { getAllAuthors } from '@/lib/authors';
import { getAuthorStats } from '@/lib/author-selectors';
import AuthorCard from '@/components/authors/AuthorCard';

/* ---------------------------------------------------------------------------
 * KATHA · Authors index
 * app/authors/page.tsx
 *
 * The destination behind the Navbar's "Authors" link (and the hero / FinalCTA
 * / footer "Become an Author" links): a calm editorial hero, every author in
 * the domain as an AuthorCard, and a quiet become-an-author band.
 *
 * Server component, assembly only: the grid renders from lib/authors.ts, the
 * genre line and book counts derive via getAuthorStats() — nothing here can
 * drift from the catalogue.
 * ------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Authors',
  description:
    'Meet the writers behind KATHA — the novelists, poets, and storytellers bringing Filipino literature to beautifully typeset shelves.',
};

export default function AuthorsPage() {
  const authors = getAllAuthors();

  return (
    <>
      {/* Hero ---------------------------------------------------------------- */}
      <section
        aria-labelledby="authors-hero-heading"
        className="relative overflow-hidden"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 right-[-6rem] h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-12 left-[-8rem] h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
        </div>

        <div className="container-katha py-20 md:py-28">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            The writers
          </p>

          <h1
            id="authors-hero-heading"
            className="mt-4 max-w-3xl font-heading text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl"
          >
            The voices behind the shelves.
          </h1>

          <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
            Novelists, poets, and storytellers — each one writing Filipino life
            in their own register, from moonlit houses to the last train home.
          </p>
        </div>
      </section>

      {/* Grid ----------------------------------------------------------------- */}
      <section
        aria-labelledby="all-authors-heading"
        className="container-katha pb-16 md:pb-24"
      >
        <div className="flex items-end justify-between gap-4">
          <h2
            id="all-authors-heading"
            className="font-heading text-2xl text-foreground sm:text-3xl"
          >
            All authors
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            {authors.length} {authors.length === 1 ? 'author' : 'authors'}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {authors.map((author) => {
            const stats = getAuthorStats(author.id);
            return (
              <AuthorCard
                key={author.id}
                name={author.displayName}
                href={`/authors/${author.slug}`}
                bio={author.bio}
                genreLabel={stats.categories[0] ?? 'New voice'}
                bookCount={stats.bookCount}
                avatar={author.avatar}
              />
            );
          })}
        </div>
      </section>

      {/* Become an author ------------------------------------------------------ */}
      <section
        aria-labelledby="become-author-heading"
        className="border-t border-border bg-secondary"
      >
        <div className="container-katha py-16 text-center md:py-20">
          <h2
            id="become-author-heading"
            className="font-heading text-2xl text-foreground sm:text-3xl"
          >
            Have a story to tell?
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-base leading-relaxed text-muted-foreground">
            KATHA is opening its shelves to new Filipino voices. Write to us
            and we&rsquo;ll help your stories find a beautiful home.
          </p>
          <a
            href="mailto:authors@katha.ph?subject=Becoming%20a%20KATHA%20author"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
          >
            Become an Author
          </a>
        </div>
      </section>
    </>
  );
}
