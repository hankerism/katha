'use client';

import { useEffect } from 'react';
import {
  saveContinueReading,
  type ContinueReadingInput,
} from '@/lib/continue-reading';

/* ---------------------------------------------------------------------------
 * KATHA · ReadingProgressTracker
 * components/reader/ReadingProgressTracker.tsx
 *
 * Invisible client leaf that records the reader's current position on mount (and
 * whenever the chapter changes via client navigation). Renders nothing.
 *
 * Persistence now lives in the proper layer (lib/continue-reading): this leaf
 * just calls saveContinueReading() with the current chapter fields — the layer
 * stamps the ReadingLocation defaults + timestamp and owns the storage key and
 * record shape. The tracker's role (write-on-mount client leaf) is unchanged.
 * ------------------------------------------------------------------------- */

export default function ReadingProgressTracker({
  bookSlug,
  bookTitle,
  chapterSlug,
  chapterTitle,
  chapterNumber,
  totalChapters,
  href,
}: ContinueReadingInput) {
  useEffect(() => {
    saveContinueReading({
      bookSlug,
      bookTitle,
      chapterSlug,
      chapterTitle,
      chapterNumber,
      totalChapters,
      href,
    });
  }, [
    bookSlug,
    bookTitle,
    chapterSlug,
    chapterTitle,
    chapterNumber,
    totalChapters,
    href,
  ]);

  return null;
}