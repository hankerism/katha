'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBookmarks, type Bookmark } from '@/lib/bookmarks';
import { getChapterNumber } from '@/lib/bookmark-selectors';
import { BookmarkIcon, ArrowRightIcon } from '@/components/ui/icons';
import { useViewer } from '@/components/membership/use-viewer';

/* ---------------------------------------------------------------------------
 * KATHA · BookmarksShelf
 * components/home/BookmarksShelf.tsx
 *
 * Homepage shelf of marked passages. Client component: bookmarks live only in
 * localStorage, so they are read in an effect after mount. Render is gated on a
 * `loaded` flag — the server pass and first client render produce nothing, then
 * the shelf resolves to either the cards or the empty state. This keeps
 * hydration clean and avoids an empty-state → cards flash. All bookmark logic
 * stays in lib/bookmarks; this only reads via getBookmarks(). Tokens only.
 * ------------------------------------------------------------------------- */

const MAX_VISIBLE = 3;

export default function BookmarksShelf() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { viewer, loaded: viewerLoaded } = useViewer();

  useEffect(() => {
    setBookmarks(getBookmarks());
    setLoaded(true);
  }, []);

  // Until we've read storage, render nothing (matches the server pass).
  // Guests see no member shelves — home's one invitation lives elsewhere.
  if (!loaded || !viewerLoaded || viewer.tier === 'guest') return null;

  const visible = bookmarks.slice(0, MAX_VISIBLE);
  const hasMore = bookmarks.length > MAX_VISIBLE;

  return (
    <section
      aria-labelledby="bookmarks-heading"
      className="container-katha py-16 md:py-20"
    >
      <h2
        id="bookmarks-heading"
        className="font-heading text-2xl text-foreground sm:text-3xl"
      >
        Bookmarks
      </h2>
      <p className="mt-1.5 font-body text-sm text-muted-foreground">
        Return to the passages you&rsquo;ve marked.
      </p>

      {visible.length > 0 ? (
        <>
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((bookmark) => {
              const chapterNumber = getChapterNumber(bookmark);
              return (
                <article
                  key={bookmark.id}
                  className="flex flex-col rounded-[18px] border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      {bookmark.bookTitle}
                    </p>
                    <BookmarkIcon filled className="size-4 shrink-0 text-accent" />
                  </div>

                  <h3 className="mt-3 line-clamp-2 font-heading text-lg leading-snug text-foreground">
                    {bookmark.chapterTitle}
                  </h3>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    Chapter {chapterNumber}
                  </p>

                  <div className="mt-auto pt-6">
                    <Link
                      href={bookmark.href}
                      aria-label={`Continue reading ${bookmark.bookTitle}, ${bookmark.chapterTitle}`}
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
                href="/bookmarks"
                className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                View all bookmarks
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="mt-7 rounded-[18px] border border-border bg-card p-10 text-center shadow-sm">
          <BookmarkIcon className="mx-auto size-8 text-muted-foreground/50" />
          <h3 className="mt-4 font-heading text-lg text-foreground">
            No bookmarks yet
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm font-body text-sm text-muted-foreground">
            Mark passages while reading and they&rsquo;ll appear here.
          </p>
          <div className="mt-6">
            <Link
              href="/library"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Explore Library
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}