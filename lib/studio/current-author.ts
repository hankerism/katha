/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — current author
 * lib/studio/current-author.ts
 *
 * The ONE file that knows who is writing. There is no authentication yet, so
 * the current author is a constant: Abigail Marte, a real row in the Author
 * domain (lib/authors.ts) — the Studio references her by authorId exactly the
 * way books do, so nothing downstream assumes a singleton.
 *
 * When accounts arrive, getCurrentAuthorId() reads the session instead and
 * every other Studio surface is already correct.
 * ------------------------------------------------------------------------- */

import { getAuthorById, type KathaAuthor } from '../authors';

const CURRENT_AUTHOR_ID = 'auth-abigail-marte';

export function getCurrentAuthorId(): string {
  return CURRENT_AUTHOR_ID;
}

/** The current author's domain record (name, bio, avatar …). */
export function getCurrentAuthor(): KathaAuthor | undefined {
  return getAuthorById(getCurrentAuthorId());
}
