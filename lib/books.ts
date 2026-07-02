/* ---------------------------------------------------------------------------
 * KATHA · Data layer
 * lib/books.ts
 *
 * The single source of truth for book + chapter data. Framework-agnostic:
 * no React, no Next.js — just types, the in-memory catalogue, and pure lookup
 * helpers. UI surfaces (library, book details, reader) import from here.
 *
 * Static sample data for now. Every export keeps the same shape a real source
 * would return, so swapping the helper bodies for `await prisma.book.*` later
 * needs no change at any call site.
 * ------------------------------------------------------------------------- */

export interface KathaChapter {
  /** 1-based position within the book. */
  number: number;
  /** URL-safe identifier, unique within a book (the [chapter] route segment). */
  slug: string;
  title: string;
  /** Whole minutes at ~200 wpm, derived from `content`. */
  estimatedReadingTime: number;
  /** Ordered paragraphs of body text. */
  content: string[];
}

export interface KathaBook {
  /** URL-safe identifier, unique across the catalogue (the [slug] route segment). */
  slug: string;
  title: string;
  author: string;
  category: string;
  language: string;
  status: string;
  updated: string;
  synopsis: string;
  chapters: KathaChapter[];
}

/* -- Internal helpers ------------------------------------------------------ */

const WORDS_PER_MINUTE = 200;

function estimateReadingTime(content: string[]): number {
  const words = content.join(' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Stamps `number` + `estimatedReadingTime` onto authored chapter data so those
 *  fields can never drift out of sync with order or content. */
type AuthoredChapter = Pick<KathaChapter, 'slug' | 'title' | 'content'>;

function buildChapters(authored: AuthoredChapter[]): KathaChapter[] {
  return authored.map((chapter, index) => ({
    number: index + 1,
    slug: chapter.slug,
    title: chapter.title,
    estimatedReadingTime: estimateReadingTime(chapter.content),
    content: chapter.content,
  }));
}

/* -- Sample content (placeholder prose, shared across chapters for now) ----- */

const SAMPLE_CONTENT: string[] = [
  'The house had not changed, and that was the worst of it. The same blue gate, swollen from the rain, still caught on the second push. The same smell of salt and old wood waited in the hall, patient as a relative.',
  'Ligaya set down her bag and listened. Somewhere above her a window had been left open, and the sea came through it the way it always had — not loud, only constant, the sound of something that had decided long ago to stay.',
  'She had told herself she would not look for the letters. She had told herself many things on the long ride north, and the town had believed none of them. By the time the jeepney let her off at the corner, every promise had quietly dissolved into the heat.',
  "In the kitchen, her mother's handwriting still curled across a list pinned by the door. Mangoes. Candles. A name, half-erased, that Ligaya did not let herself read twice.",
  'Outside, the afternoon leaned gold against the walls. It was the last summer the house would be theirs, though no one had said so yet, and the saying of it waited in every room like a held breath.',
  'She climbed the stairs slowly, the way you approach something you have already lost. At the top, the drawer was where it had always been. She knelt, the wood gave its small familiar complaint, and she began.',
  'What she found there was not what she expected, and yet it was exactly what she had come for. The paper had yellowed at the edges; the ink had held. She read the first line, and the years folded shut around her like water closing over a stone.',
  'For a long while she did not move. The light shifted across the floor. The sea kept its old appointment with the shore. And in the quiet, the last summer finally began.',
];

/* -- Catalogue ------------------------------------------------------------- */

const ANG_HULING_TAG_ARAW: KathaBook = {
  slug: 'ang-huling-tag-araw',
  title: 'Ang Huling Tag-araw',
  author: 'Lakambini Reyes',
  category: 'Literary Fiction',
  language: 'Filipino / English',
  status: 'Ongoing',
  updated: 'This week',
  synopsis:
    'A tender literary novel about memory, family, and the final summer before everything changes. Set between Manila and a quiet coastal town, Ang Huling Tag-araw follows a young woman returning home to confront old letters, unfinished grief, and the kind of love that never fully leaves.',
  chapters: buildChapters([
    { slug: 'the-letter-beneath-the-drawer', title: 'The Letter Beneath the Drawer', content: SAMPLE_CONTENT },
    { slug: 'a-house-facing-the-sea', title: 'A House Facing the Sea', content: SAMPLE_CONTENT },
    { slug: 'mangoes-in-the-afternoon', title: 'Mangoes in the Afternoon', content: SAMPLE_CONTENT },
    { slug: 'the-name-we-never-said', title: 'The Name We Never Said', content: SAMPLE_CONTENT },
    { slug: 'rain-over-manila', title: 'Rain Over Manila', content: SAMPLE_CONTENT },
    { slug: 'what-summer-remembered', title: 'What Summer Remembered', content: SAMPLE_CONTENT },
    { slug: 'the-last-blue-morning', title: 'The Last Blue Morning', content: SAMPLE_CONTENT },
  ]),
};

/** The catalogue, keyed by book slug. Add further KathaBook entries here and the
 *  helpers below (and any related shelves) pick them up automatically. */
export const BOOKS: Record<string, KathaBook> = {
  [ANG_HULING_TAG_ARAW.slug]: ANG_HULING_TAG_ARAW,
};

/* -- Lookups --------------------------------------------------------------- */

export function getBookBySlug(slug: string): KathaBook | undefined {
  return BOOKS[slug];
}

/** Every book in the catalogue, in catalogue order. */
export function getAllBooks(): KathaBook[] {
  return Object.values(BOOKS);
}

export function getChapterBySlug(
  bookSlug: string,
  chapterSlug: string,
): KathaChapter | undefined {
  return getBookBySlug(bookSlug)?.chapters.find(
    (chapter) => chapter.slug === chapterSlug,
  );
}

/** Every other book in the catalogue. Caller decides how many to show. */
export function getRelatedBooks(currentSlug: string): KathaBook[] {
  return Object.values(BOOKS).filter((book) => book.slug !== currentSlug);
}