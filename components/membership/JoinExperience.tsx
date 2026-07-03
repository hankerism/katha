'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useViewer } from '@/components/membership/use-viewer';
import { MEMBER_BENEFITS } from '@/components/membership/MembershipInvitation';
import { relativeTimeLabel } from '@/lib/relative-time';
import { BookOpenIcon, ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Membership — the join moment
 * components/membership/JoinExperience.tsx
 *
 * The one place membership begins. A guest is welcomed in with a single calm
 * action, then returned to wherever the invitation found them (?from=) — if
 * they were mid-book, they land back inside it. A member who wanders here is
 * greeted, not re-sold; the quiet "start over as a guest" keeps the whole
 * onboarding walkable again and again (their reading data stays put — that
 * is the domain's promise, restated in the copy).
 *
 * With accounts, this same page hosts the sign-in flow; the URL and the
 * promise don't change.
 * ------------------------------------------------------------------------- */

export default function JoinExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewer, loaded, join, reset } = useViewer();
  const [joining, setJoining] = useState(false);

  const from = searchParams.get('from') ?? '';
  const destination = from.startsWith('/') ? from : '/library';

  function handleJoin() {
    if (joining) return;
    setJoining(true);
    join();
    router.push(destination);
  }

  if (!loaded) return null;

  /* Already part of the library */
  if (viewer.tier !== 'guest') {
    return (
      <div className="flex flex-col items-center px-5 text-center">
        <BookOpenIcon className="size-9 text-primary/40" />
        <h1 className="mt-6 max-w-[24ch] font-reader text-3xl leading-snug text-reader-foreground">
          You&rsquo;re already part of the library.
        </h1>
        <p className="mt-4 font-body text-[0.95rem] leading-relaxed text-muted-foreground">
          {viewer.joinedAt
            ? relativeTimeLabel(viewer.joinedAt, 'Joined')
            : 'A member of KATHA'}
          {viewer.tier === 'author' && ' · a KATHA author'}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/continue-reading"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Continue reading
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="/library"
            className="font-body text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Browse the library
          </Link>
        </div>

        <div className="mt-14 border-t border-border pt-6">
          <button
            type="button"
            onClick={reset}
            className="font-body text-xs font-medium text-muted-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Start over as a guest
          </button>
          <p className="mt-2 max-w-[40ch] font-body text-xs leading-relaxed text-muted-foreground/70">
            Your bookmarks, history, and works stay on this device — they will
            be waiting when you rejoin.
          </p>
        </div>
      </div>
    );
  }

  /* The invitation proper */
  return (
    <div className="flex flex-col items-center px-5 text-center">
      <BookOpenIcon className="size-9 text-primary/40" />
      <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
        Membership
      </p>
      <h1 className="mt-4 max-w-[22ch] font-reader text-4xl leading-snug text-reader-foreground">
        Join the KATHA library.
      </h1>
      <p className="mt-4 max-w-[46ch] font-body text-base leading-relaxed text-muted-foreground">
        Free, and quietly yours. The library starts remembering — where you
        paused, what you marked, where you&rsquo;ve been.
      </p>

      <ul className="mt-9 space-y-2.5 text-left">
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

      <button
        type="button"
        onClick={handleJoin}
        disabled={joining}
        className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-9 py-4 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {joining ? 'Opening the library…' : 'Become a member'}
        <ArrowRightIcon className="size-4" />
      </button>
      <p className="mt-4 font-body text-xs text-muted-foreground/70">
        On this device for now — accounts and sync are on the way.
      </p>
      <Link
        href={destination}
        className="mt-6 font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        Not today — keep browsing
      </Link>
    </div>
  );
}
