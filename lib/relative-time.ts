/* ---------------------------------------------------------------------------
 * KATHA · Relative time
 * lib/relative-time.ts
 *
 * The one calm, editorial relative-time formatter. Five surfaces previously
 * carried their own ladders that disagreed ("Saved 3 days ago" vs "Opened
 * recently" for the same age); this is the single ladder, calendar-day aware,
 * parameterized only by the verb ("Saved" / "Opened" / "Visited").
 *
 * Client-only by nature (it reads the current clock) — call sites already
 * render these labels after mount, so there is no server/client mismatch.
 * ------------------------------------------------------------------------- */

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "Saved just now" · "Visited yesterday" · "Opened 3 weeks ago" ·
 *  "Saved on Mar 4, 2026". Unparseable timestamps degrade to the verb alone. */
export function relativeTimeLabel(iso: string, verb: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return verb;

  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  if (diffMs >= 0 && diffMs < FIVE_MINUTES) return `${verb} just now`;

  // Calendar-day distance, so 11pm → 1am reads "yesterday", not "today".
  const days = Math.max(
    0,
    Math.round((startOfDay(now) - startOfDay(then)) / ONE_DAY),
  );

  if (days <= 0) return `${verb} today`;
  if (days === 1) return `${verb} yesterday`;
  if (days < 7) return `${verb} ${days} days ago`;
  if (days < 14) return `${verb} last week`;
  if (days < 30) return `${verb} ${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return `${verb} last month`;
  if (days < 365) return `${verb} ${Math.floor(days / 30)} months ago`;
  return `${verb} on ${then.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}
