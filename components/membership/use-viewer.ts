'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  activeAuthProvider,
  completeAuthorProfile,
  getViewer,
  hydrateViewer,
  joinAsReader,
  resetMembership,
  signInWithPassword,
  signUpWithPassword,
  MEMBERSHIP_CHANGED_EVENT,
  type AuthorProfileInput,
  type SignInInput,
  type SignUpInput,
  type SignUpResult,
  type Viewer,
} from '@/lib/membership';
import { userFullName } from '@/lib/users';

/* ---------------------------------------------------------------------------
 * KATHA · Membership — useViewer
 * components/membership/use-viewer.ts
 *
 * The hook mirror of getViewer(): mount-gated (every server render and first
 * client render is a guest render, so hydration stays clean), then live — it
 * re-reads on every membership transition via the domain's changed event, so
 * the Navbar, gates, and shelves all agree without a navigation.
 *
 * Sprint 9: the membership layer is async inside (real authentication in
 * supabase mode), but this hook's contract barely moves — `loaded` now means
 * "the session has resolved" instead of "storage was read", and the
 * transition callbacks (join / completeProfile / becomeAuthor / reset) stay
 * fire-and-forget; state follows through the changed event exactly as
 * before. Additions are additive only: signUp / signIn for the credentialed
 * join flow, and authProvider so /join knows which experience to render.
 * ------------------------------------------------------------------------- */

export function useViewer() {
  const [viewer, setViewer] = useState<Viewer>({ tier: 'guest' });
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setViewer(getViewer());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void hydrateViewer().then((resolved) => {
      if (cancelled) return;
      setViewer(resolved);
      setLoaded(true);
    });
    window.addEventListener(MEMBERSHIP_CHANGED_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(MEMBERSHIP_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  const join = useCallback(() => {
    void joinAsReader().then(setViewer);
  }, []);

  /** Reader → Author: link the public writing identity (possibly a pen name)
   *  to the same account. */
  const completeProfile = useCallback((input: AuthorProfileInput) => {
    void completeAuthorProfile(input).then(setViewer);
  }, []);

  /** Convenience: become an author under the account's own name. */
  const becomeAuthor = useCallback(() => {
    const user = getViewer().user;
    void completeAuthorProfile({
      displayName: user ? userFullName(user) : '',
    }).then(setViewer);
  }, []);

  const reset = useCallback(() => {
    void resetMembership().then(() => setViewer(getViewer()));
  }, []);

  /** Credentialed registration (awaitable — the join form reports errors and
   *  the needs-verification state to the person filling it in). */
  const signUp = useCallback(
    async (input: SignUpInput): Promise<SignUpResult> => {
      const result = await signUpWithPassword(input);
      setViewer(result.viewer);
      return result;
    },
    [],
  );

  /** Credentialed sign-in (awaitable, same reasoning). */
  const signIn = useCallback(async (input: SignInInput): Promise<Viewer> => {
    const resolved = await signInWithPassword(input);
    setViewer(resolved);
    return resolved;
  }, []);

  return {
    viewer,
    loaded,
    join,
    completeProfile,
    becomeAuthor,
    reset,
    signUp,
    signIn,
    authProvider: activeAuthProvider,
  };
}
