'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · ReaderPreferences
 * components/reader/ReaderPreferences.tsx
 *
 * Client wrapper around the reader content. Renders a floating "Aa" control
 * that opens a small panel for text size, reading width, and theme, then applies
 * those choices as CSS classes on the wrapping element. Preferences persist to
 * localStorage ("katha:reader-preferences").
 *
 * Server components (toolbar, article, navigation) are passed in as `children`,
 * so this client boundary wraps them without importing them. The wrapper sets no
 * transform/overflow, so the sticky toolbar inside keeps working.
 *
 * The preference classes are backed by CSS in globals.css (width/size CSS vars,
 * sepia token remap; dark reuses the existing .dark layer). Tokens only.
 * ------------------------------------------------------------------------- */

type TextSize = 'small' | 'medium' | 'large';
type ReadingWidth = 'narrow' | 'medium' | 'wide';
type Theme = 'light' | 'sepia' | 'dark';

interface ReaderPrefs {
  size: TextSize;
  width: ReadingWidth;
  theme: Theme;
}

const STORAGE_KEY = 'katha:reader-preferences';

const DEFAULTS: ReaderPrefs = { size: 'medium', width: 'medium', theme: 'light' };

const SIZE_CLASS: Record<TextSize, string> = {
  small: 'reader-size-small',
  medium: 'reader-size-medium',
  large: 'reader-size-large',
};
const WIDTH_CLASS: Record<ReadingWidth, string> = {
  narrow: 'reader-width-narrow',
  medium: 'reader-width-medium',
  wide: 'reader-width-wide',
};
// Dark reuses the project's existing .dark token layer; light is the default.
const THEME_CLASS: Record<Theme, string> = {
  light: '',
  sepia: 'reader-theme-sepia',
  dark: 'dark',
};

const SIZE_OPTIONS: ReadonlyArray<{ value: TextSize; label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];
const WIDTH_OPTIONS: ReadonlyArray<{ value: ReadingWidth; label: string }> = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'medium', label: 'Medium' },
  { value: 'wide', label: 'Wide' },
];
const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'dark', label: 'Dark' },
];

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function isTextSize(v: unknown): v is TextSize {
  return v === 'small' || v === 'medium' || v === 'large';
}
function isReadingWidth(v: unknown): v is ReadingWidth {
  return v === 'narrow' || v === 'medium' || v === 'wide';
}
function isTheme(v: unknown): v is Theme {
  return v === 'light' || v === 'sepia' || v === 'dark';
}

/** Merge stored JSON with defaults, validating each field. */
function parsePrefs(raw: string): ReaderPrefs {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      size: isTextSize(parsed.size) ? parsed.size : DEFAULTS.size,
      width: isReadingWidth(parsed.width) ? parsed.width : DEFAULTS.width,
      theme: isTheme(parsed.theme) ? parsed.theme : DEFAULTS.theme,
    };
  } catch {
    return DEFAULTS;
  }
}

/* -- Icon ------------------------------------------------------------------ */

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/* -- Segmented control ----------------------------------------------------- */

function Segment<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 p-0 font-body text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {legend}
      </legend>
      <div className="flex gap-1 rounded-full bg-secondary p-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={cx(
                'flex-1 rounded-full px-3 py-1.5 font-body text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* -- Wrapper --------------------------------------------------------------- */

export default function ReaderPreferences({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULTS);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const skipFirstSave = useRef(true);

  // Load saved preferences after mount (keeps the SSR/first-render pass = defaults).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs(parsePrefs(raw));
    } catch {
      // localStorage unavailable — keep defaults.
    }
  }, []);

  // Persist on change, skipping the initial mount so we never overwrite stored prefs.
  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Best-effort — ignore write failures.
    }
  }, [prefs]);

  // Close on Escape / outside click while open; return focus to the button on Escape.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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

  function update<K extends keyof ReaderPrefs>(key: K, value: ReaderPrefs[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className={cx(
        'reader-surface min-h-screen bg-background text-foreground',
        SIZE_CLASS[prefs.size],
        WIDTH_CLASS[prefs.width],
        THEME_CLASS[prefs.theme],
      )}
    >
      {children}

      {/* Floating preferences control */}
      <div ref={containerRef} className="fixed bottom-6 right-6 z-40">
        {open && (
          <div
            id="reader-preferences-panel"
            role="dialog"
            aria-label="Reading preferences"
            className="absolute bottom-full right-0 mb-3 w-72 max-w-[calc(100vw-3rem)] rounded-[18px] border border-border bg-card p-4 text-foreground shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-heading text-sm font-semibold text-foreground">
                Reading preferences
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                aria-label="Close reading preferences"
                className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-4">
              <Segment
                legend="Text size"
                value={prefs.size}
                options={SIZE_OPTIONS}
                onChange={(v) => update('size', v)}
              />
              <Segment
                legend="Reading width"
                value={prefs.width}
                options={WIDTH_OPTIONS}
                onChange={(v) => update('width', v)}
              />
              <Segment
                legend="Theme"
                value={prefs.theme}
                options={THEME_OPTIONS}
                onChange={(v) => update('theme', v)}
              />
            </div>
          </div>
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Reading preferences"
          aria-expanded={open}
          aria-controls="reader-preferences-panel"
          className="flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span aria-hidden="true" className="font-heading text-lg leading-none">
            A<span className="text-sm">a</span>
          </span>
        </button>
      </div>
    </div>
  );
}