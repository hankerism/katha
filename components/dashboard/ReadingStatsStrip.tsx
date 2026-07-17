import { BookOpenIcon, ChaptersIcon, RibbonIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · ReadingStatsStrip
 * components/dashboard/ReadingStatsStrip.tsx
 *
 * Three quiet stat tiles for the dashboard. Purely presentational: numbers
 * arrive as props (the dashboard page derives them from bookmarks + history);
 * this component never touches persistence or selectors.
 *
 * Framed as RECENT activity on purpose: the numbers derive from Reading
 * History, which is capped (HISTORY_LIMIT) and user-clearable — they are a
 * picture of the recent past, not lifetime totals. Lifetime stats need their
 * own persistence and intentionally wait for a later sprint.
 * ------------------------------------------------------------------------- */

interface ReadingStatsStripProps {
  booksStarted: number;
  chaptersOpened: number;
  passagesSaved: number;
}

const TILE_CLASSES =
  'flex flex-col items-start rounded-xl border border-border/60 reading-surface p-5 shadow-soft';

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className={TILE_CLASSES}>
      <span className="text-primary/60">{icon}</span>
      <span className="mt-3 font-logo text-3xl font-semibold tabular-nums text-foreground">
        {value}
      </span>
      <span className="mt-1 font-body text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export default function ReadingStatsStrip({
  booksStarted,
  chaptersOpened,
  passagesSaved,
}: ReadingStatsStripProps) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<BookOpenIcon className="size-5" />}
          value={booksStarted}
          label="Books started"
        />
        <StatTile
          icon={<ChaptersIcon className="size-5" />}
          value={chaptersOpened}
          label="Chapters opened"
        />
        <StatTile
          icon={<RibbonIcon className="size-5" />}
          value={passagesSaved}
          label="Passages saved"
        />
      </div>
      <p className="mt-3 font-body text-[0.72rem] text-muted-foreground/80">
        Recent activity, from your reading history.
      </p>
    </div>
  );
}
