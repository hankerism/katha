'use client';

import { useState, type FormEvent } from 'react';
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
 * The one place membership begins — and, as this file always promised, the
 * same page hosts the sign-in flow now that accounts exist. The URL and the
 * promise don't change.
 *
 * Two experiences behind one URL, chosen by the EXPLICIT auth provider:
 *   local     — the original one-calm-action join, unchanged.
 *   supabase  — the calm sign-up the membership domain designed for (first
 *               name, last name, email, password — nothing else), with
 *               sign-in for returning members and a plain sentence for the
 *               check-your-inbox case. Credentials go only to supabase.auth.
 *
 * Either way the guest is returned to wherever the invitation found them
 * (?from=), and a member who wanders here is greeted, not re-sold. The quiet
 * exit at the bottom (start over / sign out) keeps onboarding walkable —
 * reading data stays on the device, the domain's standing promise.
 * ------------------------------------------------------------------------- */

const inputClass =
  'w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-base text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const labelClass =
  'block text-left font-body text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground';

export default function JoinExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewer, loaded, join, reset, signUp, signIn, authProvider } =
    useViewer();
  const [joining, setJoining] = useState(false);

  const from = searchParams.get('from') ?? '';
  const destination = from.startsWith('/') ? from : '/library';
  const authError = searchParams.get('auth_error');

  function handleLocalJoin() {
    if (joining) return;
    setJoining(true);
    join();
    router.push(destination);
  }

  if (!loaded) return null;

  /* Already part of the library */
  if (viewer.tier !== 'guest') {
    const isSupabase = authProvider === 'supabase';
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
            {isSupabase ? 'Sign out' : 'Start over as a guest'}
          </button>
          <p className="mt-2 max-w-[40ch] font-body text-xs leading-relaxed text-muted-foreground/70">
            {isSupabase
              ? 'Your bookmarks, history, and works stay on this device — they will be waiting when you sign back in.'
              : 'Your bookmarks, history, and works stay on this device — they will be waiting when you rejoin.'}
          </p>
        </div>
      </div>
    );
  }

  /* Guest — the credentialed experience (supabase mode) */
  if (authProvider === 'supabase') {
    return (
      <CredentialedJoin
        destination={destination}
        signUp={signUp}
        signIn={signIn}
        authError={authError}
      />
    );
  }

  /* Guest — the invitation proper (local mode, unchanged) */
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
        onClick={handleLocalJoin}
        disabled={joining}
        className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-9 py-4 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {joining ? 'Opening the library…' : 'Become a member'}
        <ArrowRightIcon className="size-4" />
      </button>
      <p className="mt-4 font-body text-xs text-muted-foreground/70">
        Kept on this device — cloud sync is on the way.
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

/* ── The calm sign-up / sign-in (supabase mode) ──────────────────────────── */

/** Calm explanations for the callback route's named errors. */
const AUTH_ERROR_COPY: Record<string, string> = {
  expired:
    'That confirmation link has expired or was already used. Sign in below — or sign up again and we’ll send a fresh one.',
  invalid:
    'That link didn’t carry a valid confirmation. Sign in below, or sign up to receive a new one.',
};

function CredentialedJoin({
  destination,
  signUp,
  signIn,
  authError,
}: {
  destination: string;
  signUp: ReturnType<typeof useViewer>['signUp'];
  signIn: ReturnType<typeof useViewer>['signIn'];
  authError: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<'signup' | 'signin'>(
    authError ? 'signin' : 'signup',
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInbox, setCheckInbox] = useState(false);

  const isSignUp = mode === 'signup';
  const ready = isSignUp
    ? firstName.trim() && email.trim() && password.length >= 8
    : email.trim() && password.length > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (isSignUp) {
        const result = await signUp({ firstName, lastName, email, password });
        if (result.needsEmailVerification) {
          setCheckInbox(true);
          return;
        }
      } else {
        await signIn({ email, password });
      }
      router.push(destination);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Something went wrong — try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (checkInbox) {
    return (
      <div className="flex flex-col items-center px-5 text-center">
        <BookOpenIcon className="size-9 text-primary/40" />
        <h1 className="mt-6 max-w-[24ch] font-reader text-3xl leading-snug text-reader-foreground">
          One more step — check your inbox.
        </h1>
        <p className="mt-4 max-w-[44ch] font-body text-[0.95rem] leading-relaxed text-muted-foreground">
          We sent a confirmation link to{' '}
          <span className="font-medium text-foreground">{email.trim()}</span>.
          Open it, and the library starts remembering.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 text-center">
      <BookOpenIcon className="size-9 text-primary/40" />
      <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
        Membership
      </p>
      <h1 className="mt-4 max-w-[22ch] font-reader text-4xl leading-snug text-reader-foreground">
        {isSignUp ? 'Join the KATHA library.' : 'Welcome back to the library.'}
      </h1>
      <p className="mt-4 max-w-[46ch] font-body text-base leading-relaxed text-muted-foreground">
        {isSignUp
          ? 'Free, and quietly yours. The library starts remembering — where you paused, what you marked, where you’ve been.'
          : 'Sign in and pick up exactly where you left off.'}
      </p>

      {authError && AUTH_ERROR_COPY[authError] && (
        <p
          role="alert"
          className="mt-5 max-w-[46ch] rounded-xl border border-border bg-card px-4 py-3 font-body text-sm leading-relaxed text-muted-foreground"
        >
          {AUTH_ERROR_COPY[authError]}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-9 w-full space-y-4">
        {isSignUp && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="join-first-name" className={labelClass}>
                First name
              </label>
              <input
                id="join-first-name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={`${inputClass} mt-2`}
              />
            </div>
            <div>
              <label htmlFor="join-last-name" className={labelClass}>
                Last name
              </label>
              <input
                id="join-last-name"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={`${inputClass} mt-2`}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="join-email" className={labelClass}>
            Email
          </label>
          <input
            id="join-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`${inputClass} mt-2`}
          />
        </div>

        <div>
          <label htmlFor="join-password" className={labelClass}>
            Password
            {isSignUp && (
              <span className="ml-2 normal-case tracking-normal text-muted-foreground/70">
                — at least 8 characters
              </span>
            )}
          </label>
          <input
            id="join-password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${inputClass} mt-2`}
          />
        </div>

        {error && (
          <p role="alert" className="font-body text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!ready || busy}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-9 py-4 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {busy
            ? 'Opening the library…'
            : isSignUp
              ? 'Become a member'
              : 'Sign in'}
          <ArrowRightIcon className="size-4" />
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(isSignUp ? 'signin' : 'signup');
          setError(null);
        }}
        className="mt-6 font-body text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        {isSignUp
          ? 'Already a member? Sign in'
          : 'New to KATHA? Become a member'}
      </button>
      <Link
        href={destination}
        className="mt-4 font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        Not today — keep browsing
      </Link>
    </div>
  );
}
