import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — continue writing hero
 * components/studio/dashboard/ContinueWritingHero.tsx
 *
 * The dashboard's hero card: the work most recently under the pen, with one
 * clear way back into it. Purely presentational — the page composes every
 * string (title, category, stats line, touched label) via the existing
 * selectors; nothing is derived here.
 * ------------------------------------------------------------------------- */

interface ContinueWritingHeroProps {
  /** Workspace link for the work (e.g. /studio/works/work_…). */
  href: string;
  title: string;
  category: string;
  /** Composed facts line, e.g. "3 chapters · 4,120 words · 21 min read". */
  statsLine: string;
  /** Composed recency label, e.g. "Touched yesterday". */
  touchedLabel: string;
  synopsis?: string;
}

export default function ContinueWritingHero({
  href,
  title,
  category,
  statsLine,
  touchedLabel,
  synopsis,
}: ContinueWritingHeroProps) {
  return (
    <div className="flex flex-col gap-6 rounded-[18px] border border-border bg-card p-7 shadow-sm sm:flex-row sm:items-center sm:p-8">
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {category}
        </p>
        <h3 className="mt-2 font-heading text-2xl leading-snug text-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {title}
        </h3>
        {synopsis && (
          <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {synopsis}
          </p>
        )}
        <p className="mt-4 font-body text-xs text-muted-foreground">
          {statsLine}
          <span aria-hidden="true" className="mx-2 text-muted-foreground/50">
            ·
          </span>
          {touchedLabel}
        </p>
      </div>

      <div className="shrink-0">
        <Link
          href={href}
          aria-label={`Resume writing ${title}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
        >
          Resume writing
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
