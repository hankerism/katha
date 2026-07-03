'use client';

import Link from 'next/link';
import { getCurrentAuthor, getCurrentAuthorId } from '@/lib/studio/current-author';
import { useWorks } from '@/components/studio/use-works';
import WorkCard from '@/components/studio/WorkCard';
import { ArrowRightIcon, BookOpenIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — home
 * app/studio/page.tsx
 *
 * The writer's desk, not a dashboard: a quiet greeting, the drafts you're in
 * the middle of, the works already in the library, and the archive folded
 * away at the bottom. Client component — works live in localStorage — with
 * the house mount-gate so nothing flashes.
 * ------------------------------------------------------------------------- */

export default function StudioHomePage() {
  const author = getCurrentAuthor();
  const firstName = (author?.name ?? 'Writer').split(' ')[0];
  const { works, loaded } = useWorks(getCurrentAuthorId());

  const drafts = works.filter((work) => work.lifecycle === 'draft');
  const inLibrary = works.filter((work) => work.lifecycle === 'published');
  const archived = works.filter((work) => work.lifecycle === 'archived');
  const hasAnything = works.length > 0;

  return (
    <div className="container-katha py-14 md:py-20">
      {/* Greeting */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Author Studio
          </p>
          <h1 className="mt-3 font-heading text-3xl leading-tight text-foreground sm:text-4xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-muted-foreground">
            The desk is yours. Pick up where a story left off, or begin the
            next one.
          </p>
        </div>

        {loaded && hasAnything && (
          <Link
            href="/studio/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
          >
            Begin a new work
          </Link>
        )}
      </header>

      {/* Shelves — mount-gated */}
      {loaded &&
        (hasAnything ? (
          <div className="mt-12 space-y-14">
            {/* Drafts */}
            <section aria-labelledby="studio-drafts-heading">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2
                    id="studio-drafts-heading"
                    className="font-heading text-2xl text-foreground"
                  >
                    On your desk
                  </h2>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    Drafts in progress — unfinished is a fine place to be.
                  </p>
                </div>
                <span className="shrink-0 pb-1 font-body text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
                </span>
              </div>
              {drafts.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {drafts.map((work) => (
                    <WorkCard key={work.id} work={work} />
                  ))}
                </div>
              ) : (
                <p className="mt-6 font-body text-sm leading-relaxed text-muted-foreground">
                  Nothing on the desk right now — every work you begin will
                  wait for you here.
                </p>
              )}
            </section>

            {/* In the Library */}
            {inLibrary.length > 0 && (
              <section aria-labelledby="studio-library-heading">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2
                      id="studio-library-heading"
                      className="font-heading text-2xl text-foreground"
                    >
                      In the Library
                    </h2>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      Finished and on the shelves of this device — public
                      shelves arrive with author accounts.
                    </p>
                  </div>
                  <span className="shrink-0 pb-1 font-body text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {inLibrary.length}{' '}
                    {inLibrary.length === 1 ? 'work' : 'works'}
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {inLibrary.map((work) => (
                    <WorkCard key={work.id} work={work} />
                  ))}
                </div>
              </section>
            )}

            {/* Archive — folded quietly at the bottom */}
            {archived.length > 0 && (
              <section
                aria-labelledby="studio-archive-heading"
                className="border-t border-border pt-10"
              >
                <h2
                  id="studio-archive-heading"
                  className="font-body text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                >
                  Archive
                </h2>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  Set aside, not gone. Open one to restore it to your desk.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {archived.map((work) => (
                    <WorkCard key={work.id} work={work} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* First-visit empty state */
          <div className="mt-20 flex flex-col items-center text-center">
            <BookOpenIcon className="size-9 text-primary/40" />
            <p className="mt-6 max-w-[24ch] font-reader text-3xl leading-snug text-reader-foreground">
              Every library begins with a single story.
            </p>
            <p className="mt-4 max-w-[44ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
              This is your desk — where drafts take their time, chapters find
              their shape, and finished works step onto the shelves.
            </p>
            <Link
              href="/studio/new"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Begin your first work
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        ))}
    </div>
  );
}
