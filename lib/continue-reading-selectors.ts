/* ---------------------------------------------------------------------------
 * KATHA · Continue Reading selectors (content-aware helpers)
 * lib/continue-reading-selectors.ts
 *
 * The content-aware companion to the pure persistence layer
 * (lib/continue-reading.ts), mirroring bookmark-selectors / history-selectors.
 * It owns the CONTINUE-READING-specific derivation — reading progress — and
 * builds on the shared location helpers in lib/reading-location-selectors.ts
 * (chapter number, preview resolution), which it re-exports so the Continue
 * Reading UI imports everything from this one module.
 *
 * Kept separate on purpose: lib/continue-reading.ts stays a pure persistence
 * layer, while all derivation lives in the selector layer. UI consumes
 * selectors, never lib/books.ts directly.
 * ------------------------------------------------------------------------- */

import type { ContinueReadingRecord } from './continue-reading';

// Shared, location-level helpers — re-exported so the Continue Reading UI has a
// single import surface. Implementations live in reading-location-selectors.
import {
  getChapterNumber,
  resolvePreview,
} from './reading-location-selectors';

export { getChapterNumber, resolvePreview };

/** 0–100 reading progress from chapter position. Clamped and rounded. */
export function readingProgress(
  record: Pick<ContinueReadingRecord, 'chapterNumber' | 'totalChapters'>,
): number {
  if (record.totalChapters <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round((record.chapterNumber / record.totalChapters) * 100)),
  );
}