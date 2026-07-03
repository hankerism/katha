'use client';

import Link from 'next/link';
import { relativeTimeLabel } from '@/lib/relative-time';
import { workStats, type StudioWork } from '@/lib/studio/work';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — work card
 * components/studio/WorkCard.tsx
 *
 * One work on the Studio's shelves: title as the hero, the shelf it sits on
 * as a quiet badge (only when it isn't simply a draft), a line of writing
 * facts, and the last touch. The whole card opens the workspace. Calm — no
 * inline action buttons; decisions belong to the workspace.
 * ------------------------------------------------------------------------- */

function badgeFor(work: StudioWork) {
  if (work.lifecycle === 'published') {
    return <span className="badge badge-forest">In the Library</span>;
  }
  if (work.lifecycle === 'archived') {
    return <span className="badge">Archived</span>;
  }
  return null;
}

export default function WorkCard({ work }: { work: StudioWork }) {
  const stats = workStats(work);
  const title = work.book.title.trim() || 'Untitled work';

  return (
    <Link
      href={`/studio/works/${work.id}`}
      aria-label={`Open ${title} in the workspace`}
      className="group flex h-full flex-col rounded-[18px] border border-border bg-card p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out motion-safe:hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="truncate font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {work.book.category || 'Uncategorized'}
        </p>
        {badgeFor(work)}
      </div>

      <h3 className="mt-3 font-heading text-xl font-semibold leading-snug text-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
        {title}
      </h3>

      {work.book.synopsis && (
        <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {work.book.synopsis}
        </p>
      )}

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t border-border pt-4 font-body text-xs text-muted-foreground">
          <span>
            {stats.chapterCount}{' '}
            {stats.chapterCount === 1 ? 'chapter' : 'chapters'} ·{' '}
            {stats.wordCount.toLocaleString()}{' '}
            {stats.wordCount === 1 ? 'word' : 'words'}
          </span>
          <span>{relativeTimeLabel(work.updatedAt, 'Touched')}</span>
        </div>
      </div>
    </Link>
  );
}
