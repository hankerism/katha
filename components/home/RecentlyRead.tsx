'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { HistoryEntry } from '@/lib/history';
import { readingDataRepository } from '@/lib/reading-data-repository';
import {
  catalogueRepository,
  type KathaBook,
} from '@/lib/catalogue-repository';
import { groupHistoryByBook, getChapterNumber } from '@/lib/history-selectors';
import { relativeTimeLabel } from '@/lib/relative-time';
import { ClockIcon, ArrowRightIcon } from '@/components/ui/icons';
import { useViewer } from '@/components/membership/use-viewer';

/* ---------------------------------------------------------------------------
 * KATHA · RecentlyRead
 * components/home/RecentlyRead.tsx
 *
 * Homepage shelf of recently visited books — the History feature's home
 * surface, completing the triad next to ContinueReading and BookmarksShelf.
 * Client component: history lives only in localStorage, so it is read in an
 * effect after mount and render is gated on a `loaded` flag (BookmarksShelf's
 * pattern), keeping hydration clean.
 *
 * One card per BOOK, not per entry: raw history de-dupes per paragraph, so the
 * newest N entries could all be passages of one chapter. groupHistoryByBook()
 * already collapses that — the shelf shows the most recent location in each of
 * the most-recently-visited books. All history logic stays in the lib layers;
 * this only reads via getHistory() + the selectors. Tokens only.
 *
 * With no history there is nothing to retrace, so the shelf renders nothing
 * (ContinueReading's pattern) — BookmarksShelf already owns the "start
 * reading" invitation on an empty home page.
 * ------------------------------------------------------------------------- */

const MAX_VISIBLE = 3;

export default function RecentlyRead() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [books, setBooks] = useState<readonly KathaBook[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { viewer, loaded: viewerLoaded } = useViewer();

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      readingDataRepository.listHistory(),
      catalogueRepository.listBooks(),
    ]).then(([found, foundBooks]) => {
      if (cancelled) return;
      setEntries(found);
      setBooks(foundBooks);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Until we've read storage, render nothing (matches the server pass).
  // Guests see no member shelves — home's one invitation lives elsewhere.
  if (!loaded || !viewerLoaded || viewer.tier === 'guest') return null;

  // One card per book, most-recently-visited book first; each card shows that
  // book's newest location. Orphaned books sort last and simply fall off the
  // shelf when there are more than MAX_VISIBLE groups.
  const groups = groupHistoryByBook(entries, books).slice(0, MAX_VISIBLE);
  if (groups.length === 0) return null;

  // The /history page shows every location, so "view all" appears whenever the
  // shelf is showing less than the full story.
  const visibleCount = groups.length;
  const hasMore = entries.length > visibleCount;

  return (
    <section
      aria-labelledby="recently-read-heading"
      className="container-katha py-16 md:py-20"
    >
      <h2
        id="recently-read-heading"
        className="font-heading text-2xl text-foreground sm:text-3xl"
      >
        Recently Read
      </h2>
      <p className="mt-1.5 font-body text-sm text-muted-foreground">
        Retrace your steps through the books you&rsquo;ve visited.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const latest: HistoryEntry = group.entries[0];
          const chapterNumber = getChapterNumber(latest, books);
          return (
            <article
              key={group.bookSlug}
              className="flex flex-col rounded-[18px] border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="truncate font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {group.bookTitle}
                </p>
                <ClockIcon className="size-4 shrink-0 text-accent" />
              </div>

              <h3 className="mt-3 line-clamp-2 font-heading text-lg leading-snug text-foreground">
                {latest.chapterTitle}
              </h3>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                {chapterNumber > 0 ? `Chapter ${chapterNumber}` : 'Chapter'}
                <span aria-hidden="true" className="mx-2 text-muted-foreground/50">
                  ·
                </span>
                {relativeTimeLabel(latest.visitedAt, 'Visited')}
              </p>

              <div className="mt-auto pt-6">
                <Link
                  href={latest.href}
                  aria-label={`Continue reading ${group.bookTitle}, ${latest.chapterTitle}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Continue reading
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6">
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            View reading history
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}
