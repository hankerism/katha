import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBookBySlug, getRelatedBooks, type KathaBook } from '@/lib/books';
import {
  authorName,
  getAuthorForBook,
  getBibliography,
} from '@/lib/author-selectors';
import BookCard from '@/components/ui/BookCard';
import BookCTA from '@/components/book/BookCTA';
import { ClockIcon, ArrowRightIcon } from '@/components/ui/icons';
import { initialsOf } from '@/lib/text';

/* ---------------------------------------------------------------------------
 * KATHA · Book details
 * app/library/[slug]/page.tsx
 *
 * The hub of the product graph — every cover in the app (home shelves,
 * library grids, search results, the reader's back link) lands here, and from
 * here the reader, the related shelves, and the author are one step away.
 *
 * Async server component, assembly only: everything renders from lib/books.ts.
 * The single client leaf is BookCTA, which upgrades "Start Reading" to
 * "Continue · Chapter N" when the saved position belongs to this book.
 * Sections, in the approved order: hero + CTA · Contents · Related books ·
 * About the author. Tokens only.
 * ------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) return { title: 'Book not found' };
  return {
    title: book.title,
    description: book.synopsis,
  };
}

/* -- Helpers ---------------------------------------------------------------- */

function totalReadingMinutes(book: KathaBook): number {
  return book.chapters.reduce(
    (sum, chapter) => sum + chapter.estimatedReadingTime,
    0,
  );
}

