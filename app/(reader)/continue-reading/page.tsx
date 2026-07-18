'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ContinueReadingRecord } from '@/lib/continue-reading';
import { readingDataRepository } from '@/lib/reading-data-repository';
import {
  catalogueRepository,
  type KathaBook,
} from '@/lib/catalogue-repository';
import { relativeTimeLabel } from '@/lib/relative-time';
import { BookOpenIcon, ArrowRightIcon } from '@/components/ui/icons';
import { useViewer } from '@/components/membership/use-viewer';
import MembershipInvitation from '@/components/membership/MembershipInvitation';
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

/** Chapter citation for the card eyebrow, via the shared selector. */
function composeEyebrow(
  record: ContinueReadingRecord,
  books: readonly KathaBook[],
): string {
  const number = getChapterNumber(record, books);
  return number > 0
    ? `Chapter ${number} · ${record.chapterTitle}`
    : record.chapterTitle;
}

export default function ContinueReadingPage() {
  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState<ContinueReadingRecord | null>(null);
  const [books, setBooks] = useState<readonly KathaBook[]>([]);
  const { viewer, loaded: viewerLoaded } = useViewer();
  const isGuest = viewerLoaded && viewer.tier === 'guest';

  // Read once on mount through the repositories, then reveal together.
  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      readingDataRepository.getContinueReading(),
      catalogueRepository.listBooks(),
    ]).then(([found, foundBooks]) => {
      if (cancelled) return;
      setRecord(found);
      setBooks(foundBooks);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
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
          {loaded && !isGuest && record && (
            <p className="mt-4 font-body text-[0.98rem] leading-relaxed text-muted-foreground">
              Pick up where you left off.
            </p>
          )}
        </header>

        {/* Guests meet the invitation — a saved place already on this device
            stays stored and reappears the moment they join. */}
        {isGuest && (
          <MembershipInvitation
            heading="Pick up any book where you left it."
            invitation="Continue Reading holds your place across the whole library. Join KATHA and never lose the page."
            from="/continue-reading"
          />
        )}

        {loaded && !isGuest && record && (
          <div className="mt-9 h-px w-full bg-border/70" />
        )}

        {/* Storage-dependent region — mount-gated, members only */}
        {loaded &&
          !isGuest &&
          (record ? (
            <div className="mt-11">
              <ReadingLocationCard
                href={record.href}
                eyebrow={composeEyebrow(record, books)}
                preview={resolvePreview(record, books)}
                meta={relativeTimeLabel(record.updatedAt, 'Opened')}
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