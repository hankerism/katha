'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { paragraphAnchorId } from '@/lib/reading-location';

/* ---------------------------------------------------------------------------
 * KATHA · ParagraphScrollRestoration
 * components/reader/ParagraphScrollRestoration.tsx
 *
 * A tiny client leaf (rendered by the server-side ReaderArticle) that scrolls
 * to a deep-linked paragraph. When the reader is opened at
 * `…/read/[chapter]#p-{index}` — e.g. from a bookmark — it finds the matching
 * paragraph id (paragraphAnchorId) and scrolls it into view after mount. The
 * paragraphs carry scroll-margin-top, so the target clears the sticky chrome.
 *
 * Covers the three ways you can arrive at a hash:
 *   • fresh load / navigation from another page → runs on mount
 *   • chapter → chapter within the reader          → re-runs on pathname change
 *   • same chapter, different passage              → the `hashchange` listener
 * It renders nothing.
 * ------------------------------------------------------------------------- */

function scrollToHashParagraph() {
  const match = /^#p-(\d+)$/.exec(window.location.hash);
  if (!match) return;
  const target = document.getElementById(paragraphAnchorId(Number(match[1])));
  target?.scrollIntoView({ block: 'start' });
}

export default function ParagraphScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Defer a frame so fonts/layout settle before the jump.
    const raf = requestAnimationFrame(scrollToHashParagraph);
    window.addEventListener('hashchange', scrollToHashParagraph);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('hashchange', scrollToHashParagraph);
    };
  }, [pathname]);

  return null;
}