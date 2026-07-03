import type { Metadata } from 'next';
import { Suspense } from 'react';
import JoinExperience from '@/components/membership/JoinExperience';

/* ---------------------------------------------------------------------------
 * KATHA · Join
 * app/(reader)/join/page.tsx
 *
 * The membership moment's address. Server shell (metadata + the calm canvas)
 * around the client experience; <Suspense> because the experience reads
 * ?from= to return the reader wherever the invitation found them.
 * ------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Join KATHA',
  description:
    'Become a member of the KATHA library — Continue Reading, Bookmarks, Reading History, and a personal library, free.',
};

export default function JoinPage() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 right-[-6rem] h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-12 left-[-8rem] h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="container-katha flex min-h-[70dvh] items-center justify-center py-16 md:py-20">
        <Suspense fallback={null}>
          <JoinExperience />
        </Suspense>
      </div>
    </section>
  );
}
