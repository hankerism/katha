'use client';

import { useEffect, useState } from 'react';
import type { KathaBook } from '@/lib/catalogue-repository';
import {
  getLocalPublishedBooks,
  localBookAuthorName,
} from '@/lib/studio/published-books';
import BookCard from '@/components/ui/BookCard';

/* ---------------------------------------------------------------------------
 * KATHA · Library — local published shelf
 * components/library/LocalPublishedShelf.tsx
 *
 * The labeled shelf for books published from this device's Studio. Client
 * component (published works live in localStorage) with the house
 * mount-gate: the server pass and first client render show nothing, then
 * the shelf appears only when there is something on it.
 *
 * Deliberately a SEPARATE shelf, never merged into the server-rendered
 * catalogue grid: provenance stays honest ("from this device"), and the
 * catalogue's genre pills, search, and counts stay truthful to the shared
 * catalogue. Cards are the same BookCard readers already know; hrefs point
 * at the real /library/[slug] addresses, which resolve through the client
 * fallback seam.
 * ------------------------------------------------------------------------- */

export default function LocalPublishedShelf() {
  const [books, setBooks] = useState<KathaBook[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getLocalPublishedBooks().then((found) => {
      if (cancelled) return;
      setBooks(found);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || books.length === 0) return null;

  return (
    <section
      aria-labelledby="local-shelf-heading"
      className="mt-16 border-t border-border pt-12"
    >
      <h2
        id="local-shelf-heading"
        className="font-heading text-2xl text-foreground sm:text-3xl"
      >
        From this device&rsquo;s Studio
      </h2>
      <p className="mt-1.5 font-body text-sm text-muted-foreground">
        Published here, readable here — cloud publishing arrives soon.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
        {books.map((book) => (
          <BookCard
            key={book.slug}
            title={book.title}
            author={localBookAuthorName(book)}
            cover={book.cover}
            category={book.category}
            chapters={book.chapters.length}
            href={`/library/${book.slug}`}
          />
        ))}
      </div>
    </section>
  );
}
