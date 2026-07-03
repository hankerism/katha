'use client';

import { getAuthorById } from '@/lib/authors';
import { initialsOf } from '@/lib/text';
import { useViewer } from '@/components/membership/use-viewer';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — identity chip
 * components/studio/StudioIdentity.tsx
 *
 * The writer's name in the Studio bar — shown only once the viewer actually
 * IS an author (guests and readers meeting the entry gate shouldn't be
 * greeted with someone else's name). Client leaf; the shell stays server.
 * ------------------------------------------------------------------------- */

export default function StudioIdentity() {
  const { viewer, loaded } = useViewer();
  if (!loaded || viewer.tier !== 'author' || !viewer.authorId) return null;

  const author = getAuthorById(viewer.authorId);
  if (!author) return null;

  return (
    <span className="hidden items-center gap-2.5 sm:inline-flex">
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-full bg-[linear-gradient(150deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_58%,#000))] font-heading text-[0.65rem] font-semibold text-brand-secondary"
      >
        {initialsOf(author.name)}
      </span>
      <span className="font-body text-sm text-muted-foreground">
        {author.name}
      </span>
    </span>
  );
}
