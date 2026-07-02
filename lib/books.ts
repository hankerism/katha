/* ---------------------------------------------------------------------------
 * KATHA · Data layer
 * lib/books.ts
 *
 * The single source of truth for book + chapter data. Framework-agnostic:
 * no React, no Next.js — just types, the in-memory catalogue, and pure lookup
 * helpers. UI surfaces (library, book details, reader, search) import from
 * here and NEVER carry their own book arrays.
 *
 * Static sample data for now, shaped for a real source later:
 *   · KathaBook is plain, serializable data (strings, numbers, arrays) — a
 *     JSON payload or a database row set can satisfy it directly.
 *   · The catalogue is authored as an ARRAY and keyed into a record by slug;
 *     swapping `AUTHORED_BOOKS` for `JSON.parse(...)` or a query result is a
 *     one-line change.
 *   · Derived fields (chapter number, reading time) are stamped by
 *     buildChapters() — the same transform a loader would run on raw rows —
 *     so authored data never drifts out of sync.
 *   · Every helper is a function over the record; call sites need no change
 *     when the bodies become `await prisma.book.*`.
 * ------------------------------------------------------------------------- */

import { slugifyCategory } from './text';

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
  /** Stable foreign key into the Author domain (lib/authors.ts). Books carry
   *  ONLY this reference — name, bio, and other author metadata are joined by
   *  the selector layer (lib/author-selectors.ts), never duplicated here. */
  authorId: string;
  category: string;
  language: string;
  status: string;
  updated: string;
  synopsis: string;
  /** Editorial pick — surfaces on the featured shelves. */
  featured?: boolean;
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

/* -- Sample content --------------------------------------------------------
 * Placeholder prose, one distinct voice per book, shared across that book's
 * chapters for now. Kept short on purpose: enough for the reader to feel the
 * register of each title, cheap to replace with real chapters later.
 * -------------------------------------------------------------------------- */

/** Ang Huling Tag-araw — quiet literary fiction; memory, salt air, held breath. */
const TAG_ARAW_CONTENT: string[] = [
  'The house had not changed, and that was the worst of it. The same blue gate, swollen from the rain, still caught on the second push. The same smell of salt and old wood waited in the hall, patient as a relative.',
  'Ligaya set down her bag and listened. Somewhere above her a window had been left open, and the sea came through it the way it always had — not loud, only constant, the sound of something that had decided long ago to stay.',
  'She had told herself she would not look for the letters. She had told herself many things on the long ride north, and the town had believed none of them. By the time the jeepney let her off at the corner, every promise had quietly dissolved into the heat.',
  "In the kitchen, her mother's handwriting still curled across a list pinned by the door. Mangoes. Candles. A name, half-erased, that Ligaya did not let herself read twice.",
  'Outside, the afternoon leaned gold against the walls. It was the last summer the house would be theirs, though no one had said so yet, and the saying of it waited in every room like a held breath.',
  'She climbed the stairs slowly, the way you approach something you have already lost. At the top, the drawer was where it had always been. She knelt, the wood gave its small familiar complaint, and she began.',
  'What she found there was not what she expected, and yet it was exactly what she had come for. The paper had yellowed at the edges; the ink had held. She read the first line, and the years folded shut around her like water closing over a stone.',
  'For a long while she did not move. The light shifted across the floor. The sea kept its old appointment with the shore. And in the quiet, the last summer finally began.',
];

/** Mga Liham sa Dilim — spare lyric fragments; letters addressed to the dark. */
const LIHAM_CONTENT: string[] = [
  'Dear dark: tonight the brownout took the whole street, and for once the city and I were the same shade.',
  'I write to you the way one writes to an old teacher — carefully, and about everything except the thing.',
  'The candle knows only one word and says it all night. Somewhere a tricycle passes, carrying its little cone of light like a secret it intends to spill.',
  'You have held my grandmother, the last page of every notebook, and the space between the last jeepney and the first bird. Hold this, too.',
  'When the power returns, the neighbors cheer. I do not. Some letters can only be finished in your ink.',
];

