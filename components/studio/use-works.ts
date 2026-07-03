'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  createWork,
  type NewWorkInput,
  type StudioWork,
} from '@/lib/studio/work';
import { workRepository } from '@/lib/studio/work-repository';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — state hooks
 * components/studio/use-works.ts
 *
 * The thin React layer over the async WorkRepository: mount-gated loads (the
 * house localStorage pattern) and actions that persist first, then refresh
 * local state from what the repository returned. The repository stays the
 * single source of truth — cross-route consistency comes from re-reading it
 * on mount, not from a global store. Nothing here knows the storage is
 * local; the Supabase swap changes no line of these hooks.
 * ------------------------------------------------------------------------- */

/** An author's works, newest activity first, plus the shelf actions. */
export function useWorks(authorId: string) {
  const [works, setWorks] = useState<StudioWork[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setWorks(await workRepository.listWorks(authorId));
    setLoaded(true);
  }, [authorId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const begin = useCallback(
    async (input: Omit<NewWorkInput, 'authorId'>) => {
      const work = await workRepository.saveNewWork(
        createWork({ ...input, authorId }),
      );
      await refresh();
      return work;
    },
    [authorId, refresh],
  );

  const act = useCallback(
    (action: (id: string) => Promise<unknown>) => async (id: string) => {
      await action(id);
      await refresh();
    },
    [refresh],
  );

  return {
    works,
    loaded,
    refresh,
    begin,
    publish: act((id) => workRepository.publishWork(id)),
    unpublish: act((id) => workRepository.unpublishWork(id)),
    archive: act((id) => workRepository.archiveWork(id)),
    restore: act((id) => workRepository.restoreWork(id)),
    deleteForever: act((id) => workRepository.deleteWorkForever(id)),
  };
}

/** One work, for the workspace and editor. `update` persists a patch and
 *  reflects the repository's answer back into state. */
export function useWork(id: string) {
  const [work, setWork] = useState<StudioWork | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void workRepository.getWork(id).then((found) => {
      if (cancelled) return;
      setWork(found);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const update = useCallback(
    async (
      patch: Partial<Omit<StudioWork, 'id' | 'authorId' | 'createdAt'>>,
    ) => {
      const next = await workRepository.updateWork(id, patch);
      if (next) setWork(next);
      return next;
    },
    [id],
  );

  return { work, loaded, update, setWork };
}
