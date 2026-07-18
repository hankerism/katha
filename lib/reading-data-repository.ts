/* ---------------------------------------------------------------------------
 * KATHA · Reading Data — repository seam
 * lib/reading-data-repository.ts
 *
 * The formal contract for the reader's personal data — bookmarks, reading
 * history, and the Continue Reading position — behind an ASYNC interface,
 * mirroring lib/studio/work-repository.ts: when this becomes Supabase, the
 * swap is one exported instance and zero call sites.
 *
 * The three domains share one repository on purpose: they share the
 * ReadingLocation model, they will share one backend client and one auth
 * context, and every consumer that shows "your reading" (dashboard, home
 * shelves) reads them together.
 *
 * LocalReadingData delegates to the existing pure persistence layers
 * (lib/bookmarks, lib/history, lib/continue-reading) — those modules ARE the
 * local implementation: validation, de-dupe, migration, caps, and SSR-safety
 * all live there, unchanged and still harness-testable in isolation. Pure
 * helpers that derive over data the caller already holds (isBookmarked,
 * historyEntryId) stay exported from the layers; the repository carries only
 * the operations that touch storage.
 *
 * UI components and pages consume THIS module (or hooks over it), never the
 * persistence layers directly.
 * ------------------------------------------------------------------------- */

import {
  getBookmarks,
  removeBookmark,
  toggleBookmark,
  type Bookmark,
} from './bookmarks';
import {
  getHistory,
  recordVisit,
  removeHistoryEntry,
  clearHistory,
  type HistoryEntry,
} from './history';
import {
  getContinueReading,
  saveContinueReading,
  clearContinueReading,
  type ContinueReadingInput,
  type ContinueReadingRecord,
} from './continue-reading';
import type {
  ReadingLocation,
  ReadingLocationIdentity,
} from './reading-location';

export interface ReadingDataRepository {
  /* ── Bookmarks ─────────────────────────────────────────────────────────── */
  /** All saved bookmarks, newest first. */
  listBookmarks(): Promise<Bookmark[]>;
  /** Add the location if absent, remove it if present. Returns the new list. */
  toggleBookmark(location: ReadingLocation): Promise<Bookmark[]>;
  /** Remove by location (or id). Returns the updated list. */
  removeBookmark(target: ReadingLocationIdentity | string): Promise<Bookmark[]>;

  /* ── Reading history ───────────────────────────────────────────────────── */
  /** All history entries, newest first. */
  listHistory(): Promise<HistoryEntry[]>;
  /** Record a visit (de-duped by location; most recent wins). Returns the list. */
  recordVisit(location: ReadingLocation): Promise<HistoryEntry[]>;
  /** Remove a single entry by location (or id). Returns the updated list. */
  removeHistoryEntry(
    target: ReadingLocationIdentity | string,
  ): Promise<HistoryEntry[]>;
  clearHistory(): Promise<void>;

  /* ── Continue Reading ──────────────────────────────────────────────────── */
  /** The single most-recent reading position, or null. */
  getContinueReading(): Promise<ContinueReadingRecord | null>;
  /** Persist the current position (the layer stamps defaults + timestamp). */
  saveContinueReading(input: ContinueReadingInput): Promise<void>;
  clearContinueReading(): Promise<void>;
}

/* ── Local implementation ────────────────────────────────────────────────── */

class LocalReadingData implements ReadingDataRepository {
  async listBookmarks(): Promise<Bookmark[]> {
    return getBookmarks();
  }

  async toggleBookmark(location: ReadingLocation): Promise<Bookmark[]> {
    return toggleBookmark(location);
  }

  async removeBookmark(
    target: ReadingLocationIdentity | string,
  ): Promise<Bookmark[]> {
    return removeBookmark(target);
  }

  async listHistory(): Promise<HistoryEntry[]> {
    return getHistory();
  }

  async recordVisit(location: ReadingLocation): Promise<HistoryEntry[]> {
    return recordVisit(location);
  }

  async removeHistoryEntry(
    target: ReadingLocationIdentity | string,
  ): Promise<HistoryEntry[]> {
    return removeHistoryEntry(target);
  }

  async clearHistory(): Promise<void> {
    clearHistory();
  }

  async getContinueReading(): Promise<ContinueReadingRecord | null> {
    return getContinueReading();
  }

  async saveContinueReading(input: ContinueReadingInput): Promise<void> {
    saveContinueReading(input);
  }

  async clearContinueReading(): Promise<void> {
    clearContinueReading();
  }
}

/** The seam: swap this instance for SupabaseReadingData and every consumer
 *  is already correct. */
export const readingDataRepository: ReadingDataRepository =
  new LocalReadingData();
