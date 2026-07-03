'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  completeAuthorProfile,
  getViewer,
  joinAsReader,
  resetMembership,
  MEMBERSHIP_CHANGED_EVENT,
  type AuthorProfileInput,
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
 * ------------------------------------------------------------------------- */

export function useViewer() {
  const [viewer, setViewer] = useState<Viewer>({ tier: 'guest' });
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setViewer(getViewer());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(MEMBERSHIP_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(MEMBERSHIP_CHANGED_EVENT, refresh);
  }, [refresh]);

  const join = useCallback(() => setViewer(joinAsReader()), []);

  /** Reader → Author: link the public writing identity (possibly a pen name)
   *  to the same account. */
  const completeProfile = useCallback(
    (input: AuthorProfileInput) => setViewer(completeAuthorProfile(input)),
    [],
  );

  /** Convenience: become an author under the account's own name. */
  const becomeAuthor = useCallback(() => {
    const user = getViewer().user;
    setViewer(
      completeAuthorProfile({ displayName: user ? userFullName(user) : '' }),
    );
  }, []);

  const reset = useCallback(() => {
    resetMembership();
    setViewer(getViewer());
  }, []);

  return { viewer, loaded, join, completeProfile, becomeAuthor, reset };
}
