'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SVGProps } from 'react';
import { getContinueReading } from '@/lib/continue-reading';

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
    const record = getContinueReading();
    if (record?.bookSlug === bookSlug) {
      setTarget({
        href: record.href,
        label: `Continue · Chapter ${record.chapterNumber}`,
      });
    }
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
