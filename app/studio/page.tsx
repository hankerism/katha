'use client';

import Link from 'next/link';
import { getCurrentAuthorId } from '@/lib/studio/current-author';
import { workStats, type StudioWork } from '@/lib/studio/work';
import { relativeTimeLabel } from '@/lib/relative-time';
import { useViewer } from '@/components/membership/use-viewer';
import { useWorks } from '@/components/studio/use-works';
import WorkCard from '@/components/studio/WorkCard';
import DashboardSection from '@/components/studio/dashboard/DashboardSection';
import ContinueWritingHero from '@/components/studio/dashboard/ContinueWritingHero';
import StatsStrip from '@/components/studio/dashboard/StatsStrip';
import EmptyState from '@/components/studio/dashboard/EmptyState';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — dashboard
 * app/studio/page.tsx
 *
 * The author's landing page — assembly only, on the reader dashboard's
 * principles: the page composes, lib persists, selectors derive, presentation
 * renders. Client component (works live in localStorage) with the house
 * mount-gate; StudioGate in the layout already decides who may stand here.
 *
 * Top to bottom: greeting → Continue Writing (the work most recently under
 * the pen) → the latest three works → quick stats → a calm door to a new
 * story. An author with no works meets one welcoming hero instead.
 *
 * The full shelves (drafts / In the Library / archive) live at /studio/works
 * — this page shows recent activity and points there. Stats are derived
 * INLINE from workStats (the existing selector): extract a dedicated
 * selector only when a second consumer appears. Archived works are excluded
 * from the hero, the shelf, and the numbers — set aside means set aside.
 * ------------------------------------------------------------------------- */

const MAX_SHELF_CARDS = 3;

/** "3 chapters · 4,120 words · 21 min read" — composed here so the hero
 *  stays purely presentational. */
function composeStatsLine(work: StudioWork): string {
  const stats = workStats(work);
  const chapters = `${stats.chapterCount} ${stats.chapterCount === 1 ? 'chapter' : 'chapters'}`;
  const words = `${stats.wordCount.toLocaleString()} ${stats.wordCount === 1 ? 'word' : 'words'}`;
  return `${chapters} · ${words} · ${stats.readingMinutes} min read`;
}

export default function StudioDashboardPage() {
  // The greeting addresses the PERSON (the account); the shell's identity
  // chip carries the byline — which may be a pen name.
  const { viewer } = useViewer();
  const firstName = viewer.user?.firstName ?? 'Writer';
  const { works, loaded } = useWorks(getCurrentAuthorId());

  // Archived works stay out of the dashboard entirely; they live folded away
  // at the bottom of /studio/works.
  const active = works.filter((work) => work.lifecycle !== 'archived');

  // useWorks returns newest-updated first, so the work most recently under
  // the pen is simply the head of the list.
  const mostRecent = active[0];
  const shelf = active.slice(0, MAX_SHELF_CARDS);

  // Inline stat derivation over the existing selector (see header comment).
  const chapters = active.reduce((sum, work) => sum + work.chapters.length, 0);
  const words = active.reduce(
    (sum, work) => sum + workStats(work).wordCount,
    0,
  );

  const hasAnything = works.length > 0;

  return (
    <div className="container-katha py-14 md:py-20">
      {/* Greeting */}
      <header>
        <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
          Author Studio
        </p>
        <h1 className="mt-3 font-heading text-3xl leading-tight text-foreground sm:text-4xl">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-muted-foreground">
          The desk is yours. Pick up where a story left off, or begin the next
          one.
        </p>
      </header>

      {/* Mount-gated body */}
      {loaded &&
        (hasAnything ? (
          <div className="mt-12 space-y-14">
            {mostRecent && (
              <DashboardSection
                title="Continue Writing"
                subtitle="The story most recently under your pen."
              >
                <ContinueWritingHero
                  href={`/studio/works/${mostRecent.id}`}
                  title={mostRecent.book.title.trim() || 'Untitled work'}
                  category={mostRecent.book.category || 'Uncategorized'}
                  statsLine={composeStatsLine(mostRecent)}
                  touchedLabel={relativeTimeLabel(
                    mostRecent.updatedAt,
                    'Touched',
                  )}
                  synopsis={mostRecent.book.synopsis}
                />
              </DashboardSection>
            )}

            {shelf.length > 0 && (
              <DashboardSection
                title="Your works"
                subtitle="The latest from your desk and the library."
                viewAllHref="/studio/works"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {shelf.map((work) => (
                    <WorkCard key={work.id} work={work} />
                  ))}
                </div>
              </DashboardSection>
            )}

            <DashboardSection title="At a glance">
              <StatsStrip works={active.length} chapters={chapters} words={words} />
            </DashboardSection>

            {/* A calm door to the next story */}
            <section
              aria-label="Begin a new story"
              className="flex flex-col items-start gap-5 rounded-[18px] border border-border bg-card p-7 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8"
            >
              <div>
                <h2 className="font-heading text-xl text-foreground">
                  Begin a new story
                </h2>
                <p className="mt-1.5 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
                  A title and a first line are enough — the rest can take its
                  time.
                </p>
              </div>
              <Link
                href="/studio/new"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                New work
              </Link>
            </section>
          </div>
        ) : (
          <EmptyState />
        ))}
    </div>
  );
}
