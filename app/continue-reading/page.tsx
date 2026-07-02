'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SVGProps } from 'react';
import {
  getContinueReading,
  type ContinueReadingRecord,
} from '@/lib/continue-reading';
import {
  resolvePreview,
  getChapterNumber,
  readingProgress,
} from '@/lib/continue-reading-selectors';
import ReadingLocationCard from '@/components/ui/ReadingLocationCard';

/* ---------------------------------------------------------------------------
 * KATHA · Continue Reading page
 * app/continue-reading/page.tsx
 *
 * Where you left off — a single reading position. Mirrors app/bookmarks/page.tsx
 * and app/history/page.tsx: client component (the position lives only in
 * localStorage), mount-gated read via the persistence layer (never localStorage
 * directly), and the SAME ReadingLocationCard + selectors.
 *
 * Card props (eyebrow / preview / meta / href / progress) are composed HERE via
 * the shared selectors, so no logic leaks into the presentational card. Continue
 * Reading shows exactly one record with a progress bar, drops the remove control
 * and the ribbon, and promotes an "Opened …" label.
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function BookOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 6.5C10.5 5.5 8 5 4 5v13c4 0 6.5.5 8 1.5 1.5-1 4-1.5 8-1.5V5c-4 0-6.5.5-8 1.5V20" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Calm, editorial relative time for the "opened" label. Client-only (rendered
 *  after mount), so no server/client clock mismatch. */
function formatOpened(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Opened recently';
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'Opened today';
  if (days === 1) return 'Opened yesterday';
  if (days < 7) return `Opened ${days} days ago`;
  if (days < 14) return 'Opened last week';
  if (days < 30) return `Opened ${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'Opened last month';
  if (days < 365) return `Opened ${Math.floor(days / 30)} months ago`;
  return `Opened on ${new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

/** Chapter citation for the card eyebrow, via the shared selector. */
function composeEyebrow(record: ContinueReadingRecord): string {
  const number = getChapterNumber(record);
  return number > 0
    ? `Chapter ${number} · ${record.chapterTitle}`
    : record.chapterTitle;
}

export default function ContinueReadingPage() {
  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState<ContinueReadingRecord | null>(null);

  // The position lives in localStorage — read once on mount via the persistence
  // layer (the UI never touches localStorage directly), then reveal.
  useEffect(() => {
    setRecord(getContinueReading());
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-[720px] px-5 py-16 sm:px-6 sm:py-20">
        {/* Header — static, renders immediately */}
        <header>
          <p className="font-body text-[0.72rem] font-medium uppercase tracking-[0.26em] text-muted-foreground">
            Your library
          </p>
          <h1 className="mt-3 font-logo text-4xl font-semibold tracking-[-0.01em] text-foreground sm:text-5xl">
            Continue Reading
          </h1>
          {loaded && record && (
            <p className="mt-4 font-body text-[0.98rem] leading-relaxed text-muted-foreground">
              Pick up where you left off.
            </p>
          )}
        </header>

        {loaded && record && <div className="mt-9 h-px w-full bg-border/70" />}

        {/* Storage-dependent region — mount-gated */}
        {loaded &&
          (record ? (
            <div className="mt-11">
              <ReadingLocationCard
                href={record.href}
                eyebrow={composeEyebrow(record)}
                preview={resolvePreview(record)}
                meta={formatOpened(record.updatedAt)}
                ariaLabel={`Continue reading ${record.bookTitle}, ${record.chapterTitle}`}
                showRibbon={false}
                progress={readingProgress(record)}
              />
            </div>
          ) : (
            /* Editorial empty state */
            <div className="mt-16 flex flex-col items-center text-center">
              <BookOpenIcon className="size-8 text-primary/40" />
              <p className="mt-6 font-reader text-2xl text-reader-foreground">
                Nothing in progress yet
              </p>
              <p className="mt-3 max-w-[38ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
                Open a book and your place is saved here, so you can pick up right
                where you left off.
              </p>
              <Link
                href="/library"
                className={cx(
                  'mt-7 inline-flex items-center gap-2 rounded-full font-body text-[0.85rem] font-medium text-primary',
                  'transition-colors hover:text-primary/80',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                Browse the library
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          ))}
      </main>
    </div>
  );
}