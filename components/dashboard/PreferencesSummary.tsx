import type { ReaderPreferences } from '@/lib/reader-preferences';

/* ---------------------------------------------------------------------------
 * KATHA · PreferencesSummary
 * components/dashboard/PreferencesSummary.tsx
 *
 * A calm one-row summary of the reader's current preferences — a surface, not
 * a control panel. Editing happens where the effect is visible: the "Aa"
 * button while reading (mounting the full panel here was considered and
 * deliberately deferred — changing text size with no prose in sight is a
 * poor control loop).
 *
 * Purely presentational: the preferences object arrives as a prop (the page
 * reads it through useReaderPreferences); the value→label maps here are
 * display vocabulary only, no persistence knowledge.
 * ------------------------------------------------------------------------- */

interface PreferencesSummaryProps {
  preferences: ReaderPreferences;
}

/** Display labels for each preference value (matches the panel's options). */
const LABELS: { [K in keyof ReaderPreferences]: Record<ReaderPreferences[K], string> } = {
  theme: { light: 'Light', sepia: 'Sepia', dark: 'Dark' },
  fontSize: { small: 'Small', medium: 'Medium', large: 'Large' },
  lineHeight: { compact: 'Compact', normal: 'Normal', relaxed: 'Relaxed' },
  width: { narrow: 'Narrow', medium: 'Medium', wide: 'Wide' },
  paragraphSpacing: { tight: 'Tight', normal: 'Normal', loose: 'Loose' },
};

const FIELDS: ReadonlyArray<{ key: keyof ReaderPreferences; name: string }> = [
  { key: 'theme', name: 'Theme' },
  { key: 'fontSize', name: 'Text' },
  { key: 'lineHeight', name: 'Line height' },
  { key: 'width', name: 'Width' },
  { key: 'paragraphSpacing', name: 'Spacing' },
];

/** Generic so TypeScript correlates the field with its label map (the same
 *  union-indexing limitation worked around in reader-preference-selectors). */
function labelFor<K extends keyof ReaderPreferences>(
  labels: typeof LABELS,
  key: K,
  value: ReaderPreferences[K],
): string {
  return labels[key][value];
}

export default function PreferencesSummary({ preferences }: PreferencesSummaryProps) {
  return (
    <div className="rounded-xl border border-border/60 reading-surface p-5 shadow-soft sm:p-6">
      <dl className="flex flex-wrap gap-x-7 gap-y-3">
        {FIELDS.map(({ key, name }) => (
          <div key={key} className="flex items-baseline gap-2">
            <dt className="font-body text-[0.68rem] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              {name}
            </dt>
            <dd className="font-body text-[0.85rem] font-medium text-reader-foreground">
              {labelFor(LABELS, key, preferences[key])}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-body text-[0.74rem] text-reader-muted">
        Adjust these any time while reading — the Aa button in the corner of the
        page.
      </p>
    </div>
  );
}
