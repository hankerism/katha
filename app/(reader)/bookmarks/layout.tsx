import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/* Metadata shim: the page is a client component (bookmarks live in
 * localStorage) and cannot export metadata itself, so the segment layout
 * carries the title into the root `%s · KATHA` template. */

export const metadata: Metadata = {
  title: 'Bookmarks',
  description:
    'Your marked passages across the KATHA library — every bookmark waits here, ready to take you back to the exact paragraph.',
};

export default function BookmarksLayout({ children }: { children: ReactNode }) {
  return children;
}
