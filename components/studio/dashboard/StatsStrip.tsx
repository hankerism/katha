import { BookOpenIcon, ChaptersIcon, ShelfIcon } from '@/components/ui/icons';
import type { ReactNode } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — stats strip
 * components/studio/dashboard/StatsStrip.tsx
 *
 * Three quiet tiles of writing facts. Purely presentational: the numbers
 * arrive as props (the dashboard page derives them inline from workStats,
 * the existing selector); this component never touches persistence.
 *
 * The Studio sibling of the reader's ReadingStatsStrip — separate because
 * the vocabulary differs (works/chapters/words vs books/chapters/passages),
 * not the shape.
 * ------------------------------------------------------------------------- */

interface StatsStripProps {
  works: number;
  chapters: number;
  words: number;
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-start rounded-[18px] border border-border bg-card p-5 shadow-sm">
      <span className="text-primary/60">{icon}</span>
      <span className="mt-3 font-heading text-3xl font-semibold tabular-nums text-foreground">
        {value}
      </span>
      <span className="mt-1 font-body text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export default function StatsStrip({ works, chapters, words }: StatsStripProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatTile
        icon={<ShelfIcon className="size-5" />}
        value={works.toLocaleString()}
        label={works === 1 ? 'Work' : 'Works'}
      />
      <StatTile
        icon={<ChaptersIcon className="size-5" />}
        value={chapters.toLocaleString()}
        label={chapters === 1 ? 'Chapter' : 'Chapters'}
      />
      <StatTile
        icon={<BookOpenIcon className="size-5" />}
        value={words.toLocaleString()}
        label={words === 1 ? 'Word' : 'Words'}
      />
    </div>
  );
}
