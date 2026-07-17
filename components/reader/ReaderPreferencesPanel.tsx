'use client';

import type {
  ReaderFontSize,
  ReaderLineHeight,
  ReaderParagraphSpacing,
  ReaderPreferences,
  ReaderTheme,
  ReaderWidth,
} from '@/lib/reader-preferences';

/* ---------------------------------------------------------------------------
 * KATHA · ReaderPreferencesPanel
 * components/reader/ReaderPreferencesPanel.tsx
 *
 * The preferences panel body — five segmented controls. Purely presentational:
 * current values in, change callbacks out. It knows nothing about storage,
 * class maps, or where the values come from; the shell (ReaderPreferences)
 * owns state via useReaderPreferences and applies the visual result.
 * ------------------------------------------------------------------------- */

interface ReaderPreferencesPanelProps {
  preferences: ReaderPreferences;
  onChange: (patch: Partial<ReaderPreferences>) => void;
}

const THEME_OPTIONS: ReadonlyArray<{ value: ReaderTheme; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'dark', label: 'Dark' },
];

const FONT_SIZE_OPTIONS: ReadonlyArray<{
  value: ReaderFontSize;
  label: string;
}> = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const LINE_HEIGHT_OPTIONS: ReadonlyArray<{
  value: ReaderLineHeight;
  label: string;
}> = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
];

const WIDTH_OPTIONS: ReadonlyArray<{ value: ReaderWidth; label: string }> = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'medium', label: 'Medium' },
  { value: 'wide', label: 'Wide' },
];

const PARAGRAPH_SPACING_OPTIONS: ReadonlyArray<{
  value: ReaderParagraphSpacing;
  label: string;
}> = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'loose', label: 'Loose' },
];

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
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

export default function ReaderPreferencesPanel({
  preferences,
  onChange,
}: ReaderPreferencesPanelProps) {
  return (
    <div className="space-y-4">
      <Segment
        legend="Theme"
        value={preferences.theme}
        options={THEME_OPTIONS}
        onChange={(theme) => onChange({ theme })}
      />
      <Segment
        legend="Text Size"
        value={preferences.fontSize}
        options={FONT_SIZE_OPTIONS}
        onChange={(fontSize) => onChange({ fontSize })}
      />
      <Segment
        legend="Line Height"
        value={preferences.lineHeight}
        options={LINE_HEIGHT_OPTIONS}
        onChange={(lineHeight) => onChange({ lineHeight })}
      />
      <Segment
        legend="Reading Width"
        value={preferences.width}
        options={WIDTH_OPTIONS}
        onChange={(width) => onChange({ width })}
      />
      <Segment
        legend="Paragraph Spacing"
        value={preferences.paragraphSpacing}
        options={PARAGRAPH_SPACING_OPTIONS}
        onChange={(paragraphSpacing) => onChange({ paragraphSpacing })}
      />
    </div>
  );
}
