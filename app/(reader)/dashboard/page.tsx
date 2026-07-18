'use client';

import { useEffect, useState } from 'react';
import type { Bookmark } from '@/lib/bookmarks';
import type { HistoryEntry } from '@/lib/history';
import type { ContinueReadingRecord } from '@/lib/continue-reading';
import { readingDataRepository } from '@/lib/reading-data-repository';
import {
  catalogueRepository,
  type KathaBook,
} from '@/lib/catalogue-repository';
import { groupHistoryByBook } from '@/lib/history-selectors';
import {
  resolvePreview,
  getChapterNumber,
  readingProgress,
} from '@/lib/continue-reading-selectors';
import { relativeTimeLabel } from '@/lib/relative-time';
import { useViewer } from '@/components/membership/use-viewer';
import { useReaderPreferences } from '@/components/reader/use-reader-preferences';
import MembershipInvitation from '@/components/membership/MembershipInvitation';
import ReadingLocationCard from '@/components/ui/ReadingLocationCard';
import DashboardSection from '@/components/dashboard/DashboardSection';
import ReadingStatsStrip from '@/components/dashboard/ReadingStatsStrip';
import PreferencesSummary from '@/components/dashboard/PreferencesSummary';
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState';
import type { ReadingLocation } from '@/lib/reading-location';

/* ---------------------------------------------------------------------------
 * KATHA · Reader Dashboard
 * app/(reader)/dashboard/page.tsx
 *
 * The reader's personal home — assembly only, on the pattern shared by the
 * Bookmarks / History / Continue Reading pages: client component (all reading
 * data lives in localStorage), mount-gated reads via the persistence layers,
 * guest gate via useViewer → MembershipInvitation, and the shared
 * ReadingLocationCard for every location shown.
 *
 * Nothing here owns business logic: grouping and derivation come from the
 * existing selectors, and each section links to its feature's full page.
 * Sections self-hide when empty; a member with no activity at all meets one
 * warm onboarding hero (DashboardEmptyState) instead of five empty boxes.
 *
 * The stats are derived INLINE from data already loaded (per the approved
 * architecture): extract a reading-stats selector only when a second consumer
 * appears or the derivation grows real complexity. They are framed as recent
 * activity because history is capped and clearable — not lifetime truth.
 * ------------------------------------------------------------------------- */

const MAX_SECTION_CARDS = 3;

/** Cross-book card citation: "Book · Chapter N" (chapter title when the
 *  chapter is unknown/orphaned). Composed here via the shared selector — the
 *  card never derives this itself. */
function composeEyebrow(
  location: Pick<
    ReadingLocation,
    'bookSlug' | 'bookTitle' | 'chapterSlug' | 'chapterTitle'
  >,
  books: readonly KathaBook[],
): string {
  const number = getChapterNumber(location, books);
  return number > 0
    ? `${location.bookTitle} · Chapter ${number}`
    : `${location.bookTitle} · ${location.chapterTitle}`;
}

