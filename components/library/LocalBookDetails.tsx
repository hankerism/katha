'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { KathaBook } from '@/lib/catalogue-repository';
import {
  getLocalPublishedBookBySlug,
  localBookAuthorName,
} from '@/lib/studio/published-books';
import { ArrowRightIcon, ClockIcon, ChaptersIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Library — local book details (fallback)
 * components/library/LocalBookDetails.tsx
 *
 * The client half of the distribution seam: rendered by the server book page
 * when a slug misses the shared catalogue, it resolves the slug against the
 * books published from this device's Studio and renders an editorial details
 * page — cover, byline, synopsis, the chapter list, and the door into the
 * reader at the book's REAL /library/[slug]/read/[chapter] addresses.
 *
 * Deliberately lighter than the catalogue details page (no related shelf, no
 * bibliography — those derive from the shared catalogue): a calm landing for
 * a book that exists on this device. When the slug resolves nowhere, the
 * editorial miss mirrors the reader's not-found voice.
 *
 * Mount-gated (nothing until storage is read), so the server pass and first
 * client render agree and hydration stays clean.
 * ------------------------------------------------------------------------- */

export default function LocalBookDetails({ slug }: { slug: string }) {
  const [book, setBook] = useState<KathaBook | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getLocalPublishedBookBySlug(slug).then((found) => {
      if (cancelled) return;
      setBook(found);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!loaded) return null;

  if (!book) {
    return (
      <div className="container-katha py-24 text-center">
        <p className="font-reader text-2xl text-reader-foreground">
          This book isn&rsquo;t on the shelves.
        </p>
        <Link
          href="/library"
          className="mt-6 inline-block font-body text-sm font-medium text-primary hover:text-primary/80"
        >
          Browse the library →
        </Link>
      </div>
    );
  }

  const author = localBookAuthorName(book);
  const minutes = book.chapters.reduce(
    (sum, chapter) => sum + chapter.estimatedReadingTime,
    0,
  );
  const firstChapter = book.chapters[0];

  return (
    <div className="container-katha max-w-4xl py-14 md:py-20">
      {/* Hero */}
      <header className="flex flex-col gap-8 sm:flex-row sm:items-start">
        {/* Cover — uploaded, or the branded placeholder */}
        {book.cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- author-uploaded data URL
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            className="aspect-[3/4] w-40 shrink-0 rounded-[14px] object-cover shadow-md ring-1 ring-black/10"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex aspect-[3/4] w-40 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(155deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_55%,#000))] shadow-md ring-1 ring-black/10"
          >
            <span className="font-logo text-sm tracking-[0.18em] text-brand-secondary/80">
              KATHA
            </span>
          </div>
        )}

        <div className="min-w-0">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {book.category}
          </p>
          <h1 className="mt-3 font-heading text-3xl leading-tight text-foreground sm:text-4xl">
            {book.title}
          </h1>
          <p className="mt-2 font-body text-base text-muted-foreground">
            {author}
          </p>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ChaptersIcon className="size-4" />
              {book.chapters.length}{' '}
              {book.chapters.length === 1 ? 'chapter' : 'chapters'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-4" />
              about {minutes} min
            </span>
            <span>{book.status}</span>
            <span>{book.language}</span>
          </p>

          <p className="mt-5 max-w-prose font-body text-[0.98rem] leading-relaxed text-muted-foreground">
            {book.synopsis}
          </p>

          {firstChapter && (
            <Link
              href={`/library/${book.slug}/read/${firstChapter.slug}`}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start reading
              <ArrowRightIcon className="size-4" />
            </Link>
          )}

          <p className="mt-4 font-body text-xs text-muted-foreground/80">
            Published from this device&rsquo;s Studio — public shelves arrive
            with author accounts.
          </p>
        </div>
      </header>

      {/* Chapters */}
      <section aria-labelledby="local-chapters-heading" className="mt-14 border-t border-border pt-10">
        <h2
          id="local-chapters-heading"
          className="font-heading text-2xl text-foreground"
        >
          Contents
        </h2>
        <ol className="mt-6 space-y-2">
          {book.chapters.map((chapter) => (
            <li key={chapter.slug}>
              <Link
                href={`/library/${book.slug}/read/${chapter.slug}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="min-w-0">
                  <span className="block font-body text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Chapter {chapter.number}
                  </span>
                  <span className="mt-1 block truncate font-heading text-lg text-foreground">
                    {chapter.title}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 font-body text-[0.78rem] text-muted-foreground">
                  {chapter.estimatedReadingTime} min
                  <ArrowRightIcon className="size-[15px] transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
