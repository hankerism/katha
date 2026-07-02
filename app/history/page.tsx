'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SVGProps } from 'react';
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/history';
import {
  groupHistoryByBook,
  resolvePreview,
  getChapterNumber,
} from '@/lib/history-selectors';
import ReadingLocationCard from '@/components/ui/ReadingLocationCard';

/* ---------------------------------------------------------------------------
 * KATHA · Reading History page
 * app/history/page.tsx
 *
 * Where the reader has been, newest first. Mirrors app/bookmarks/page.tsx and
 * app/continue-reading/page.tsx: client component (history lives only in
 * localStorage), mount-gated read via the persistence layer (never localStorage
 * directly), and the SAME ReadingLocationCard + selectors.
 *
 * Assembly only: getHistory() → groupHistoryByBook() → one section per book
 * (most-recently-visited book first), entries within a book newest first. Card
 * props (eyebrow / preview / meta / href) are composed HERE via the selectors,
 * so no book logic leaks into the presentational card. Per the card's contract,
 * History renders no per-entry remove — the only mutation is a quiet
 * "Clear history" control wired to clearHistory().
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
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

/** Calm, editorial relative time for the "visited" label. Client-only (rendered
 *  after mount), so no server/client clock mismatch. */
function formatVisited(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Visited';
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'Visited today';
  if (days === 1) return 'Visited yesterday';
  if (days < 7) return `Visited ${days} days ago`;
  if (days < 14) return 'Visited last week';
  if (days < 30) return `Visited ${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'Visited last month';
  if (days < 365) return `Visited ${Math.floor(days / 30)} months ago`;
  return `Visited on ${new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

/** Chapter citation for the card eyebrow, composed from the selectors — the
 *  card never derives this itself. Falls back gracefully for orphaned chapters. */
function composeEyebrow(entry: HistoryEntry): string {
  const number = getChapterNumber(entry);
  return number > 0
    ? `Chapter ${number} · ${entry.chapterTitle}`
    : entry.chapterTitle;
}

function pluralize(count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

export default function HistoryPage() {
  const [loaded, setLoaded] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // History lives in localStorage — read once on mount via the persistence
  // layer (the UI never touches localStorage directly), then reveal.
  useEffect(() => {
    setEntries(getHistory());
    setLoaded(true);
  }, []);

  const groups = groupHistoryByBook(entries);
  const hasHistory = entries.length > 0;

  // clearHistory() persists the empty list via the foundation; the empty state
  // renders automatically once local state follows.
  function handleClear() {
    clearHistory();
    setEntries([]);
  }

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-[720px] px-5 py-16 sm:px-6 sm:py-20">
        {/* Header — static, renders immediately */}
        <header>
          <p className="font-body text-[0.72rem] font-medium uppercase tracking-[0.26em] text-muted-foreground">
            Your library
          </p>
          <h1 className="mt-3 font-logo text-4xl font-semibold tracking-[-0.01em] text-foreground sm:text-5xl">
            Reading History
          </h1>
          {loaded && hasHistory && (
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <p className="font-body text-[0.98rem] leading-relaxed text-muted-foreground">
                <span className="font-medium text-reader-foreground">
                  {pluralize(entries.length, 'place')} across{' '}
                  {pluralize(groups.length, 'book')}
                </span>{' '}
                · where you have been.
              </p>
              <button
                type="button"
                onClick={handleClear}
                className={cx(
                  'shrink-0 font-body text-[0.78rem] font-medium text-muted-foreground',
                  'transition-colors hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                Clear history
              </button>
            </div>
          )}
        </header>

        {loaded && hasHistory && (
          <div className="mt-9 h-px w-full bg-border/70" />
        )}

        {/* Storage-dependent region — mount-gated */}
        {loaded &&
          (hasHistory ? (
            <div className="mt-11 space-y-14">
              {groups.map((group) => (
                <section key={group.bookSlug} aria-label={group.bookTitle}>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <h2 className="font-logo text-2xl font-semibold leading-tight text-foreground">
                      {group.bookTitle}
                    </h2>
                    <span className="shrink-0 pb-1 font-body text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {pluralize(group.entries.length, 'place')}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {group.entries.map((entry) => (
                      <ReadingLocationCard
                        key={entry.id}
                        href={entry.href}
                        eyebrow={composeEyebrow(entry)}
                        preview={resolvePreview(entry)}
                        meta={formatVisited(entry.visitedAt)}
                        ariaLabel={`Continue reading ${group.bookTitle}, ${entry.chapterTitle}`}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* Editorial empty state */
            <div className="mt-16 flex flex-col items-center text-center">
              <ClockIcon className="size-8 text-primary/40" />
              <p className="mt-6 font-reader text-2xl text-reader-foreground">
                No history yet
              </p>
              <p className="mt-3 max-w-[38ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
                As you read, the places you visit are remembered here, so you
                can retrace your steps.
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
