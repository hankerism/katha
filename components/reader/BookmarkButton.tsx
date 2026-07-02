'use client';

import { useEffect, useState, type SVGProps } from 'react';
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks';
import { withParagraphAnchor } from '@/lib/reading-location';

/* ---------------------------------------------------------------------------
 * KATHA · BookmarkButton
 * components/reader/BookmarkButton.tsx
 *
 * Client leaf for the reader toolbar. Reads bookmark state on mount, toggles it
 * on click (persisting via lib/bookmarks), and swaps an outline/filled icon.
 * State starts false so the server render and first client render agree, then
 * the effect reconciles with localStorage — no hydration mismatch. No libraries.
 * ------------------------------------------------------------------------- */

/* Chapter-level props for now. Until the in-reader ribbon lands (a later
 * phase), the toolbar marks paragraph 0 of the chapter, so paragraphIndex /
 * preview are not yet chosen at this call site. */
interface BookmarkButtonProps {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  href: string;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function BookmarkIcon({
  filled,
  ...props
}: { filled?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function BookmarkButton({
  bookSlug,
  bookTitle,
  chapterSlug,
  chapterTitle,
  href,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);

  // Reconcile with storage after mount, and whenever the chapter changes.
  useEffect(() => {
    setBookmarked(isBookmarked({ bookSlug, chapterSlug, paragraphIndex: 0 }));
  }, [bookSlug, chapterSlug]);

  function handleToggle() {
    const next = toggleBookmark({
      bookSlug,
      bookTitle,
      chapterSlug,
      chapterTitle,
      paragraphIndex: 0,
      preview: '',
      href: withParagraphAnchor(href, 0),
    });
    setBookmarked(
      isBookmarked({ bookSlug, chapterSlug, paragraphIndex: 0 }, next),
    );
  }

  const label = bookmarked ? 'Remove bookmark' : 'Bookmark this chapter';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={bookmarked}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        bookmarked ? 'text-accent' : 'text-primary-foreground/80 hover:text-primary-foreground',
      )}
    >
      <BookmarkIcon filled={bookmarked} className="size-5" />
    </button>
  );
}