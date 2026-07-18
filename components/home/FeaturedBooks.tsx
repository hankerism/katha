import Link from 'next/link';
import BookCard from '@/components/ui/BookCard';
import { catalogueRepository } from '@/lib/catalogue-repository';
import { authorName } from '@/lib/author-selectors';

/* ---------------------------------------------------------------------------
 * KATHA · FeaturedBooks
 * components/home/FeaturedBooks.tsx
 *
 * Homepage featured shelf, rendered from the catalogue's editorial picks
 * (lib/books.ts `featured` flag) — no book data lives here. Server component;
 * flag a book featured in the catalogue and it appears on this shelf and the
 * library's featured shelf alike.
 * ------------------------------------------------------------------------- */

export default async function FeaturedBooks() {
  const featured = await catalogueRepository.listFeatured();
  return (
    <section aria-labelledby="featured-books-heading" className="bg-background">
      <div className="container-katha py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2
              id="featured-books-heading"
              className="font-heading text-3xl font-bold tracking-tight text-foreground"
            >
              Featured Books
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Hand-picked for the front table — what the library is reading
              this week.
            </p>
          </div>

          <Link
            href="/library"
            className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-sm text-sm font-semibold text-primary transition-colors hover:text-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-accent sm:self-auto"
          >
            View all
            <span
              aria-hidden="true"
              className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((book) => (
            <BookCard
              key={book.slug}
              title={book.title}
              author={authorName(book.authorId)}
              cover={book.cover}
              category={book.category}
              featured={book.featured}
              chapters={book.chapters.length}
              href={`/library/${book.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}