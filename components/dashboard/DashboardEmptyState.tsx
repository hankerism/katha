import Link from 'next/link';
import { BookOpenIcon, ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · DashboardEmptyState
 * components/dashboard/DashboardEmptyState.tsx
 *
 * The new member's welcome — shown when a reader has joined but has no
 * activity anywhere (no position, no bookmarks, no history). ONE warm
 * onboarding hero rather than five separate empty boxes; the sections
 * simply stay silent until there is something to show.
 *
 * Purely presentational; mirrors the editorial empty states on the
 * Bookmarks / History / Continue Reading pages.
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardEmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <BookOpenIcon className="size-8 text-primary/40" />
      <p className="mt-6 font-reader text-2xl text-reader-foreground">
        Your shelf is waiting
      </p>
      <p className="mt-3 max-w-[40ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
        Open any book and this page starts to fill — the chapter you are on,
        the passages you mark, the places you have been.
      </p>
      <Link
        href="/library"
        className={cx(
          'mt-7 inline-flex items-center gap-2 rounded-full font-body text-[0.85rem] font-medium text-primary',
          'transition-colors hover:text-primary/80',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        Browse the library
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
