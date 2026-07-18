'use client';

import Link from 'next/link';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useViewer } from '@/components/membership/use-viewer';
import { userFullName } from '@/lib/users';
import { BookOpenIcon, ArrowRightIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — entry gate
 * components/studio/StudioGate.tsx
 *
 * The ladder's last rungs, one identity all the way up:
 *
 *   Guest  → join the library first (reading and writing share one account)
 *   Reader → Become an Author → COMPLETE THE AUTHOR PROFILE → the desk
 *   Author → write
 *
 * The profile step is where the public writing identity is born, separate
 * from the account: a display name (prefilled with the person's name, freely
 * a pen name), a bio, a location. The account itself never gains a username
 * or a slug — only the Author profile does.
 * ------------------------------------------------------------------------- */

const inputClass =
  'w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-base text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const labelClass =
  'block text-left font-body text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground';

export default function StudioGate({ children }: { children: ReactNode }) {
  const { viewer, loaded, completeProfile } = useViewer();
  const [step, setStep] = useState<'invite' | 'profile'>('invite');
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
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

  /* Reader — beat one: the invitation to write */
  if (step === 'invite') {
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
            You&rsquo;re a member of the library. Become a KATHA author and
            the Studio opens — drafts that take their time, chapters in the
            reader&rsquo;s own type, and a shelf of your own.
          </p>
          <button
            type="button"
            onClick={() => setStep('profile')}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Become a KATHA author
            <ArrowRightIcon className="size-4" />
          </button>
          <p className="mt-4 max-w-[40ch] font-body text-xs leading-relaxed text-muted-foreground/70">
            No application, no waiting — the desk simply opens.
          </p>
        </div>
      </div>
    );
  }

  /* Reader — beat two: the author profile (where the pen name is born) */
  const accountName = viewer.user ? userFullName(viewer.user) : '';
  const nameValue = displayName ?? accountName;
  const ready = nameValue.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready || opening) return;
    setOpening(true);
    completeProfile({ displayName: nameValue, bio, location });
    // The viewer flips to author and the desk renders in place.
  }

  return (
    <div className="container-katha flex min-h-[70dvh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <BookOpenIcon className="size-9 text-primary/40" />
          <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Your author profile
          </p>
          <h1 className="mt-4 font-reader text-3xl leading-snug text-reader-foreground">
            How should readers know you?
          </h1>
          <p className="mt-4 font-body text-[0.95rem] leading-relaxed text-muted-foreground">
            Your account stays yours{accountName ? ` (${accountName})` : ''} —
            this is the byline on your books. Your own name, or a pen name.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-9 space-y-6">
          <div>
            <label htmlFor="author-display-name" className={labelClass}>
              Display name
            </label>
            <input
              id="author-display-name"
              type="text"
              value={nameValue}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="The name on the spine"
              autoComplete="off"
              autoFocus
              className={`${inputClass} mt-2 font-heading text-lg`}
            />
          </div>

          <div>
            <label htmlFor="author-bio" className={labelClass}>
              Bio{' '}
              <span className="normal-case tracking-normal text-muted-foreground/70">
                — a line or two, it can grow later
              </span>
            </label>
            <textarea
              id="author-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="What do you write, and how does it feel?"
              rows={3}
              className={`${inputClass} mt-2 resize-y leading-relaxed`}
            />
          </div>

          <div>
            <label htmlFor="author-location" className={labelClass}>
              Location{' '}
              <span className="normal-case tracking-normal text-muted-foreground/70">
                — optional
              </span>
            </label>
            <input
              id="author-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Manila, Cebu, anywhere stories happen"
              autoComplete="off"
              className={`${inputClass} mt-2`}
            />
          </div>

          <p className="font-body text-xs leading-relaxed text-muted-foreground/70">
            A portrait and banner arrive with uploads — your initials will
            stand in beautifully until then.
          </p>

          <div className="flex items-center gap-5 pt-1">
            <button
              type="submit"
              disabled={!ready || opening}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {opening ? 'Opening the Writing Desk…' : 'Open the Writing Desk'}
              <ArrowRightIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep('invite')}
              className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Not yet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
