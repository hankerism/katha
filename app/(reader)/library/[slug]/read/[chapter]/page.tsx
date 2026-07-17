import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBookBySlug, getChapterBySlug, isChapterFree } from '@/lib/books';
import { authorName } from '@/lib/author-selectors';
import ChapterGate from '@/components/membership/ChapterGate';
import ReaderSidebar from '@/components/reader/ReaderSidebar';
import ReaderToolbar from '@/components/reader/ReaderToolbar';
import ReaderArticle from '@/components/reader/ReaderArticle';
import ReaderNavigation from '@/components/reader/ReaderNavigation';
import ReadingProgressTracker from '@/components/reader/ReadingProgressTracker';
import ParagraphScrollRestoration from '@/components/reader/ParagraphScrollRestoration';
import ReaderPreferences from '@/components/reader/ReaderPreferences';
import type { ReadingLocation } from '@/lib/reading-location';

/* ---------------------------------------------------------------------------
 * KATHA · Reader Mode
 * app/library/[slug]/read/[chapter]/page.tsx
 *
 * Async server component. Resolves book + chapter from @/lib/books, 404s on a
 * miss, computes adjacent chapters once, and composes the reader.
 *
 * Layout — a two-column shell inside ReaderPreferences (so size/width/theme +
 * reader-surface apply to both columns):
 *   • lg+  : a persistent ReaderSidebar (sticky left TOC rail) + a main column
 *            holding the toolbar, the centered article, and prev/next paging.
 *            The content sits BESIDE the sidebar — no overlay, never covered.
 *   • <lg  : the sidebar is hidden; the toolbar's ReaderDrawer (hamburger)
 *            provides the table of contents as before.
 *
 * Two invisible client leaves do the remembering, each owning one write:
 * ReadingProgressTracker persists Continue Reading (chapter-level, on mount);
 * ParagraphScrollRestoration records Reading History at the arrival paragraph.
 * The toolbar's BookmarkButton stores a complete bookmark from the current
 * chapter's slug + title.
 * ------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}): Promise<Metadata> {
  const { slug, chapter } = await params;
  const book = getBookBySlug(slug);
  const current = book ? getChapterBySlug(slug, chapter) : undefined;

  if (!book || !current) {
    return { title: 'Chapter not found' };
  }

  return {
    title: `${current.title} · ${book.title}`,
    description: `Chapter ${current.number} of ${book.chapters.length} — ${book.title} by ${authorName(book.authorId)}.`,
  };
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;

  const book = getBookBySlug(slug);
  if (!book) notFound();

  const current = getChapterBySlug(slug, chapter);
  if (!current) notFound();

  const total = book.chapters.length;
  const prevChapter =
    current.number > 1 ? book.chapters[current.number - 2] ?? null : null;
  const nextChapter =
    current.number < total ? book.chapters[current.number] ?? null : null;

  const href = `/library/${book.slug}/read/${current.slug}`;

  // Base reading location for this chapter (paragraph 0). The scroll-restoration
  // leaf refines the paragraph index from any #p-{index} deep link, then records
  // the visit. `preview` is intentionally empty — the History page resolves it
  // from book content via resolvePreview(), so nothing is duplicated here.
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

      <div data-reader-page className="lg:flex lg:items-start">
        {/* Desktop: persistent TOC rail (hidden < lg) */}
        <ReaderSidebar
          bookSlug={book.slug}
          bookTitle={book.title}
          currentChapterSlug={current.slug}
        />

        {/* Main column: toolbar spans full width; reading column centers */}
        <div className="flex min-w-0 flex-1 flex-col">
          <ReaderToolbar
            bookSlug={book.slug}
            bookTitle={book.title}
            chapterSlug={current.slug}
            chapterTitle={current.title}
            chapterNumber={current.number}
            totalChapters={total}
            prevChapter={prevChapter}
            nextChapter={nextChapter}
          />

          {/* Reading canvas — a calm sheet of paper floating on the reader
              surface: centered, narrow measure, generous breathing room. */}
          {/* The column measure follows the Reading Width preference via
              --reader-measure (set on the reader shell); the fallback is the
              original 680px, which Medium reproduces exactly. */}
          <main className="flex flex-1 justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
            <div className="w-full max-w-[var(--reader-measure,680px)]">
              {/* The page — the warm reader surface (not a white card): a subtle
                  border, soft elevation, a minimum page height so short chapters
                  still fill the sheet, and an understated end-of-chapter footer
                  pinned to its foot. */}
              <div className="reading-surface flex min-h-[70dvh] w-full flex-col rounded-xl border border-border/50 px-8 py-14 shadow-[var(--ds-shadow-soft)] sm:px-12 sm:py-16 md:px-14 md:py-20">
                {/* The free-preview edge: the server decides whether this
                    chapter is free; the gate decides who is reading. Guests
                    read the whole preview untouched, then meet the editorial
                    invitation on this same paper. */}
                <ChapterGate
                  free={isChapterFree(book, current.number)}
                  bookTitle={book.title}
                  from={href}
                >
                  <ReaderArticle
                    bookTitle={book.title}
                    author={authorName(book.authorId)}
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

              {/* Chapter navigation — below the page, on the reader surface */}
              <div className="mt-8">
                <ReaderNavigation
                  bookSlug={book.slug}
                  prevChapter={prevChapter}
                  nextChapter={nextChapter}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ReaderPreferences>
  );
}