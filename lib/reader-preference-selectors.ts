/* ---------------------------------------------------------------------------
 * KATHA · Reader Preference selectors (derivation helpers)
 * lib/reader-preference-selectors.ts
 *
 * The derivation companion to the pure persistence layer
 * (lib/reader-preferences.ts), mirroring the bookmark/history selector split.
 * Persistence owns WHAT the reader chose; this module owns what those choices
 * LOOK like — the mapping from preference values to the design system's
 * `.reader-*` classes in globals.css.
 *
 * It also generates the bootstrap script that prevents the
 * flash-before-hydration on hard loads (see readerPreferencesBootstrapScript).
 * Both the React render and the script derive classes from the SAME maps, so
 * they cannot disagree.
 *
 * Pure: no storage access, no React, no DOM at module level.
 * ------------------------------------------------------------------------- */

import {
  DEFAULT_READER_PREFERENCES,
  READER_PREFERENCES_STORAGE_KEY,
  type ReaderPreferences,
} from './reader-preferences';

/** Preference value → design-system class, per field. The single source of
 *  truth shared by the React render and the pre-paint bootstrap script.
 *  (`reader-theme-light` is intentionally inert — light is the base theme.) */
export const READER_PREFERENCE_CLASSES: {
  [K in keyof ReaderPreferences]: Record<ReaderPreferences[K], string>;
} = {
  theme: {
    light: 'reader-theme-light',
    sepia: 'reader-theme-sepia',
    dark: 'dark',
  },
  fontSize: {
    small: 'reader-size-small',
    medium: 'reader-size-medium',
    large: 'reader-size-large',
  },
  lineHeight: {
    compact: 'reader-leading-compact',
    normal: 'reader-leading-normal',
    relaxed: 'reader-leading-relaxed',
  },
  width: {
    narrow: 'reader-width-narrow',
    medium: 'reader-width-medium',
    wide: 'reader-width-wide',
  },
  paragraphSpacing: {
    tight: 'reader-spacing-tight',
    normal: 'reader-spacing-normal',
    loose: 'reader-spacing-loose',
  },
} as const;

const PREFERENCE_KEYS = Object.keys(
  READER_PREFERENCE_CLASSES,
) as Array<keyof ReaderPreferences>;

/** Generic so TypeScript correlates the field with its value map — mapping
 *  over the key union directly loses that link (TS2536/TS7053). */
function classFor<K extends keyof ReaderPreferences>(
  key: K,
  value: ReaderPreferences[K],
): string {
  return READER_PREFERENCE_CLASSES[key][value];
}

/** The class string for a set of preferences (one class per field). */
export function readerPreferenceClasses(
  preferences: ReaderPreferences,
): string {
  return PREFERENCE_KEYS.map((key) => classFor(key, preferences[key])).join(
    ' ',
  );
}

/** Source for an inline <script> that applies the saved preferences to the
 *  reader shell BEFORE first paint, on hard loads (direct visit, refresh).
 *
 *  Per the Next.js "Preventing Flash" guide: the server renders the shell with
 *  default classes; this script — parsed synchronously right after the shell's
 *  opening tag — reads localStorage and swaps the preference classes in place.
 *  React then hydrates against a DOM that already matches its client render
 *  (the hook's lazy initializer reads the same storage). On soft navigations
 *  the script is inert (`text/plain`, see InlineScript) and the client render
 *  is simply correct from the start.
 *
 *  Only the classes in READER_PREFERENCE_CLASSES are touched — base classes on
 *  the shell stay owned by the component. Mirrors the persistence layer's
 *  legacy handling (`size` → `fontSize`) so un-migrated records render right
 *  on the very first paint. Fails silent (try/catch) like the layer itself. */
export function readerPreferencesBootstrapScript(elementId: string): string {
  const maps = JSON.stringify(READER_PREFERENCE_CLASSES);
  const defaults = JSON.stringify(DEFAULT_READER_PREFERENCES);
  const key = JSON.stringify(READER_PREFERENCES_STORAGE_KEY);
  const id = JSON.stringify(elementId);
  return (
    '(function(){try{' +
    `var el=document.getElementById(${id});if(!el)return;` +
    `var maps=${maps};var prefs=${defaults};` +
    `var raw=localStorage.getItem(${key});` +
    'if(raw){var p=JSON.parse(raw);if(p&&typeof p==="object"){' +
    'if(typeof p.fontSize!=="string"&&typeof p.size==="string")p.fontSize=p.size;' +
    'for(var k in maps){if(Object.prototype.hasOwnProperty.call(maps[k],p[k]))prefs[k]=p[k]}' +
    '}}' +
    'for(var f in maps){var m=maps[f];' +
    'for(var v in m){el.classList.remove(m[v])}' +
    'el.classList.add(m[prefs[f]])}' +
    '}catch(e){}})()'
  );
}
