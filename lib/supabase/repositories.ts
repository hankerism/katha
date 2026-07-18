/* ---------------------------------------------------------------------------
 * KATHA · Supabase — repository implementations
 * lib/supabase/repositories.ts
 *
 * The cloud implementations behind the app's repository interfaces, arriving
 * one migration step at a time:
 *
 *   SupabaseCatalogue       LIVE (Sprint 13) — published works + chapters,
 *                           selected by NEXT_PUBLIC_CATALOGUE_PROVIDER.
 *   SupabaseWorkRepository  placeholder — lands with the publishing swap.
 *   SupabaseReadingData     placeholder — lands with reading-data sync.
 *
 * The row mappers are the schema⟷domain translation layer, compiler-held to
 * both sides of the contract. This module is imported LAZILY (dynamic
 * import) by the selection seams, so local-mode bundles carry none of it.
 * ------------------------------------------------------------------------- */

import type { Database } from './database-types';
import type { CatalogueRepository } from '../catalogue-repository';
import { buildChapters, type KathaBook } from '../catalogue-repository';
import type { BookSearchRecord } from '../catalogue-repository';
import type { ReadingDataRepository } from '../reading-data-repository';
import type { WorkRepository } from '../studio/work-repository';
import type { StudioChapter, StudioWork } from '../studio/work';

type WorkRow = Database['public']['Tables']['works']['Row'];
type ChapterRow = Database['public']['Tables']['chapters']['Row'];

const NOT_IMPLEMENTED =
  'SupabaseRepository: not implemented yet — this lands with its migration step; the app runs on the local implementations.';

/* ── Row mappers (the real translation layer, compiler-checked) ──────────── */

/** "This week" / "This month" / a plain date — the display recency label,
 *  computed from updated_at (the compiled catalogue hand-authored these;
 *  the database computes them honestly). */
function updatedLabel(updatedAt: string): string {
  const time = Date.parse(updatedAt);
  if (Number.isNaN(time)) return 'Recently';
  const days = (Date.now() - time) / 86_400_000;
  if (days <= 7) return 'This week';
  if (days <= 31) return 'This month';
  return new Date(time).toLocaleDateString('en-PH', {
    month: 'long',
    year: 'numeric',
  });
}

/** A published work + its ordered chapters → the reader's KathaBook, through
 *  the same buildChapters() derivation the local catalogue uses. Chapter
 *  slugs come from the STORED column (they are public addresses and reading-
 *  data keys); a draft row without one falls back to its id. */
export function rowsToKathaBook(
  work: WorkRow,
  chapters: ChapterRow[],
): KathaBook {
  return {
    slug: work.slug,
    title: work.title,
    authorId: work.author_id,
    category: work.category,
    language: work.language,
    status: work.status,
    updated: updatedLabel(work.updated_at),
    // The domain documents publishedAt as an ISO DATE ("the date the book
    // joined the shelves"); the column is a timestamptz — normalize.
    publishedAt: (work.published_at ?? work.updated_at).slice(0, 10),
    cover: work.cover_url,
    synopsis: work.synopsis,
    featured: work.featured,
    freeChapters: work.free_chapters ?? undefined,
    chapters: buildChapters(
      [...chapters]
        .sort((a, b) => a.position - b.position)
        .map((chapter) => ({
          slug: chapter.slug ?? chapter.id,
          title: chapter.title,
          content: chapter.manuscript.split(/\n\s*\n/).filter(Boolean),
        })),
    ),
  };
}

/** A work row + chapter rows → the Studio's StudioWork. */
export function rowsToStudioWork(
  work: WorkRow,
  chapters: ChapterRow[],
): StudioWork {
  const studioChapters: StudioChapter[] = [...chapters]
    .sort((a, b) => a.position - b.position)
    .map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      manuscript: chapter.manuscript,
    }));
  return {
    id: work.id,
    authorId: work.author_id,
    lifecycle: work.lifecycle as StudioWork['lifecycle'],
    createdAt: work.created_at,
    updatedAt: work.updated_at,
    publishedAt: work.published_at ?? undefined,
    archivedAt: work.archived_at ?? undefined,
    book: {
      slug: work.slug,
      title: work.title,
      category: work.category,
      language: work.language,
      status: work.status,
      synopsis: work.synopsis,
      cover: work.cover_url,
    },
    chapters: studioChapters,
  };
}

/* ── Placeholder implementations ─────────────────────────────────────────── */

