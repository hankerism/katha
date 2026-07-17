/* ---------------------------------------------------------------------------
 * KATHA · Reader Preferences — persistence layer
 * lib/reader-preferences.ts
 *
 * How the reader likes their page set: theme, font size, line height, reading
 * width, paragraph spacing. Mirrors the other persistence layers (bookmarks,
 * history, continue-reading): pure persistence, SSR-safe, no React, no CSS,
 * no book content. What these values LOOK like (class names, CSS variables)
 * is the selector layer's concern (lib/reader-preference-selectors.ts).
 *
 * Unlike reading data, preferences are NOT member-gated: they are device
 * comfort settings, and a guest adjusting text size must be respected.
 *
 * Every value is a named step on a small scale, not a raw number — the design
 * system owns the actual typography values in CSS. Defaults reproduce the
 * reader's original appearance, so a visitor with no saved preferences sees
 * exactly what they always saw.
 *
 * Legacy migration: the original record was { size, width, theme } (written by
 * the old ReaderPreferences component). `size` becomes `fontSize`; the fields
 * that didn't exist yet get defaults. Upgraded once on read, like bookmarks.
 *
 * Writes dispatch READER_PREFERENCES_CHANGED_EVENT (the membership pattern) so
 * every mounted consumer — the reader shell today, a Settings page tomorrow —
 * stays in sync without prop drilling.
 *
 * SSR-safe: every accessor returns defaults / no-ops without a window.
 * ------------------------------------------------------------------------- */

export const READER_THEMES = ['light', 'sepia', 'dark'] as const;
export const READER_FONT_SIZES = ['small', 'medium', 'large'] as const;
export const READER_LINE_HEIGHTS = ['compact', 'normal', 'relaxed'] as const;
export const READER_WIDTHS = ['narrow', 'medium', 'wide'] as const;
export const READER_PARAGRAPH_SPACINGS = ['tight', 'normal', 'loose'] as const;

export type ReaderTheme = (typeof READER_THEMES)[number];
export type ReaderFontSize = (typeof READER_FONT_SIZES)[number];
export type ReaderLineHeight = (typeof READER_LINE_HEIGHTS)[number];
export type ReaderWidth = (typeof READER_WIDTHS)[number];
export type ReaderParagraphSpacing = (typeof READER_PARAGRAPH_SPACINGS)[number];

export interface ReaderPreferences {
  theme: ReaderTheme;
  fontSize: ReaderFontSize;
  lineHeight: ReaderLineHeight;
  width: ReaderWidth;
  paragraphSpacing: ReaderParagraphSpacing;
}

export const READER_PREFERENCES_STORAGE_KEY = 'katha:reader-preferences';

/** Fired on every preference write so mounted surfaces (the reader shell, a
 *  future Settings page) can refresh without a navigation. */
export const READER_PREFERENCES_CHANGED_EVENT =
  'katha:reader-preferences-changed';

/** Reproduces the reader's original appearance exactly — a visitor with no
 *  saved record sees no change. */
export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  theme: 'light',
  fontSize: 'medium',
  lineHeight: 'normal',
  width: 'medium',
  paragraphSpacing: 'normal',
};

/* ── Validation ──────────────────────────────────────────────────────────── */

function oneOf<T extends string>(
  values: readonly T[],
  value: unknown,
  fallback: T,
): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

/** Normalize any stored value into complete, valid preferences. Handles the
 *  legacy { size, width, theme } shape (`size` → `fontSize`) and fills every
 *  missing or unrecognizable field with its default. Pure transform. */
function normalize(value: unknown): ReaderPreferences {
  if (!value || typeof value !== 'object') return DEFAULT_READER_PREFERENCES;
  const r = value as Record<string, unknown>;
  const d = DEFAULT_READER_PREFERENCES;
  return {
    theme: oneOf(READER_THEMES, r.theme, d.theme),
    // Legacy records stored the font size under `size`.
    fontSize: oneOf(READER_FONT_SIZES, r.fontSize ?? r.size, d.fontSize),
    lineHeight: oneOf(READER_LINE_HEIGHTS, r.lineHeight, d.lineHeight),
    width: oneOf(READER_WIDTHS, r.width, d.width),
    paragraphSpacing: oneOf(
      READER_PARAGRAPH_SPACINGS,
      r.paragraphSpacing,
      d.paragraphSpacing,
    ),
  };
}

/* ── Read / write ────────────────────────────────────────────────────────── */

/** The saved preferences, complete and valid. Migrates legacy records and
 *  backfills missing fields, persisting the upgrade once so the stored shape
 *  converges. Returns defaults on the server / with nothing saved. */
export function getReaderPreferences(): ReaderPreferences {
  if (typeof window === 'undefined') return DEFAULT_READER_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(READER_PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_READER_PREFERENCES;
    const preferences = normalize(JSON.parse(raw));
    // Persist the upgrade once if the stored shape isn't already current.
    if (raw !== JSON.stringify(preferences)) saveReaderPreferences(preferences);
    return preferences;
  } catch {
    return DEFAULT_READER_PREFERENCES;
  }
}

/** Persist the full record and announce the change. No-op on the server /
 *  when storage is unavailable. */
export function saveReaderPreferences(preferences: ReaderPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      READER_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    );
    window.dispatchEvent(new Event(READER_PREFERENCES_CHANGED_EVENT));
  } catch {
    // Storage unavailable (private mode, disabled, quota) — best-effort.
  }
}

/* ── Mutations ───────────────────────────────────────────────────────────── */

/** Merge a partial change into the saved preferences. Returns the result. */
export function updateReaderPreferences(
  patch: Partial<ReaderPreferences>,
): ReaderPreferences {
  const next = normalize({ ...getReaderPreferences(), ...patch });
  saveReaderPreferences(next);
  return next;
}

/** Back to the defaults (removes the record entirely). */
export function resetReaderPreferences(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(READER_PREFERENCES_STORAGE_KEY);
    window.dispatchEvent(new Event(READER_PREFERENCES_CHANGED_EVENT));
  } catch {
    // best-effort
  }
}
