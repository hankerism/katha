'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useViewer } from '@/components/membership/use-viewer';
import { BookOpenIcon, ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — entry gate
 * components/studio/StudioGate.tsx
 *
 * The last rung of the ladder: Guest → Reader → Author, one identity all the
 * way up. Guests are pointed to the library door first (reading and writing
 * share one membership); readers are invited to open their Studio — which,
 * pre-authentication, simply opens (the honest stand-in for the future
 * application flow, and the exact slot it will occupy). Authors pass
 * through untouched.
 * ------------------------------------------------------------------------- */

export default function StudioGate({ children }: { children: ReactNode }) {
  const { viewer, loaded, becomeAuthor } = useViewer();
  const [opening, setOpening] = useState(false);

  if (!loaded) return null;
  if (viewer.tier === 'author') return children;

  if (viewer.tier === 'guest') {
    return (
      <div className="container-katha flex min-h-[70dvh] items-center justify-center py-16">
        <div className="flex max-w-md flex-col items-center text-center">
          <BookOpenIcon className="size-9 text-primary/40" />
          <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Author Studio
          </p>
          <h1 className="mt-4 font-reader text-3xl leading-snug text-reader-foreground">
            Where KATHA stories are written.
          </h1>
          <p className="mt-4 font-body text-[0.95rem] leading-relaxed text-muted-foreground">
            The Studio belongs to members of the library — reading and
            writing share one identity here. Join first, and the desk is one
            more step.
          </p>
          <Link
            href="/join?from=%2Fstudio"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Join the library first
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="/"
            className="mt-5 font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Back to KATHA
          </Link>
        </div>
      </div>
    );
  }

  /* Reader → the desk is one step away */
  return (
    <div className="container-katha flex min-h-[70dvh] items-center justify-center py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <BookOpenIcon className="size-9 text-primary/40" />
        <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
          Author Studio
        </p>
        <h1 className="mt-4 font-reader text-3xl leading-snug text-reader-foreground">
          Your desk is one step away.
        </h1>
        <p className="mt-4 font-body text-[0.95rem] leading-relaxed text-muted-foreground">
          You&rsquo;re a member of the library. Become a KATHA author and the
          Studio opens — drafts that take their time, chapters in the
          reader&rsquo;s own type, and a shelf of your own.
        </p>
        <button
          type="button"
          onClick={() => {
            setOpening(true);
            becomeAuthor();
          }}
          disabled={opening}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {opening ? 'Opening your Studio…' : 'Open your Studio'}
          <ArrowRightIcon className="size-4" />
        </button>
        <p className="mt-4 max-w-[40ch] font-body text-xs leading-relaxed text-muted-foreground/70">
          Author applications arrive with accounts — today, the desk simply
          opens.
        </p>
      </div>
    </div>
  );
}
