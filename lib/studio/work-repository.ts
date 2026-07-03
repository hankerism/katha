/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — work repository
 * lib/studio/work-repository.ts
 *
 * Persistence for Works behind an ASYNC interface, even though today's
 * implementation is synchronous localStorage — so when this becomes Supabase,
 * the swap is one exported instance and zero call sites.
 *
 * LocalWorkRepository follows the house persistence pattern (bookmarks,
 * history, recent searches): one storage key, SSR-safe no-ops, validated
 * clean-on-read with a single write-back, plain serializable records.
 *
 * The honest publish seam: with no backend, publishing flips lifecycle and
 * stamps publishedAt — the work is real, previewable, and shelved "In the
 * Library" in the Studio, but the public reader (server-rendered from the
 * shared catalogue) cannot see this browser's storage. When Supabase lands,
 * published works flow into the catalogue helpers and distribution becomes
 * real without touching this interface.
 * ------------------------------------------------------------------------- */

import type { StudioWork, WorkLifecycle } from './work';

export const WORKS_STORAGE_KEY = 'katha:studio:works';

/* ── Interface (what Supabase will implement) ────────────────────────────── */

export interface WorkRepository {
  /** All of an author's works, most recently updated first. */
  listWorks(authorId: string): Promise<StudioWork[]>;
  getWork(id: string): Promise<StudioWork | undefined>;
  /** Persist a freshly created work (see createWork in the domain). */
  saveNewWork(work: StudioWork): Promise<StudioWork>;
  /** Shallow-merge a patch; stamps updatedAt. Returns the updated work. */
  updateWork(
    id: string,
    patch: Partial<Omit<StudioWork, 'id' | 'authorId' | 'createdAt'>>,
  ): Promise<StudioWork | undefined>;
  publishWork(id: string): Promise<StudioWork | undefined>;
  /** Back to drafts (the work leaves the library shelf). */
  unpublishWork(id: string): Promise<StudioWork | undefined>;
  archiveWork(id: string): Promise<StudioWork | undefined>;
  restoreWork(id: string): Promise<StudioWork | undefined>;
  /** Permanent removal — the only true delete, offered from the archive. */
  deleteWorkForever(id: string): Promise<void>;
}

/* ── Validation ──────────────────────────────────────────────────────────── */

const LIFECYCLES: WorkLifecycle[] = ['draft', 'published', 'archived'];

function isStudioWork(value: unknown): value is StudioWork {
  if (!value || typeof value !== 'object') return false;
  const w = value as Record<string, unknown>;
  const book = w.book as Record<string, unknown> | undefined;
  return (
    typeof w.id === 'string' &&
    typeof w.authorId === 'string' &&
    LIFECYCLES.includes(w.lifecycle as WorkLifecycle) &&
    typeof w.createdAt === 'string' &&
    typeof w.updatedAt === 'string' &&
    !!book &&
    typeof book.slug === 'string' &&
    typeof book.title === 'string' &&
    typeof book.category === 'string' &&
    typeof book.language === 'string' &&
    typeof book.status === 'string' &&
    typeof book.synopsis === 'string' &&
    (book.cover === undefined ||
      book.cover === null ||
      typeof book.cover === 'string') &&
    Array.isArray(w.chapters) &&
    (w.chapters as unknown[]).every((chapter) => {
      if (!chapter || typeof chapter !== 'object') return false;
      const c = chapter as Record<string, unknown>;
      return (
        typeof c.id === 'string' &&
        typeof c.title === 'string' &&
        typeof c.manuscript === 'string'
      );
    })
  );
}

/* ── Local implementation ────────────────────────────────────────────────── */

function readAll(): StudioWork[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(WORKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    let changed = false;
    const works: StudioWork[] = [];
    for (const item of parsed) {
      if (!isStudioWork(item) || seen.has(item.id)) {
        changed = true; // dropped unrecognizable entry or duplicate id
        continue;
      }
      seen.add(item.id);
      // Works saved before covers existed gain the field on read.
      if (item.book.cover === undefined) {
        works.push({ ...item, book: { ...item.book, cover: null } });
        changed = true;
      } else {
        works.push(item);
      }
    }
    if (changed) writeAll(works); // persist the cleanup once
    return works;
  } catch {
    return [];
  }
}

function writeAll(works: StudioWork[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WORKS_STORAGE_KEY, JSON.stringify(works));
  } catch {
    // Storage unavailable (private mode, disabled, quota) — best-effort.
  }
}

function mutate(
  id: string,
  transform: (work: StudioWork) => StudioWork,
): StudioWork | undefined {
  const works = readAll();
  const index = works.findIndex((work) => work.id === id);
  if (index === -1) return undefined;
  const next = transform(works[index]);
  works[index] = next;
  writeAll(works);
  return next;
}

class LocalWorkRepository implements WorkRepository {
  async listWorks(authorId: string): Promise<StudioWork[]> {
    return readAll()
      .filter((work) => work.authorId === authorId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getWork(id: string): Promise<StudioWork | undefined> {
    return readAll().find((work) => work.id === id);
  }

  async saveNewWork(work: StudioWork): Promise<StudioWork> {
    const works = readAll();
    writeAll([work, ...works.filter((other) => other.id !== work.id)]);
    return work;
  }

  async updateWork(
    id: string,
    patch: Partial<Omit<StudioWork, 'id' | 'authorId' | 'createdAt'>>,
  ): Promise<StudioWork | undefined> {
    return mutate(id, (work) => ({
      ...work,
      ...patch,
      book: patch.book ?? work.book,
      chapters: patch.chapters ?? work.chapters,
      updatedAt: new Date().toISOString(),
    }));
  }

  async publishWork(id: string): Promise<StudioWork | undefined> {
    const now = new Date().toISOString();
    return mutate(id, (work) => ({
      ...work,
      lifecycle: 'published',
      publishedAt: now,
      updatedAt: now,
    }));
  }

  async unpublishWork(id: string): Promise<StudioWork | undefined> {
    return mutate(id, (work) => ({
      ...work,
      lifecycle: 'draft',
      publishedAt: undefined,
      updatedAt: new Date().toISOString(),
    }));
  }

  async archiveWork(id: string): Promise<StudioWork | undefined> {
    const now = new Date().toISOString();
    return mutate(id, (work) => ({
      ...work,
      lifecycle: 'archived',
      archivedAt: now,
      updatedAt: now,
    }));
  }

  async restoreWork(id: string): Promise<StudioWork | undefined> {
    return mutate(id, (work) => ({
      ...work,
      lifecycle: 'draft',
      archivedAt: undefined,
      updatedAt: new Date().toISOString(),
    }));
  }

  async deleteWorkForever(id: string): Promise<void> {
    writeAll(readAll().filter((work) => work.id !== id));
  }
}

/** The seam: swap this instance for SupabaseWorkRepository and every hook,
 *  page, and component is already correct. */
export const workRepository: WorkRepository = new LocalWorkRepository();
