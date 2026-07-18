/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — published books (distribution selectors)
 * lib/studio/published-books.ts
 *
 * The ONE place Studio works become reader-facing KathaBooks: repository →
 * workToBook, published works only. The Library's local shelf and the
 * client fallback surfaces (book details, chapter reader) all consume this
 * module — nothing else translates works for readers.
 *
 * DEVICE-scoped on purpose (Sprint 11 product decision): the shelf's own
 * label is "From this device's Studio", so it lists every published work on
 * the device — signed in, signed out, whoever's pen. Author-scoped views
 * (the Studio desk) stay behind the repository interface; this module uses
 * the local implementation's device-level helper directly, which is exactly
 * the coupling a device-only feature should have. Cloud publishing replaces
 * this seam wholesale.
 *
 * SSR-safe: resolves to [] / null on the server (the repository already
 * no-ops without a window), which is exactly what the server-rendered
 * catalogue pages expect from the client-only shelf.
 * ------------------------------------------------------------------------- */

import type { KathaBook } from '../catalogue-repository';
import { authorName } from '../author-selectors';
import { getWorksProvider } from '../supabase/env';
import { getViewer } from '../membership';
import { getCurrentAuthor } from './current-author';
import { listAllLocalWorks, workRepository } from './work-repository';
import { workToBook } from './work';

/** Every book published from this device's Studio, most recently published
 *  first. The abstraction resolves by works provider (Sprint 14 refinement —
 *  the seam stays intact, its SOURCE changes):
 *
 *    local works    — everything published on this device, any pen, signed
 *                     in or not (the device's shelf, per its own label).
 *    cloud works    — what this device's Studio publishes is the signed-in
 *                     author's cloud output; guests and readers have no
 *                     Studio output, so their shelf is naturally empty (the
 *                     public catalogue already shows every published book).
 */
export async function getLocalPublishedBooks(): Promise<KathaBook[]> {
  let works;
  if (getWorksProvider() === 'supabase') {
    const viewer = getViewer();
    if (viewer.tier !== 'author' || !viewer.authorId) return [];
    works = await workRepository.listWorks(viewer.authorId);
  } else {
    works = listAllLocalWorks();
  }
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
