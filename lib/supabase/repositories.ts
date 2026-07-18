/* ---------------------------------------------------------------------------
 * KATHA · Supabase — repository implementations (PLACEHOLDERS)
 * lib/supabase/repositories.ts
 *
 * Sprint 8 Step 4: compile-time proof that the app's repository interfaces
 * and the generated database types fit together — every class implements its
 * existing interface, and the row mappers below translate generated Rows
 * into the exact domain shapes the interfaces return. NOTHING imports this
 * module yet; the app runs entirely on the local implementations.
 *
 * Methods deliberately throw: wiring them up is the work of the coming
 * migration steps (read-only library, publishing, reading-data sync), each
 * behind its own review. The mappers are real, though — they are the
 * translation layer those steps will use, and the compiler holds them to
 * both sides of the contract.
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

/** A published work + its ordered chapters → the reader's KathaBook, through
 *  the same buildChapters() derivation the local catalogue uses. */
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
    updated: 'This week',
    publishedAt: work.published_at ?? work.updated_at,
    cover: work.cover_url,
    synopsis: work.synopsis,
    chapters: buildChapters(
      [...chapters]
        .sort((a, b) => a.position - b.position)
        .map((chapter) => ({
          slug: chapterSlugFromRow(chapter),
          title: chapter.title,
          content: chapter.manuscript.split(/\n\s*\n/).filter(Boolean),
        })),
    ),
  };
}

/** Chapter slugs derive from titles at publish time (chapterSlugsFor); until
 *  the publishing step persists them, rows fall back to the id. */
function chapterSlugFromRow(chapter: ChapterRow): string {
  return chapter.id;
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

export class SupabaseCatalogue implements CatalogueRepository {
  async listBooks(): Promise<KathaBook[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async getBook(): Promise<KathaBook | null> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async listFeatured(): Promise<KathaBook[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async listByCategory(): Promise<KathaBook[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async listRelated(): Promise<KathaBook[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
  async searchIndex(): Promise<BookSearchRecord[]> {
    throw new Error(NOT_IMPLEMENTED);
  }
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
