'use client';

import Link from 'next/link';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — preview banner
 * components/studio/PreviewBanner.tsx
 *
 * The one honest seam in an otherwise reader-perfect preview: a slim ribbon
 * reminding the writer this is their draft through a reader's eyes. Preview
 * renders the presentational reader pieces only — nothing here records
 * history, progress, or bookmarks.
 * ------------------------------------------------------------------------- */

export default function PreviewBanner({ workId }: { workId: string }) {
  return (
    <div className="border-b border-accent/40 bg-accent/10">
      <div className="container-katha flex h-10 items-center justify-between gap-4">
        <p className="min-w-0 truncate font-body text-xs font-medium text-clay">
          You&rsquo;re reading your draft the way readers will. Nothing is
          recorded.
        </p>
        <Link
          href={`/studio/works/${workId}`}
          className="shrink-0 font-body text-xs font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Back to the workspace →
        </Link>
      </div>
    </div>
  );
}
