'use client';

import Link from 'next/link';
import { BookOpenIcon, ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Membership — the invitation
 * components/membership/MembershipInvitation.tsx
 *
 * The editorial membership moment, everywhere a guest meets the edge of the
 * library: the end of a free preview, the feature pages, the home shelves.
 * Never a wall, never a form — an invitation in the brand's own voice, with
 * one calm way in (/join) and always a way to keep browsing.
 *
 *   page — the full moment (chapter gates, bookmarks/history/continue pages)
 *   card — shelf-sized, for the home page's member sections
 * ------------------------------------------------------------------------- */

export const MEMBER_BENEFITS: Array<{
  title: string;
  note?: 'coming soon' | 'on the way';
}> = [
  { title: 'Continue Reading — pick up any book where you left it' },
  { title: 'Bookmarks — keep the passages worth returning to' },
  { title: 'Reading History — retrace your steps through the shelves' },
  { title: 'A personal library — your shelves, at your pace' },
  { title: 'Cross-device sync', note: 'coming soon' },
  { title: 'Follow your favorite authors', note: 'on the way' },
];

export interface MembershipInvitationProps {
  variant?: 'page' | 'card';
  /** Contextual heading, e.g. the end of a book's free preview. */
  heading?: string;
  /** Contextual line under the heading. */
  invitation?: string;
  /** Where /join should return the reader afterwards. */
  from?: string;
}

function joinHref(from?: string): string {
  return from ? `/join?from=${encodeURIComponent(from)}` : '/join';
}

export default function MembershipInvitation({
  variant = 'page',
  heading = 'Continue your reading journey.',
  invitation = 'Become a member of KATHA and the library remembers you — every book, every bookmark, every place you paused.',
  from,
}: MembershipInvitationProps) {
  if (variant === 'card') {
    return (
      <div className="rounded-[18px] border border-border bg-card p-8 text-center shadow-sm">
        <BookOpenIcon className="mx-auto size-7 text-primary/40" />
        <p className="mt-4 font-reader text-xl text-reader-foreground">
          {heading}
        </p>
        <p className="mx-auto mt-2 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
          {invitation}
        </p>
        <Link
          href={joinHref(from)}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          Become a member
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <BookOpenIcon className="size-9 text-primary/40" />
      <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
        KATHA membership
      </p>
      <h2 className="mt-4 max-w-[26ch] font-reader text-3xl leading-snug text-reader-foreground">
        {heading}
      </h2>
      <p className="mt-4 max-w-[48ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
        {invitation}
      </p>

      <ul className="mt-8 space-y-2.5 text-left">
        {MEMBER_BENEFITS.map((benefit) => (
          <li
            key={benefit.title}
            className="flex items-start gap-3 font-body text-sm leading-relaxed text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent"
            />
            <span>
              {benefit.title}
              {benefit.note && (
                <span className="ml-2 font-body text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
                  {benefit.note}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={joinHref(from)}
        className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Become a member of KATHA
        <ArrowRightIcon className="size-4" />
      </Link>
      <Link
        href="/library"
        className="mt-5 font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        Keep browsing the library
      </Link>
    </div>
  );
}
