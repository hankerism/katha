/* ---------------------------------------------------------------------------
 * KATHA · Continue Reading — persistence layer
 * lib/continue-reading.ts
 *
 * The single most-recent reading position, persisted under one key. Mirrors the
 * bookmark/history persistence layers: pure persistence, SSR-safe, independent
 * of book content.
 *
 * A record is a ReadingLocation plus chapter progress + a timestamp — completing
 * the pattern shared with Bookmark and HistoryEntry. Continue Reading is
 * chapter-level, so the reader supplies chapter fields only; the persistence
 * layer stamps the ReadingLocation defaults (paragraph 0, empty preview → the
 * selector resolves the chapter's opening passage) and the timestamp. That keeps
 * ReadingProgressTracker's inputs unchanged while giving the UI a full
 * ReadingLocation to render through ReadingLocationCard.
 *
 * SSR-safe: every accessor no-ops (returns null / does nothing) without a window.
 * ------------------------------------------------------------------------- */

import type { ReadingLocation } from './reading-location';

export interface ContinueReadingRecord extends ReadingLocation {
  chapterNumber: number;
  totalChapters: number;
  /** ISO timestamp of the last visit. */
  updatedAt: string;
}

export const CONTINUE_READING_STORAGE_KEY = 'katha:continue-reading';

/** The fields the reader supplies when recording a position. The persistence
 *  layer stamps the ReadingLocation defaults (paragraph 0, empty preview) and
 *  updatedAt, so callers never deal with those. */
export type ContinueReadingInput = Omit<
  ContinueReadingRecord,
  'paragraphIndex' | 'preview' | 'updatedAt'
>;

/* ── Validation ──────────────────────────────────────────────────────────── */

/** Validates the fields always written for a record. paragraphIndex/preview are
 *  backfilled on read (see getContinueReading), so older records still resolve. */
function hasCoreFields(
  value: unknown,
): value is Omit<ContinueReadingRecord, 'paragraphIndex' | 'preview'> {
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

/* ── Read / write ────────────────────────────────────────────────────────── */

/** The single most-recent reading position, or null. Backfills the
 *  ReadingLocation fields (paragraph 0, empty preview) for records written
 *  before they existed, so the result is always a complete ReadingLocation.
 *  Returns null on the server. */
export function getContinueReading(): ContinueReadingRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONTINUE_READING_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!hasCoreFields(parsed)) return null;

    const maybe = parsed as { paragraphIndex?: unknown; preview?: unknown };
    return {
      ...parsed,
      paragraphIndex:
        typeof maybe.paragraphIndex === 'number' ? maybe.paragraphIndex : 0,
      preview: typeof maybe.preview === 'string' ? maybe.preview : '',
    };
  } catch {
    return null;
  }
}

/** Persist the current position. Stamps the ReadingLocation defaults + the
 *  timestamp. No-op on the server / when storage is unavailable. */
export function saveContinueReading(input: ContinueReadingInput): void {
  if (typeof window === 'undefined') return;
  const record: ContinueReadingRecord = {
    ...input,
    paragraphIndex: 0,
    preview: '',
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(
      CONTINUE_READING_STORAGE_KEY,
      JSON.stringify(record),
    );
  } catch {
    // Storage unavailable (private mode, disabled, quota) — best-effort.
  }
}

/** Clear the saved position. No-op on the server. */
export function clearContinueReading(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CONTINUE_READING_STORAGE_KEY);
  } catch {
    // best-effort
  }
}