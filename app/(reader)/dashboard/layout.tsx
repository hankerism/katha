import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/* Metadata shim: the page is a client component (reading data lives in
 * localStorage) and cannot export metadata itself, so the segment layout
 * carries the title into the root `%s · KATHA` template. */

export const metadata: Metadata = {
  title: 'Your Dashboard',
  description:
    'Your personal reading home — pick up where you left off, revisit saved passages, and see your recent activity across the KATHA library.',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
