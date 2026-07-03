'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWork } from '@/components/studio/use-works';
import { workToBook } from '@/lib/studio/work';
import { getCurrentAuthor } from '@/lib/studio/current-author';
import { initialsOf } from '@/lib/text';
import PreviewBanner from '@/components/studio/PreviewBanner';
import { ArrowRightIcon, ClockIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — book preview
 * app/studio/works/[id]/preview/page.tsx
 *
 * The draft as its library page: the SAME composition as the reader's book
 * detail hub (cover, meta row, Contents with reading times, About the
 * author), fed by workToBook() — the derivation readers get. Differences are
 * deliberate: the preview ribbon on top, chapter rows link within the
 * preview, and the effectful pieces (Continue-Reading CTA, related shelves)
 * stay out — a draft records nothing and sits on no public shelf yet.
 * ------------------------------------------------------------------------- */

export default function WorkPreviewPage() {
  const params = useParams<{ id: string }>();
  const { work, loaded } = useWork(params.id);
  const author = getCurrentAuthor();

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
  const minutes = book.chapters.reduce(
    (sum, chapter) => sum + chapter.estimatedReadingTime,
    0,
  );
  const authorName = author?.displayName ?? 'You';
  const firstChapter = book.chapters[0];

  return (
    <>
      <PreviewBanner workId={work.id} />

      {/* Hero — the book detail composition */}
      <section aria-labelledby="preview-book-title" className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 right-[-6rem] h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-16 left-[-8rem] h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
        </div>

        <div className="container-katha grid gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
          <div className="mx-auto w-full max-w-[280px] lg:mx-0 lg:max-w-none">
            {book.cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- author-uploaded data URL
              <img
                src={book.cover}
                alt={`Cover of ${book.title || 'Untitled work'}`}
                className="aspect-[3/4] w-full rounded-[18px] object-cover shadow-xl ring-1 ring-black/10"
              />
            ) : (
            <div aria-hidden="true" className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-[linear-gradient(155deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_55%,#000))] shadow-xl ring-1 ring-black/10">
              <span className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.16),transparent_55%)]" />
              <span className="absolute inset-y-0 left-0 w-3 bg-[linear-gradient(to_right,rgba(0,0,0,0.30),transparent)]" />
              <span className="absolute inset-y-0 left-3 w-px bg-brand-accent/40" />
              <div className="relative flex h-full flex-col justify-between p-7">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-logo text-base font-semibold tracking-[0.18em] text-brand-secondary/90">
                    KATHA
                  </span>
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-brand-accent">
                    {book.category}
                  </span>
                </div>
                <div>
                  <span className="mb-4 block h-px w-12 bg-brand-accent/70" />
                  <p className="font-heading text-3xl font-bold leading-tight text-brand-secondary">
                    {book.title || 'Untitled work'}
                  </p>
                  <p className="mt-3 font-logo text-lg italic text-brand-secondary/80">
                    {authorName}
                  </p>
                </div>
              </div>
            </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {book.category}
            </p>
            <h1
              id="preview-book-title"
              className="mt-4 font-heading text-4xl leading-[1.08] text-foreground sm:text-5xl"
            >
              {book.title || 'Untitled work'}
            </h1>
            <p className="mt-3 font-logo text-xl italic text-muted-foreground">
              by {authorName}
            </p>
            <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
              {book.synopsis || 'The synopsis is still on its way.'}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 font-body text-sm text-muted-foreground">
              <span
                className={
                  book.status === 'Completed' ? 'badge badge-forest' : 'badge badge-accent'
                }
              >
                {book.status}
              </span>
              <span>
                {book.chapters.length}{' '}
                {book.chapters.length === 1 ? 'chapter' : 'chapters'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="size-4" />
                about {minutes} min
              </span>
              <span>{book.language}</span>
            </div>

            {firstChapter && (
              <div className="mt-9">
                <Link
                  href={`/studio/works/${work.id}/preview/${firstChapter.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Start Reading
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contents */}
      <section aria-labelledby="preview-contents-heading" className="container-katha py-4 md:py-8">
        <div className="flex items-end justify-between gap-4 border-t border-border pt-12">
          <h2 id="preview-contents-heading" className="font-heading text-2xl text-foreground sm:text-3xl">
            Contents
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            {book.chapters.length}{' '}
            {book.chapters.length === 1 ? 'chapter' : 'chapters'}
          </p>
        </div>

        <ol className="mt-7 space-y-3">
          {book.chapters.map((chapter) => (
            <li key={chapter.slug}>
              <Link
                href={`/studio/works/${work.id}/preview/${chapter.slug}`}
                aria-label={`Read chapter ${chapter.number}: ${chapter.title} (${chapter.estimatedReadingTime} min)`}
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-border-strong hover:shadow-md motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="min-w-0">
                  <span className="block font-body text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Chapter {chapter.number}
                  </span>
                  <span className="mt-1 block truncate font-heading text-lg text-foreground">
                    {chapter.title}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 font-body text-[0.78rem] text-muted-foreground">
                    <ClockIcon className="size-3.5" />
                    {chapter.estimatedReadingTime} min
                  </span>
                  <ArrowRightIcon className="size-[15px] text-muted-foreground transition-[color,transform] duration-200 group-hover:text-primary motion-safe:group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* About the author */}
      <section aria-labelledby="preview-author-heading" className="mt-10 border-t border-border bg-secondary">
        <div className="container-katha py-16 md:py-20">
          <h2 id="preview-author-heading" className="font-heading text-2xl text-foreground sm:text-3xl">
            About the author
          </h2>
          <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-center">
            <span
              aria-hidden="true"
              className="grid size-20 shrink-0 place-items-center rounded-full bg-[linear-gradient(150deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_58%,#000))] font-heading text-xl font-semibold text-brand-secondary shadow-sm ring-1 ring-black/10"
            >
              {initialsOf(authorName)}
            </span>
            <div className="min-w-0">
              <p className="font-heading text-xl font-semibold text-foreground">
                {authorName}
              </p>
              {author?.location && (
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  {author.location} · {book.category}
                </p>
              )}
              <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-muted-foreground">
                {author?.bio ?? 'The author of this work.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
