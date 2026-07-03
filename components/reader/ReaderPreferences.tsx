'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ReaderPreferencesState {
  size: 'small' | 'medium' | 'large';
  width: 'narrow' | 'medium' | 'wide';
  theme: 'light' | 'sepia' | 'dark';
}

const STORAGE_KEY = 'katha:reader-preferences';
const PANEL_ID = 'reader-preferences-panel';

const DEFAULTS: ReaderPreferencesState = {
  size: 'medium',
  width: 'medium',
  theme: 'light',
};

const SIZE_CLASS: Record<ReaderPreferencesState['size'], string> = {
  small: 'reader-size-small',
  medium: 'reader-size-medium',
  large: 'reader-size-large',
};

const WIDTH_CLASS: Record<ReaderPreferencesState['width'], string> = {
  narrow: 'reader-width-narrow',
  medium: 'reader-width-medium',
  wide: 'reader-width-wide',
};

const THEME_CLASS: Record<ReaderPreferencesState['theme'], string> = {
  light: 'reader-theme-light',
  sepia: 'reader-theme-sepia',
  dark: 'dark',
};

const SIZE_OPTIONS: ReadonlyArray<{ value: ReaderPreferencesState['size']; label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const WIDTH_OPTIONS: ReadonlyArray<{ value: ReaderPreferencesState['width']; label: string }> = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'medium', label: 'Medium' },
  { value: 'wide', label: 'Wide' },
];

const THEME_OPTIONS: ReadonlyArray<{ value: ReaderPreferencesState['theme']; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'dark', label: 'Dark' },
];

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function isSize(v: unknown): v is ReaderPreferencesState['size'] {
  return v === 'small' || v === 'medium' || v === 'large';
}

function isWidth(v: unknown): v is ReaderPreferencesState['width'] {
  return v === 'narrow' || v === 'medium' || v === 'wide';
}

function isTheme(v: unknown): v is ReaderPreferencesState['theme'] {
  return v === 'light' || v === 'sepia' || v === 'dark';
}

function parsePreferences(raw: string): ReaderPreferencesState {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      size: isSize(parsed.size) ? parsed.size : DEFAULTS.size,
      width: isWidth(parsed.width) ? parsed.width : DEFAULTS.width,
      theme: isTheme(parsed.theme) ? parsed.theme : DEFAULTS.theme,
    };
  } catch {
    return DEFAULTS;
  }
}

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
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cx(
                'flex-1 rounded-full px-3 py-1.5 font-body text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function ReaderPreferences({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ReaderPreferencesState>(DEFAULTS);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const skipFirstSave = useRef(true);

  // Load saved preferences after mount so SSR + first client render use defaults.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPreferences(parsePreferences(raw));
    } catch {
      // localStorage unavailable — keep defaults.
    }
  }, []);

  // Persist on change; skip the initial mount so stored preferences survive.
  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Best-effort — ignore write failures.
    }
  }, [preferences]);

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

  function update<K extends keyof ReaderPreferencesState>(
    key: K,
    value: ReaderPreferencesState[K],
  ) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }

  // `reader-surface` lets the typography variables from globals.css apply.
  // No transform / overflow / isolation / perspective here — ReaderToolbar is sticky.
  const wrapperClasses = cx(
    'min-h-screen bg-background text-foreground',
    'reader-surface',
    SIZE_CLASS[preferences.size],
    WIDTH_CLASS[preferences.width],
    THEME_CLASS[preferences.theme],
  );

  return (
    <div className={wrapperClasses}>
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

            <div className="space-y-4">
              <Segment
                legend="Text Size"
                value={preferences.size}
                options={SIZE_OPTIONS}
                onChange={(value) => update('size', value)}
              />
              <Segment
                legend="Reading Width"
                value={preferences.width}
                options={WIDTH_OPTIONS}
                onChange={(value) => update('width', value)}
              />
              <Segment
                legend="Theme"
                value={preferences.theme}
                options={THEME_OPTIONS}
                onChange={(value) => update('theme', value)}
              />
            </div>
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