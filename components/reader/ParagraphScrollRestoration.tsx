'use client';

import { useEffect, useRef } from 'react';
import { recordVisit } from '@/lib/history';
import { getViewer } from '@/lib/membership';
import {
  paragraphAnchorId,
  withParagraphAnchor,
  type ReadingLocation,
} from '@/lib/reading-location';

/* ---------------------------------------------------------------------------
 * KATHA · ParagraphScrollRestoration
 * components/reader/ParagraphScrollRestoration.tsx
 *
 * A tiny client leaf (rendered by the reader page, which owns the routing data)
 * that carries the reader's browser-only behavior:
 *
 *   1. Scroll restoration — when opened at `…/read/[chapter]#p-{index}` (e.g.
 *      from a bookmark), it scrolls that paragraph into view after mount. The
 *      paragraphs carry scroll-margin-top, so the target clears the sticky
 *      chrome. Same-chapter passage jumps are handled by the hashchange listener.
 *
 *   2. History recording — it records this visit via history.recordVisit() ONCE
 *      per chapter navigation, at the arrival paragraph (a valid #p-{index} deep
 *      link, else paragraph 0). It reuses the shared ReadingLocation model and
 *      withParagraphAnchor(); it never re-derives any of that logic.
 *
 * Why here: ReaderArticle is a Server Component and must stay one, so all
 * browser-only work lives in this leaf. The page passes the base ReadingLocation
 * (paragraph 0, empty preview); this leaf only refines the paragraph index/href
 * for deep links. It renders nothing.
 * ------------------------------------------------------------------------- */

/** Parse `#p-{index}` from the current hash, or null. */
function hashParagraphIndex(): number | null {
  const match = /^#p-(\d+)$/.exec(window.location.hash);
  return match ? Number(match[1]) : null;
}

/** Scroll to the paragraph named in the hash, if any (null-safe). */
function scrollToHashParagraph() {
  const index = hashParagraphIndex();
  if (index === null) return;
  document
    .getElementById(paragraphAnchorId(index))
    ?.scrollIntoView({ block: 'start' });
}

export default function ParagraphScrollRestoration({
  location,
}: {
  location: ReadingLocation;
}) {
  // Guards against duplicate writes for the same arrival within one mount
  // (React StrictMode's double-invoke, or an incidental re-render).
  const lastRecorded = useRef<string | null>(null);

  // Re-runs per chapter navigation: the page passes a new `location` object for
  // each chapter, which is also the data the effect depends on.
  useEffect(() => {
    // Where did we land? A valid #p-{index} deep link, else the chapter start.
    // Validate against the DOM so a stale/out-of-range index falls back to 0.
    const requested = hashParagraphIndex();
    const paragraphIndex =
      requested !== null &&
      document.getElementById(paragraphAnchorId(requested)) !== null
        ? requested
        : 0;

    // 1) Scroll to the deep-linked paragraph after layout settles.
    const raf = requestAnimationFrame(scrollToHashParagraph);

    // 2) Record the visit once per chapter navigation, at the arrival paragraph.
    const visit: ReadingLocation =
      paragraphIndex === 0
        ? location
        : {
            ...location,
            paragraphIndex,
            href: withParagraphAnchor(location.href, paragraphIndex),
          };
    const key = `${visit.bookSlug}:${visit.chapterSlug}:${visit.paragraphIndex}`;
    // Scroll restoration works for everyone; only members are remembered.
    if (lastRecorded.current !== key && getViewer().tier !== 'guest') {
      lastRecorded.current = key;
      recordVisit(visit);
    }

    // Same-chapter jumps to another passage still scroll — but don't re-record.
    window.addEventListener('hashchange', scrollToHashParagraph);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('hashchange', scrollToHashParagraph);
    };
  }, [location]);

  return null;
}