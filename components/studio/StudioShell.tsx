import Link from 'next/link';
import type { ReactNode } from 'react';
import { getCurrentAuthor } from '@/lib/studio/current-author';
import { initialsOf } from '@/lib/text';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — shell
 * components/studio/StudioShell.tsx
 *
 * The writing product's chrome, deliberately quieter than the reader's: a
 * thin paper-toned bar with the Studio wordmark, the writer's identity, and
 * one quiet way back to the library. No menus, no tabs, no admin furniture —
 * the page below is the product.
 * ------------------------------------------------------------------------- */

export default function StudioShell({ children }: { children: ReactNode }) {
  const author = getCurrentAuthor();
  const name = author?.name ?? 'Writer';

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border/70 bg-[#FCFAF6]">
        <div className="container-katha flex h-14 items-center justify-between gap-4">
          <Link
            href="/studio"
            aria-label="Author Studio — home"
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-[#FCFAF6]"
          >
            <span className="logo text-base tracking-[0.18em]">KATHA</span>
            <span
              aria-hidden="true"
              className="mx-2 font-body text-xs text-muted-foreground/60"
            >
              ·
            </span>
            <span className="font-body text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-clay">
              Studio
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2.5 sm:inline-flex">
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-full bg-[linear-gradient(150deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_58%,#000))] font-heading text-[0.65rem] font-semibold text-brand-secondary"
              >
                {initialsOf(name)}
              </span>
              <span className="font-body text-sm text-muted-foreground">
                {name}
              </span>
            </span>

            <Link
              href="/"
              className="font-body text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF6] rounded-sm"
            >
              Back to KATHA →
            </Link>
          </div>
        </div>
      </header>

      <main id="studio-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