/** The cloud catalogue — published works + their chapters, one nested query
 *  per call (no N+1), assembled through the shared mapper. Runs on server
 *  and browser alike with a bare anon client: published data is public by
 *  the validated RLS policies, so no cookies or session are involved.
 *
 *  Failure behavior extends the Sprint 11 principle: a backend problem
 *  degrades to EMPTY SHELVES with a development warning — calm empty
 *  states, never a crashed page. */
export class SupabaseCatalogue implements CatalogueRepository {
  private client: import('@supabase/supabase-js').SupabaseClient<Database> | null =
    null;

  private async getClient() {
    if (this.client) return this.client;
    const [{ createClient }, { requireSupabaseEnv }] = await Promise.all([
      import('@supabase/supabase-js'),
      import('./env'),
    ]);
    const env = requireSupabaseEnv();
    this.client = createClient<Database>(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return this.client;
  }

  /** The one query shape every method builds on. */
  private async fetchPublished(match?: {
    slug?: string;
    featured?: boolean;
  }): Promise<KathaBook[]> {
    try {
      const client = await this.getClient();
      // The embed names its FK explicitly: PostgREST sees several paths
      // between works and chapters (the direct FK plus the reading-data
      // composite tables) and refuses an ambiguous `chapters(*)`.
      let query = client
        .from('works')
        .select('*, chapters!chapters_work_id_fkey(*)')
        .eq('lifecycle', 'published')
        .order('published_at', { ascending: true });
      if (match?.slug !== undefined) query = query.eq('slug', match.slug);
      if (match?.featured !== undefined) {
        query = query.eq('featured', match.featured);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) =>
        rowsToKathaBook(row, row.chapters ?? []),
      );
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'KATHA catalogue: Supabase is unreachable — serving empty shelves.',
          error,
        );
      }
      return [];
    }
  }

  async listBooks(): Promise<KathaBook[]> {
    return this.fetchPublished();
  }

  async getBook(slug: string): Promise<KathaBook | null> {
    const books = await this.fetchPublished({ slug });
    return books[0] ?? null;
  }

  async listFeatured(): Promise<KathaBook[]> {
    return this.fetchPublished({ featured: true });
  }

  async listByCategory(categorySlug: string): Promise<KathaBook[]> {
    // Category URLS are slugified display names; match in memory over the
    // published set (small) so slugification stays in ONE place app-side.
    const books = await this.fetchPublished();
    return books.filter(
      (book) => slugifyCategory(book.category) === categorySlug,
    );
  }

  async listRelated(slug: string): Promise<KathaBook[]> {
    const books = await this.fetchPublished();
    const current = books.find((book) => book.slug === slug);
    if (!current) return [];
    return books.filter(
      (book) => book.slug !== slug && book.category === current.category,
    );
  }

  async searchIndex(): Promise<BookSearchRecord[]> {
    const books = await this.fetchPublished();
    return books.map((book) => ({
      slug: book.slug,
      title: book.title,
      authorId: book.authorId,
      category: book.category,
      cover: book.cover,
      chapters: book.chapters.map(({ number, slug: chapterSlug, title }) => ({
        number,
        slug: chapterSlug,
        title,
      })),
    }));
  }
}

/** Mirror of lib/search's category slugification (display name → URL slug). */
function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
export class SupabaseWorkRepository implements WorkRepository {
  async listWorks(): Promise<StudioWork[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async getWork(): Promise<StudioWork | undefined> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async saveNewWork(): Promise<StudioWork> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async updateWork(): Promise<StudioWork | undefined> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async publishWork(): Promise<StudioWork | undefined> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async unpublishWork(): Promise<StudioWork | undefined> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async archiveWork(): Promise<StudioWork | undefined> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async restoreWork(): Promise<StudioWork | undefined> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async deleteWorkForever(): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }
}

export class SupabaseReadingData implements ReadingDataRepository {
  async listBookmarks(): ReturnType<ReadingDataRepository['listBookmarks']> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async toggleBookmark(): ReturnType<ReadingDataRepository['toggleBookmark']> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async removeBookmark(): ReturnType<ReadingDataRepository['removeBookmark']> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async listHistory(): ReturnType<ReadingDataRepository['listHistory']> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async recordVisit(): ReturnType<ReadingDataRepository['recordVisit']> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async removeHistoryEntry(): ReturnType<
    ReadingDataRepository['removeHistoryEntry']
  > {
    throw new Error(NOT_IMPLEMENTED);
  }
  async clearHistory(): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async getContinueReading(): ReturnType<
    ReadingDataRepository['getContinueReading']
  > {
    throw new Error(NOT_IMPLEMENTED);
  }
  async saveContinueReading(): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async clearContinueReading(): Promise<void> {
    throw new Error(NOT_IMPLEMENTED);
  }
}
