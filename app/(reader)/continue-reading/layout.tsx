import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/* Metadata shim: the page is a client component (the position lives in
 * localStorage) and cannot export metadata itself, so the segment layout
 * carries the title into the root `%s · KATHA` template. */

export const metadata: Metadata = {
  title: 'Continue Reading',
  description:
    'Pick up where you left off — your saved reading position in the KATHA library.',
};

export default function ContinueReadingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
