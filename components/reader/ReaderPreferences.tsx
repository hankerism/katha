'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { readerPreferenceClasses, readerPreferencesBootstrapScript } from '@/lib/reader-preference-selectors';
import { useReaderPreferences } from './use-reader-preferences';
import ReaderPreferencesPanel from './ReaderPreferencesPanel';
import InlineScript from '@/components/ui/InlineScript';

/* ---------------------------------------------------------------------------
 * KATHA · ReaderPreferences
 * components/reader/ReaderPreferences.tsx
 *
 * The reader shell: wraps the reading experience, applies the visitor's
 * preferences (theme / text size / line height / width / paragraph spacing)
 * as design-system classes, and floats the "Aa" button that opens the panel.
 *
 * This component owns NO persistence and NO preference vocabulary:
 *   • state comes through useReaderPreferences (the hook seam),
 *   • classes come from the selector layer (readerPreferenceClasses),
 *   • the panel body is the dumb ReaderPreferencesPanel.
 *
 * Flash prevention (the Next.js inline-script pattern): the server renders
 * this shell with default classes; the InlineScript directly inside it runs
 * synchronously during HTML parsing — BEFORE first paint — and swaps in the
 * saved preference classes. The hook's lazy initializer reads the same
 * storage, so React's first client render matches the corrected DOM and
 * hydration is clean. On soft navigations the script is inert and the lazy
 * read is simply correct. suppressHydrationWarning lets the DOM win for the
 * className the script already fixed.
 *
 * `reader-surface` lets the typography variables from globals.css apply.
 * No transform / overflow / isolation / perspective here — ReaderToolbar is
 * sticky.
 * ------------------------------------------------------------------------- */

const SHELL_BASE_CLASSES = 'min-h-screen bg-background text-foreground reader-surface';

const PANEL_ID = 'reader-preferences-panel';

export default function ReaderPreferences({ children }: { children: ReactNode }) {
  const shellId = useId();
  const { preferences, update } = useReaderPreferences();
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape / outside click; return focus to the button on Escape.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  return (
    <div
      id={shellId}
      className={`${SHELL_BASE_CLASSES} ${readerPreferenceClasses(preferences)}`}
      suppressHydrationWarning
    >
      {/* Pre-paint correction for hard loads — see header comment. */}
      <InlineScript html={readerPreferencesBootstrapScript(shellId)} />

      {children}

      <div ref={containerRef} className="fixed bottom-6 right-6 z-40">
        {open && (
          <div
            id={PANEL_ID}
            role="dialog"
            aria-label="Reading preferences"
            className="absolute bottom-full right-0 mb-3 w-80 max-w-[calc(100vw-3rem)] origin-bottom-right rounded-xl border border-border bg-card/85 p-4 text-foreground shadow-xl backdrop-blur-xl transition-all duration-200 supports-[backdrop-filter]:bg-card/70"
          >
            <p className="mb-4 font-heading text-sm font-semibold text-foreground">
              Reading preferences
            </p>

            <ReaderPreferencesPanel preferences={preferences} onChange={update} />
          </div>
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Reading preferences"
          aria-expanded={open}
          aria-controls={PANEL_ID}
          className="flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition duration-200 hover:bg-secondary/60 hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span aria-hidden="true" className="font-heading text-lg leading-none">
            A<span className="text-sm">a</span>
          </span>
        </button>
      </div>
    </div>
  );
}
