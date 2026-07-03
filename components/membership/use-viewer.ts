'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  becomeAuthor,
  getViewer,
  joinAsReader,
  resetMembership,
  MEMBERSHIP_CHANGED_EVENT,
  type Viewer,
} from '@/lib/membership';

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
  const upgrade = useCallback(() => setViewer(becomeAuthor()), []);
  const reset = useCallback(() => {
    resetMembership();
    setViewer(getViewer());
  }, []);

  return { viewer, loaded, join, becomeAuthor: upgrade, reset };
}
