'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — useAutosave
 * components/studio/use-autosave.ts
 *
 * The Studio's one autosave mechanism, extracted now that it has two
 * consumers (the workspace's metadata form and the chapter editor). It owns
 * the debounce timer, the pending draft, dirty tracking, the save-state
 * whisper, and every lifecycle guard — consumers only decide WHAT to save
 * and WHEN a draft is worth scheduling.
 *
 * The invariant: there is exactly ONE save path.
 *
 *     scheduleSave(draft) ──▶ pending draft ──▶ flush() ──▶ save(draft)
 *
 * The debounce timer, component unmount, and pagehide/beforeunload all call
 * the same flush(); none of them saves on its own. This closes the silent
 * data-loss hole the inline implementations had: cancelling the debounce on
 * unmount used to DROP the last keystrokes on any in-app navigation. Now
 * unmount flushes.
 *
 * Persistence stays behind the caller's `save` callback (the repository
 * seam) — this hook never touches storage. With the local repository the
 * write lands synchronously when flush() calls save(), which is what makes
 * the unmount/pagehide flush trustworthy; a future async backend keeps the
 * same shape, and the beforeunload guard below still warns while a save is
 * genuinely in flight.
 * ------------------------------------------------------------------------- */

export type SaveState = 'idle' | 'saving' | 'saved';

const DEFAULT_DELAY_MS = 800;

export function useAutosave<T>(
  save: (draft: T) => Promise<unknown>,
  delayMs: number = DEFAULT_DELAY_MS,
) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  /** The draft waiting to be persisted; null = nothing pending. */
  const pendingRef = useRef<T | null>(null);
  /** True from flush() calling save() until that save settles. */
  const inFlightRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Always the latest save closure, so a flush at unmount uses fresh data.
   *  Updated in an effect (never during render, per react-hooks/refs);
   *  effects run before any timer or exit event can reach flush(). */
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  /** THE save path — everything below funnels through here. Synchronously
   *  hands the pending draft to save() (with the local repository the write
   *  itself is synchronous), so it is safe from unmount cleanup and
   *  pagehide, where nothing may await. */
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const draft = pendingRef.current;
    if (draft === null) return;
    pendingRef.current = null;
    inFlightRef.current = true;
    void saveRef
      .current(draft)
      .then(() => {
        setSaveState('saved');
        setSavedAt(new Date().toISOString());
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  }, []);

  /** Register (or replace) the pending draft and re-arm the debounce. */
  const scheduleSave = useCallback(
    (draft: T) => {
      pendingRef.current = draft;
      setSaveState('saving');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, delayMs);
    },
    [flush, delayMs],
  );

  // Lifecycle guards — every exit route converges on flush().
  useEffect(() => {
    // Tab close / reload / bfcache navigation: persist what's pending.
    const onPageHide = () => flush();

    // Same flush; the warning only remains for a draft that could not be
    // handed to save() synchronously, or a save still in flight (a future
    // async backend) — with the local repository this effectively never warns.
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      flush();
      if (pendingRef.current !== null || inFlightRef.current) {
        event.preventDefault();
      }
    };

    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
      // THE fix: in-app navigation unmounts this hook — persist, don't drop.
      flush();
    };
  }, [flush]);

  return { scheduleSave, flush, saveState, savedAt };
}
