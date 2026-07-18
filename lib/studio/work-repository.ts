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
import { getAuthProvider, getWorksProvider } from '../supabase/env';

export const WORKS_STORAGE_KEY = 'katha:studio:works';

/* ── The house manuscript ────────────────────────────────────────────────────
 * Hankerism's current draft lives on every desk this Studio opens on — the
 * platform's first author is mid-book, and the deployed demo should say so.
 * Seeded idempotently BY ID (present even alongside other works; re-planted
 * if removed — it is the house fixture). The Prologue's manuscript is the
 * author's own text, VERBATIM — it must never be rewritten, summarized, or
 * "improved" here; only she edits her words. */
const TABLE_FOR_TWO_SEED: StudioWork = {
  id: 'work_table-for-two',
  authorId: 'auth-abigail-marte',
  lifecycle: 'draft',
  createdAt: '2026-06-28T09:00:00.000Z',
  updatedAt: '2026-07-04T10:30:00.000Z',
  book: {
    slug: 'table-for-two',
    title: 'Table for Two',
    category: 'Contemporary Romance',
    language: 'Filipino / English',
    status: 'Ongoing',
    synopsis:
      'Two regulars. One café table that keeps ending up shared. A love story measured in refills, receipts, and the seat left open on purpose.',
    cover: null,
  },
  chapters: [
    {
      id: 'ch_ttf-prologue',
      title: 'Prologue',
      manuscript: `Some people fall in love all at once.

At least, that's how the stories usually tell it.

One glance across a crowded room.

One unforgettable conversation.

One perfect moment that changes everything.

Lianne never believed in that.

Maybe because she spent most of her waking hours talking to people she had never met. Eight hours every night, five nights a week, she answered emails, joined meetings, and solved problems for clients who only knew her through a webcam and a profile picture.

You'd be surprised how much of a person's life could exist behind a screen.

And how much of it couldn't.

Adrian believed in routines.

Not in a boring way.

Just... quietly.

He liked arriving ten minutes early. Drinking the same coffee. Taking the same route home. Replying when he said he would. There was comfort in knowing what tomorrow looked like.

He didn't think that made him predictable.

He thought it made life a little easier.

If someone had asked either of them that Tuesday afternoon what they wanted from a dating app, neither would've had an interesting answer.

"Conversation, maybe."

"Let's see."

Nothing dramatic.

Nothing worth writing a novel about.

Because that's the funny thing about ordinary days.

Most of them don't announce that they're about to change your life.

They just begin like any other Tuesday.

One person waking up at four in the afternoon.

Another packing up his laptop before six.

One person walking through familiar streets in Silang.

Another sitting in traffic somewhere in Alabang.

Two routines.

Two different clocks.

One message.

It wasn't love at first sight.

It wasn't destiny.

It wasn't even good timing.

It was simply two people who, without meaning to, started making room for each other inside lives that were already full.

Neither of them knew it yet.

But years later, if someone asked them where everything started...

Neither would remember the exact date.

They'd remember something much smaller.

A notification.

A question about carbonara.

And the strange feeling that talking to a complete stranger somehow felt... easy.

Maybe that's how some love stories begin.

Not with fireworks.

Just with someone who quietly becomes your favorite notification.`,
    },
  ],
};

const SEEDED_WORKS: StudioWork[] = [TABLE_FOR_TWO_SEED];

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
    const parsed: unknown = raw ? JSON.parse(raw) : [];
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
    // Plant the house manuscript(s) wherever absent — by id, so it stands
    // beside whatever else is on the desk. LOCAL (demo) mode only, per the
    // Sprint 11 product decision: a real account's desk starts empty; the
    // house fixture belongs to the deviceless demo, not to cloud users.
    if (getAuthProvider() === 'local') {
      for (const seed of SEEDED_WORKS) {
        if (!seen.has(seed.id)) {
          works.push(seed);
          changed = true;
        }
      }
    }

    if (changed) writeAll(works); // persist the cleanup + seeding once
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

/* ── Selection (Sprint 14) ───────────────────────────────────────────────── */

/** Resolve the ACTIVE implementation lazily: the Supabase repository loads
 *  via dynamic import at first use — local mode bundles none of it, and no
 *  static import cycle exists. */
let activeWorks: Promise<WorkRepository> | null = null;

function resolveWorks(): Promise<WorkRepository> {
  if (activeWorks) return activeWorks;
  activeWorks =
    getWorksProvider() === 'supabase'
      ? import('../supabase/repositories').then(
          ({ SupabaseWorkRepository }) => new SupabaseWorkRepository(),
        )
      : Promise.resolve(new LocalWorkRepository());
  return activeWorks;
}

/** The seam every hook, page, and component holds — which implementation
 *  answers is the EXPLICIT NEXT_PUBLIC_WORKS_PROVIDER's decision (cloud
 *  works require cloud auth; see getWorksProvider). */
export const workRepository: WorkRepository = {
  listWorks: async (authorId) => (await resolveWorks()).listWorks(authorId),
  getWork: async (id) => (await resolveWorks()).getWork(id),
  saveNewWork: async (work) => (await resolveWorks()).saveNewWork(work),
  updateWork: async (id, patch) => (await resolveWorks()).updateWork(id, patch),
  publishWork: async (id) => (await resolveWorks()).publishWork(id),
  unpublishWork: async (id) => (await resolveWorks()).unpublishWork(id),
  archiveWork: async (id) => (await resolveWorks()).archiveWork(id),
  restoreWork: async (id) => (await resolveWorks()).restoreWork(id),
  deleteWorkForever: async (id) => (await resolveWorks()).deleteWorkForever(id),
};

/* ── Local-only helpers (device-level concerns of THIS implementation) ───── */

/** Every work stored on this device, regardless of author. For device-scoped
 *  surfaces only — the /library "From this device's Studio" shelf, which is
 *  the device's shelf by its own label (Sprint 11 product decision: it stays
 *  populated across sign-out). Author-scoped surfaces (the Studio desk) keep
 *  using listWorks(authorId) behind the repository interface. */
export function listAllLocalWorks(): StudioWork[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/* ── Local-only migration helper (Sprint 9 · Authentication) ─────────────── */

/** When a real account creates its author profile, the works written on this
 *  device under the pre-auth identities follow the writer: re-key them to the
 *  new author id so the desk survives the first sign-in. Local storage only —
 *  cloud work sync is a later migration step. Returns how many works moved. */
export function adoptLocalWorks(
  fromAuthorIds: readonly string[],
  toAuthorId: string,
): number {
  if (typeof window === 'undefined' || !toAuthorId) return 0;
  const from = new Set(
    fromAuthorIds.filter((id) => id && id !== toAuthorId),
  );
  if (from.size === 0) return 0;

  const works = readAll();
  let adopted = 0;
  const next = works.map((work) => {
    if (!from.has(work.authorId)) return work;
    adopted += 1;
    return { ...work, authorId: toAuthorId };
  });
  if (adopted > 0) writeAll(next);
  return adopted;
}
