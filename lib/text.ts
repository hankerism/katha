/* ---------------------------------------------------------------------------
 * KATHA · Text helpers
 * lib/text.ts
 *
 * Tiny, pure string utilities shared across layers (the data catalogue, the
 * search engine, the recent-searches persistence). Nothing here knows about
 * books, storage, or React — extracting these keeps the layering honest:
 * lib/books.ts can slugify a category without importing the search engine,
 * and lib/recent-searches.ts can fold a query without depending on matching
 * logic.
 * ------------------------------------------------------------------------- */

/** Lowercase + strip diacritics, one output char per input char, so indices
 *  into the folded text are valid indices into the original. Characters that
 *  decompose to several code points (rare ligatures) keep their base char. */
export function foldText(text: string): string {
  let folded = '';
  for (const char of text.toLowerCase()) {
    const decomposed = char.normalize('NFD').replace(/[̀-ͯ]/g, '');
    folded += decomposed.charAt(0) || char;
  }
  return folded;
}

/** URL-safe slug in the existing `/library?genre=historical-fiction` register. */
export function slugifyCategory(name: string): string {
  return foldText(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Up to two uppercase initials for portrait fallbacks ("Lakambini Reyes" →
 *  "LR"). */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
