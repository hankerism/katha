'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWork } from '@/components/studio/use-works';
import { workToBook } from '@/lib/studio/work';
import { getCurrentAuthor } from '@/lib/studio/current-author';
import PreviewBanner from '@/components/studio/PreviewBanner';
import ReaderArticle from '@/components/reader/ReaderArticle';
import ReaderPreferences from '@/components/reader/ReaderPreferences';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — chapter preview
 * app/studio/works/[id]/preview/[chapterSlug]/page.tsx
 *
 * The draft chapter as its reader page: the REAL reading composition —
 * ReaderPreferences (size / width / theme, the same floating Aa), the paper
 * canvas, ReaderArticle, the end-of-chapter mark, prev/next paging — fed by
 * workToBook(). Deliberately absent: ReadingProgressTracker,
 * ParagraphScrollRestoration, and BookmarkButton. A preview must never write
 * into Continue Reading, History, or Bookmarks.
 * ------------------------------------------------------------------------- */

export default function ChapterPreviewPage() {
  const params = useParams<{ id: string; chapterSlug: string }>();
  const { work, loaded } = useWork(params.id);

  if (!loaded) return null;
  if (!work) {
    return (
      <div className="container-katha py-24 text-center">
        <p className="font-reader text-2xl text-reader-foreground">
          This work isn&rsquo;t on your desk.
        </p>
        <Link
          href="/studio"
          className="mt-6 inline-block font-body text-sm font-medium text-primary hover:text-primary/80"
        >
          Back to the Studio →
        </Link>
      </div>
    );
  }

  const book = workToBook(work);
  const current = book.chapters.find(
    (chapter) => chapter.slug === params.chapterSlug,
  );

  if (!current) {
    return (
      <div className="container-katha py-24 text-center">
        <p className="font-reader text-2xl text-reader-foreground">
          This page isn&rsquo;t in the manuscript.
        </p>
        <Link
          href={`/studio/works/${work.id}/preview`}
          className="mt-6 inline-block font-body text-sm font-medium text-primary hover:text-primary/80"
        >
          Back to the book →
        </Link>
      </div>
    );
  }

  const prev =
    current.number > 1 ? book.chapters[current.number - 2] ?? null : null;
  const next =
    current.number < book.chapters.length
      ? book.chapters[current.number]
      : null;
  const previewHref = (slug: string) =>
    `/studio/works/${work.id}/preview/${slug}`;
  const authorName = getCurrentAuthor()?.name ?? 'You';

  return (
    <>
      <PreviewBanner workId={work.id} />

      <ReaderPreferences>
        <main className="flex justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
          <div className="w-full max-w-[680px]">
            {/* The page — the same warm reader surface as the real thing */}
            <div className="reading-surface flex min-h-[70dvh] w-full flex-col rounded-xl border border-border/50 px-8 py-14 shadow-[var(--ds-shadow-soft)] sm:px-12 sm:py-16 md:px-14 md:py-20">
              <ReaderArticle
                bookTitle={book.title || 'Untitled work'}
                author={authorName}
                chapterTitle={current.title}
                estimatedReadingTime={current.estimatedReadingTime}
                content={current.content}
              />

              <footer className="mt-auto pt-16 text-center">
                <div aria-hidden="true" className="mx-auto h-px w-10 bg-border" />
                <p className="mt-4 font-body text-[0.7rem] font-medium uppercase tracking-[0.25em] text-muted-foreground/70">
                  End of Chapter {current.number}
                </p>
              </footer>
            </div>

            {/* Prev / next within the preview */}
            <nav aria-label="Chapter navigation" className="mt-8 grid grid-cols-2 gap-4">
              {prev ? (
                <Link
                  href={previewHref(prev.slug)}
                  className="group flex flex-col gap-1 rounded-[14px] border border-border bg-card px-5 py-4 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <ArrowLeftIcon className="size-3.5 transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5" />
                    Previous
                  </span>
                  <span className="truncate font-heading text-sm text-foreground">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}

              {next ? (
                <Link
                  href={previewHref(next.slug)}
                  className="group flex flex-col items-end gap-1 rounded-[14px] border border-border bg-card px-5 py-4 text-right transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Next
                    <ArrowRightIcon className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
                  </span>
                  <span className="truncate font-heading text-sm text-foreground">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <Link
                  href={`/studio/works/${work.id}/preview`}
                  className="group flex flex-col items-end gap-1 rounded-[14px] border border-border bg-card px-5 py-4 text-right transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Finish
                    <ArrowRightIcon className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
                  </span>
                  <span className="font-heading text-sm text-foreground">
                    Back to the book
                  </span>
                </Link>
              )}
            </nav>
          </div>
        </main>
      </ReaderPreferences>
    </>
  );
}
