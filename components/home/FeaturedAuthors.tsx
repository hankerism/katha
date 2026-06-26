import Link from 'next/link';

/* ---------------------------------------------------------------------------
 * KATHA · FeaturedAuthors
 * components/home/FeaturedAuthors.tsx
 *
 * A muted-cream band introducing the writers: rounded cards with a circular
 * initials portrait, name, genre, a one-line bio, a published-books count, and
 * a "View Profile →" affordance. The whole card is the link. Server component,
 * data separated from the markup.
 * ------------------------------------------------------------------------- */

type Author = {
  name: string;
  genre: string;
  bio: string;
  books: number;
  slug: string;
};

const AUTHORS: Author[] = [
  {
    name: 'Lakambini Reyes',
    genre: 'Romance',
    bio: 'Writes heartfelt contemporary romance rooted in Filipino family life.',
    books: 12,
    slug: 'lakambini-reyes',
  },
  {
    name: 'Noemi Bautista',
    genre: 'Magical Realism',
    bio: 'Blends folklore, memory, and magic into everyday Philippine life.',
    books: 8,
    slug: 'noemi-bautista',
  },
  {
    name: 'Rafael Lim',
    genre: 'Poetry',
    bio: 'Modern Filipino poetry inspired by cities, trains, and quiet evenings.',
    books: 15,
    slug: 'rafael-lim',
  },
  {
    name: 'J. Salvador',
    genre: 'Literary Fiction',
    bio: 'Character-driven novels exploring identity and belonging.',
    books: 10,
    slug: 'j-salvador',
  },
];

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function FeaturedAuthors() {
  return (
    <section aria-labelledby="featured-authors-heading" className="bg-secondary">
      <div className="container-katha py-20">
        {/* Header */}
        <div className="max-w-xl">
          <h2
            id="featured-authors-heading"
            className="font-heading text-3xl font-bold tracking-tight text-foreground"
          >
            Featured Authors
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Meet the writers behind today&rsquo;s most loved Filipino stories.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {AUTHORS.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              aria-label={`View ${author.name}'s profile — ${author.genre}, ${author.books} books`}
              className="group flex h-full flex-col items-center rounded-[18px] border border-border bg-card p-6 text-center shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* Portrait placeholder */}
              <span
                aria-hidden="true"
                className="grid size-20 shrink-0 place-items-center rounded-full font-heading text-xl font-semibold text-brand-secondary shadow-sm ring-1 ring-black/10 transition-transform duration-300 ease-out group-hover:scale-105 bg-[linear-gradient(150deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_58%,#000))]"
              >
                {initialsOf(author.name)}
              </span>

              <h3 className="mt-5 font-heading text-lg font-semibold leading-snug text-foreground">
                {author.name}
              </h3>
              <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-clay dark:text-accent">
                {author.genre}
              </p>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {author.bio}
              </p>

              {/* Footer */}
              <div className="mt-auto w-full pt-5">
                <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="font-medium text-muted-foreground">{author.books} Books</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary transition-colors duration-200 group-hover:text-clay dark:text-accent">
                    View Profile
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}