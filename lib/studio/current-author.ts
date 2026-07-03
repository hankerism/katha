/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — current author
 * lib/studio/current-author.ts
 *
 * Who is writing — the VIEWER's own Author profile, created when they
 * completed it on the ladder (User and Author are separate domains linked by
 * userId; the display name may be a pen name). Local profiles live on the
 * membership record, not in the static catalogue table. The legacy id
 * fallback keeps works written before the split resolving.
 * ------------------------------------------------------------------------- */

import type { KathaAuthor } from '../authors';
import { DEFAULT_STUDIO_AUTHOR_ID, getViewer } from '../membership';

export function getCurrentAuthorId(): string {
  return getViewer().authorId ?? DEFAULT_STUDIO_AUTHOR_ID;
}

/** The current author's profile (display name, bio, media …) — the viewer's
 *  own writing identity. Undefined until the profile has been completed. */
export function getCurrentAuthor(): KathaAuthor | undefined {
  return getViewer().author;
}
