'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Bookmark } from '@/lib/bookmarks';
import { readingDataRepository } from '@/lib/reading-data-repository';
import {
  catalogueRepository,
  type KathaBook,
} from '@/lib/catalogue-repository';
import { relativeTimeLabel } from '@/lib/relative-time';
import { RibbonIcon, ArrowRightIcon } from '@/components/ui/icons';
import { useViewer } from '@/components/membership/use-viewer';
import MembershipInvitation from '@/components/membership/MembershipInvitation';
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

/** Chapter citation for the card eyebrow, composed from the selectors — the
 *  card never derives this itself. Falls back gracefully for orphaned chapters. */
function composeEyebrow(bookmark: Bookmark, books: readonly KathaBook[]): string {
  const number = getChapterNumber(bookmark, books);
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
  const [books, setBooks] = useState<readonly KathaBook[]>([]);
  const { viewer, loaded: viewerLoaded } = useViewer();
  const isGuest = viewerLoaded && viewer.tier === 'guest';

  // Read once on mount through the repositories (bookmarks + the catalogue
  // snapshot the selectors derive over), then reveal together.
  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      readingDataRepository.listBookmarks(),
      catalogueRepository.listBooks(),
    ]).then(([foundBookmarks, foundBooks]) => {
      if (cancelled) return;
      setBookmarks(foundBookmarks);
      setBooks(foundBooks);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = groupBookmarksByBook(bookmarks, books);
  const hasBookmarks = bookmarks.length > 0;

  // Remove through the repository, which persists and returns the next list —
  // storage is the single source of truth, so quick successive deletes can't
  // race on a stale closure. When the last one goes, `groups` empties and the
  // empty state renders automatically.
  function handleRemove(id: string) {
    void readingDataRepository.removeBookmark(id).then(setBookmarks);
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
          {loaded && !isGuest && hasBookmarks && (
            <p className="mt-4 font-body text-[0.98rem] leading-relaxed text-muted-foreground">
              <span className="font-medium text-reader-foreground">
                {pluralize(bookmarks.length, 'passage')} across{' '}
                {pluralize(groups.length, 'book')}
              </span>{' '}
              · marked to return to.
            </p>
          )}
        </header>

        {/* Guests meet the invitation — anything already marked on this
            device stays stored and reappears the moment they join. */}
        {isGuest && (
          <MembershipInvitation
            heading="Every marked passage, kept."
            invitation="Members keep the passages worth returning to — tap the ribbon while reading and it waits here. Join KATHA and the library starts remembering."
            from="/bookmarks"
          />
        )}

        {loaded && !isGuest && hasBookmarks && (
          <div className="mt-9 h-px w-full bg-border/70" />
        )}

        {/* Storage-dependent region — mount-gated, members only */}
        {loaded &&
          !isGuest &&
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
                        eyebrow={composeEyebrow(bookmark, books)}
                        preview={resolvePreview(bookmark, books)}
                        meta={relativeTimeLabel(bookmark.createdAt, 'Saved')}
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