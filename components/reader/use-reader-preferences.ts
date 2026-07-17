'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getReaderPreferences,
  updateReaderPreferences,
  READER_PREFERENCES_CHANGED_EVENT,
  READER_PREFERENCES_STORAGE_KEY,
  type ReaderPreferences,
} from '@/lib/reader-preferences';

/* ---------------------------------------------------------------------------
 * KATHA · useReaderPreferences
 * components/reader/use-reader-preferences.ts
 *
 * The hook mirror of getReaderPreferences() — the seam through which reader
 * UI consumes preferences (components never touch the persistence layer or
 * localStorage directly). Mirrors components/membership/use-viewer.ts.
 *
 * One deliberate difference from useViewer: the initial state is a LAZY read
 * of storage, not a mount-gated effect. Server render and first client render
 * therefore differ when preferences are saved — which is exactly the contract
 * of the flash-prevention pattern (see reader-preference-selectors): the
 * bootstrap script has already corrected the DOM to the stored preferences
 * before paint, so the client's first render MATCHES the DOM and hydration
 * stays clean. An effect-gated read here would re-introduce the flash.
 *
 * Live: re-reads on the domain's changed event (same-tab writers — the panel,
 * a future Settings page) and on `storage` (another tab), so every mounted
 * consumer agrees without prop drilling.
 * ------------------------------------------------------------------------- */

export function useReaderPreferences() {
  const [preferences, setPreferences] = useState<ReaderPreferences>(
    getReaderPreferences,
  );

  useEffect(() => {
    const refresh = () => setPreferences(getReaderPreferences());
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === READER_PREFERENCES_STORAGE_KEY) {
        refresh();
      }
    };
    window.addEventListener(READER_PREFERENCES_CHANGED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(READER_PREFERENCES_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  /** Merge a partial change; persistence + the changed event fan it out. */
  const update = useCallback((patch: Partial<ReaderPreferences>) => {
    setPreferences(updateReaderPreferences(patch));
  }, []);

  return { preferences, update };
}
