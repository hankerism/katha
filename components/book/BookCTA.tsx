'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readingDataRepository } from '@/lib/reading-data-repository';
import { ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · BookCTA
 * components/book/BookCTA.tsx
 *
 * The book detail page's primary action — the one client leaf on an otherwise
 * server-rendered page. Renders "Start Reading" (first chapter) by default;
 * after mount, if the saved Continue Reading position belongs to THIS book,
 * it upgrades itself to "Continue · Chapter N" deep-linking to that position.
 *
 * Reads via the persistence layer (never localStorage directly), and starts
 * from the server-safe default so hydration stays clean — the upgrade is a
 * plain post-mount state change.
 * ------------------------------------------------------------------------- */

export interface BookCTAProps {
  bookSlug: string;
  bookTitle: string;
  /** Reader href of chapter 1 — the "Start Reading" default. */
  firstChapterHref: string;
}

export default function BookCTA({
  bookSlug,
  bookTitle,
  firstChapterHref,
}: BookCTAProps) {
  const [target, setTarget] = useState({
    href: firstChapterHref,
    label: 'Start Reading',
  });

  useEffect(() => {
    let cancelled = false;
    void readingDataRepository.getContinueReading().then((record) => {
      if (cancelled || record?.bookSlug !== bookSlug) return;
      setTarget({
        href: record.href,
        label: `Continue · Chapter ${record.chapterNumber}`,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [bookSlug]);

  return (
    <Link
      href={target.href}
      aria-label={`${target.label} — ${bookTitle}`}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {target.label}
      <ArrowRightIcon className="size-4" />
    </Link>
  );
}
