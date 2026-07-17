/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — published books (distribution selectors)
 * lib/studio/published-books.ts
 *
 * The ONE place Studio works become reader-facing KathaBooks: repository →
 * workToBook, published works only. The Library's local shelf and the
 * client fallback surfaces (book details, chapter reader) all consume this
 * module — nothing else translates works for readers.
 *
 * Derives from the EXISTING repository interface (listWorks by the current
 * author) rather than a dedicated query — on this device the current author
 * IS the publisher. If a future backend wants a dedicated published-books
 * query for performance, this selector adopts it internally without
 * affecting any caller.
 *
 * SSR-safe: resolves to [] / null on the server (the repository already
 * no-ops without a window), which is exactly what the server-rendered
 * catalogue pages expect from the client-only shelf.
 * ------------------------------------------------------------------------- */

import type { KathaBook } from '../books';
import { authorName } from '../author-selectors';
import { getCurrentAuthor, getCurrentAuthorId } from './current-author';
import { workRepository } from './work-repository';
import { workToBook } from './work';

/** Every book published from this device's Studio, most recently published
 *  first. */
export async function getLocalPublishedBooks(): Promise<KathaBook[]> {
  const works = await workRepository.listWorks(getCurrentAuthorId());
  return works
    .filter((work) => work.lifecycle === 'published')
    .sort((a, b) =>
      (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt),
    )
    .map(workToBook);
}

/** Resolve a locally published book by its public slug, or null. The server
 *  resolves the shared catalogue first, so this is only consulted on a
 *  catalogue miss — a local slug can never shadow a catalogue book (and
 *  validateForPublish refuses colliding slugs at publish time anyway). */
export async function getLocalPublishedBookBySlug(
  slug: string,
): Promise<KathaBook | null> {
  const books = await getLocalPublishedBooks();
  return books.find((book) => book.slug === slug) ?? null;
}

/** Byline for a local book: the catalogue author if the id resolves (the
 *  seeded house author does), else the device's current writing identity —
 *  the pen name — else the humanized-id fallback authorName() provides. */
export function localBookAuthorName(book: Pick<KathaBook, 'authorId'>): string {
  const current = getCurrentAuthor();
  if (current && current.id === book.authorId) return current.displayName;
  return authorName(book.authorId);
}