/** Ang Bahay sa Buwan — magical realism; impossible things, stated plainly. */
const BUWAN_CONTENT: string[] = [
  'On the first night of every full moon, the house went to the moon, and the family had learned to plan around it, the way other families plan around the tide.',
  'Lola Remedios kept a list taped inside the pantry: water the orchids twice, cover the mirrors, leave a window open for the house to breathe on the way up. Nobody remembered who wrote the list. The handwriting changed when no one was looking.',
  'From the moon, Manila was a spill of lamplight on a dark table, and their street was the smallest coin in it. Tonio liked to sit on the roof during the crossing and name the things that could not be named from the ground.',
  'The neighbors never mentioned the absences. A house has its errands, Aling Corazon said, sweeping her steps, and everyone found this reasonable.',
  'What worried the family was never the leaving. It was that one morning, unpacking sunlight in the kitchen, they might find the house had grown fond of the quiet up there — and had begun, in small ways, to pack.',
];

/** Sa Ilalim ng Sampaguita — warm romance; banter over a flower stall. */
const SAMPAGUITA_CONTENT: string[] = [
  'The first thing Marisol ever sold him was a garland he did not want. "For your girlfriend," she said. "I don\'t have one," said Elias. "For your luck, then," she said. "You clearly need it."',
  'He came back the next Friday, and the one after that, until the sampaguita stall by the church steps had quietly become the fixed point around which his week arranged itself.',
  "She talked while she strung the buds — about the flower farms in Laguna, about her brother's tuition, about how rain was good for business because guilt, like jasmine, opens in bad weather. He mostly listened. He was good at that, and she noticed.",
  '"You buy flowers every week," she said once, tying off a garland, "and you give them to no one. I checked." Elias held the white loop of blossoms like a small verdict. "They\'re for the vendor," he said, before he could stop himself.',
  'The church bells counted six. Neither of them moved. Between them the sampaguita did what it always does at dusk — it opened, unhurried, certain it would be forgiven for taking its time.',
];

/** Huling Tren Pauwi — wry urban vignettes from the last train home. */
const TREN_CONTENT: string[] = [
  'The 11:42 is the most honest train in the city. By then everyone has run out of the face they wear for work, and what boards at Ayala is simply people.',
  'A man in a barong holds a cake box like a sleeping child. The cake says HAPPY 60TH ESTELITA. He has missed the party; the cake has not. There is a whole novel in how carefully he holds it.',
  'Two nurses compare blisters at Guadalupe. A student rehearses an apology into her phone camera, deletes it, rehearses a worse one, keeps that. The aircon drips its one cold comma onto the same lucky seat.',
  'At Boni, the doors open on no one. The platform stands there like an unanswered question. The train waits its polite three seconds, gives up, and goes on — which is, if you think about it, most of adulthood.',
  'The announcement says the next station is the last station. It always says this as though it were news. Around the carriage, the city\'s tired children stir and gather their bags — home, whatever that means tonight, is about to be true again.',
];

/** Mga Tala sa Ulan — first-person YA; rain-season notes, earnest and quick. */
const ULAN_CONTENT: string[] = [
  "Tita Ines says I should write things down instead of saying them out loud at the worst possible moment, so fine. This is me, writing things down. Notebook, don't fail me.",
  "Fact one: it has rained for eleven days straight, which is also exactly how long Migs hasn't replied to my message. I am NOT saying these things are connected. I am saying the universe lacks subtlety.",
  'Fact two: when classes got suspended, the whole barangay turned into one big kwentuhan under the sari-sari store awning, and I learned more about our neighbors in one afternoon than in fifteen years of living here. Rain is basically a group chat.',
  "Fact three, and I'm only writing this because notebooks can't laugh: I don't actually mind the flood walks home. Shoes in one hand, umbrella in the other, the water warm as soup. It's the only time of day nobody expects me to be anything.",
  "The rain on the roof does this thing at night where it goes from applause to whisper, like even the sky eventually runs out of announcements and just wants to talk. Same, sky. Same.",
];

/** Bayan ng mga Alon — historical fiction; a coastal town, 1898, formal cadence. */
const ALON_CONTENT: string[] = [
  'In the year the ships changed flags, the town of San Isidro de las Olas kept, as it had always kept, two calendars: the one the friars printed, and the one the sea wrote nightly along the shore.',
  'Capitán Anselmo read the proclamation aloud on the steps of the tribunal, his voice steady, his hands not. The words were grand and foreign. The fishermen listened with the patience of men who knew that no decree had ever moved a tide.',
  'In the convent kitchen, Sister Clara hid the parish records inside a rice jar — births, deaths, marriages, the modest arithmetic of a people — reasoning that whoever ruled next would want the numbers, and whoever wanted the numbers could be made to wait.',
  'The young men went to the hills with bolos and two rifles between twelve of them. Their mothers watched them climb until the trees took them, then turned back to the nets, because grief in San Isidro had always been mended the way sails were: quickly, and before the next weather.',
  'Years later, the historians would write that the town had played no great part in the war. The town would not dispute this. It had been busy surviving, which is the part history assigns to almost everyone.',
];

