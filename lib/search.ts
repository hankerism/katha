/* ---------------------------------------------------------------------------
 * KATHA · Search — pure query engine
 * lib/search.ts
 *
 * The content-aware logic layer for Search (the selector analog of the Reading
 * Experience features): pure functions from (query, books) to ranked, grouped
 * results. No React, no DOM, no storage, no imports of the catalogue itself —
 * the caller passes the books (getAllBooks()), so the engine is testable in
 * isolation and improves automatically as the catalogue grows.
 *
 * Matching is deliberately forgiving. Each query token must match the text
 * (AND semantics), where a token can hit as, in descending score order:
 *   exact → prefix → word-start → substring → fuzzy word (bounded edit
 *   distance, typo-tolerant, incl. word prefixes so partial+typo still hits)
 *   → in-order character subsequence (last resort).
 * Scores are averaged across tokens, then weighted by field (book title >
 * author > category > chapter title). Diacritics are folded character-by-
 * character so highlight ranges always align with the ORIGINAL text.
 *
 * The UI renders highlights from the returned MatchRanges and never re-derives
 * any matching logic.
 * ------------------------------------------------------------------------- */

import type { KathaBook } from './books';
import type { KathaAuthor } from './authors';
import { foldText, slugifyCategory } from './text';

/* ── Result model ────────────────────────────────────────────────────────── */

/** Half-open [start, end) range within the ORIGINAL display text. */
export interface MatchRange {
  start: number;
  end: number;
}

export interface BookResult {
  type: 'book';
  id: string;
  /** Primary display text (the matched field is always `title`). */
  title: string;
  titleRanges: MatchRange[];
  author: string;
  category: string;
  chapterCount: number;
  href: string;
  score: number;
}

export interface AuthorResult {
  type: 'author';
  id: string;
  title: string;
  titleRanges: MatchRange[];
  bookCount: number;
  /** Authors have no page — selecting one refines the search to this query. */
  refineQuery: string;
  score: number;
}

export interface CategoryResult {
  type: 'category';
  id: string;
  title: string;
  titleRanges: MatchRange[];
  bookCount: number;
  href: string;
  score: number;
}

export interface ChapterResult {
  type: 'chapter';
  id: string;
  title: string;
  titleRanges: MatchRange[];
  bookSlug: string;
  bookTitle: string;
  chapterNumber: number;
  href: string;
  score: number;
}

export type SearchResult =
  | BookResult
  | AuthorResult
  | CategoryResult
  | ChapterResult;

export interface SearchResults {
  /** The query these results answer (as given, untrimmed folding aside). */
  query: string;
  books: BookResult[];
  authors: AuthorResult[];
  categories: CategoryResult[];
  chapters: ChapterResult[];
  total: number;
  /** The single best hit across all groups — the Enter-key target. */
  top: SearchResult | null;
}

const EMPTY_RESULTS: Omit<SearchResults, 'query'> = {
  books: [],
  authors: [],
  categories: [],
  chapters: [],
  total: 0,
  top: null,
};

/* ── Normalization ───────────────────────────────────────────────────────── */
/* foldText / slugifyCategory live in lib/text.ts (shared with the catalogue
 * and persistence layers); re-exported here so search consumers keep a single
 * import surface. */

export { foldText, slugifyCategory } from './text';

/* ── Fuzzy primitives ────────────────────────────────────────────────────── */

/** Optimal-string-alignment edit distance (insert / delete / substitute /
 *  adjacent transpose), early-exiting once the distance must exceed `max`.
 *  Returns max + 1 when out of budget. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a === b) return 0;

  let previous2: number[] = [];
  let previous: number[] = [];
  let current: number[] = [];
  for (let j = 0; j <= b.length; j += 1) previous[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(
        previous[j] + 1, // deletion
        current[j - 1] + 1, // insertion
        previous[j - 1] + substitution, // substitution
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        value = Math.min(value, previous2[j - 2] + 1); // transposition
      }
      current[j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1; // no cell can recover under budget
    previous2 = previous;
    previous = current;
  }
  return current[b.length];
}

/** How many edits a token of this length may be off by and still match. */
function editBudget(tokenLength: number): number {
  if (tokenLength >= 6) return 2;
  if (tokenLength >= 4) return 1;
  return 0;
}

/** Do `token`'s characters appear in order (not necessarily adjacent)? */
function isSubsequence(token: string, text: string): boolean {
  let i = 0;
  for (const char of text) {
    if (char === token[i]) i += 1;
    if (i === token.length) return true;
  }
  return false;
}

/* ── Token scoring ───────────────────────────────────────────────────────── */

const SCORE_EXACT = 100;
const SCORE_PREFIX = 90;
const SCORE_WORD_START = 80;
const SCORE_SUBSTRING = 70;
const SCORE_FUZZY_BASE = 60; // minus FUZZY_EDIT_PENALTY per edit
const FUZZY_EDIT_PENALTY = 18;
const SCORE_SUBSEQUENCE = 25;

