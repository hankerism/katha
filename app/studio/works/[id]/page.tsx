'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useWork } from '@/components/studio/use-works';
import { workRepository } from '@/lib/studio/work-repository';
import {
  manuscriptWordCount,
  newChapterId,
  slugifyTitle,
  workStats,
  type StudioChapter,
  type WorkBookMeta,
} from '@/lib/studio/work';
import { relativeTimeLabel } from '@/lib/relative-time';
import { ArrowRightIcon, ClockIcon } from '@/components/ui/icons';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — work workspace
 * app/studio/works/[id]/page.tsx
 *
 * One work, laid out the way a writer thinks about it: the chapters first
 * (this is a place for writing, so the manuscript leads), the book's details
 * second, and the quiet shelf decisions (archive / restore) at the bottom.
 * Publishing arrives with the preview in Phase 4.
 *
 * Metadata edits autosave (debounced) with a 'Draft saved' whisper — there is
 * no Save button in a calm room. The address (slug) follows the title until
 * the writer takes it over by editing it directly.
 * ------------------------------------------------------------------------- */

const AUTOSAVE_DELAY_MS = 800;

const inputClass =
  'w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-base text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const labelClass =
  'block font-body text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground';

type SaveState = 'idle' | 'saving' | 'saved';

export default function WorkWorkspacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { work, loaded, update, setWork } = useWork(params.id);

  // Editable metadata mirror; the repository stays the source of truth.
  const [meta, setMeta] = useState<WorkBookMeta | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (work && !meta) setMeta(work.book);
  }, [work, meta]);

  // Debounced autosave of metadata edits.
  useEffect(() => {
    if (!work || !meta) return;
    if (JSON.stringify(meta) === JSON.stringify(work.book)) return;
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void update({ book: meta }).then(() => {
        setSaveState('saved');
        setSavedAt(new Date().toISOString());
      });
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [meta, work, update]);

  function patchMeta(patch: Partial<WorkBookMeta>) {
    setMeta((current) => (current ? { ...current, ...patch } : current));
  }

  function handleTitleChange(title: string) {
    patchMeta(
      slugTouched ? { title } : { title, slug: slugifyTitle(title) },
    );
  }

  async function saveChapters(chapters: StudioChapter[]) {
    const next = await update({ chapters });
    if (next) setWork(next);
  }

  async function addChapter() {
    if (!work) return;
    const chapter: StudioChapter = {
      id: newChapterId(),
      title: 'Untitled chapter',
      manuscript: '',
    };
    await saveChapters([...work.chapters, chapter]);
    router.push(`/studio/works/${work.id}/chapters/${chapter.id}`);
  }

  async function moveChapter(index: number, delta: -1 | 1) {
    if (!work) return;
    const target = index + delta;
    if (target < 0 || target >= work.chapters.length) return;
    const chapters = [...work.chapters];
    [chapters[index], chapters[target]] = [chapters[target], chapters[index]];
    await saveChapters(chapters);
  }

  async function removeChapter(id: string) {
    if (!work) return;
    await saveChapters(work.chapters.filter((chapter) => chapter.id !== id));
    setConfirmingRemove(null);
  }

  async function archive() {
    if (!work) return;
    await workRepository.archiveWork(work.id);
    router.push('/studio');
  }

  async function restore() {
    if (!work) return;
    const next = await workRepository.restoreWork(work.id);
    if (next) setWork(next);
  }

  async function deleteForever() {
    if (!work) return;
    await workRepository.deleteWorkForever(work.id);
    router.push('/studio');
  }

  if (!loaded) return null;

  if (!work || !meta) {
    return (
      <div className="container-katha py-24 text-center">
        <p className="font-reader text-2xl text-reader-foreground">
          This work isn&rsquo;t on your desk.
        </p>
        <Link
          href="/studio"
          className="mt-6 inline-block font-body text-sm font-medium text-primary hover:text-primary/80"
        >
          Back to the Studio →
        </Link>
      </div>
    );
  }

  const stats = workStats(work);
  const isArchived = work.lifecycle === 'archived';

  return (
    <div className="container-katha max-w-4xl py-12 md:py-16">
      {/* Way back + saved whisper */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/studio"
          className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          ← The desk
        </Link>
        <p aria-live="polite" className="font-body text-xs text-muted-foreground">
          {saveState === 'saving' && 'Saving…'}
          {saveState === 'saved' &&
            savedAt &&
            relativeTimeLabel(savedAt, 'Draft saved')}
        </p>
      </div>

      {/* Header */}
      <header className="mt-8">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
          {meta.category || 'Uncategorized'}
        </p>
        <h1 className="mt-2 font-heading text-3xl leading-tight text-foreground sm:text-4xl">
          {meta.title.trim() || 'Untitled work'}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-muted-foreground">
          {work.lifecycle === 'published' && (
            <span className="badge badge-forest">In the Library</span>
          )}
          {isArchived && <span className="badge">Archived</span>}
          <span>
            {stats.chapterCount}{' '}
            {stats.chapterCount === 1 ? 'chapter' : 'chapters'}
          </span>
          <span>{stats.wordCount.toLocaleString()} words</span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-3.5" />
            about {stats.readingMinutes} min
          </span>
        </p>
      </header>

      {/* Chapters — the manuscript leads */}
      <section aria-labelledby="chapters-heading" className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 id="chapters-heading" className="font-heading text-2xl text-foreground">
            Chapters
          </h2>
          <button
            type="button"
            onClick={() => void addChapter()}
            className="font-body text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            + New chapter
          </button>
        </div>

        {work.chapters.length > 0 ? (
          <ol className="mt-5 space-y-3">
            {work.chapters.map((chapter, index) => {
              const words = manuscriptWordCount(chapter.manuscript);
              return (
                <li
                  key={chapter.id}
                  className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-border-strong hover:shadow-md"
                >
                  <Link
                    href={`/studio/works/${work.id}/chapters/${chapter.id}`}
                    className="flex min-w-0 flex-1 items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                  >
                    <span className="min-w-0">
                      <span className="block font-body text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Chapter {index + 1}
                      </span>
                      <span className="mt-1 block truncate font-heading text-lg text-foreground">
                        {chapter.title.trim() || 'Untitled chapter'}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 font-body text-[0.78rem] text-muted-foreground">
                      {words === 0 ? 'A blank page' : `${words.toLocaleString()} words`}
                      <ArrowRightIcon className="size-[15px] text-muted-foreground transition-[color,transform] duration-200 group-hover:text-primary motion-safe:group-hover:translate-x-0.5" />
                    </span>
                  </Link>

                  {/* Quiet ordering + removal, revealed with the row */}
                  <span className="flex shrink-0 items-center gap-1 border-l border-border/60 pl-3">
                    <button
                      type="button"
                      onClick={() => void moveChapter(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move chapter ${index + 1} earlier`}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => void moveChapter(index, 1)}
                      disabled={index === work.chapters.length - 1}
                      aria-label={`Move chapter ${index + 1} later`}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      ↓
                    </button>
                    {confirmingRemove === chapter.id ? (
                      <span className="flex items-center gap-2 pl-1 font-body text-xs">
                        <button
                          type="button"
                          onClick={() => void removeChapter(chapter.id)}
                          className="font-semibold text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingRemove(null)}
                          className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                          Keep
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingRemove(chapter.id)}
                        aria-label={`Remove chapter: ${chapter.title || 'Untitled chapter'}`}
                        className="grid size-7 place-items-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        ×
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-5 font-body text-sm leading-relaxed text-muted-foreground">
            No chapters yet — the first page is waiting.
          </p>
        )}
      </section>

      {/* About this work */}
      <section aria-labelledby="about-work-heading" className="mt-14 border-t border-border pt-10">
        <h2 id="about-work-heading" className="font-heading text-2xl text-foreground">
          About this work
        </h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          What readers will meet the story through. Changes save themselves.
        </p>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="meta-title" className={labelClass}>
              Title
            </label>
            <input
              id="meta-title"
              type="text"
              value={meta.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className={`${inputClass} mt-2 font-heading text-lg`}
            />
          </div>

          <div>
            <label htmlFor="meta-category" className={labelClass}>
              Shelf
            </label>
            <input
              id="meta-category"
              type="text"
              value={meta.category}
              onChange={(event) => patchMeta({ category: event.target.value })}
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label htmlFor="meta-status" className={labelClass}>
              Story status
            </label>
            <select
              id="meta-status"
              value={meta.status}
              onChange={(event) => patchMeta({ status: event.target.value })}
              className={`${inputClass} mt-2`}
            >
              <option value="Ongoing">Ongoing — chapters still arriving</option>
              <option value="Completed">Completed — the story is whole</option>
            </select>
          </div>

          <div>
            <label htmlFor="meta-language" className={labelClass}>
              Language
            </label>
            <input
              id="meta-language"
              type="text"
              value={meta.language}
              onChange={(event) => patchMeta({ language: event.target.value })}
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label htmlFor="meta-slug" className={labelClass}>
              Address{' '}
              <span className="normal-case tracking-normal text-muted-foreground/70">
                — /library/{meta.slug || '…'}
              </span>
            </label>
            <input
              id="meta-slug"
              type="text"
              value={meta.slug}
              onChange={(event) => {
                setSlugTouched(true);
                patchMeta({ slug: slugifyTitle(event.target.value) });
              }}
              className={`${inputClass} mt-2 font-mono text-sm`}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="meta-synopsis" className={labelClass}>
              Synopsis
            </label>
            <textarea
              id="meta-synopsis"
              value={meta.synopsis}
              onChange={(event) => patchMeta({ synopsis: event.target.value })}
              rows={4}
              placeholder="A few lines readers will meet the story through."
              className={`${inputClass} mt-2 resize-y leading-relaxed`}
            />
          </div>
        </div>
      </section>

      {/* The shelf — quiet lifecycle decisions */}
      <section aria-labelledby="shelf-heading" className="mt-14 border-t border-border pt-10">
        <h2
          id="shelf-heading"
          className="font-body text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
        >
          The shelf
        </h2>
        {isArchived ? (
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <p className="font-body text-sm text-muted-foreground">
              This work is set aside in the archive.
            </p>
            <button
              type="button"
              onClick={() => void restore()}
              className="font-body text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Return it to the desk
            </button>
            <button
              type="button"
              onClick={() => void deleteForever()}
              className="font-body text-sm font-medium text-destructive/80 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Remove forever
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <p className="font-body text-sm text-muted-foreground">
              Not every story needs to stay on the desk.
            </p>
            <button
              type="button"
              onClick={() => void archive()}
              className="font-body text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Archive this work
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
