'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isBookmarked } from '@/lib/bookmarks';
import { readingDataRepository } from '@/lib/reading-data-repository';
import { withParagraphAnchor } from '@/lib/reading-location';
import { BookmarkIcon } from '@/components/ui/icons';
import { useViewer } from '@/components/membership/use-viewer';

/* ---------------------------------------------------------------------------
 * KATHA · BookmarkButton
 * components/reader/BookmarkButton.tsx
 *
 * Client leaf for the reader toolbar. It bookmarks the passage you're actually
 * reading: an IntersectionObserver tracks the paragraph at the top of the
 * reading area (matched via the [data-paragraph-index] hook that ReaderArticle
 * stamps on each <p>), and the button toggles a bookmark for THAT paragraph —
 * storing the paragraph index, a short preview of its text, and an #p-anchored
 * href. The icon reflects whether the current paragraph is bookmarked, so it
 * fills/empties as you scroll.
 *
 * Reuses the shared ReadingLocation model and toggles through the reading-data
 * repository — no new persistence. State starts false so SSR and the first
 * client render agree, then effects reconcile with the DOM + stored bookmarks
 * (no hydration mismatch).
 * ------------------------------------------------------------------------- */

interface BookmarkButtonProps {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  /** Chapter-level reader href; anchored to the current paragraph on save. */
  href: string;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** A short, single-line preview from a paragraph's text (~200 chars, trimmed at
 *  a word boundary). Stored on the bookmark so the card is self-contained. */
function makePreview(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= 200) return clean;
  return `${clean.slice(0, 200).replace(/\s+\S*$/, '')}…`;
}

export default function BookmarkButton({
  bookSlug,
  bookTitle,
  chapterSlug,
  chapterTitle,
  href,
}: BookmarkButtonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const { viewer, loaded } = useViewer();
  const pathname = usePathname();

  // Track the paragraph at the top of the reading area for this chapter.
  useEffect(() => {
    setCurrentIndex(0);
    const paragraphs = Array.from(
      document.querySelectorAll<HTMLElement>('[data-paragraph-index]'),
    );
    if (paragraphs.length === 0) return;

    const inView = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(
            entry.target.getAttribute('data-paragraph-index'),
          );
          if (entry.isIntersecting) inView.add(index);
          else inView.delete(index);
        }
        // The current paragraph is the topmost one crossing the reading line.
        if (inView.size > 0) setCurrentIndex(Math.min(...inView));
      },
      // A thin band just below the sticky navbar + toolbar = the reading line.
      { rootMargin: '-16% 0px -78% 0px' },
    );
    paragraphs.forEach((paragraph) => observer.observe(paragraph));
    return () => observer.disconnect();
  }, [chapterSlug]);

  // Reflect whether the CURRENT paragraph is bookmarked (reconciled post-mount
  // and whenever the reading position changes). The list comes through the
  // repository; isBookmarked stays the pure derivation over it.
  useEffect(() => {
    let cancelled = false;
    void readingDataRepository.listBookmarks().then((bookmarks) => {
      if (cancelled) return;
      setBookmarked(
        isBookmarked(
          { bookSlug, chapterSlug, paragraphIndex: currentIndex },
          bookmarks,
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [bookSlug, chapterSlug, currentIndex]);

  function handleToggle() {
    const paragraph = document.querySelector<HTMLElement>(
      `[data-paragraph-index="${currentIndex}"]`,
    );
    void readingDataRepository
      .toggleBookmark({
        bookSlug,
        bookTitle,
        chapterSlug,
        chapterTitle,
        paragraphIndex: currentIndex,
        preview: makePreview(paragraph?.textContent ?? ''),
        href: withParagraphAnchor(href, currentIndex),
      })
      .then((next) => {
        setBookmarked(
          isBookmarked(
            { bookSlug, chapterSlug, paragraphIndex: currentIndex },
            next,
          ),
        );
      });
  }

  // Guests see the ribbon as an invitation, not a control — bookmarks are a
  // member's shelf. (Render nothing until the viewer is known: no flash.)
  if (!loaded) return <span aria-hidden="true" className="size-9" />;
  if (viewer.tier === 'guest') {
    return (
      <Link
        href={`/join?from=${encodeURIComponent(pathname ?? '/library')}`}
        aria-label="Members keep bookmarks — join KATHA"
        title="Members keep bookmarks — join KATHA"
        className="inline-flex size-9 items-center justify-center rounded-full text-primary-foreground/50 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BookmarkIcon className="size-5" />
      </Link>
    );
  }

  const label = bookmarked ? 'Remove bookmark' : 'Bookmark this passage';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={bookmarked}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        bookmarked
          ? 'text-accent'
          : 'text-primary-foreground/80 hover:text-primary-foreground',
      )}
    >
      <BookmarkIcon filled={bookmarked} className="size-5" />
    </button>
  );
}