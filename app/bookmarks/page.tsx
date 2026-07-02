'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SVGProps } from 'react';
import { getBookmarks, removeBookmark, type Bookmark } from '@/lib/bookmarks';
import {
  groupBookmarksByBook,
  resolvePreview,
  getChapterNumber,
} from '@/lib/bookmark-selectors';
import ReadingLocationCard from '@/components/ui/ReadingLocationCard';

/* ---------------------------------------------------------------------------
 * KATHA · Bookmarks page
 * app/bookmarks/page.tsx
 *
 * The reader's personal anthology of marked passages. Client component:
 * bookmarks live only in localStorage, so we mount-gate the storage-dependent
 * region (same pattern as BookmarksShelf) to avoid a hydration mismatch or a
 * false empty-state flash. The static header renders immediately.
 *
 * Assembly only, on top of the Phase 1 foundation + the ReadingLocationCard:
 *   getBookmarks() → groupBookmarksByBook() → one section per book (most-recent
 *   activity first), bookmarks within a book in reading order. Card props
 *   (eyebrow / preview / meta / href) are composed HERE via the selectors, so
 *   no book logic leaks into the presentational card.
 *
 * Delete is wired to removeBookmark() with an immediate local-state update; the
 * empty state appears automatically when the last bookmark is removed. Deferred
 * to later phases: the undo toast, paragraph-level capture, scroll restoration.
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function RibbonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Calm, editorial relative time for the "saved" label. Client-only (rendered
 *  after mount), so no server/client clock mismatch. */
function formatSavedAt(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Saved';
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'Saved today';
  if (days === 1) return 'Saved yesterday';
  if (days < 7) return `Saved ${days} days ago`;
  if (days < 14) return 'Saved last week';
  if (days < 30) return `Saved ${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'Saved last month';
  if (days < 365) return `Saved ${Math.floor(days / 30)} months ago`;
  return `Saved on ${new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

/** Chapter citation for the card eyebrow, composed from the selectors — the
 *  card never derives this itself. Falls back gracefully for orphaned chapters. */
function composeEyebrow(bookmark: Bookmark): string {
  const number = getChapterNumber(bookmark);
  return number > 0
    ? `Chapter ${number} · ${bookmark.chapterTitle}`
    : bookmark.chapterTitle;
}

function pluralize(count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

export default function BookmarksPage() {
  const [loaded, setLoaded] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Bookmarks live in localStorage — read once on mount, then reveal.
  useEffect(() => {
    setBookmarks(getBookmarks());
    setLoaded(true);
  }, []);

  const groups = groupBookmarksByBook(bookmarks);
  const hasBookmarks = bookmarks.length > 0;

  // Remove immediately: removeBookmark() filters + persists via the foundation
  // and returns the next list. The functional updater removes from the LATEST
  // list, so quick successive deletes can't race on a stale closure. When the
  // last one goes, `groups` empties and the empty state renders automatically.
  function handleRemove(id: string) {
    setBookmarks((current) => removeBookmark(id, current));
  }

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-[720px] px-5 py-16 sm:px-6 sm:py-20">
        {/* Header — static, renders immediately */}
        <header>
          <p className="font-body text-[0.72rem] font-medium uppercase tracking-[0.26em] text-muted-foreground">
            Your library
          </p>
          <h1 className="mt-3 font-logo text-4xl font-semibold tracking-[-0.01em] text-foreground sm:text-5xl">
            Bookmarks
          </h1>
          {loaded && hasBookmarks && (
            <p className="mt-4 font-body text-[0.98rem] leading-relaxed text-muted-foreground">
              <span className="font-medium text-reader-foreground">
                {pluralize(bookmarks.length, 'passage')} across{' '}
                {pluralize(groups.length, 'book')}
              </span>{' '}
              · marked to return to.
            </p>
          )}
        </header>

        {loaded && hasBookmarks && (
          <div className="mt-9 h-px w-full bg-border/70" />
        )}

        {/* Storage-dependent region — mount-gated */}
        {loaded &&
          (hasBookmarks ? (
            <div className="mt-11 space-y-14">
              {groups.map((group) => (
                <section key={group.bookSlug} aria-label={group.bookTitle}>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <h2 className="font-logo text-2xl font-semibold leading-tight text-foreground">
                      {group.bookTitle}
                    </h2>
                    <span className="shrink-0 pb-1 font-body text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {pluralize(group.bookmarks.length, 'passage')}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {group.bookmarks.map((bookmark) => (
                      <ReadingLocationCard
                        key={bookmark.id}
                        href={bookmark.href}
                        eyebrow={composeEyebrow(bookmark)}
                        preview={resolvePreview(bookmark)}
                        meta={formatSavedAt(bookmark.createdAt)}
                        ariaLabel={`Continue reading ${group.bookTitle}, ${bookmark.chapterTitle}`}
                        onRemove={() => handleRemove(bookmark.id)}
                        removeLabel={`Remove bookmark: ${bookmark.chapterTitle}`}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* Approved empty state */
            <div className="mt-16 flex flex-col items-center text-center">
              <RibbonIcon className="size-8 text-primary/40" />
              <p className="mt-6 font-reader text-2xl text-reader-foreground">
                Nothing marked yet
              </p>
              <p className="mt-3 max-w-[38ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
                When a passage is worth returning to, tap the ribbon while
                reading and it will wait for you here.
              </p>
              <Link
                href="/library"
                className={cx(
                  'mt-7 inline-flex items-center gap-2 rounded-full font-body text-[0.85rem] font-medium text-primary',
                  'transition-colors hover:text-primary/80',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                Browse the library
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          ))}
      </main>
    </div>
  );
}