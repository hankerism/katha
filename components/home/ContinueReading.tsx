'use client';

import { useEffect, useState } from 'react';
import type { SVGProps } from 'react';
import Link from 'next/link';
import {
  STORAGE_KEY,
  type ContinueReadingRecord,
} from '@/components/reader/ReadingProgressTracker';

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function isContinueReadingRecord(value: unknown): value is ContinueReadingRecord {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;

  return (
    typeof r.bookSlug === 'string' &&
    typeof r.bookTitle === 'string' &&
    typeof r.chapterSlug === 'string' &&
    typeof r.chapterTitle === 'string' &&
    typeof r.chapterNumber === 'number' &&
    typeof r.totalChapters === 'number' &&
    typeof r.href === 'string' &&
    typeof r.updatedAt === 'string'
  );
}

function formatOpened(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 'Opened recently';

  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const fiveMinutes = 5 * 60 * 1000;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diffMs >= 0 && diffMs < fiveMinutes) return 'Opened just now';

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - oneDay;

  if (then.getTime() >= startOfToday) return 'Opened today';
  if (then.getTime() >= startOfYesterday) return 'Opened yesterday';

  return 'Opened recently';
}

export default function ContinueReading() {
  const [record, setRecord] = useState<ContinueReadingRecord | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);
      if (isContinueReadingRecord(parsed)) setRecord(parsed);
    } catch {
      // localStorage is best-effort
    }
  }, []);

  if (!record) return null;

  const progress =
    record.totalChapters > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((record.chapterNumber / record.totalChapters) * 100),
          ),
        )
      : 0;

  const isCompleted = progress >= 100;
  const opened = formatOpened(record.updatedAt);

  return (
    <section
      aria-labelledby="continue-reading-heading"
      className="container-katha py-16 md:py-20"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="continue-reading-heading"
            className="font-heading text-2xl text-foreground sm:text-3xl"
          >
            Continue Reading
          </h2>
          <p className="mt-1.5 font-body text-sm text-muted-foreground">
            Pick up where you left off.
          </p>
        </div>

        <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {opened}
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-7 rounded-[22px] border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:p-7">
        <div
          aria-hidden="true"
          className="relative hidden aspect-[3/4] w-32 shrink-0 overflow-hidden rounded-[14px] bg-[linear-gradient(155deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_55%,#000))] text-brand-secondary shadow-md ring-1 ring-border sm:block"
        >
          <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_0%_0%,rgba(255,255,255,0.14),transparent_55%)]" />
          <div className="absolute inset-y-0 left-0 w-3 bg-[linear-gradient(to_right,rgba(0,0,0,0.28),transparent)]" />
          <div className="absolute inset-y-0 left-3 w-px bg-brand-accent/40" />

          <div className="relative flex h-full flex-col justify-between p-4">
            <span className="font-logo text-sm font-semibold uppercase tracking-[0.18em] text-brand-secondary/90">
              KATHA
            </span>

            <div>
              <span className="mb-3 block h-px w-10 bg-brand-accent" />
              <p className="font-heading text-lg font-bold leading-tight text-brand-secondary">
                Ang Huling
                <br />
                Tag-araw
              </p>
              <p className="mt-2 font-logo text-xs italic text-brand-secondary/75">
                Lakambini Reyes
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {record.bookTitle}
          </p>

          <h3 className="mt-2 truncate font-heading text-xl text-foreground">
            {record.chapterTitle}
          </h3>

          <p className="mt-1.5 font-body text-sm text-muted-foreground">
            Chapter {record.chapterNumber} of {record.totalChapters}
            <span aria-hidden="true" className="mx-2 text-muted-foreground/50">
              •
            </span>
            {isCompleted ? 'Completed' : `${progress}% read`}
          </p>

          {isCompleted ? (
            <p className="mt-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                <CheckIcon className="size-3.5 text-primary" />
                Completed
              </span>
            </p>
          ) : (
            <div className="mt-5 flex items-center gap-3">
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