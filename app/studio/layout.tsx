import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import StudioShell from '@/components/studio/StudioShell';
import StudioGate from '@/components/studio/StudioGate';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — product layout
 * app/studio/layout.tsx
 *
 * The writing product's own chrome and title register. Studio pages are
 * client components (works live in localStorage), so titles come from this
 * layout tree, composing into "… · KATHA Studio".
 * ------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: {
    default: 'Author Studio · KATHA',
    template: '%s · KATHA Studio',
  },
  description:
    'The Author Studio — where KATHA stories are written. A calm writing environment with reader-quality preview.',
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <StudioShell>
      {/* The ladder's last rung: guests are pointed to the library door,
          readers may open their Studio, authors write. */}
      <StudioGate>{children}</StudioGate>
    </StudioShell>
  );
}
