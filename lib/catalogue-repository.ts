/* ---------------------------------------------------------------------------
 * KATHA · Catalogue — repository seam
 * lib/catalogue-repository.ts
 *
 * The formal contract for the shared catalogue — the books every reader sees.
 * Today the catalogue is compile-time data in lib/books.ts; tomorrow it is
 * rows in a database that server components fetch per request. This interface
 * is the seam that makes that swap invisible: server pages await the
 * repository, and whether the answer comes from a static module or Supabase
 * is the implementation's business.
 *
 * LocalCatalogue delegates to lib/books.ts — the static catalogue IS the
 * local implementation. Pure helpers that derive over book data the caller
 * already holds (isChapterFree, buildChapters) stay exported from lib/books;
 * the repository carries only RESOLUTION (which books exist, finding one).
 *
 * As of Sprint 8 Step 2 the migration is COMPLETE: every consumer obtains
 * catalogue data through this interface. Server components await it; client
 * components either receive book data as props from a server parent (the
 * reader chrome) or fetch a catalogue snapshot through it on mount and hand
 * that snapshot to the pure selectors. Only this module imports lib/books.
 * ------------------------------------------------------------------------- */

import {
  getAllBooks,
  getBookBySlug,
  getFeaturedBooks,
  getBooksByCategory,
  getRelatedBooks,
  getSearchIndex,
  type BookSearchRecord,
  type KathaBook,
} from './books';

/* The catalogue DOMAIN — types and pure helpers that derive over book data
 * the caller already holds — re-exported so every consumer has ONE import
 * surface. Only this module (the local implementation) knows the data itself
 * lives in lib/books. */
export {
  isChapterFree,
  buildChapters,
  type KathaBook,
  type KathaChapter,
  type BookSearchRecord,
} from './books';

export interface CatalogueRepository {
  /** Every book on the shelves, catalogue order. */
  listBooks(): Promise<KathaBook[]>;
  /** Resolve one book by its public slug, or null. */
  getBook(slug: string): Promise<KathaBook | null>;
  /** The editorial featured shelf. */
  listFeatured(): Promise<KathaBook[]>;
  /** Books on one category shelf (by category slug). */
  listByCategory(categorySlug: string): Promise<KathaBook[]>;
  /** Same-category companions for a book's "you may also like" shelf. */
  listRelated(slug: string): Promise<KathaBook[]>;
  /** The flattened records the search experience indexes. */
  searchIndex(): Promise<BookSearchRecord[]>;
}

/* ── Local implementation ────────────────────────────────────────────────── */

class LocalCatalogue implements CatalogueRepository {
  async listBooks(): Promise<KathaBook[]> {
    return getAllBooks();
  }

  async getBook(slug: string): Promise<KathaBook | null> {
    return getBookBySlug(slug) ?? null;
  }

  async listFeatured(): Promise<KathaBook[]> {
    return getFeaturedBooks();
  }

  async listByCategory(categorySlug: string): Promise<KathaBook[]> {
    return getBooksByCategory(categorySlug);
  }

  async listRelated(slug: string): Promise<KathaBook[]> {
    return getRelatedBooks(slug);
  }

  async searchIndex(): Promise<BookSearchRecord[]> {
    return getSearchIndex();
  }
}

/* ── Selection (Sprint 13) ───────────────────────────────────────────────── */

import { getCatalogueProvider } from './supabase/env';

/** Resolve the ACTIVE implementation, lazily: the Supabase catalogue loads
 *  via dynamic import at first use, so local mode bundles none of it and no
 *  static import cycle exists (lib/supabase/repositories imports this
 *  module's interface + helpers). */
let activeCatalogue: Promise<CatalogueRepository> | null = null;

function resolveCatalogue(): Promise<CatalogueRepository> {
  if (activeCatalogue) return activeCatalogue;
  activeCatalogue =
    getCatalogueProvider() === 'supabase'
      ? import('./supabase/repositories').then(
          ({ SupabaseCatalogue }) => new SupabaseCatalogue(),
        )
      : Promise.resolve(new LocalCatalogue());
  return activeCatalogue;
}

/** The seam: every consumer holds this one instance; which implementation
 *  answers is decided by the EXPLICIT NEXT_PUBLIC_CATALOGUE_PROVIDER —
 *  independent of the auth provider, so the data domains stay independently
 *  swappable. */
export const catalogueRepository: CatalogueRepository = {
  listBooks: async () => (await resolveCatalogue()).listBooks(),
  getBook: async (slug) => (await resolveCatalogue()).getBook(slug),
  listFeatured: async () => (await resolveCatalogue()).listFeatured(),
  listByCategory: async (categorySlug) =>
    (await resolveCatalogue()).listByCategory(categorySlug),
  listRelated: async (slug) => (await resolveCatalogue()).listRelated(slug),
  searchIndex: async () => (await resolveCatalogue()).searchIndex(),
};
