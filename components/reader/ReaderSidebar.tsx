import Link from 'next/link';
import { getBookBySlug } from '@/lib/books';
import { authorName } from '@/lib/author-selectors';
import {
  BookmarkIcon,
  ArrowRightIcon,
  ClockIcon,
} from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · ReaderSidebar
 * components/reader/ReaderSidebar.tsx
 *
 * A persistent, Wattpad-style table-of-contents rail for DESKTOP. It mirrors the
 * ReaderDrawer's editorial content (book title · author · Contents · chapter
 * list · reading progress · bookmarks) but lives permanently in the layout as a
 * sticky left column, so the reading content sits beside it — no overlay, no
 * backdrop, nothing covering the article.
 *
 * Visibility: `hidden lg:flex` — shown only at lg+. On smaller screens this
 * renders nothing and the ReaderDrawer (hamburger) in the toolbar takes over.
 *
 * Server component: the current chapter + progress are derived from props (the
 * page already knows the active chapter), so no client state is needed and
 * chapter navigation is plain <Link> routing.
 * ------------------------------------------------------------------------- */

interface ReaderSidebarProps {
  bookSlug: string;
  bookTitle: string;
  currentChapterSlug: string;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export default function ReaderSidebar({
  bookSlug,
  bookTitle,
  currentChapterSlug,
}: ReaderSidebarProps) {
  const book = getBookBySlug(bookSlug);
  const chapters = book?.chapters ?? [];
  const author = book ? authorName(book.authorId) : '';
  const title = book?.title ?? bookTitle;
  const total = chapters.length;
  const currentNumber =
    chapters.find((chapter) => chapter.slug === currentChapterSlug)?.number ?? 0;
  const percent = total > 0 ? Math.round((currentNumber / total) * 100) : 0;

  return (
    <aside
      aria-label="Table of contents"
      className="hidden w-[300px] shrink-0 flex-col self-start border-r border-border bg-[#FCFAF6] text-foreground lg:sticky lg:top-[var(--navbar-height,4rem)] lg:flex lg:h-[calc(100dvh-var(--navbar-height,4rem))]"
    >
      {/* Header */}
      <div className="shrink-0 px-6 pt-7">
        <h2 className="font-heading text-xl leading-tight text-foreground">
          {title}
        </h2>
        {author && (
          <p className="mt-1.5 font-body text-sm text-muted-foreground">
            {author}
          </p>
        )}
        <div className="mt-6 h-px w-full bg-border" />
        <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Contents
        </p>
      </div>

      {/* Chapter list (scrollable) */}
      <nav
        aria-label="Chapters"
        className="mt-4 min-h-0 flex-1 overflow-y-auto"
      >
        <ol className="pb-6">
          {chapters.map((chapter) => {
            const isCurrent = chapter.slug === currentChapterSlug;
            return (
              <li key={chapter.slug}>
                <Link
                  href={`/library/${bookSlug}/read/${chapter.slug}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cx(
                    'block w-full rounded-lg border-l-2 px-6 py-2.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isCurrent
                      ? 'border-primary bg-secondary/25'
                      : 'border-transparent hover:bg-secondary/25',
                  )}
                >
                  <p
                    className={cx(
                      'font-body text-[11px] font-semibold uppercase tracking-[0.18em]',
                      isCurrent ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    Chapter {chapter.number}
                  </p>
                  <p
                    className={cx(
                      'mt-1.5 font-heading text-lg leading-snug text-foreground',
                      isCurrent && 'font-semibold',
                    )}
                  >
                    {chapter.title}
                  </p>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Footer: progress · bookmarks · history */}
      <div className="shrink-0 space-y-5 border-t border-border px-6 py-6">
        {/* Reading progress */}
        <div
          role="progressbar"
          aria-valuenow={currentNumber}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Reading progress: chapter ${currentNumber} of ${total}`}
        >
          <div className="flex items-baseline justify-between">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Reading Progress
            </span>
            <span className="font-heading text-lg tabular-nums text-foreground">
              {percent}%
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 font-body text-xs text-muted-foreground">
            Chapter {currentNumber} of {total}
          </p>
        </div>

        {/* Bookmarks link */}
        <Link
          href="/bookmarks"
          className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <span className="inline-flex items-center gap-2.5">
            <BookmarkIcon filled className="size-4 text-primary" />
            <span className="font-body text-sm font-medium text-foreground">
              View Bookmarks
            </span>
          </span>
          <ArrowRightIcon className="size-4 text-muted-foreground transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
        </Link>

        {/* Reading history link */}
        <Link
          href="/history"
          className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <span className="inline-flex items-center gap-2.5">
            <ClockIcon className="size-4 text-primary" />
            <span className="font-body text-sm font-medium text-foreground">
              View History
            </span>
          </span>
          <ArrowRightIcon className="size-4 text-muted-foreground transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </aside>
  );
}