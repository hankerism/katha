import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — dashboard section
 * components/studio/dashboard/DashboardSection.tsx
 *
 * A Studio dashboard section frame: heading in the Studio's register
 * (font-heading, with an optional editorial subtitle), an optional
 * "View all →" link, children slot. The Studio sibling of the reader's
 * components/dashboard/DashboardSection — kept separate because the two
 * products carry different typographic voices, not because the shape
 * differs. Purely presentational.
 * ------------------------------------------------------------------------- */

interface DashboardSectionProps {
  title: string;
  /** Quiet editorial line under the heading. */
  subtitle?: string;
  /** Link to the full page (e.g. /studio/works). Omit to hide. */
  viewAllHref?: string;
  /** Label for the view-all link. Default "View all". */
  viewAllLabel?: string;
  children: ReactNode;
}

export default function DashboardSection({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View all',
  children,
}: DashboardSectionProps) {
  return (
    <section aria-label={title}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
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
