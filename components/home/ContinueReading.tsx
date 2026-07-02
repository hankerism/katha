'use client';

import { useEffect, useState } from 'react';
import type { SVGProps } from 'react';
import Link from 'next/link';
import {
  getContinueReading,
  type ContinueReadingRecord,
} from '@/lib/continue-reading';
import { readingProgress } from '@/lib/continue-reading-selectors';

/* ---------------------------------------------------------------------------
 * KATHA · ContinueReading
 * components/home/ContinueReading.tsx
 *
 * Homepage "pick up where you left off" card. Client component: the saved
 * position is read via the persistence layer (getContinueReading) in an effect
 * after mount — the server pass and first client render both produce null (no
 * card), keeping hydration clean. Renders nothing until a valid record is found.
 *
 * At 100% progress it reads as "Completed" rather than a full bar; the relative
 * "Opened …" label is derived from updatedAt. Tokens only — no new colours.
 * ------------------------------------------------------------------------- */

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Friendly relative label from an ISO timestamp. Calendar-day aware. */
function formatOpened(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 'Opened recently';

  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const FIVE_MINUTES = 5 * 60 * 1000;
  const ONE_DAY = 24 * 60 * 60 * 1000;

  if (diffMs >= 0 && diffMs < FIVE_MINUTES) return 'Opened just now';

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfYesterday = startOfToday - ONE_DAY;

  if (then.getTime() >= startOfToday) return 'Opened today';
  if (then.getTime() >= startOfYesterday) return 'Opened yesterday';
  return 'Opened recently';
}

export default function ContinueReading() {
  const [record, setRecord] = useState<ContinueReadingRecord | null>(null);

  // Read via the persistence layer (never localStorage directly); it validates
  // and returns null on the server / bad data, so the mount-gate stays clean.
  useEffect(() => {
    setRecord(getContinueReading());
  }, []);

  if (!record) return null;

  const progress = readingProgress(record);
  const isCompleted = progress === 100;
  const opened = formatOpened(record.updatedAt);

  return (
    <section
      aria-labelledby="continue-reading-heading"
      className="container-katha py-16 md:py-20"
    >
      <h2
        id="continue-reading-heading"
        className="font-heading text-2xl text-foreground sm:text-3xl"
      >
        Continue Reading
      </h2>
      <p className="mt-1.5 font-body text-sm text-muted-foreground">
        Pick up where you left off.
      </p>

      <div className="mt-7 flex flex-col gap-6 rounded-[18px] border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
        {/* Mini cover (decorative) */}
        <div
          aria-hidden="true"
          className="relative hidden aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-[12px] bg-primary text-primary-foreground shadow-sm sm:block"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 via-transparent to-foreground/20" />
          <div className="absolute inset-y-0 left-0 w-1.5 bg-foreground/15" />
          <div className="relative flex h-full items-end p-2">
            <span className="font-logo text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
              Katha
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {record.bookTitle}
          </p>
          <p className="mt-2 truncate font-heading text-lg text-foreground">
            {record.chapterTitle}
          </p>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Chapter {record.chapterNumber} of {record.totalChapters}
            <span aria-hidden="true" className="mx-2 text-muted-foreground/50">
              ·
            </span>
            {opened}
          </p>

          {isCompleted ? (
            <p className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                <CheckIcon className="size-3.5 text-primary" />
                Completed
              </span>
            </p>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progress through ${record.bookTitle}`}
                className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="shrink-0 font-body text-xs font-medium tabular-nums text-muted-foreground">
                {progress}%
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <Link
            href={record.href}
            aria-label={`Resume ${record.bookTitle}, chapter ${record.chapterNumber}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
          >
            Resume
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}