import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/* Metadata shim: the page is a client component (history lives in
 * localStorage) and cannot export metadata itself, so the segment layout
 * carries the title into the root `%s · KATHA` template. */

export const metadata: Metadata = {
  title: 'Reading History',
  description:
    'Where you have been across the KATHA library — every visited chapter and passage, newest first, so you can retrace your steps.',
};

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return children;
}