/** Ang Mahiwagang Estasyon — portal fantasy; a station between weathers. */
const ESTASYON_CONTENT: string[] = [
  'The station appears only to those who have missed something important — a train, a person, a version of their life — and it accepts exactly one kind of fare: a memory you are willing to never have back.',
  'Odessa paid with the smell of her father\'s workshop and stepped onto the platform, where the departures board flickered through destinations no map had agreed to: The Rainy Year. The City of Doors. Home, But Earlier.',
  'The stationmaster was a heron in a conductor\'s coat, or a man with a heron\'s patience; the light could not decide and the light had clearly stopped trying years ago. "One way," he said. It was not a question. It never was.',
  'Between platforms, vendors sold what travelers between worlds actually need: bottled courage in three sizes, umbrellas that opened into rooms for the night, string bags of last words, still warm.',
  'The train arrived the way sleep does — all at once, from nowhere, having been coming the whole time. Odessa chose a window seat. Behind the glass, the station began, gently and completely, to forget her.',
];

/* -- Catalogue ------------------------------------------------------------- */

/** Authored as an array (a JSON payload / query result satisfies this shape
 *  directly); keyed into the record below. Order here is catalogue order. */
const AUTHORED_BOOKS: KathaBook[] = [
  {
    slug: 'ang-huling-tag-araw',
    title: 'Ang Huling Tag-araw',
    authorId: 'auth-lakambini-reyes',
    category: 'Literary Fiction',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'This week',
    featured: true,
    synopsis:
      'A tender literary novel about memory, family, and the final summer before everything changes. Set between Manila and a quiet coastal town, Ang Huling Tag-araw follows a young woman returning home to confront old letters, unfinished grief, and the kind of love that never fully leaves.',
    chapters: buildChapters([
      { slug: 'the-letter-beneath-the-drawer', title: 'The Letter Beneath the Drawer', content: TAG_ARAW_CONTENT },
      { slug: 'a-house-facing-the-sea', title: 'A House Facing the Sea', content: TAG_ARAW_CONTENT },
      { slug: 'mangoes-in-the-afternoon', title: 'Mangoes in the Afternoon', content: TAG_ARAW_CONTENT },
      { slug: 'the-name-we-never-said', title: 'The Name We Never Said', content: TAG_ARAW_CONTENT },
      { slug: 'rain-over-manila', title: 'Rain Over Manila', content: TAG_ARAW_CONTENT },
      { slug: 'what-summer-remembered', title: 'What Summer Remembered', content: TAG_ARAW_CONTENT },
      { slug: 'the-last-blue-morning', title: 'The Last Blue Morning', content: TAG_ARAW_CONTENT },
    ]),
  },
  {
    slug: 'mga-liham-sa-dilim',
    title: 'Mga Liham sa Dilim',
    authorId: 'auth-j-salvador',
    category: 'Poetry',
    language: 'Filipino / English',
    status: 'Completed',
    updated: 'Last month',
    featured: true,
    synopsis:
      'A slim cycle of prose poems written as letters to the dark — brownouts, candlelight, the hour after the last jeepney. J. Salvador turns the nightly failures of the grid into a correspondence with everything the light leaves out.',
    chapters: buildChapters([
      { slug: 'unang-liham', title: 'Unang Liham', content: LIHAM_CONTENT },
      { slug: 'kandila', title: 'Kandila', content: LIHAM_CONTENT },
      { slug: 'ang-hindi-nasabi', title: 'Ang Hindi Nasabi', content: LIHAM_CONTENT },
      { slug: 'brownout', title: 'Brownout', content: LIHAM_CONTENT },
      { slug: 'huling-liham', title: 'Huling Liham', content: LIHAM_CONTENT },
    ]),
  },
  {
    slug: 'ang-bahay-sa-buwan',
    title: 'Ang Bahay sa Buwan',
    authorId: 'auth-noemi-bautista',
    category: 'Magical Realism',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'This week',
    featured: true,
    synopsis:
      'Once a month, on the full moon, the Salazar house quietly leaves for the moon and comes back by morning. A family saga told in lunar cycles, about the errands of houses, the habits of grief, and what it costs a home to love the quiet.',
    chapters: buildChapters([
      { slug: 'ang-listahan-sa-paminggalan', title: 'Ang Listahan sa Paminggalan', content: BUWAN_CONTENT },
      { slug: 'unang-paglalakbay', title: 'Unang Paglalakbay', content: BUWAN_CONTENT },
      { slug: 'ang-bubong-ni-tonio', title: 'Ang Bubong ni Tonio', content: BUWAN_CONTENT },
      { slug: 'mga-kapitbahay', title: 'Mga Kapitbahay', content: BUWAN_CONTENT },
      { slug: 'ang-bahay-na-nagbabalot', title: 'Ang Bahay na Nagbabalot', content: BUWAN_CONTENT },
      { slug: 'pagbabalik-sa-umaga', title: 'Pagbabalik sa Umaga', content: BUWAN_CONTENT },
    ]),
  },
  {
    slug: 'sa-ilalim-ng-sampaguita',
    title: 'Sa Ilalim ng Sampaguita',
    authorId: 'auth-clara-mendoza',
    category: 'Romance',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: '3 days ago',
    featured: true,
    synopsis:
      'Every Friday, Elias buys a garland he gives to no one from the sampaguita stall by the church steps. A slow, warm romance about flowers sold at dusk, tuition arithmetic, and the courage it takes to say who the flowers are for.',
    chapters: buildChapters([
      { slug: 'ang-unang-kwintas', title: 'Ang Unang Kwintas', content: SAMPAGUITA_CONTENT },
      { slug: 'biyernes', title: 'Biyernes', content: SAMPAGUITA_CONTENT },
      { slug: 'mga-bulaklak-ng-laguna', title: 'Mga Bulaklak ng Laguna', content: SAMPAGUITA_CONTENT },
      { slug: 'para-kanino', title: 'Para Kanino', content: SAMPAGUITA_CONTENT },
      { slug: 'anim-na-kampana', title: 'Anim na Kampana', content: SAMPAGUITA_CONTENT },
      { slug: 'pagbubukas', title: 'Pagbubukas', content: SAMPAGUITA_CONTENT },
    ]),
  },
  {
    slug: 'huling-tren-pauwi',
    title: 'Huling Tren Pauwi',
    authorId: 'auth-rafael-lim',
    category: 'Short Stories',
    language: 'Filipino / English',
    status: 'Completed',
    updated: '2 weeks ago',
    synopsis:
      'Linked vignettes from the 11:42 — the last train home. A cake missing its party, nurses comparing blisters, a rehearsed apology that gets worse on purpose. Rafael Lim rides the length of the line and finds the whole city in one carriage.',
    chapters: buildChapters([
      { slug: 'ang-11-42', title: 'Ang 11:42', content: TREN_CONTENT },
      { slug: 'ang-keyk-ni-estelita', title: 'Ang Keyk ni Estelita', content: TREN_CONTENT },
      { slug: 'guadalupe', title: 'Guadalupe', content: TREN_CONTENT },
      { slug: 'walang-sumakay-sa-boni', title: 'Walang Sumakay sa Boni', content: TREN_CONTENT },
      { slug: 'huling-estasyon', title: 'Huling Estasyon', content: TREN_CONTENT },
    ]),
  },
  {
    slug: 'mga-tala-sa-ulan',
    title: 'Mga Tala sa Ulan',
    authorId: 'auth-isa-navarro',
    category: 'Young Adult',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'Yesterday',
    synopsis:
      'Eleven straight days of rain, one unanswered message, and a notebook that cannot laugh. A rainy-season diary about class suspensions, sari-sari store kwentuhan, and figuring out who you are when nobody expects you to be anything.',
    chapters: buildChapters([
      { slug: 'notebook-huwag-mo-akong-bibiguin', title: 'Notebook, Huwag Mo Akong Bibiguin', content: ULAN_CONTENT },
      { slug: 'fact-one', title: 'Fact One', content: ULAN_CONTENT },
      { slug: 'walang-pasok', title: 'Walang Pasok', content: ULAN_CONTENT },
      { slug: 'baha-sa-uwian', title: 'Baha sa Uwian', content: ULAN_CONTENT },
      { slug: 'ang-bubong-sa-gabi', title: 'Ang Bubong sa Gabi', content: ULAN_CONTENT },
    ]),
  },
  {
    slug: 'bayan-ng-mga-alon',
    title: 'Bayan ng mga Alon',
    authorId: 'auth-tomas-reyes',
    category: 'Historical Fiction',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'Last week',
    synopsis:
      'San Isidro de las Olas, 1898: the ships change flags, the proclamations change hands, and a fishing town keeps its two calendars — the printed one and the one the sea writes nightly. A novel about the people history assigns to surviving.',
    chapters: buildChapters([
      { slug: 'dalawang-kalendaryo', title: 'Dalawang Kalendaryo', content: ALON_CONTENT },
      { slug: 'ang-proklamasyon', title: 'Ang Proklamasyon', content: ALON_CONTENT },
      { slug: 'ang-banga-ng-bigas', title: 'Ang Banga ng Bigas', content: ALON_CONTENT },
      { slug: 'sa-kabundukan', title: 'Sa Kabundukan', content: ALON_CONTENT },
      { slug: 'ang-isinulat-ng-dagat', title: 'Ang Isinulat ng Dagat', content: ALON_CONTENT },
      { slug: 'pagkatapos-ng-digma', title: 'Pagkatapos ng Digma', content: ALON_CONTENT },
    ]),
  },
  {
    slug: 'ang-mahiwagang-estasyon',
    title: 'Ang Mahiwagang Estasyon',
    authorId: 'auth-mila-cruz',
    category: 'Fantasy',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'This week',
    synopsis:
      'The station appears only to those who have missed something important, and the fare is a memory you will never have back. Odessa pays, boards, and learns what the departures board means by "Home, But Earlier." A portal fantasy about what travel costs.',
    chapters: buildChapters([
      { slug: 'ang-pamasahe', title: 'Ang Pamasahe', content: ESTASYON_CONTENT },
      { slug: 'ang-tagapamahala', title: 'Ang Tagapamahala', content: ESTASYON_CONTENT },
      { slug: 'mga-tindahan-sa-plataporma', title: 'Mga Tindahan sa Plataporma', content: ESTASYON_CONTENT },
      { slug: 'home-but-earlier', title: 'Home, But Earlier', content: ESTASYON_CONTENT },
      { slug: 'ang-bintana', title: 'Ang Bintana', content: ESTASYON_CONTENT },
    ]),
  },
];

