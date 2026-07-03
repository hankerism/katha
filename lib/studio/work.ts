/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — Work domain
 * lib/studio/work.ts
 *
 * The writing product's data model and its pure logic. A Work is a manuscript
 * project: lifecycle metadata around an authorable book whose shape is
 * EXACTLY what the catalogue ingests — publishing a work runs the same
 * buildChapters() transform as lib/books.ts, so nothing about numbering,
 * reading time, or paragraph structure is ever derived twice.
 *
 * Chapters store raw MANUSCRIPT text (what the writer types); paragraphs are
 * blank-line-separated, and parseManuscript/serializeManuscript are the ONE
 * place that convention lives. Everything here is plain serializable data +
 * pure functions — no storage, no React — ready to become Supabase rows and
 * testable in isolation.
 * ------------------------------------------------------------------------- */

import {
  buildChapters,
  getBookBySlug,
  type KathaBook,
} from '../books';
import { foldText } from '../text';

/* ── Model ───────────────────────────────────────────────────────────────── */

export type WorkLifecycle = 'draft' | 'published' | 'archived';

export interface StudioChapter {
  /** Stable opaque id — editor routes and reordering key on this, never on
   *  the slug (which derives from the title and may change until publish). */
  id: string;
  title: string;
  /** Raw manuscript text; paragraphs separated by blank lines. */
  manuscript: string;
}

/** The authorable book metadata — field-for-field the shape the catalogue's
 *  authored entries use, so a published work needs no translation layer. */
export interface WorkBookMeta {
  slug: string;
  title: string;
  category: string;
  language: string;
  /** Serial status shown to readers ('Ongoing' / 'Completed'). */
  status: string;
  synopsis: string;
}

export interface StudioWork {
  id: string;
  /** FK into the Author domain (lib/authors.ts). */
  authorId: string;
  lifecycle: WorkLifecycle;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
  book: WorkBookMeta;
  chapters: StudioChapter[];
}

/* ── Ids & slugs ─────────────────────────────────────────────────────────── */

function randomId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

export function newWorkId(): string {
  return randomId('work');
}

export function newChapterId(): string {
  return randomId('ch');
}

