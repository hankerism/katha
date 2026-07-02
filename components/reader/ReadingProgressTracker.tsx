'use client';

import { useEffect } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · ReadingProgressTracker
 * components/reader/ReadingProgressTracker.tsx
 *
 * Invisible client leaf that records the reader's current position to
 * localStorage on mount (and whenever the chapter changes via client
 * navigation). Renders nothing. No UI — a future "Continue Reading" shelf reads
 * the stored record back via STORAGE_KEY / ContinueReadingRecord.
 * ------------------------------------------------------------------------- */

export const STORAGE_KEY = 'katha:continue-reading';

export interface ContinueReadingRecord {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
  totalChapters: number;
  href: string;
  updatedAt: string;
}

type ReadingProgressTrackerProps = Omit<
  ContinueReadingRecord,
  'updatedAt'
>;

export default function ReadingProgressTracker({
  bookSlug,
  bookTitle,
  chapterSlug,
  chapterTitle,
  chapterNumber,
  totalChapters,
  href,
}: ReadingProgressTrackerProps) {
  useEffect(() => {
    console.log('📚 ReadingProgressTracker mounted');

    const record: ContinueReadingRecord = {
      bookSlug,
      bookTitle,
      chapterSlug,
      chapterTitle,
      chapterNumber,
      totalChapters,
      href,
      updatedAt: new Date().toISOString(),
    };

    console.log('💾 Saving reading progress:', record);

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(record)
      );

      console.log(
        '✅ Saved to localStorage:',
        window.localStorage.getItem(STORAGE_KEY)
      );
    } catch (error) {
      console.error('❌ Failed to save reading progress:', error);
    }
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
