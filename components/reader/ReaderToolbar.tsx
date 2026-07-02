import Link from 'next/link';
import type { SVGProps } from 'react';
import type { KathaChapter } from '@/lib/books';
import BookmarkButton from '@/components/reader/BookmarkButton';
import ReaderDrawer from '@/components/reader/ReaderDrawer';

/* ---------------------------------------------------------------------------
 * KATHA · ReaderToolbar
 * components/reader/ReaderToolbar.tsx
 *
 * The slim sticky reader bar under the global navbar: a back-to-book link, the
 * table-of-contents drawer trigger, the chapter position, prev/next paging, a
 * bookmark toggle, and a thin progress line. Server component — the interactive
 * pieces (ReaderDrawer, BookmarkButton) are client leaves, so the bar itself
 * never needs 'use client'.
 *
 * Surface: a deep espresso (bg-primary) bar with cream (primary-foreground)
 * text and icons, a faint cream hairline beneath, and a gold (accent) progress
 * line — an intentional, premium frame.
 *
 * LAYOUT — the bar is a single in-flow `sticky` block: a fixed-height nav row
 * (h-12) followed by the 2px progress strip, with NO absolute positioning. That
 * means it always reserves its own vertical space and can never float over the
 * article; the reading column simply begins beneath it. (Sticky reserves space
 * in normal flow, unlike fixed/absolute.)
 *
 * NOTE — no backdrop-filter here on purpose. ReaderDrawer is a no-portal,
 * position:fixed drawer rendered inside this bar. A `backdrop-filter` (e.g.
 * backdrop-blur) on an ancestor establishes a containing block for fixed
 * descendants, which would re-anchor the drawer to this bar instead of the
 * viewport. A solid background (bg-primary, no filter) avoids that. If you want
 * a glassy blur back, re-add the portal in ReaderDrawer first.
 * ------------------------------------------------------------------------- */

interface ReaderToolbarProps {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
  totalChapters: number;
  prevChapter: KathaChapter | null;
  nextChapter: KathaChapter | null;
}

function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function ReaderToolbar({
  bookSlug,
  bookTitle,
  chapterSlug,
  chapterTitle,
  chapterNumber,
  totalChapters,
  prevChapter,
  nextChapter,
}: ReaderToolbarProps) {
  const progress =
    totalChapters > 0 ? Math.round((chapterNumber / totalChapters) * 100) : 0;
  const chapterHref = `/library/${bookSlug}/read/${chapterSlug}`;
  const prevHref = prevChapter
    ? `/library/${bookSlug}/read/${prevChapter.slug}`
    : null;
  const nextHref = nextChapter
    ? `/library/${bookSlug}/read/${nextChapter.slug}`
    : null;

  return (
    <div className="sticky top-[var(--navbar-height,4rem)] z-40 border-b border-primary-foreground/10 bg-primary">
      <nav
        aria-label="Reader"
        className="container-katha flex h-12 items-center justify-between gap-3"
      >
        {/* Back to book details */}
        <Link
          href={`/library/${bookSlug}`}
          aria-label="Back to book details"
          className="inline-flex min-w-0 items-center gap-2 font-body text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <ArrowLeftIcon className="size-4 shrink-0" />
          <span className="max-w-[42vw] truncate sm:max-w-[18rem]">
            {bookTitle}
          </span>
        </Link>

        {/* Contents drawer · position · paging · bookmark */}
        <div className="flex items-center gap-1">
          {/* Table of contents drawer trigger — MOBILE/TABLET ONLY. On lg+ the
              persistent ReaderSidebar replaces it, so it's hidden there. */}
          <div className="flex items-center lg:hidden">
            <ReaderDrawer
              bookSlug={bookSlug}
              bookTitle={bookTitle}
              currentChapterSlug={chapterSlug}
            />
          </div>

          <span className="mx-1 hidden font-body text-xs uppercase tracking-[0.16em] text-primary-foreground/60 sm:inline">
            Chapter {chapterNumber} / {totalChapters}
          </span>

          {prevHref && prevChapter ? (
            <Link
              href={prevHref}
              aria-label={`Previous chapter: ${prevChapter.title}`}
              className="inline-flex size-9 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeftIcon className="size-5" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex size-9 items-center justify-center rounded-full text-primary-foreground/25"
            >
              <ChevronLeftIcon className="size-5" />
            </span>
          )}

          {nextHref && nextChapter ? (
            <Link
              href={nextHref}
              aria-label={`Next chapter: ${nextChapter.title}`}
              className="inline-flex size-9 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRightIcon className="size-5" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex size-9 items-center justify-center rounded-full text-primary-foreground/25"
            >
              <ChevronRightIcon className="size-5" />
            </span>
          )}

          {/* Bookmark toggle (client leaf) */}
          <BookmarkButton
            bookSlug={bookSlug}
            bookTitle={bookTitle}
            chapterSlug={chapterSlug}
            chapterTitle={chapterTitle}
            href={chapterHref}
          />
        </div>
      </nav>

      {/* Thin progress line — in normal flow at the bar's bottom edge (doubles
          as a divider). Not absolute, so it adds to the bar's reserved height. */}
      <div
        role="progressbar"
        aria-valuenow={chapterNumber}
        aria-valuemin={1}
        aria-valuemax={totalChapters}
        aria-label={`Reading progress: chapter ${chapterNumber} of ${totalChapters}`}
        className="h-0.5 w-full bg-primary-foreground/15"
      >
        <div
          className="h-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}