/** URL-safe slug from any title ("Ang Unang Ulan" → "ang-unang-ulan"). */
export function slugifyTitle(title: string): string {
  return foldText(title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ── Manuscript ⇄ paragraphs ─────────────────────────────────────────────── */

/** The writing convention, in one place: paragraphs are separated by one or
 *  more blank lines; single newlines inside a paragraph are soft-wrapped into
 *  spaces; empty paragraphs are dropped. */
export function parseManuscript(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/** The inverse — content paragraphs back to editable manuscript text. */
export function serializeManuscript(paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

export function manuscriptWordCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length === 0 || words[0] === '' ? 0 : words.length;
}

/* ── Creation ────────────────────────────────────────────────────────────── */

export interface NewWorkInput {
  authorId: string;
  title: string;
  category: string;
  language?: string;
  status?: string;
  synopsis?: string;
  /** Injectable clock for deterministic tests; defaults to now. */
  now?: string;
}

/** A fresh draft with one untitled chapter waiting — every work opens onto a
 *  page, never onto emptiness. */
export function createWork(input: NewWorkInput): StudioWork {
  const now = input.now ?? new Date().toISOString();
  const title = input.title.trim();
  return {
    id: newWorkId(),
    authorId: input.authorId,
    lifecycle: 'draft',
    createdAt: now,
    updatedAt: now,
    book: {
      slug: slugifyTitle(title),
      title,
      category: input.category.trim(),
      language: input.language?.trim() || 'Filipino / English',
      status: input.status?.trim() || 'Ongoing',
      synopsis: input.synopsis?.trim() ?? '',
    },
    chapters: [
      {
        id: newChapterId(),
        title: 'Chapter One',
        manuscript: '',
      },
    ],
  };
}

/* ── Publishing ──────────────────────────────────────────────────────────── */

/** Unique chapter slugs within the work, derived from titles ("Chapter One"
 *  twice → chapter-one, chapter-one-2). */
export function chapterSlugsFor(chapters: StudioChapter[]): string[] {
  const seen = new Map<string, number>();
  return chapters.map((chapter, index) => {
    const base = slugifyTitle(chapter.title) || `chapter-${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}

/** The work as readers would receive it — the same authored shape and the
 *  same buildChapters() derivation the catalogue uses. Pure: safe for live
 *  preview on every keystroke. */
export function workToBook(work: StudioWork): KathaBook {
  const slugs = chapterSlugsFor(work.chapters);
  return {
    slug: work.book.slug,
    title: work.book.title,
    authorId: work.authorId,
    category: work.book.category,
    language: work.book.language,
    status: work.book.status,
    updated: 'This week',
    publishedAt: work.publishedAt ?? work.updatedAt,
    cover: null,
    synopsis: work.book.synopsis,
    chapters: buildChapters(
      work.chapters.map((chapter, index) => ({
        slug: slugs[index],
        title: chapter.title.trim() || `Chapter ${index + 1}`,
        content: parseManuscript(chapter.manuscript),
      })),
    ),
  };
}

export interface PublishIssue {
  /** Machine key for tests; the message is what writers read. */
  key: string;
  message: string;
}

/** Everything standing between a draft and the library, as gentle, editorial
 *  guidance. `siblings` = the author's other works (for slug collisions). */
export function validateForPublish(
  work: StudioWork,
  siblings: StudioWork[] = [],
): PublishIssue[] {
  const issues: PublishIssue[] = [];

  if (!work.book.title.trim()) {
    issues.push({ key: 'title', message: 'Every story needs a title.' });
  }
  if (!work.book.synopsis.trim()) {
    issues.push({
      key: 'synopsis',
      message: 'A few lines of synopsis help readers find their way in.',
    });
  }
  if (!work.book.category.trim()) {
    issues.push({
      key: 'category',
      message: 'Choose a shelf — readers browse by category.',
    });
  }
  if (work.chapters.length === 0) {
    issues.push({
      key: 'chapters',
      message: 'A book needs at least one chapter.',
    });
  }
  const emptyChapters = work.chapters.filter(
    (chapter) => parseManuscript(chapter.manuscript).length === 0,
  );
  if (work.chapters.length > 0 && emptyChapters.length > 0) {
    issues.push({
      key: 'empty-chapters',
      message:
        emptyChapters.length === 1
          ? `“${emptyChapters[0].title || 'Untitled chapter'}” is still a blank page.`
          : `${emptyChapters.length} chapters are still blank pages.`,
    });
  }

  const slug = work.book.slug;
  if (!slug) {
    issues.push({ key: 'slug', message: 'The title needs a web address.' });
  } else {
    const catalogueCollision = getBookBySlug(slug) !== undefined;
    const siblingCollision = siblings.some(
      (other) => other.id !== work.id && other.book.slug === slug,
    );
    if (catalogueCollision || siblingCollision) {
      issues.push({
        key: 'slug-taken',
        message: `The address “${slug}” already belongs to another book — adjust the title or address.`,
      });
    }
  }

  return issues;
}

/* ── Stats (for the workspace, derived, never stored) ────────────────────── */

export interface WorkStats {
  chapterCount: number;
  wordCount: number;
  /** Whole minutes, from the same estimator readers see. */
  readingMinutes: number;
}

export function workStats(work: StudioWork): WorkStats {
  const built = workToBook(work);
  return {
    chapterCount: work.chapters.length,
    wordCount: work.chapters.reduce(
      (sum, chapter) => sum + manuscriptWordCount(chapter.manuscript),
      0,
    ),
    readingMinutes: built.chapters.reduce(
      (sum, chapter) => sum + chapter.estimatedReadingTime,
      0,
    ),
  };
}
