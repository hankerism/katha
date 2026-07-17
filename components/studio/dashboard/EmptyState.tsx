import Link from 'next/link';
import { BookOpenIcon, ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — empty state
 * components/studio/dashboard/EmptyState.tsx
 *
 * The first-visit welcome — shown when an author has no works at all. ONE
 * warm hero rather than a stack of empty sections (the dashboard's sections
 * simply stay silent). The copy moved verbatim from the original Studio
 * home; it is approved editorial voice.
 *
 * Purely presentational; shared by the dashboard and the works page so an
 * author with nothing meets the same welcome on both.
 * ------------------------------------------------------------------------- */

export default function EmptyState() {
  return (
    <div className="mt-20 flex flex-col items-center text-center">
      <BookOpenIcon className="size-9 text-primary/40" />
      <p className="mt-6 max-w-[24ch] font-reader text-3xl leading-snug text-reader-foreground">
        Every library begins with a single story.
      </p>
      <p className="mt-4 max-w-[44ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
        This is your desk — where drafts take their time, chapters find their
        shape, and finished works step onto the shelves.
      </p>
      <Link
        href="/studio/new"
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Begin your first work
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
