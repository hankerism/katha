'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWork } from '@/components/studio/use-works';
import {
  manuscriptWordCount,
  parseManuscript,
  workToBook,
} from '@/lib/studio/work';
import { getCurrentAuthor } from '@/lib/studio/current-author';
import { relativeTimeLabel } from '@/lib/relative-time';
import ReaderArticle from '@/components/reader/ReaderArticle';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — chapter editor
 * app/studio/works/[id]/chapters/[chapterId]/page.tsx
 *
 * The signature experience: writing happens INSIDE KATHA. The manuscript is a
 * borderless page in the reader's own typography and measure, and one quiet
 * toggle turns the same words into the real thing — the actual ReaderArticle
 * component, fed live through the same parseManuscript → buildChapters
 * derivation readers get. No mock preview, no duplicated rendering.
 *
 * Everything autosaves (debounced, flushed on unload); the only status is a
 * whisper: "Draft saved just now." Blank-line = new paragraph, exactly as the
 * published page will break it.
 * ------------------------------------------------------------------------- */

const AUTOSAVE_DELAY_MS = 800;

type Mode = 'write' | 'read';
type SaveState = 'idle' | 'saving' | 'saved';

export default function ChapterEditorPage() {
  const params = useParams<{ id: string; chapterId: string }>();
  const { work, loaded, update, setWork } = useWork(params.id);

  const [mode, setMode] = useState<Mode>('write');
  const [title, setTitle] = useState<string | null>(null);
  const [manuscript, setManuscript] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  const chapterIndex =
    work?.chapters.findIndex((chapter) => chapter.id === params.chapterId) ??
    -1;
  const chapter = chapterIndex >= 0 ? work?.chapters[chapterIndex] : undefined;

  // Adopt the stored chapter once, then local state leads and autosave follows.
  useEffect(() => {
    if (chapter && title === null && manuscript === null) {
      setTitle(chapter.title);
      setManuscript(chapter.manuscript);
    }
  }, [chapter, title, manuscript]);

  // Debounced autosave of title + manuscript into the work's chapter array.
  useEffect(() => {
    if (!work || !chapter || title === null || manuscript === null) return;
    if (title === chapter.title && manuscript === chapter.manuscript) return;

    dirtyRef.current = true;
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const chapters = work.chapters.map((existing) =>
        existing.id === chapter.id
          ? { ...existing, title, manuscript }
          : existing,
      );
      void update({ chapters }).then((next) => {
        if (next) setWork(next);
        dirtyRef.current = false;
        setSaveState('saved');
        setSavedAt(new Date().toISOString());
      });
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, manuscript, work, chapter, update, setWork]);

  // A guard for the keystrokes still inside the debounce window.
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (dirtyRef.current) event.preventDefault();
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // The live reader view: the CURRENT keystrokes through the real derivation.
  const previewChapter = useMemo(() => {
    if (!work || chapterIndex < 0 || title === null || manuscript === null) {
      return null;
    }
    const liveWork = {
      ...work,
      chapters: work.chapters.map((existing, index) =>
        index === chapterIndex ? { ...existing, title, manuscript } : existing,
      ),
    };
    return workToBook(liveWork).chapters[chapterIndex] ?? null;
  }, [work, chapterIndex, title, manuscript]);

  if (!loaded) return null;

  if (!work || !chapter || title === null || manuscript === null) {
    return (
      <div className="container-katha py-24 text-center">
        <p className="font-reader text-2xl text-reader-foreground">
          This page isn&rsquo;t in the manuscript.
        </p>
        <Link
          href={work ? `/studio/works/${work.id}` : '/studio'}
          className="mt-6 inline-block font-body text-sm font-medium text-primary hover:text-primary/80"
        >
          Back to the work →
        </Link>
      </div>
    );
  }

  const words = manuscriptWordCount(manuscript);
  const paragraphs = parseManuscript(manuscript).length;
  const authorName = getCurrentAuthor()?.displayName ?? 'You';

  return (
    <div>
      {/* Quiet editor bar */}
      <div className="border-b border-border/60 bg-background/90">
        <div className="container-katha flex h-12 items-center justify-between gap-4">
          <Link
            href={`/studio/works/${work.id}`}
            className="min-w-0 truncate font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            ← {work.book.title.trim() || 'Untitled work'}
          </Link>

          <div className="flex shrink-0 items-center gap-4">
            <p aria-live="polite" className="hidden font-body text-xs text-muted-foreground sm:block">
              {saveState === 'saving' && 'Saving…'}
              {saveState === 'saved' &&
                savedAt &&
                relativeTimeLabel(savedAt, 'Draft saved')}
            </p>

            {/* Write ⇄ Read — the signature toggle */}
            <div
              role="group"
              aria-label="Editor mode"
              className="flex rounded-full border border-border bg-card p-0.5 shadow-sm"
            >
              {(['write', 'read'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  aria-pressed={mode === option}
                  className={`rounded-full px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    mode === option
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option === 'write' ? 'Write' : 'Read'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The page */}
      <main className="flex justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-[680px]">
          {mode === 'write' ? (
            <div className="reading-surface flex min-h-[70dvh] w-full flex-col rounded-xl border border-border/50 px-8 py-14 shadow-[var(--ds-shadow-soft)] sm:px-12 sm:py-16">
              <label htmlFor="chapter-title" className="sr-only">
                Chapter title
              </label>
              <input
                id="chapter-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Chapter title"
                autoComplete="off"
                className="w-full bg-transparent text-center font-heading text-3xl leading-tight text-reader-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              <div aria-hidden="true" className="mx-auto mt-6 h-px w-10 bg-border" />

              <label htmlFor="chapter-manuscript" className="sr-only">
                Manuscript
              </label>
              <textarea
                id="chapter-manuscript"
                value={manuscript}
                onChange={(event) => setManuscript(event.target.value)}
                placeholder="The page is yours. A blank line begins a new paragraph."
                spellCheck
                className="mt-10 min-h-[50dvh] w-full flex-1 resize-none bg-transparent font-reader text-[1.075rem] leading-[1.9] text-reader-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
            </div>
          ) : (
            /* Read mode — the real reader, live */
            <div className="reading-surface flex min-h-[70dvh] w-full flex-col rounded-xl border border-border/50 px-8 py-14 shadow-[var(--ds-shadow-soft)] sm:px-12 sm:py-16">
              {previewChapter && previewChapter.content.length > 0 ? (
                <ReaderArticle
                  bookTitle={work.book.title.trim() || 'Untitled work'}
                  author={authorName}
                  chapterTitle={previewChapter.title}
                  estimatedReadingTime={previewChapter.estimatedReadingTime}
                  content={previewChapter.content}
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <p className="font-reader text-2xl text-reader-foreground">
                    The page is still blank.
                  </p>
                  <p className="mt-3 max-w-[36ch] font-body text-sm leading-relaxed text-muted-foreground">
                    Write a few lines and this becomes the reader&rsquo;s page —
                    the real one.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer whisper */}
          <p className="mt-4 text-center font-body text-xs text-muted-foreground">
            {words.toLocaleString()} {words === 1 ? 'word' : 'words'} ·{' '}
            {paragraphs} {paragraphs === 1 ? 'paragraph' : 'paragraphs'}
            <span className="sm:hidden">
              {saveState === 'saved' && savedAt
                ? ` · ${relativeTimeLabel(savedAt, 'Draft saved')}`
                : saveState === 'saving'
                  ? ' · Saving…'
                  : ''}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