/* -- Page ------------------------------------------------------------------- */

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) notFound();

  const chapterCount = book.chapters.length;
  const minutes = totalReadingMinutes(book);
  const firstChapter = book.chapters[0];
  const related = getRelatedBooks(book.slug).slice(0, 4);

  // All author facts come from the Author domain via the selector layer.
  const author = getAuthorForBook(book);
  const displayAuthor = author?.displayName ?? authorName(book.authorId);
  const moreByAuthor = getBibliography(book.authorId).filter(
    (other) => other.slug !== book.slug,
  );

  return (
    <>
      {/* Hero ---------------------------------------------------------------- */}
      <section
        aria-labelledby="book-title"
        className="relative overflow-hidden"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 right-[-6rem] h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-16 left-[-8rem] h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
        </div>

        <div className="container-katha grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
          {/* Cover — the book's own art, or the brand placeholder */}
          <div className="mx-auto w-full max-w-[280px] lg:mx-0 lg:max-w-none">
            {book.cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- covers are local SVGs or uploaded data URLs
              <img
                src={book.cover}
                alt={`Cover of ${book.title} by ${displayAuthor}`}
                className="aspect-[3/4] w-full rounded-[18px] object-cover shadow-xl ring-1 ring-black/10"
              />
            ) : (
            <div aria-hidden="true" className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-[linear-gradient(155deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_55%,#000))] shadow-xl ring-1 ring-black/10">
              <span className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.16),transparent_55%)]" />
              <span className="absolute inset-y-0 left-0 w-3 bg-[linear-gradient(to_right,rgba(0,0,0,0.30),transparent)]" />
              <span className="absolute inset-y-0 left-3 w-px bg-brand-accent/40" />
              <div className="relative flex h-full flex-col justify-between p-7">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-logo text-base font-semibold tracking-[0.18em] text-brand-secondary/90">
                    KATHA
                  </span>
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-brand-accent">
                    {book.category}
                  </span>
                </div>
                <div>
                  <span className="mb-4 block h-px w-12 bg-brand-accent/70" />
                  <p className="font-heading text-3xl font-bold leading-tight text-brand-secondary">
                    {book.title}
                  </p>
                  <p className="mt-3 font-logo text-lg italic text-brand-secondary/80">
                    {displayAuthor}
                  </p>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {book.category}
            </p>

            <h1
              id="book-title"
              className="mt-4 font-heading text-4xl leading-[1.08] text-foreground sm:text-5xl"
            >
              {book.title}
            </h1>

            <p className="mt-3 font-logo text-xl italic text-muted-foreground">
              by {displayAuthor}
            </p>

            <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
              {book.synopsis}
            </p>

            {/* Meta row */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 font-body text-sm text-muted-foreground">
              <span
                className={
                  book.status === 'Completed' ? 'badge badge-forest' : 'badge badge-accent'
                }
              >
                {book.status}
              </span>
              <span>
                {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="size-4" />
                about {minutes} min
              </span>
              <span>{book.language}</span>
              <span>
                Published{' '}
                {new Date(book.publishedAt).toLocaleDateString('en-PH', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span>Updated {book.updated.toLowerCase()}</span>
            </div>

            <div className="mt-9">
              <BookCTA
                bookSlug={book.slug}
                bookTitle={book.title}
                firstChapterHref={`/library/${book.slug}/read/${firstChapter.slug}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contents -------------------------------------------------------------- */}
      <section
        aria-labelledby="book-contents-heading"
        className="container-katha py-4 md:py-8"
      >
        <div className="flex items-end justify-between gap-4 border-t border-border pt-12">
          <h2
            id="book-contents-heading"
            className="font-heading text-2xl text-foreground sm:text-3xl"
          >
            Contents
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
          </p>
        </div>

        <ol className="mt-7 space-y-3">
          {book.chapters.map((chapter) => (
            <li key={chapter.slug}>
              <Link
                href={`/library/${book.slug}/read/${chapter.slug}`}
                aria-label={`Read chapter ${chapter.number}: ${chapter.title} (${chapter.estimatedReadingTime} min)`}
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-border-strong hover:shadow-md motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="min-w-0">
                  <span className="block font-body text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Chapter {chapter.number}
                  </span>
                  <span className="mt-1 block truncate font-heading text-lg text-foreground">
                    {chapter.title}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 font-body text-[0.78rem] text-muted-foreground">
                    <ClockIcon className="size-3.5" />
                    {chapter.estimatedReadingTime} min
                  </span>
                  <ArrowRightIcon className="size-[15px] text-muted-foreground transition-[color,transform] duration-200 group-hover:text-primary motion-safe:group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Related books ---------------------------------------------------------- */}
      {related.length > 0 && (
        <section
          aria-labelledby="related-books-heading"
          className="container-katha py-12 md:py-16"
        >
          <div className="flex items-end justify-between gap-4 border-t border-border pt-12">
            <div>
              <h2
                id="related-books-heading"
                className="font-heading text-2xl text-foreground sm:text-3xl"
              >
                Related books
              </h2>
              <p className="mt-1.5 font-body text-sm text-muted-foreground">
                More from the KATHA shelves.
              </p>
            </div>
            <Link
              href="/library"
              className="group inline-flex shrink-0 items-center gap-1.5 pb-1 font-body text-sm font-medium text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View all
              <ArrowRightIcon className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((other) => (
              <BookCard
                key={other.slug}
                title={other.title}
                author={authorName(other.authorId)}
                cover={other.cover}
                category={other.category}
                chapters={other.chapters.length}
                href={`/library/${other.slug}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* About the author -------------------------------------------------------- */}
      <section
        aria-labelledby="about-author-heading"
        className="border-t border-border bg-secondary"
      >
        <div className="container-katha py-16 md:py-20">
          <h2
            id="about-author-heading"
            className="font-heading text-2xl text-foreground sm:text-3xl"
          >
            About the author
          </h2>

          <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-center">
            <span
              aria-hidden="true"
              className="grid size-20 shrink-0 place-items-center rounded-full bg-[linear-gradient(150deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_58%,#000))] font-heading text-xl font-semibold text-brand-secondary shadow-sm ring-1 ring-black/10"
            >
              {initialsOf(displayAuthor)}
            </span>

            <div className="min-w-0">
              <p className="font-heading text-xl font-semibold text-foreground">
                {displayAuthor}
              </p>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                {1 + moreByAuthor.length}{' '}
                {moreByAuthor.length === 0 ? 'book' : 'books'} on KATHA ·{' '}
                {book.category}
                {author?.location ? ` · ${author.location}` : ''}
              </p>
              <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-muted-foreground">
                {author?.bio ??
                  `${book.title} is ${displayAuthor}'s first title on KATHA — more is on the way.`}
              </p>
              {moreByAuthor.length > 0 && (
                <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-muted-foreground">
                  Also the author of{' '}
                  {moreByAuthor.map((other) => other.title).join(', ')}.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