/** The catalogue, keyed by book slug. Swap AUTHORED_BOOKS for a fetched
 *  payload and everything downstream — helpers, shelves, search — follows. */
export const BOOKS: Record<string, KathaBook> = Object.fromEntries(
  AUTHORED_BOOKS.map((book) => [book.slug, book]),
);

/* -- Lookups --------------------------------------------------------------- */

export function getBookBySlug(slug: string): KathaBook | undefined {
  return BOOKS[slug];
}

export function getChapterBySlug(
  bookSlug: string,
  chapterSlug: string,
): KathaChapter | undefined {
  return getBookBySlug(bookSlug)?.chapters.find(
    (chapter) => chapter.slug === chapterSlug,
  );
}

/** Every book in the catalogue, in catalogue order. */
export function getAllBooks(): KathaBook[] {
  return Object.values(BOOKS);
}

/** Lightweight projection for the client-side search engine: everything the
 *  engine matches on (title, authorId, category, chapter titles) and none of
 *  the prose — so full book content never ships in the browser bundle.
 *  Structurally satisfies lib/search.ts's SearchableBook. */
export interface BookSearchRecord {
  slug: string;
  title: string;
  authorId: string;
  category: string;
  chapters: Array<{ number: number; slug: string; title: string }>;
}

export function getSearchIndex(): BookSearchRecord[] {
  return getAllBooks().map((book) => ({
    slug: book.slug,
    title: book.title,
    authorId: book.authorId,
    category: book.category,
    chapters: book.chapters.map(({ number, slug, title }) => ({
      number,
      slug,
      title,
    })),
  }));
}

/** Editorial picks for the featured shelves, in catalogue order. */
export function getFeaturedBooks(): KathaBook[] {
  return getAllBooks().filter((book) => book.featured);
}

/** Books whose category matches the given slug (the `/library?genre=` value).
 *  Matching is slug-based so URLs never depend on display casing. */
export function getBooksByCategory(categorySlug: string): KathaBook[] {
  return getAllBooks().filter(
    (book) => slugifyCategory(book.category) === categorySlug,
  );
}

/** Every other book in the catalogue. Caller decides how many to show. */
export function getRelatedBooks(currentSlug: string): KathaBook[] {
  return getAllBooks().filter((book) => book.slug !== currentSlug);
}
