'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  isChapterFree,
  type KathaBook,
} from '@/lib/catalogue-repository';
import type { ReadingLocation } from '@/lib/reading-location';
import {
  getLocalPublishedBookBySlug,
  localBookAuthorName,
} from '@/lib/studio/published-books';
import ChapterGate from '@/components/membership/ChapterGate';
import ReaderArticle from '@/components/reader/ReaderArticle';
import ReaderNavigation from '@/components/reader/ReaderNavigation';
import ReaderPreferences from '@/components/reader/ReaderPreferences';
import ReadingProgressTracker from '@/components/reader/ReadingProgressTracker';
import ParagraphScrollRestoration from '@/components/reader/ParagraphScrollRestoration';

/* ---------------------------------------------------------------------------
 * KATHA · Reader — local chapter reader (fallback)
 * components/reader/LocalChapterReader.tsx
 *
 * The client half of the distribution seam for READING: rendered by the
 * server reader page when a slug misses the shared catalogue, it resolves
 * the book from this device's published Studio works and renders the real
 * reading composition — ReaderPreferences, the paper canvas, ChapterGate,
 * ReaderArticle, prev/next paging, AND the reading trackers.
 *
 * The trackers are deliberately INCLUDED (the Studio preview deliberately
 * excludes them): this is not a preview, it is a published book being read
 * at its real /library address, and it must write Continue Reading and
 * History like any other book. Everything downstream (bookmarks, history
 * cards, deep links) keys on the same slug-based hrefs.
 *
 * Absent for now, deliberately: ReaderSidebar / ReaderToolbar — both resolve
 * the shared catalogue internally by slug, so they cannot serve a local
 * book. The composition here mirrors the Studio preview's proven page shape
 * instead. Unifying the chrome behind a catalogue-resolution seam is a later
 * iteration.
 *
 * Mount-gated; the editorial misses mirror the reader's not-found voice.
 * ------------------------------------------------------------------------- */

export default function LocalChapterReader({
  slug,
  chapterSlug,
}: {
  slug: string;
  chapterSlug: string;
}) {
  const [book, setBook] = useState<KathaBook | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getLocalPublishedBookBySlug(slug).then((found) => {
      if (cancelled) return;
      setBook(found);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!loaded) return null;

  const current = book?.chapters.find((c) => c.slug === chapterSlug);

  if (!book || !current) {
    return (
      <div className="container-katha py-24 text-center">
        <p className="font-reader text-2xl text-reader-foreground">
          {book
            ? 'This chapter isn’t in the book.'
            : 'This book isn’t on the shelves.'}
        </p>
        <Link
          href={book ? `/library/${book.slug}` : '/library'}
          className="mt-6 inline-block font-body text-sm font-medium text-primary hover:text-primary/80"
        >
          {book ? 'Back to the book →' : 'Browse the library →'}
        </Link>
      </div>
    );
  }

  const total = book.chapters.length;
  const prevChapter =
    current.number > 1 ? book.chapters[current.number - 2] ?? null : null;
  const nextChapter =
    current.number < total ? book.chapters[current.number] ?? null : null;

  const href = `/library/${book.slug}/read/${current.slug}`;

  // Base reading location (paragraph 0) — the scroll-restoration leaf refines
  // the paragraph from any #p-{index} deep link, then records the visit.
  const readingLocation: ReadingLocation = {
    bookSlug: book.slug,
    bookTitle: book.title,
    chapterSlug: current.slug,
    chapterTitle: current.title,
    paragraphIndex: 0,
    preview: '',
    href,
  };

  return (
    <ReaderPreferences>
      {/* Invisible: persists this position to localStorage on every visit */}
      <ReadingProgressTracker
        bookSlug={book.slug}
        bookTitle={book.title}
        chapterSlug={current.slug}
        chapterTitle={current.title}
        chapterNumber={current.number}
        totalChapters={total}
        href={href}
      />

      <main className="flex justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="w-full max-w-[var(--reader-measure,680px)]">
          <div className="reading-surface flex min-h-[70dvh] w-full flex-col rounded-xl border border-border/50 px-8 py-14 shadow-[var(--ds-shadow-soft)] sm:px-12 sm:py-16 md:px-14 md:py-20">
            <ChapterGate
              free={isChapterFree(book, current.number)}
              bookTitle={book.title}
              from={href}
            >
              <ReaderArticle
                bookTitle={book.title}
                author={localBookAuthorName(book)}
                chapterTitle={current.title}
                estimatedReadingTime={current.estimatedReadingTime}
                content={current.content}
              />

              {/* Client leaf: scrolls to a deep-linked #p-{index} after mount,
                  and records this visit in Reading History (once per chapter
                  navigation, at the arrival paragraph). Inside the gate, so a
                  chapter the reader never got to see is never recorded. */}
              <ParagraphScrollRestoration location={readingLocation} />

              <footer className="mt-auto pt-16 text-center">
                <div aria-hidden="true" className="mx-auto h-px w-10 bg-border" />
                <p className="mt-4 font-body text-[0.7rem] font-medium uppercase tracking-[0.25em] text-muted-foreground/70">
                  End of Chapter {current.number}
                </p>
              </footer>
            </ChapterGate>
          </div>

          <div className="mt-8">
            <ReaderNavigation
              bookSlug={book.slug}
              prevChapter={prevChapter}
              nextChapter={nextChapter}
            />
          </div>
        </div>
      </main>
    </ReaderPreferences>
  );
}
