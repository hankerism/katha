/* ---------------------------------------------------------------------------
 * KATHA · Supabase — repository implementations
 * lib/supabase/repositories.ts
 *
 * The cloud implementations behind the app's repository interfaces, arriving
 * one migration step at a time:
 *
 *   SupabaseCatalogue       LIVE (Sprint 13) — published works + chapters,
 *                           selected by NEXT_PUBLIC_CATALOGUE_PROVIDER.
 *   SupabaseWorkRepository  LIVE (Sprint 14) — the Studio's drafts and
 *                           publishing, selected by NEXT_PUBLIC_WORKS_PROVIDER.
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
import { chapterSlugsFor, type StudioChapter, type StudioWork } from '../studio/work';

type WorkRow = Database['public']['Tables']['works']['Row'];
type ChapterRow = Database['public']['Tables']['chapters']['Row'];
type SupabaseClientT =
  import('@supabase/supabase-js').SupabaseClient<Database>;

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

/** The cloud work repository — the Studio's drafts and publishing, written
 *  straight into the database that IS the catalogue (Sprint 13): publishing
 *  makes a book publicly visible the moment the lifecycle flips.
 *
 *  Uses the AUTHENTICATED browser client (cookie session) so RLS governs
 *  every write; an injectable client keeps the class harness-testable.
 *  Unlike the catalogue (which degrades to empty shelves), writing THROWS on
 *  failure — an editor must report, never swallow, a failed save.
 *
 *  Conflict model this sprint: last-write-wins, matching the single-device
 *  semantics the app has always had; optimistic concurrency arrives with
 *  multi-device draft sync. */
export class SupabaseWorkRepository implements WorkRepository {
  private client: SupabaseClientT | null;

  constructor(client?: SupabaseClientT) {
    this.client = client ?? null;
  }

  private async getClient(): Promise<SupabaseClientT> {
    if (this.client) return this.client;
    const { getSupabaseBrowserClient } = await import('./client');
    this.client = getSupabaseBrowserClient();
    return this.client;
  }

  private async fetchWork(id: string): Promise<StudioWork | undefined> {
    const client = await this.getClient();
    const { data, error } = await client
      .from('works')
      .select('*, chapters!chapters_work_id_fkey(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? rowsToStudioWork(data, data.chapters ?? []) : undefined;
  }

  async listWorks(authorId: string): Promise<StudioWork[]> {
    // First authenticated look at the desk in cloud mode also brings any
    // pre-cloud local drafts along (conditional, verified — see the helper).
    await importLocalWorksOnce(this, authorId);
    const client = await this.getClient();
    const { data, error } = await client
      .from('works')
      .select('*, chapters!chapters_work_id_fkey(*)')
      .eq('author_id', authorId)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => rowsToStudioWork(row, row.chapters ?? []));
  }

  async getWork(id: string): Promise<StudioWork | undefined> {
    return this.fetchWork(id);
  }

  async saveNewWork(work: StudioWork): Promise<StudioWork> {
    const client = await this.getClient();
    const { error } = await client.from('works').insert({
      id: work.id,
      author_id: work.authorId,
      lifecycle: work.lifecycle,
      slug: work.book.slug,
      title: work.book.title,
      category: work.book.category,
      language: work.book.language,
      status: work.book.status,
      synopsis: work.book.synopsis,
      cover_url: work.book.cover,
      created_at: work.createdAt,
      updated_at: work.updatedAt,
    });
    if (error) throw new Error(error.message);
    if (work.chapters.length > 0) {
      const { error: chapterError } = await client.from('chapters').insert(
        work.chapters.map((chapter, index) => ({
          id: chapter.id,
          work_id: work.id,
          position: index + 1,
          title: chapter.title,
          manuscript: chapter.manuscript,
        })),
      );
      if (chapterError) throw new Error(chapterError.message);
    }
    return (await this.fetchWork(work.id)) ?? work;
  }

  async updateWork(
    id: string,
    patch: Partial<Omit<StudioWork, 'id' | 'authorId' | 'createdAt'>>,
  ): Promise<StudioWork | undefined> {
    const client = await this.getClient();
    const now = new Date().toISOString();

    const workPatch: Database['public']['Tables']['works']['Update'] = {
      updated_at: now,
    };
    if (patch.book) {
      workPatch.slug = patch.book.slug;
      workPatch.title = patch.book.title;
      workPatch.category = patch.book.category;
      workPatch.language = patch.book.language;
      workPatch.status = patch.book.status;
      workPatch.synopsis = patch.book.synopsis;
      workPatch.cover_url = patch.book.cover;
    }
    const { error } = await client.from('works').update(workPatch).eq('id', id);
    if (error) throw new Error(error.message);

    if (patch.chapters) {
      // Chapter sync is UPSERT-only, never delete-and-reinsert: reading
      // data cascades on chapter_id, so recreating rows would silently
      // erase readers' bookmarks/history for those chapters.
      //
      // Two-phase positions: reorders swap position values, and the
      // per-work unique fires through PostgREST despite being deferrable —
      // so park every row far out of range first, then set finals.
      const park = await client.from('chapters').upsert(
        patch.chapters.map((chapter, index) => ({
          id: chapter.id,
          work_id: id,
          position: index + 1 + 100_000,
          title: chapter.title,
          manuscript: chapter.manuscript,
        })),
      );
      if (park.error) throw new Error(park.error.message);

      // Delete removed chapters BETWEEN park and final: a removed chapter
      // still holds its old position, and the deferred unique check at
      // commit would reject a survivor claiming it (found the hard way —
      // the harness's remove-then-renumber case).
      const keep = patch.chapters.map((chapter) => chapter.id);
      let removal = client.from('chapters').delete().eq('work_id', id);
      if (keep.length > 0) {
        removal = removal.not('id', 'in', `(${keep.join(',')})`);
      }
      const { error: deleteError } = await removal;
      if (deleteError) throw new Error(deleteError.message);

      const { error: upsertError } = await client.from('chapters').upsert(
        patch.chapters.map((chapter, index) => ({
          id: chapter.id,
          work_id: id,
          position: index + 1,
          title: chapter.title,
          manuscript: chapter.manuscript,
        })),
      );
      if (upsertError) throw new Error(upsertError.message);
    }

    return this.fetchWork(id);
  }

