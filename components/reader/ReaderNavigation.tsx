import Link from 'next/link';
import type { KathaChapter } from '@/lib/catalogue-repository';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · ReaderNavigation
 * components/reader/ReaderNavigation.tsx
 *
 * The end-of-chapter pager: descriptive previous / next cards showing the
 * adjacent chapter titles. Previous is a disabled placeholder at the start of
 * the book; Next becomes "Back to book" at the end. Presentational server
 * component — no client state. Tokens only.
 * ------------------------------------------------------------------------- */

interface ReaderNavigationProps {
  bookSlug: string;
  prevChapter: KathaChapter | null;
  nextChapter: KathaChapter | null;
}

export default function ReaderNavigation({
  bookSlug,
  prevChapter,
  nextChapter,
}: ReaderNavigationProps) {
  const prevHref = prevChapter
    ? `/library/${bookSlug}/read/${prevChapter.slug}`
    : null;
  const nextHref = nextChapter
    ? `/library/${bookSlug}/read/${nextChapter.slug}`
    : null;

  return (
    <nav
      aria-label="Chapter navigation"
      className="grid grid-cols-2 gap-4 border-t border-border py-10"
    >
      {prevHref && prevChapter ? (
        <Link
          href={prevHref}
          className="group flex flex-col gap-1 rounded-[14px] border border-border bg-card px-5 py-4 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <ArrowLeftIcon className="size-3.5 transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="truncate font-heading text-sm text-foreground">
            {prevChapter.title}
          </span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="flex flex-col gap-1 rounded-[14px] border border-border bg-card px-5 py-4 opacity-40"
        >
          <span className="font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Previous
          </span>
          <span className="font-heading text-sm text-muted-foreground">
            Start of book
          </span>
        </span>
      )}

      {nextHref && nextChapter ? (
        <Link
          href={nextHref}
          className="group flex flex-col items-end gap-1 rounded-[14px] border border-border bg-card px-5 py-4 text-right transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Next
            <ArrowRightIcon className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
          </span>
          <span className="truncate font-heading text-sm text-foreground">
            {nextChapter.title}
          </span>
        </Link>
      ) : (
        <Link
          href={`/library/${bookSlug}`}
          className="group flex flex-col items-end gap-1 rounded-[14px] border border-border bg-card px-5 py-4 text-right transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Finish
            <ArrowRightIcon className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
          </span>
          <span className="font-heading text-sm text-foreground">
            Back to book
          </span>
        </Link>
      )}
    </nav>
  );
}