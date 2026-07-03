'use client';

import type { ReactNode } from 'react';
import { useViewer } from '@/components/membership/use-viewer';
import MembershipInvitation from '@/components/membership/MembershipInvitation';

/* ---------------------------------------------------------------------------
 * KATHA · Membership — chapter gate
 * components/membership/ChapterGate.tsx
 *
 * The edge of the free preview. The server decides WHETHER a chapter is free
 * (isChapterFree, passed down as data); this boundary decides WHO is looking.
 * Free chapters render for everyone, immediately — a guest reads the whole
 * preview uninterrupted. Beyond it, guests meet the editorial invitation (on
 * the same paper the chapter would have been printed on), and members read on.
 *
 * The server-rendered pass shows nothing for gated chapters (guest is the
 * server's viewer), so the article body never paints for a guest. With
 * accounts, this same decision moves fully server-side; the composition here
 * doesn't change.
 * ------------------------------------------------------------------------- */

export interface ChapterGateProps {
  /** Server-computed: is this chapter inside the book's free preview? */
  free: boolean;
  bookTitle: string;
  /** The chapter URL, so joining returns the reader exactly here. */
  from: string;
  children: ReactNode;
}

export default function ChapterGate({
  free,
  bookTitle,
  from,
  children,
}: ChapterGateProps) {
  const { viewer, loaded } = useViewer();

  // The preview is for everyone — no gate, no flash, no judgement.
  if (free) return children;

  // Gated: quiet until we know who's reading (server + first client render).
  if (!loaded) return null;

  if (viewer.tier === 'guest') {
    return (
      <MembershipInvitation
        heading="You’ve reached the end of the free preview."
        invitation={`Become a member of KATHA to continue reading ${bookTitle} — and the library will hold your place in every book, free.`}
        from={from}
      />
    );
  }

  return children;
}