  async publishWork(id: string): Promise<StudioWork | undefined> {
    const client = await this.getClient();
    const work = await this.fetchWork(id);
    if (!work) return undefined;

    // Publish-time slug persistence: chapter addresses freeze NOW — they
    // become public URLs and reading-data keys the moment readers arrive.
    // Cleared first so a re-publish that moves a slug between chapters can
    // never transiently collide with the per-work uniqueness.
    const { error: clearError } = await client
      .from('chapters')
      .update({ slug: null })
      .eq('work_id', id);
    if (clearError) throw new Error(clearError.message);

    const slugs = chapterSlugsFor(work.chapters);
    for (let i = 0; i < work.chapters.length; i++) {
      const { error } = await client
        .from('chapters')
        .update({ slug: slugs[i] })
        .eq('id', work.chapters[i].id);
      if (error) throw new Error(error.message);
    }

    const now = new Date().toISOString();
    const { error } = await client
      .from('works')
      .update({ lifecycle: 'published', published_at: now, updated_at: now })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return this.fetchWork(id);
  }

  async unpublishWork(id: string): Promise<StudioWork | undefined> {
    const client = await this.getClient();
    // Chapter slugs are deliberately KEPT: re-publishing restores the same
    // public addresses, so old links and reading data stay whole.
    const { error } = await client
      .from('works')
      .update({
        lifecycle: 'draft',
        published_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return this.fetchWork(id);
  }

  async archiveWork(id: string): Promise<StudioWork | undefined> {
    const client = await this.getClient();
    const now = new Date().toISOString();
    const { error } = await client
      .from('works')
      .update({ lifecycle: 'archived', archived_at: now, updated_at: now })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return this.fetchWork(id);
  }

  async restoreWork(id: string): Promise<StudioWork | undefined> {
    const client = await this.getClient();
    const { error } = await client
      .from('works')
      .update({
        lifecycle: 'draft',
        archived_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return this.fetchWork(id);
  }

  async deleteWorkForever(id: string): Promise<void> {
    const client = await this.getClient();
    const { error } = await client.from('works').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

/* ── One-time local-works import (Sprint 14, conditional by refinement) ──── */

const WORKS_IMPORTED_FLAG = 'katha:studio:works-imported';

/** Seed-reserved ids never travel: the house fixture and the generated
 *  catalogue seeds belong to their modes, not to a writer's cloud desk. */
function isSeedWorkId(id: string): boolean {
  return id === 'work_table-for-two' || id.startsWith('work_seed_');
}

/** Bring a device's pre-cloud drafts to the writer's cloud desk, ONCE, and
 *  only when there is something to bring:
 *    detect → import (author re-keyed to the cloud identity) → VERIFY the
 *    rows exist → only then persist the imported flag.
 *  Local copies stay on the device as a safety net; a failed or partial
 *  import leaves the flag unset so the next visit retries. */
export async function importLocalWorksOnce(
  repository: SupabaseWorkRepository,
  authorId: string,
): Promise<number> {
  if (typeof window === 'undefined') return 0;
  try {
    if (window.localStorage.getItem(WORKS_IMPORTED_FLAG)) return 0;

    const { listAllLocalWorks } = await import('../studio/work-repository');
    const locals = listAllLocalWorks().filter(
      (work) => !isSeedWorkId(work.id),
    );
    if (locals.length === 0) return 0; // nothing to import; no flag — a
    // future local draft (e.g. after a mode flip) still gets its chance.

    for (const work of locals) {
      await repository.saveNewWork({ ...work, authorId });
    }

    // Verify before flagging: every imported id must now resolve.
    for (const work of locals) {
      const stored = await repository.getWork(work.id);
      if (!stored) {
        throw new Error(`import verification failed for ${work.id}`);
      }
    }

    window.localStorage.setItem(
      WORKS_IMPORTED_FLAG,
      new Date().toISOString(),
    );
    return locals.length;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'KATHA works import: could not bring local drafts to the cloud desk ' +
          'yet — they remain on this device; will retry next visit.',
        error,
      );
    }
    return 0;
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
