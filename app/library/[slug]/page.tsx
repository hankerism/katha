import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBookBySlug, getRelatedBooks } from '@/lib/books';
import BookCard from '@/components/ui/BookCard';

/* ---------------------------------------------------------------------------
 * KATHA · Book Details
 * app/library/[slug]/page.tsx
 *
 * Server component. Resolves a single book from the shared data layer, 404s on
 * an unknown slug, and presents the cover, synopsis, chapter list, and a
 * "related reads" shelf. Each chapter links into the reader at
 * /library/[slug]/read/[chapterSlug]. Tokens only — no reader components.
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    return { title: 'Book not found · KATHA' };
  }

  return {
    title: `${book.title} · KATHA`,
    description: book.synopsis.slice(0, 160),
  };
}

export default async function BookDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const relatedBooks = getRelatedBooks(slug);
  const firstChapter = book.chapters[0];
  const totalReadingTime = book.chapters.reduce(
    (sum, chapter) => sum + chapter.estimatedReadingTime,
    0,
  );

  const details: Array<{ label: string; value: string }> = [
    { label: 'Genre', value: book.category },
    { label: 'Language', value: book.language },
    { label: 'Status', value: book.status },
    { label: 'Updated', value: book.updated },
  ];

  return (
    <div className="bg-background">
      <div className="container-katha py-10 md:py-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="font-body text-sm">
          <ol className="flex items-center gap-2 text-muted-foreground">
            <li>
              <Link
                href="/library"
                className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Library
              </Link>
            </li>
            <li aria-hidden="true" className="text-border">
              /
            </li>
            <li className="truncate text-foreground" aria-current="page">
              {book.title}
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="mt-8 grid gap-10 md:mt-10 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-12">
          {/* Cover (decorative, theme-stable) */}
          <div
            aria-hidden="true"
            className="flex aspect-[2/3] w-full max-w-[17rem] flex-col justify-between overflow-hidden rounded-[18px] bg-primary p-6 text-primary-foreground shadow-sm"
          >
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
              {book.category}
            </span>
            <div>
              <p className="font-heading text-2xl leading-tight">{book.title}</p>
              <p className="mt-2 font-body text-sm text-primary-foreground/80">
                {book.author}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0">
            <span className="badge">{book.category}</span>

            <h1 className="mt-4 font-heading text-3xl leading-tight text-foreground sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-2 font-body text-base text-muted-foreground">
              by <span className="text-foreground">{book.author}</span>
            </p>

            <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              {book.synopsis}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {firstChapter && (
                <Link
                  href={`/library/${book.slug}/read/${firstChapter.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Start Reading
                </Link>
              )}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-body text-sm font-semibold text-foreground transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Save
              </button>
            </div>

            {/* Details */}
            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 border-t border-border pt-8 sm:grid-cols-4">
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {detail.label}
                  </dt>
                  <dd className="mt-1.5 font-body text-sm text-foreground">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Chapters */}
        <section className="mt-16 md:mt-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-heading text-2xl text-foreground">Chapters</h2>
            <p className="font-body text-sm text-muted-foreground">
              {book.chapters.length}{' '}
              {book.chapters.length === 1 ? 'chapter' : 'chapters'} ·{' '}
              {totalReadingTime} min
            </p>
          </div>

          <ol className="mt-6 divide-y divide-border border-y border-border">
            {book.chapters.map((chapter) => (
              <li key={chapter.slug}>
                <Link
                  href={`/library/${book.slug}/read/${chapter.slug}`}
                  className="group flex items-center gap-5 py-4 transition-colors hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="w-8 shrink-0 text-center font-heading text-lg tabular-nums text-muted-foreground">
                    {chapter.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-lg text-foreground transition-colors group-hover:text-primary">
                      {chapter.title}
                    </span>
                    <span className="mt-0.5 block font-body text-xs text-muted-foreground">
                      {chapter.estimatedReadingTime} min read
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-body text-sm text-muted-foreground transition-colors group-hover:text-foreground"
                  >
                    Read →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Related */}
        {relatedBooks.length > 0 && (
          <section className="mt-16 md:mt-20">
            <h2 className="font-heading text-2xl text-foreground">
              You might also like
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedBooks.map((related) => (
                <BookCard
                  key={related.slug}
                  title={related.title}
                  author={related.author}
                  category={related.category}
                  chapters={related.chapters.length}
                  href={`/library/${related.slug}`}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}