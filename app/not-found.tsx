import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpenIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Not found
 * app/not-found.tsx
 *
 * The brand-register 404 — the same calm empty-state idiom as the Bookmarks /
 * History / Search dead ends: a quiet glyph, a font-reader line, and two ways
 * back onto the shelves.
 * ------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-5">
      <div className="flex max-w-md flex-col items-center text-center">
        <BookOpenIcon className="size-9 text-primary/40" />
        <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 font-reader text-3xl text-reader-foreground">
          This page has wandered off the shelf
        </h1>
        <p className="mt-4 font-body text-[0.95rem] leading-relaxed text-muted-foreground">
          The story you&rsquo;re looking for isn&rsquo;t here — it may have
          been moved, renamed, or never written. The rest of the library is
          exactly where you left it.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/library"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Browse the library
          </Link>
          <Link
            href="/search"
            className="font-body text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Search instead →
          </Link>
        </div>
      </div>
    </div>
  );
}