interface TokenMatch {
  score: number;
  /** Highlight range in the folded/original text; null when the match has no
   *  meaningful contiguous span (subsequence). */
  range: MatchRange | null;
}

const WORD_PATTERN = /[a-z0-9]+/g;

/** Score one query token against one folded text. Null when it doesn't match. */
function scoreToken(token: string, folded: string): TokenMatch | null {
  // Contiguous hit: exact / prefix / word-start / substring.
  const index = folded.indexOf(token);
  if (index !== -1) {
    const range = { start: index, end: index + token.length };
    if (index === 0) {
      return {
        score: token.length === folded.length ? SCORE_EXACT : SCORE_PREFIX,
        range,
      };
    }
    const wordStart = !/[a-z0-9]/.test(folded[index - 1]);
    return { score: wordStart ? SCORE_WORD_START : SCORE_SUBSTRING, range };
  }

  // Fuzzy hit: compare against each word AND each word's token-length prefix,
  // so both whole-word typos ("hulign") and partial+typo ("hulni") match.
  const budget = editBudget(token.length);
  if (budget > 0) {
    let best: TokenMatch | null = null;
    for (const match of folded.matchAll(WORD_PATTERN)) {
      const word = match[0];
      const start = match.index;
      const whole = editDistance(token, word, budget);
      const prefix =
        word.length > token.length
          ? editDistance(token, word.slice(0, token.length), budget)
          : budget + 1;
      const distance = Math.min(whole, prefix);
      if (distance > budget) continue;
      const score = SCORE_FUZZY_BASE - distance * FUZZY_EDIT_PENALTY;
      if (!best || score > best.score) {
        best = { score, range: { start, end: start + word.length } };
      }
    }
    if (best) return best;
  }

  // Last resort: in-order character subsequence ("hlng" → "huling").
  if (token.length >= 3 && isSubsequence(token, folded)) {
    return { score: SCORE_SUBSEQUENCE, range: null };
  }

  return null;
}

/* ── Text scoring ────────────────────────────────────────────────────────── */

/** Merge overlapping / touching ranges so the UI renders clean <mark> spans. */
export function mergeRanges(ranges: MatchRange[]): MatchRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: MatchRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

interface TextMatch {
  score: number;
  ranges: MatchRange[];
}

/** Score a whole query against a display text: every token must match; the
 *  text score is the token mean. Null when any token misses. */
function scoreText(queryTokens: string[], text: string): TextMatch | null {
  const folded = foldText(text);
  let sum = 0;
  const ranges: MatchRange[] = [];
  for (const token of queryTokens) {
    const match = scoreToken(token, folded);
    if (!match) return null;
    sum += match.score;
    if (match.range) ranges.push(match.range);
  }
  return { score: sum / queryTokens.length, ranges: mergeRanges(ranges) };
}

/* ── Catalogue search ────────────────────────────────────────────────────── */

/** Field weights: what kind of hit matters most, all else equal. A book
 *  matches on "title author" combined (so author queries and cross-field
 *  queries like "huling reyes" list the book itself), with a lower-weighted
 *  category fallback. */
const WEIGHT_BOOK = 1;
const WEIGHT_BOOK_VIA_CATEGORY = 0.65;
const WEIGHT_AUTHOR = 0.9;
const WEIGHT_CATEGORY = 0.8;
const WEIGHT_CHAPTER = 0.7;

/** Group priority for the `top` pick when scores tie. */
const TYPE_PRIORITY: Record<SearchResult['type'], number> = {
  book: 0,
  author: 1,
  category: 2,
  chapter: 3,
};

function byScore<T extends { score: number; title: string }>(a: T, b: T): number {
  return b.score - a.score || a.title.localeCompare(b.title);
}

/** What the engine searches over: the two domain tables, passed as plain
 *  data (the caller supplies getAllBooks() / getAllAuthors()). The engine
 *  joins authorId → name internally and never imports either domain module. */
export interface SearchableCatalogue {
  books: KathaBook[];
  authors: KathaAuthor[];
}

/** Search the given catalogue. Pure: same inputs, same outputs. An empty /
 *  whitespace query returns empty results (the UI treats that state itself). */
