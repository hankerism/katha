import type { ReactNode } from 'react';
import Navbar from '@/components/ui/layout/Navbar';
import Footer from '@/components/ui/layout/Footer';

/* ---------------------------------------------------------------------------
 * KATHA · Reader product layout
 * app/(reader)/layout.tsx
 *
 * The reading product's chrome: sticky Navbar above the routed page, site
 * Footer beneath it (the immersive reader chapter page opts out via the
 * body:has() CSS gate in globals.css). The Studio — a separate product with
 * its own chrome — lives outside this group; the root layout carries only
 * the html shell.
 * ------------------------------------------------------------------------- */

export default function ReaderLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