/** "Reading since July 2026" from the membership joinedAt timestamp. */
function readingSinceLabel(joinedAt: string): string | null {
  const time = Date.parse(joinedAt);
  if (Number.isNaN(time)) return null;
  const formatted = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(time);
  return `Reading since ${formatted}`;
}

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [record, setRecord] = useState<ContinueReadingRecord | null>(null);
  const [books, setBooks] = useState<readonly KathaBook[]>([]);
  const { viewer, loaded: viewerLoaded } = useViewer();
  const { preferences } = useReaderPreferences();
  const isGuest = viewerLoaded && viewer.tier === 'guest';

  // Read once on mount through the repositories, then reveal together.
  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      readingDataRepository.listBookmarks(),
      readingDataRepository.listHistory(),
      readingDataRepository.getContinueReading(),
      catalogueRepository.listBooks(),
    ]).then(([foundBookmarks, foundHistory, foundRecord, foundBooks]) => {
      if (cancelled) return;
      setBookmarks(foundBookmarks);
      setHistory(foundHistory);
      setRecord(foundRecord);
      setBooks(foundBooks);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const historyGroups = groupHistoryByBook(history, books);
  const recentBookmarks = bookmarks.slice(0, MAX_SECTION_CARDS);
  const recentBooks = historyGroups.slice(0, MAX_SECTION_CARDS);

  // Inline stat derivation (see header). "Started" = opened at least one
  // chapter; "opened" = distinct chapters visited — the history id already
  // encodes book:chapter:paragraph, so chapters collapse via a Set.
  const booksStarted = historyGroups.length;
  const chaptersOpened = new Set(
    history.map((entry) => `${entry.bookSlug}:${entry.chapterSlug}`),
  ).size;
  const passagesSaved = bookmarks.length;

  const hasActivity = record !== null || bookmarks.length > 0 || history.length > 0;
  const since = viewer.joinedAt ? readingSinceLabel(viewer.joinedAt) : null;

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-[720px] px-5 py-16 sm:px-6 sm:py-20">
        {/* Header — static, renders immediately; the personal line follows
            the mount-gate like every member surface. */}
        <header>
          <p className="font-body text-[0.72rem] font-medium uppercase tracking-[0.26em] text-muted-foreground">
            Your library
          </p>
          <h1 className="mt-3 font-logo text-4xl font-semibold tracking-[-0.01em] text-foreground sm:text-5xl">
            Welcome back
          </h1>
          {loaded && !isGuest && (viewer.user || since) && (
            <p className="mt-4 font-body text-[0.98rem] leading-relaxed text-muted-foreground">
              {viewer.user && (
                <span className="font-medium text-reader-foreground">
                  {viewer.user.firstName}
                </span>
              )}
              {viewer.user && since && ' · '}
              {since}
            </p>
          )}
        </header>

        {/* Guests meet the invitation — any reading data already on this
            device stays stored and reappears the moment they join. */}
        {isGuest && (
          <MembershipInvitation
            heading="A home for your reading."
            invitation="Members get a personal dashboard — the chapter they are on, their saved passages, their recent activity, all in one calm place. Join KATHA and make yourself at home."
            from="/dashboard"
          />
        )}

        {loaded && !isGuest && hasActivity && (
          <div className="mt-9 h-px w-full bg-border/70" />
        )}

        {/* Storage-dependent region — mount-gated, members only */}
        {loaded &&
          !isGuest &&
          (hasActivity ? (
            <div className="mt-11 space-y-14">
              <ReadingStatsStrip
                booksStarted={booksStarted}
                chaptersOpened={chaptersOpened}
                passagesSaved={passagesSaved}
              />

              {record && (
                <DashboardSection title="Continue Reading">
                  <ReadingLocationCard
                    href={record.href}
                    eyebrow={composeEyebrow(record, books)}
                    preview={resolvePreview(record, books)}
                    meta={relativeTimeLabel(record.updatedAt, 'Opened')}
                    ariaLabel={`Continue reading ${record.bookTitle}, ${record.chapterTitle}`}
                    showRibbon={false}
                    continueLabel="Resume"
                    progress={readingProgress(record)}
                  />
                </DashboardSection>
              )}

              {recentBookmarks.length > 0 && (
                <DashboardSection title="Recent bookmarks" viewAllHref="/bookmarks">
                  <div className="space-y-4">
                    {recentBookmarks.map((bookmark) => (
                      <ReadingLocationCard
                        key={bookmark.id}
                        href={bookmark.href}
                        eyebrow={composeEyebrow(bookmark, books)}
                        preview={resolvePreview(bookmark, books)}
                        meta={relativeTimeLabel(bookmark.createdAt, 'Saved')}
                        ariaLabel={`Continue reading ${bookmark.bookTitle}, ${bookmark.chapterTitle}`}
                      />
                    ))}
                  </div>
                </DashboardSection>
              )}

              {recentBooks.length > 0 && (
                <DashboardSection title="Recently read" viewAllHref="/history">
                  <div className="space-y-4">
                    {recentBooks.map((group) => {
                      const latest = group.entries[0];
                      return (
                        <ReadingLocationCard
                          key={group.bookSlug}
                          href={latest.href}
                          eyebrow={composeEyebrow(latest, books)}
                          preview={resolvePreview(latest, books)}
                          meta={relativeTimeLabel(latest.visitedAt, 'Visited')}
                          ariaLabel={`Continue reading ${group.bookTitle}, ${latest.chapterTitle}`}
                        />
                      );
                    })}
                  </div>
                </DashboardSection>
              )}

              <DashboardSection title="Reading preferences">
                <PreferencesSummary preferences={preferences} />
              </DashboardSection>
            </div>
          ) : (
            <DashboardEmptyState />
          ))}
      </main>
    </div>
  );
}