export function searchCatalogue(
  query: string,
  catalogue: SearchableCatalogue,
): SearchResults {
  const { books, authors } = catalogue;
  const tokens = foldText(query).trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { query, ...EMPTY_RESULTS };

  // The one join the engine performs: authorId → display name.
  const authorNameById = new Map(authors.map((a) => [a.id, a.name]));

  const bookResults: BookResult[] = [];
  const chapterResults: ChapterResult[] = [];
  const categoryHits = new Map<
    string,
    { title: string; ranges: MatchRange[]; score: number; bookCount: number }
  >();

  for (const book of books) {
    // Books match on "title author" combined: an author query lists the
    // author's books, and mixed queries ("huling reyes") still hit. Highlight
    // ranges are clipped to the title portion, which the combined text starts
    // with, so they remain valid indices into the displayed title. Books that
    // only match via their category still surface, ranked lower. An orphaned
    // authorId (no author row) simply drops the author half of the text.
    const authorDisplay = authorNameById.get(book.authorId) ?? '';
    const combinedMatch = scoreText(
      tokens,
      authorDisplay ? `${book.title} ${authorDisplay}` : book.title,
    );
    const bookCategoryMatch = combinedMatch
      ? null
      : scoreText(tokens, book.category);
    if (combinedMatch || bookCategoryMatch) {
      const titleRanges = combinedMatch
        ? combinedMatch.ranges
            .filter((range) => range.start < book.title.length)
            .map((range) => ({
              start: range.start,
              end: Math.min(range.end, book.title.length),
            }))
        : [];
      bookResults.push({
        type: 'book',
        id: book.slug,
        title: book.title,
        titleRanges,
        author: authorDisplay,
        category: book.category,
        chapterCount: book.chapters.length,
        href: `/library/${book.slug}`,
        score: combinedMatch
          ? combinedMatch.score * WEIGHT_BOOK
          : (bookCategoryMatch as TextMatch).score * WEIGHT_BOOK_VIA_CATEGORY,
      });
    }

    // Categories aggregate across books (one row per name).
    const categoryMatch = scoreText(tokens, book.category);
    if (categoryMatch) {
      const key = foldText(book.category);
      const existing = categoryHits.get(key);
      if (existing) {
        existing.bookCount += 1;
        existing.score = Math.max(existing.score, categoryMatch.score);
      } else {
        categoryHits.set(key, {
          title: book.category,
          ranges: categoryMatch.ranges,
          score: categoryMatch.score,
          bookCount: 1,
        });
      }
    }

    for (const chapter of book.chapters) {
      const chapterMatch = scoreText(tokens, chapter.title);
      if (chapterMatch) {
        chapterResults.push({
          type: 'chapter',
          id: `${book.slug}:${chapter.slug}`,
          title: chapter.title,
          titleRanges: chapterMatch.ranges,
          bookSlug: book.slug,
          bookTitle: book.title,
          chapterNumber: chapter.number,
          href: `/library/${book.slug}/read/${chapter.slug}`,
          score: chapterMatch.score * WEIGHT_CHAPTER,
        });
      }
    }
  }

  // Author rows come from the author TABLE, not from book aggregation — an
  // author is findable even before their first book is published.
  const authorResults: AuthorResult[] = [];
  for (const author of authors) {
    const match = scoreText(tokens, author.name);
    if (!match) continue;
    authorResults.push({
      type: 'author',
      id: author.id,
      title: author.name,
      titleRanges: match.ranges,
      bookCount: books.filter((book) => book.authorId === author.id).length,
      refineQuery: author.name,
      score: match.score * WEIGHT_AUTHOR,
    });
  }

  const categoryResults: CategoryResult[] = [...categoryHits.values()].map(
    (hit) => ({
      type: 'category',
      id: `category:${slugifyCategory(hit.title)}`,
      title: hit.title,
      titleRanges: hit.ranges,
      bookCount: hit.bookCount,
      href: `/library?genre=${slugifyCategory(hit.title)}`,
      score: hit.score * WEIGHT_CATEGORY,
    }),
  );

  bookResults.sort(byScore);
  authorResults.sort(byScore);
  categoryResults.sort(byScore);
  chapterResults.sort(byScore);

  const all: SearchResult[] = [
    ...bookResults,
    ...authorResults,
    ...categoryResults,
    ...chapterResults,
  ];
  const top = all.reduce<SearchResult | null>((best, result) => {
    if (!best) return result;
    if (result.score > best.score) return result;
    if (
      result.score === best.score &&
      TYPE_PRIORITY[result.type] < TYPE_PRIORITY[best.type]
    ) {
      return result;
    }
    return best;
  }, null);

  return {
    query,
    books: bookResults,
    authors: authorResults,
    categories: categoryResults,
    chapters: chapterResults,
    total: all.length,
    top,
  };
}

/* ── Suggestions (empty-state fodder) ────────────────────────────────────── */

export interface CategorySuggestion {
  name: string;
  slug: string;
  bookCount: number;
  href: string;
}

/** The catalogue's categories, most-populated first — grows with the data. */
export function collectCategories(books: KathaBook[]): CategorySuggestion[] {
  const counts = new Map<string, { name: string; bookCount: number }>();
  for (const book of books) {
    const key = foldText(book.category);
    const existing = counts.get(key);
    if (existing) existing.bookCount += 1;
    else counts.set(key, { name: book.category, bookCount: 1 });
  }
  return [...counts.values()]
    .sort((a, b) => b.bookCount - a.bookCount || a.name.localeCompare(b.name))
    .map(({ name, bookCount }) => ({
      name,
      slug: slugifyCategory(name),
      bookCount,
      href: `/library?genre=${slugifyCategory(name)}`,
    }));
}
