import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · DashboardSection
 * components/dashboard/DashboardSection.tsx
 *
 * A dashboard section frame: quiet heading, optional "View all →" link into
 * the feature's full page, children slot. Purely presentational — it knows
 * nothing about what it frames; the dashboard page composes the content.
 * ------------------------------------------------------------------------- */

interface DashboardSectionProps {
  title: string;
  /** Link to the feature's full page (e.g. /bookmarks). Omit to hide. */
  viewAllHref?: string;
  /** Label for the view-all link. Default "View all". */
  viewAllLabel?: string;
  children: ReactNode;
}

export default function DashboardSection({
  title,
  viewAllHref,
  viewAllLabel = 'View all',
  children,
}: DashboardSectionProps) {
  return (
    <section aria-label={title}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-logo text-2xl font-semibold leading-tight text-foreground">
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1.5 pb-1 font-body text-[0.78rem] font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {viewAllLabel}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
