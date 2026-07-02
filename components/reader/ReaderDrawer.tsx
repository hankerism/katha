'use client';

import {
  useEffect,
  useRef,
  useState,
  type SVGProps,
  type TransitionEvent,
} from 'react';
import Link from 'next/link';
import { getBookBySlug } from '@/lib/books';
import { getBookmarks } from '@/lib/bookmarks';
import { authorName } from '@/lib/author-selectors';

/* ---------------------------------------------------------------------------
 * KATHA · ReaderDrawer
 * components/reader/ReaderDrawer.tsx
 *
 * Apple Books–style Table of Contents drawer. A true fixed ~340px side panel
 * anchored to the LEFT, on a warm paper surface. No portal: the <aside> is
 * `position: fixed` itself. The only change from the prior version is the warm
 * paper background (#FCFAF6) in place of the plain card colour.
 *
 * The 340px width is enforced with !important via the panel ref so no class or
 * global rule can stretch it.
 *
 * Behaviour: closes on Escape and backdrop click, locks body scroll while open
 * and restores it on close, traps Tab focus, returns focus to the trigger.
 * ------------------------------------------------------------------------- */

interface ReaderDrawerProps {
  bookSlug: string;
  bookTitle: string;
  currentChapterSlug: string;
}

const DRAWER_WIDTH = 340; // px

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function ContentsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function BookmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export default function ReaderDrawer({
  bookSlug,
  bookTitle,
  currentChapterSlug,
}: ReaderDrawerProps) {
  const [open, setOpen] = useState(false); // controls mount
  const [shown, setShown] = useState(false); // drives the slide transform
  const [bookmarkCount, setBookmarkCount] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const book = getBookBySlug(bookSlug);
  const chapters = book?.chapters ?? [];
  const author = book ? authorName(book.authorId) : '';
  const title = book?.title ?? bookTitle;
  const total = chapters.length;
  const currentNumber =
    chapters.find((chapter) => chapter.slug === currentChapterSlug)?.number ?? 0;
  const percent = total > 0 ? Math.round((currentNumber / total) * 100) : 0;

  // After the panel mounts, flip `shown` so the transform transition runs.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Guarantee the width with !important priority — beats any class/global rule.
  useEffect(() => {
    const el = panelRef.current;
    if (!open || !el) return;
    el.style.setProperty('width', `${DRAWER_WIDTH}px`, 'important');
    el.style.setProperty('max-width', '85vw', 'important');
  }, [open]);

  // While open: lock body scroll, read bookmark count, focus the panel, and
  // restore scroll + focus to the trigger on close.
  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setBookmarkCount(getBookmarks().filter((b) => b.bookSlug === bookSlug).length);

    const focusId = requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(focusId);
      trigger?.focus();
    };
  }, [open, bookSlug]);

  // Escape closes; Tab is trapped within the dialog.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null);

      if (items.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function handleClose() {
    setShown(false); // slide out, then unmount on transition end
  }

  function handleTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.propertyName === 'transform' && !shown) {
      setOpen(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Table of contents"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="reader-drawer"
        className="inline-flex size-9 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ContentsIcon className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop (click to close) — light wash, no blur, so the reading
              page stays visible and crisp behind the panel */}
          <button
            type="button"
            aria-label="Close table of contents"
            onClick={handleClose}
            className="absolute inset-0 bg-black/10"
          />

          {/* Sheet — a true fixed 340px left drawer on warm paper */}
          <aside
            id="reader-drawer"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-drawer-title"
            tabIndex={-1}
            onTransitionEnd={handleTransitionEnd}
            className={cx(
              'fixed left-0 top-0 z-[10000] flex h-screen w-[340px] max-w-[85vw] flex-col overflow-hidden rounded-r-3xl border-r border-border bg-[#FCFAF6] text-foreground shadow-xl outline-none transition-transform duration-300 ease-out',
              shown ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            {/* Header */}
            <div className="shrink-0 px-6 pt-7">
              <h2
                id="reader-drawer-title"
                className="font-heading text-xl leading-tight text-foreground"
              >
                {title}
              </h2>
              {author && (
                <p className="mt-1.5 font-body text-sm text-muted-foreground">
                  {author}
                </p>
              )}
              <div className="mt-6 h-px w-full bg-border" />
              <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Contents
              </p>
            </div>

            {/* Chapter list (scrollable) */}
            <nav
              aria-label="Chapters"
              className="mt-4 min-h-0 flex-1 overflow-y-auto"
            >
              <ol className="pb-6">
                {chapters.map((chapter) => {
                  const isCurrent = chapter.slug === currentChapterSlug;
                  return (
                    <li key={chapter.slug}>
                      <Link
                        href={`/library/${bookSlug}/read/${chapter.slug}`}
                        aria-current={isCurrent ? 'page' : undefined}
                        onClick={handleClose}
                        className={cx(
                          'block w-full rounded-lg border-l-2 px-6 py-2.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isCurrent
                            ? 'border-primary'
                            : 'border-transparent hover:bg-secondary/25',
                        )}
                      >
                        <p
                          className={cx(
                            'font-body text-[11px] font-semibold uppercase tracking-[0.18em]',
                            isCurrent ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          Chapter {chapter.number}
                        </p>
                        <p
                          className={cx(
                            'mt-1.5 font-heading text-lg leading-snug text-foreground',
                            isCurrent && 'font-semibold',
                          )}
                        >
                          {chapter.title}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Footer: progress · bookmarks · history · close */}
            <div className="shrink-0 space-y-5 border-t border-border px-6 py-6">
              {/* Reading progress */}
              <div
                role="progressbar"
                aria-valuenow={currentNumber}
                aria-valuemin={1}
                aria-valuemax={total}
                aria-label={`Reading progress: chapter ${currentNumber} of ${total}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Reading Progress
                  </span>
                  <span className="font-heading text-lg tabular-nums text-foreground">
                    {percent}%
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-2 font-body text-xs text-muted-foreground">
                  Chapter {currentNumber} of {total}
                </p>
              </div>

              {/* Bookmarks CTA */}
              <Link
                href="/bookmarks"
                onClick={handleClose}
                className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <span className="inline-flex items-center gap-2.5">
                  <BookmarkIcon className="size-4 text-accent" />
                  <span className="font-body text-sm font-medium text-foreground">
                    View Bookmarks
                  </span>
                  {bookmarkCount > 0 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-body text-[11px] font-semibold tabular-nums text-muted-foreground">
                      {bookmarkCount}
                    </span>
                  )}
                </span>
                <ArrowRightIcon className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              {/* Reading history CTA */}
              <Link
                href="/history"
                onClick={handleClose}
                className="group flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <span className="inline-flex items-center gap-2.5">
                  <ClockIcon className="size-4 text-accent" />
                  <span className="font-body text-sm font-medium text-foreground">
                    View History
                  </span>
                </span>
                <ArrowRightIcon className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              {/* Close */}
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 font-body text-sm font-semibold text-foreground transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <CloseIcon className="size-4" />
                Close
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}