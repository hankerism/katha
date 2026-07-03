/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — current author
 * lib/studio/current-author.ts
 *
 * Who is writing — now answered by the membership domain: the Studio's author
 * identity is the VIEWER's authorId (an Author is a Reader whose viewer
 * carries one). Pre-authentication that resolves to Abigail Marte; with
 * sessions it resolves to whoever signed in. The fallback keeps the Studio
 * usable when reached without the author tier (the entry gate handles the
 * ladder; data written here always belongs to a real Author-domain row).
 * ------------------------------------------------------------------------- */

import { getAuthorById, type KathaAuthor } from '../authors';
import { DEFAULT_STUDIO_AUTHOR_ID, getViewer } from '../membership';

export function getCurrentAuthorId(): string {
  return getViewer().authorId ?? DEFAULT_STUDIO_AUTHOR_ID;
}

/** The current author's domain record (name, bio, avatar …). */
export function getCurrentAuthor(): KathaAuthor | undefined {
  return getAuthorById(getCurrentAuthorId());
}
