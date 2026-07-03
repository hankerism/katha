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
  /** ISO date the book joined the shelves — displayed as "Published …". */
  publishedAt: string;
  /** Cover image URL (/covers/*.svg for the catalogue; a data URL for
   *  Studio-uploaded covers). Null → the branded placeholder cover. */
  cover: string | null;
  synopsis: string;
  /** Editorial pick — surfaces on the featured shelves. */
  featured?: boolean;
  /** How many opening chapters guests may read (the free preview). Absent →
   *  DEFAULT_FREE_CHAPTERS. Authors will set this per work in the Studio. */
  freeChapters?: number;
  chapters: KathaChapter[];
}

export const DEFAULT_FREE_CHAPTERS = 1;

/** Is this chapter part of the book's free preview? The ONE answer the
 *  reader gate, the Studio preview, and the future server-side gate share. */
export function isChapterFree(
  book: Pick<KathaBook, 'freeChapters'>,
  chapterNumber: number,
): boolean {
  return chapterNumber <= (book.freeChapters ?? DEFAULT_FREE_CHAPTERS);
}

/* -- Internal helpers ------------------------------------------------------ */

const WORDS_PER_MINUTE = 200;

function estimateReadingTime(content: string[]): number {
  const words = content.join(' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Stamps `number` + `estimatedReadingTime` onto authored chapter data so those
 *  fields can never drift out of sync with order or content. Exported: the
 *  Author Studio runs the SAME transform when turning a draft into a book, so
 *  derivation is never duplicated. */
export type AuthoredChapter = Pick<KathaChapter, 'slug' | 'title' | 'content'>;

export function buildChapters(authored: AuthoredChapter[]): KathaChapter[] {
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

/** Ang Huling Tag-araw, Chapter One — the full opening. */
const TAG_ARAW_OPENING: string[] = [
  'The bus let Ligaya off at the mercado at a quarter past four, into the exact heat she had spent eleven years describing to people who had never felt it. Manila heat pressed down, she always said; the heat here leaned. It put an arm around your shoulders like an uncle at a wake and did not let go until you agreed to stay.',
  'Nothing on the walk to the house had the decency to be different. The tailor shop still had the same sun-bleached barong in the window, faded now to the color of weak tea. The basketball court still had one netless ring. Somewhere behind the chapel someone was still, after all these years, learning the same four chords on a badly tuned guitar.',
  'She had come home for the signing of papers. That was the sentence she had practiced on the bus, the sentence she planned to say briskly at the door — I am here for the papers, Tita, nothing else — as if grief were a parcel one could refuse by declining to acknowledge the deliveryman.',
  'The house had not changed, and that was the worst of it. The same blue gate, swollen from the rain, still caught on the second push. The same smell of salt and old wood waited in the hall, patient as a relative. Houses forget nothing; that is what they are for.',
  'Ligaya set down her bag and listened. Somewhere above her a window had been left open, and the sea came through it the way it always had — not loud, only constant, the sound of something that had decided long ago to stay.',
  "In the kitchen, her mother's handwriting still curled across a list pinned by the door. Mangoes. Candles. A name, half-erased, that Ligaya did not let herself read twice. She stood in front of that list the way people stand in front of paintings in museums, at the respectful distance we reserve for things that can no longer be touched.",
  'The kettle was where kettles are. The cups were where cups are. Her hands made coffee without consulting her, and she drank it standing up, looking out at the yard where the santol tree had grown wider and lower, like everyone else she knew.',
  'She had told herself she would not look for the letters. She had told herself many things on the long ride north, and the town had believed none of them. Promises made on buses are the cheapest currency there is; every town along the coast knows the exchange rate.',
  'Upstairs, the afternoon leaned gold against the walls. It was the last summer the house would be theirs, though no one had said so yet, and the saying of it waited in every room like a held breath.',
  'She climbed the stairs slowly, the way you approach something you have already lost. At the top, the drawer was where it had always been. She knelt, the wood gave its small familiar complaint, and she began.',
  'What she found there was not what she expected, and yet it was exactly what she had come for. The paper had yellowed at the edges; the ink had held. Her mother had written the first line the way she began all difficult things — with the date, as if time could be made to take some of the responsibility.',
  'Ligaya read the first line, and the years folded shut around her like water closing over a stone. Below the window, the sea kept its old appointment with the shore. And in the quiet, the last summer finally began.',
];

/** Mga Liham sa Dilim — spare lyric fragments; letters addressed to the dark. */
const LIHAM_CONTENT: string[] = [
  'Dear dark: tonight the brownout took the whole street, and for once the city and I were the same shade.',
  'I write to you the way one writes to an old teacher — carefully, and about everything except the thing.',
  'The candle knows only one word and says it all night. Somewhere a tricycle passes, carrying its little cone of light like a secret it intends to spill.',
  'You have held my grandmother, the last page of every notebook, and the space between the last jeepney and the first bird. Hold this, too.',
  'When the power returns, the neighbors cheer. I do not. Some letters can only be finished in your ink.',
];

/** Mga Liham sa Dilim, Unang Liham — the full opening. */
const LIHAM_OPENING: string[] = [
  'Dear dark: tonight the brownout took the whole street, and for once the city and I were the same shade.',
  'You should know I have been meaning to write for years. Every evening the fluorescent light came on at six and I lost my nerve. Brightness is a kind of small talk. It fills the room so nothing true can get a word in.',
  'I write to you the way one writes to an old teacher — carefully, and about everything except the thing.',
  'Here is what the neighborhood does when you arrive: Aling Nena lights the emergency lamp she has owned since the Marcos years and sets it in the window, not for herself, but so the street has somewhere to look. The Delgado twins begin their concert of complaints. Someone, somewhere, laughs the specific laugh of a person losing at cards in the dark.',
  'The candle knows only one word and says it all night. Somewhere a tricycle passes, carrying its little cone of light like a secret it intends to spill.',
  'My mother used to say the dark was for sleeping. My father used to say it was for praying. They were both wrong, or both right, which in a marriage is the same thing. The dark is for the sentences that cannot survive being seen while they are said.',
  'You have held my grandmother, the last page of every notebook, and the space between the last jeepney and the first bird. Hold this, too.',
  'I am not afraid of you. I want that on the record, here, in ink you cannot read. What I am afraid of is the moment the lights return and I go back to being the person the light expects.',
  'When the power comes back, the neighbors will cheer, and the street will forget it was briefly one long room where everyone lived together. I will not cheer. Some letters can only be finished in your ink, and I am not finished.',
  'Yours, in the meantime — which is the only time there is.',
];

/** Ang Bahay sa Buwan — magical realism; impossible things, stated plainly. */
const BUWAN_CONTENT: string[] = [
  'On the first night of every full moon, the house went to the moon, and the family had learned to plan around it, the way other families plan around the tide.',
  'Lola Remedios kept a list taped inside the pantry: water the orchids twice, cover the mirrors, leave a window open for the house to breathe on the way up. Nobody remembered who wrote the list. The handwriting changed when no one was looking.',
  'From the moon, Manila was a spill of lamplight on a dark table, and their street was the smallest coin in it. Tonio liked to sit on the roof during the crossing and name the things that could not be named from the ground.',
  'The neighbors never mentioned the absences. A house has its errands, Aling Corazon said, sweeping her steps, and everyone found this reasonable.',
  'What worried the family was never the leaving. It was that one morning, unpacking sunlight in the kitchen, they might find the house had grown fond of the quiet up there — and had begun, in small ways, to pack.',
];

/** Ang Bahay sa Buwan, Chapter One — the full opening. */
const BUWAN_OPENING: string[] = [
  'On the first night of every full moon, the house went to the moon, and the family had learned to plan around it, the way other families plan around the tide.',
  'It was not discussed outside the family, in the way that money and certain cousins are not discussed. If a visitor happened to stay late on a crossing night, Lola Remedios would simply serve the good biscuits and remark that the guest looked tired, and the guest, understanding nothing but feeling everything, would go home.',
  'Lola Remedios kept a list taped inside the pantry: water the orchids twice, cover the mirrors, leave a window open for the house to breathe on the way up. Nobody remembered who wrote the list. The handwriting changed when no one was looking.',
  'Preparation took most of the afternoon. The jars were turned label-inward, because the house was vain about how it looked from outside. The rice was moved to the low shelf, since gravity, Lola said, was a habit more than a law, and habits loosen when you travel.',
  'Tonio, who was eleven that year and therefore responsible for the questions no one else would ask, wanted to know why the house went at all. His mother said houses need to get away like anyone. His father said it was the land that left, technically. Lola Remedios said some houses are homesick for places they have never been, and hers happened to be one of them.',
  'The crossing itself was gentle. There was a feeling like the moment a jeepney stops being pushed and starts being driven, a soft gathering under the floorboards, and then the sound of the street — dogs, videoke, the barangay announcements — thinned out like a radio being carried into another room.',
  'From the moon, Manila was a spill of lamplight on a dark table, and their street was the smallest coin in it. Tonio liked to sit on the roof during the crossing and name the things that could not be named from the ground.',
  'Supper on the moon tasted the same, except the sinigang stayed hot longer, which Lola attributed to the absence of gossip, heat having fewer places to escape to.',
  'The neighbors never mentioned the absences. A house has its errands, Aling Corazon said, sweeping her steps, and everyone found this reasonable. In a country of typhoons and miracles, a traveling house was well within the ordinary shape of things.',
  'What worried the family was never the leaving. It was that one morning, unpacking sunlight in the kitchen, they might find the house had grown fond of the quiet up there — and had begun, in small ways, to pack.',
  'That morning was still far away, that first full moon of the year. But Tonio, on the roof with the whole bright world below him, had already noticed what the grown-ups had not: the house no longer waited for the moon to be entirely full before it started, quietly, to lean.',
];

/** Coffee After Five — Clara Mendoza; overtime hearts, one window table. */
const KAPE_CONTENT: string[] = [
  'The café had eleven tables, and ten of them were just furniture. The eleventh sat by the window, fit exactly two, and had opinions about who deserved it.',
  'Dani could tell time by the orders. Americanos meant morning people pretending. Milk tea meant students negotiating with deadlines. And at five-fifteen, without fail, one iced latte, less ice, extra shot — the walking contradiction himself.',
  '"You know that defeats the purpose of the ice," she said, every time. "The ice knows what it signed up for," said Marco, every time. This had been going on for four months. Neither of them had learned the other\'s surname. Both of them had memorized everything else.',
  'The Wi-Fi password changed weekly and Marco never once asked for it, which Dani noticed the way baristas notice everything: silently, and into the permanent record.',
  'At closing she stacked the chairs, and left the window table for last, always, the way you save the best sentence of a letter for the ending.',
];

const KAPE_OPENING: string[] = [
  'The thing nobody tells you about working the closing shift is that a café after five is a different establishment entirely. The morning crowd wants fuel. The afternoon crowd wants Wi-Fi. But the after-five crowd — the overtime survivors, the almost-home-but-not-yet people — they want somewhere to be a person again for thirty minutes, and Dani made coffee for THOSE people.',
  'He first came in on a Tuesday during the brownout of March, when the espresso machine was down and she was serving whatever could be brewed by stubbornness alone. He ordered an iced latte. She offered him tepid calamansi juice and her professional condolences. He stayed two hours anyway, doing spreadsheets by the light of a phone propped against the napkin dispenser.',
  '"We have electricity now," she told him the following Tuesday. "I noticed," he said, and sat at the same table — the window one, the one that fits exactly two — alone, in the seat facing the counter.',
  'Facing the counter. Dani filed that detail where she filed everything: under Later.',
  'His order stabilized by week three. Iced latte, less ice, extra shot, at five-fifteen, which any barista will tell you is the order of a man at war with his own schedule. "You know the extra shot cancels out the — " "Don\'t," said Marco. "Let me have this." She drew a small white flag in the foam. He did not notice, because it was an ICED latte, which she realized one full second after handing it over, and thought about for the rest of the shift.',
  'The café belonged to her tita, technically. Tita Baby appeared on Thursdays to disapprove of the pastry case and ask, with the subtlety of a jeepney horn, whether the nice five-fifteen boy had a girlfriend. "He has a laptop," said Dani. "Your uncle had a tricycle," said Tita Baby, as if this settled something. Somehow, it did.',
  'What Dani knew about Marco, four months in: junior architect. Overworked in the specific way of people who still believe the work will love them back. Took calls from his mother in Bicolano and his boss in a voice two keys lower. Tipped in exact, apologetic twenties. Read the sugar packets like they contained news.',
  'What Marco knew about Dani, four months in — and she would have been alarmed to learn the list was this long: made the foam patterns only when she thought no one was watching. Sang the last syllable of every song on the café playlist, just the last one. Kept a paperback under the register with a receipt for a bookmark, and the receipt never moved past page ninety.',
  'On the first Friday of July, at 5:14, the rain arrived the way deadlines do — all at once, out of a clear sky, unreasonable. At 5:15, the door chimed. Marco stood dripping on the mat, laptop bag held to his chest like an infant, and the café was full. Every table taken. Every table except the good one, the window one, where Dani had — for no reason she was prepared to defend in court — just set down a second chair.',
  '"Sit," she said. "I\'ll bring the usual." "You\'re busy." "It\'s the closing shift," said Dani. "Everything after five is extra." She would think about that sentence later, at home, at length, with her face in a pillow. Everything after five is extra. The table by the window said nothing, and fit, as advertised, exactly two.',
];

/** Huling Tren Pauwi — wry urban vignettes from the last train home. */
const TREN_CONTENT: string[] = [
  'The 11:42 is the most honest train in the city. By then everyone has run out of the face they wear for work, and what boards at Ayala is simply people.',
  'A man in a barong holds a cake box like a sleeping child. The cake says HAPPY 60TH ESTELITA. He has missed the party; the cake has not. There is a whole novel in how carefully he holds it.',
  'Two nurses compare blisters at Guadalupe. A student rehearses an apology into her phone camera, deletes it, rehearses a worse one, keeps that. The aircon drips its one cold comma onto the same lucky seat.',
  'At Boni, the doors open on no one. The platform stands there like an unanswered question. The train waits its polite three seconds, gives up, and goes on — which is, if you think about it, most of adulthood.',
  'The announcement says the next station is the last station. It always says this as though it were news. Around the carriage, the city\'s tired children stir and gather their bags — home, whatever that means tonight, is about to be true again.',
];

/** Huling Tren Pauwi, Ang 11:42 — the full opening. */
const TREN_OPENING: string[] = [
  'The 11:42 is the most honest train in the city. By then everyone has run out of the face they wear for work, and what boards at Ayala is simply people.',
  'I ride it for research, I tell myself, being a writer in the way that unemployed men with notebooks are writers. The truth is the fare is cheaper than aircon and lonelier than my apartment, and some nights you need a loneliness with other people in it.',
  'A man in a barong holds a cake box like a sleeping child. The cake says HAPPY 60TH ESTELITA. He has missed the party; the cake has not. There is a whole novel in how carefully he holds it, and I am not a good enough writer for that novel, so I will just tell you: he held it level through four stations, and at Buendia he checked the ribbon.',
  'Two nurses compare blisters at Guadalupe, professionally, the way carpenters compare thumbnails. They speak in the specialized tenderness of people who have spent twelve hours being tender for money and have some left over anyway, which is the mystery of nurses and has never once been explained.',
  'A student rehearses an apology into her phone camera, deletes it, rehearses a worse one, keeps that. I want to tell her the first draft was better. It is the oldest rule of apologies and of writing: the version with the shake in it is the true one.',
  'The aircon drips its one cold comma onto the same lucky seat. Regulars know the seat. We let tourists find it themselves; the city has few enough initiations left.',
  'At Boni, the doors open on no one. The platform stands there like an unanswered question. The train waits its polite three seconds, gives up, and goes on — which is, if you think about it, most of adulthood.',
  'Between Shaw and Ortigas the lights flicker, and for two seconds the whole carriage exists only in the window reflections — all of us doubled, hung out there over the city, the cake man and the nurses and the girl with her ruined apology, riding a train of light beside the real one.',
  'I have thought about that other train more than I should. The one made of reflections, where everyone is on time for the party and every apology is accepted. On bad weeks I nearly board it.',
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

/** Mga Tala sa Ulan, day one — the full opening. */
const ULAN_OPENING: string[] = [
  "Tita Ines says I should write things down instead of saying them out loud at the worst possible moment, so fine. This is me, writing things down. Notebook, don't fail me.",
  'For the record, this is not a diary. Diaries are for people with secrets. This is a WEATHER LOG that occasionally mentions people who are ruining my life. There is a difference and I will not be explaining it.',
  "Fact one: it has rained for eleven days straight, which is also exactly how long Migs hasn't replied to my message. I am NOT saying these things are connected. I am saying the universe lacks subtlety.",
  'The message, since you ask, notebook, was two words and one of them was "hey." You cannot get in trouble for "hey." Entire governments have survived on less. And yet.',
  'Fact two: when classes got suspended, the whole barangay turned into one big kwentuhan under the sari-sari store awning, and I learned more about our neighbors in one afternoon than in fifteen years of living here. Rain is basically a group chat.',
  'Today\'s headlines from the awning: Kuya Dodong\'s roof leaks in the shape of Mindanao. Aling Baby\'s cat has opinions about thunder. And Migs — this was reported BY HIS OWN SISTER, I did not ask, I want that noted — has been "moping and eating all the pandesal." Interesting. No further comment. (Notebook, that means I have SO much further comment.)',
  "Fact three, and I'm only writing this because notebooks can't laugh: I don't actually mind the flood walks home. Shoes in one hand, umbrella in the other, the water warm as soup. It's the only time of day nobody expects me to be anything.",
  'Mama says girls my age kept diaries in her day too, except hers got read by HER mama, which explains why Mama writes everything in a code of song lyrics to this day. When she is annoyed at Papa she hums. The whole house knows the discography.',
  'Fact four: I have decided that if the rain stops tomorrow, I will not check my phone until noon. This is called dignity. Tita Ines says dignity is just patience wearing lipstick. Tita Ines says a lot of things; that is what titas are for.',
  "The rain on the roof does this thing at night where it goes from applause to whisper, like even the sky eventually runs out of announcements and just wants to talk. Same, sky. Same.",
  'Day one of writing things down: complete. Nothing solved. Weirdly, everything lighter. Maybe Tita Ines is onto something. (Do NOT tell her, notebook. She is unbearable when she is right, which is always, which is unbearable.)',
];

/** Bayan ng mga Alon — historical fiction; a coastal town, 1898, formal cadence. */
const ALON_CONTENT: string[] = [
  'In the year the ships changed flags, the town of San Isidro de las Olas kept, as it had always kept, two calendars: the one the friars printed, and the one the sea wrote nightly along the shore.',
  'Capitán Anselmo read the proclamation aloud on the steps of the tribunal, his voice steady, his hands not. The words were grand and foreign. The fishermen listened with the patience of men who knew that no decree had ever moved a tide.',
  'In the convent kitchen, Sister Clara hid the parish records inside a rice jar — births, deaths, marriages, the modest arithmetic of a people — reasoning that whoever ruled next would want the numbers, and whoever wanted the numbers could be made to wait.',
  'The young men went to the hills with bolos and two rifles between twelve of them. Their mothers watched them climb until the trees took them, then turned back to the nets, because grief in San Isidro had always been mended the way sails were: quickly, and before the next weather.',
  'Years later, the historians would write that the town had played no great part in the war. The town would not dispute this. It had been busy surviving, which is the part history assigns to almost everyone.',
];

/** Bayan ng mga Alon, Chapter One — the full opening. */
const ALON_OPENING: string[] = [
  'In the year the ships changed flags, the town of San Isidro de las Olas kept, as it had always kept, two calendars: the one the friars printed, and the one the sea wrote nightly along the shore.',
  'By the printed calendar it was June of 1898, and the world, according to the proclamations that arrived folded inside cargo manifests, had been made new. By the sea\'s calendar it was the third week of the southwest monsoon, and the world was the same water asking the same questions of the same stones.',
  'The town had learned long ago which calendar to trust. Empires arrived by the printed one; fish arrived by the other. Only one of these could be salted.',
  'Capitán Anselmo read the proclamation aloud on the steps of the tribunal, his voice steady, his hands not. The words were grand and foreign. Liberty was mentioned, and destiny, and the dawn of an age. The fishermen listened with the patience of men who knew that no decree had ever moved a tide, then asked the only question the century would ever require of them: whose taxes, now?',
  'In the convent kitchen, Sister Clara hid the parish records inside a rice jar — births, deaths, marriages, the modest arithmetic of a people — reasoning that whoever ruled next would want the numbers, and whoever wanted the numbers could be made to wait.',
  'She was the only one in town who had read the whole proclamation, having been handed it to wrap fish in. She judged the Spanish of it florid and the intentions of it familiar. Sister Clara had buried three regimes\' worth of official paper in her jars, and her lentils had never once noticed the difference.',
  'The young men went to the hills with bolos and two rifles between twelve of them. Their mothers watched them climb until the trees took them, then turned back to the nets, because grief in San Isidro had always been mended the way sails were: quickly, and before the next weather.',
  'What the town remembered afterward was not the year of the flags but the year the whales came close to shore, which was the same year, though no proclamation mentioned it. History and the sea kept separate ledgers, and the town, prudent as ever, was entered in both.',
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

/** Ang Mahiwagang Estasyon, Chapter One — the full opening. */
const ESTASYON_OPENING: string[] = [
  'The station appears only to those who have missed something important — a train, a person, a version of their life — and it accepts exactly one kind of fare: a memory you are willing to never have back.',
  'Odessa had missed all three, which perhaps explains why the station appeared to her so completely, down to the pigeons.',
  'It stood where the old Paco station stands, but more so — the way a word in your own handwriting is more yours than the same word printed. The arches remembered being new. The clock had all its numbers and, more unsettling still, was right.',
  'At the fare booth she was asked, politely, what she could afford. "I have money," said Odessa. "Everyone has money," said the clerk, whose face was kind and difficult to look at directly, like a candle. "Money is what people give when they want to keep everything else. The line for that is outside, and it is very long, and it is called the city."',
  'She paid with the smell of her father\'s workshop — sawdust and machine oil and the small bright note of solder — and felt it leave her the way a tooth leaves: an absence with edges. She could still name it, list its parts, know it had mattered. She would simply never stand inside it again.',
  '"A fair price," said the clerk, stamping nothing onto nothing. "You will want Platform Two."',
  'The departures board flickered through destinations no map had agreed to: The Rainy Year. The City of Doors. Home, But Earlier. Two entries below that, in smaller letters, as if embarrassed: Home, But Kinder, DELAYED.',
  'The stationmaster was a heron in a conductor\'s coat, or a man with a heron\'s patience; the light could not decide and the light had clearly stopped trying years ago. "One way," he said. It was not a question. It never was.',
  'Between platforms, vendors sold what travelers between worlds actually need: bottled courage in three sizes, umbrellas that opened into rooms for the night, string bags of last words, still warm. Odessa bought nothing. Buying, here, felt like a way of agreeing to arrive, and she had not yet decided.',
  'The train came the way sleep does — all at once, from nowhere, having been coming the whole time. Odessa chose a window seat. Behind the glass, the station began, gently and completely, to forget her, and Odessa, holding her ticket of nothing, began to learn what the fare had actually bought.',
];

/** Ang Mga Pahina ni Lola — Abigail Marte; an inherited library, read margin
 *  by margin. Archival tenderness, first person. */
const PAHINA_CONTENT: string[] = [
  'Lola annotated everything. Novels, missals, the almanac, the manual for a rice cooker she never owned. To inherit her books was to inherit an argument she was still winning.',
  'Her marginalia had a grammar of its own. One line for agreement. Two for doubt. A star for sentences she intended to use on somebody. In the love scenes, nothing — not modesty, I think now, but privacy, the way you look away from people who are managing something difficult with dignity.',
  'I read her library the way she read it: out of order, in the afternoons, with a pencil of my own. It has become a correspondence. She writes from 1974; I answer from now; the book between us holds both our letters and complains about neither.',
  'Some pages she pressed flowers into, and the flowers left their shadows on the paragraphs — a santan bleached to paper-gray over a description of a garden, as if the book had tried to grow the scene itself.',
  'People ask if I have read them all. They misunderstand the project. I am not reading the books. I am reading her, and she was longer than any shelf.',
  'On the last page of everything she finished, she wrote the date and one word: tapos. Finished. Not the book — the sitting. Even endings, in her system, were only pauses that had earned a name.',
];

const PAHINA_OPENING: string[] = [
  'The boxes arrived on a Tuesday, which would have pleased her. Lola distrusted Mondays — too eager, she said, a day that arrives before you have decided about it — and held that anything of consequence should be scheduled for Tuesday, when the week has proven its intentions.',
  'Fourteen boxes. The movers stacked them in my apartment in a wall two deep, and when the last man left he looked at the wall, then at me, then said, with the honesty of someone paid by the hour and off the clock: "Ma\'am, that is a lot of dead weight." He was as wrong as a person can be, but I tipped him anyway. He had carried her whole reading life up three floors.',
  'The will had a clause just for this, in language her lawyer clearly lost a fight about: "The library goes to the one who will talk back to it." My cousins received the house, the land in Batangas, the jewelry that pretended to be older than it was. I received fourteen boxes and a sentence, and I want it on the record that I would not trade.',
  'I opened the first box that night, telling myself I would only look. Every reader knows that lie. It is the lie the whole enterprise is built on.',
  'On top: her Noli, the 1961 printing, spine held by electrical tape she had chosen in yellow, so that the repair would not go around pretending to be original. That was Lola entirely. Fix things, but never let the fixing lie about itself.',
  'Inside the cover, in the blue ink she bought by the box from a stationer in Quiapo who died before I was born: her name, the year, and her first annotation — an argument with the foreword, naturally, because Lola believed forewords were where publishers sent men to say confident things about books they had skimmed.',
  'Page 12: one line under a sentence. Page 30: two lines and a word I could not read, in the private shorthand she used when she was too moved for penmanship. Page 41, beside a description of a woman entering a room: the single word "Asuncion" — her sister, dead at nineteen, whom she otherwise never mentioned and here mentioned every time a certain kind of light entered a certain kind of room.',
  'This is what I mean when I say the library talks. Not metaphor. Correspondence. She wrote to the books and the books kept the letters, and now the letters have come to me, fourteen boxes of them, one argument deep and sixty years long.',
  'I made coffee. I found her pencil marks going soft with age, like paths a little grown over but still walkable. Somewhere near midnight I found, pressed between pages 212 and 213, a jacaranda flower gone to tissue, and under it, in the margin: "Planted the tree today. The book will wait."',
  'The tree is still in Batangas. It goes to my cousins, along with the land it stands on. But the day she planted it — the day itself, her hands in the soil, the book left open on the porch table, the patience of a woman who trusted both saplings and chapters to keep — that, apparently, is mine.',
  'I wrote the date on the inside cover, under her name, in my own ink. Then, because the correspondence had to begin somewhere, I wrote the first thing I have ever said to her that she could not interrupt: "Received. All fourteen boxes. Talking back begins tomorrow."',
];

/** Liwanag sa Kusina — Abigail Marte; dawn-kitchen stories, present tense,
 *  small mercies. */
const KUSINA_CONTENT: string[] = [
  'The kitchen wakes before the house does. This is its privilege and its burden, and it accepts both the way the eldest child does — without being asked, and with one eye on the window.',
  'The first light through the jalousies lands on the table in stripes, and for ten minutes the wood grain is legible, like a letter the tree left and nobody answered.',
  'Rice first. Always rice first. The pot knows its work the way hands know a rosary, and the steam climbs the cold air slowly, testing it, a swimmer entering a January sea.',
  'Someone upstairs turns over in bed, and the ceiling creaks its small report. The kitchen notes it. Twenty minutes, that creak means. Enough time for the eggs, and for the quiet, which is also being prepared.',
  'By the time the first pair of slippers hits the stairs, the table is set and the light has moved on from legibility to plain warmth. No one will say thank you to the room. The room does not work for thanks. It works for the sound of chairs.',
];

const KUSINA_OPENING: string[] = [
  'The light arrives at the kitchen window at 5:41, give or take the season, and Corazon is there to receive it, as she has been every morning for thirty-one years, the way one meets a guest who has grown too old to knock.',
  'She does not turn on the bulb. The bulb is for emergencies and Decembers. This hour belongs to the blue light that comes before the gold light, the one that makes the kitchen look underwater and makes Corazon, sixty-two, look like the photograph of her mother that hangs in the sala pretending to be a saint.',
  'Kettle. Match. The ring of blue flame, which is the kitchen answering the window: we also have dawn in here, we make it ourselves.',
  'On the table, the list her granddaughter left, in handwriting that gets more like Corazon\'s every year though neither of them will say so: baon for Thursday, no cucumber PLEASE, love you, the please underlined three times and the love not underlined at all, because the girl underlines only what she doubts will be granted.',
  'Corazon slices the cucumber. She is not being cruel. She is being sixty-two, and she knows things about lunches and about doubt that cannot be explained, only packed.',
  'The rice sighs in the pot. The first tricycle of the day goes by with its cargo of one nurse, headed for the six o\'clock shift, and Corazon lifts two fingers off the counter toward the window — not quite a wave, more an acknowledgment between institutions.',
  'Her husband, when he was alive, called this hour her office hours. He was not wrong. The bills are thought about here, and the daughters, and the son in Dubai whose calls come at strange hours shaped by other people\'s clocks. The kitchen holds what the house cannot say in daylight; that is what kitchens are for, and why they are given the first light as payment.',
  'At 6:10 the gold arrives, replacing the blue without ceremony, and the kitchen becomes ordinary again — becomes counters and a calendar and a jar of spoons. Corazon takes the garlic down. The day may begin now. She has decided to allow it.',
  'Upstairs, an alarm goes off, is silenced, goes off again with the wounded persistence of alarms. Chairs will scrape soon. Doors. The great clumsy orchestra of a family surfacing.',
  'Corazon sets four plates, then, after a pause that has a name she does not use, a fifth — because today is the second of the month, and on the second of the month, for reasons the kitchen keeps, her sister always comes to breakfast, and has not missed one yet, in the eleven years since she died.',
];

/** Apartment 9B — Cesar Madrigal; a superintendent's inventory of a quiet
 *  wrongness. Mystery: precise, dry, unsettling by accumulation. */
const APT9B_CONTENT: string[] = [
  'A building superintendent keeps three lists: what is broken, what is pending, and what is strange. The first two I submit monthly. The third I keep in my own notebook, because management does not have a form for strange.',
  'Unit 9B paid on time, every time, by envelope, in person, on the first Monday of the month, at 7:40 in the morning. In eleven years of this work I have learned that punctuality at that level is not a virtue. It is an alibi being maintained in advance.',
  'The complaints about 9B were never about noise. They were about the absence of it — the specific, pressurized quiet of a unit where someone is being careful.',
  'I fixed a leak in 9B once, in the second year. The apartment was clean the way hotel rooms are clean: thoroughly, and of everything. There were four locks on the inside of the bedroom door. I noted this in the third list.',
  'Every profession has its confessional. Priests have the booth. Bartenders have the counter. Superintendents have the elevator, six floors of it, and what the tenants tell you between 3 and 9 is a kind of prayer they trust you to forget. I have forgotten none of it.',
];

const APT9B_OPENING: string[] = [
  'The elevator of Golden Palm Residences takes forty-one seconds from lobby to ninth floor, and for eleven years I have used those seconds to review my lists. My name is Agapito Reyes, superintendent, and on the morning of August the fourth I was reviewing the third list — the strange one — because unit 9B had failed, for the first time in eleven years, to pay the rent.',
  'You will want to know why a late payment matters. It matters because Mr. Solano of 9B had never once been late. Not during the typhoon year, when half the building paid in apologies. Not during the pandemic, when the envelopes stopped and the promises started. On the first Monday of every month, 7:40, the envelope, the nod, the same three words: "For the month." One hundred and thirty-two envelopes. And then, on the hundred and thirty-third Monday: nothing.',
  'The building noticed before I did. Buildings do. The señora of 9A, who has opinions the way the lobby has mosquitoes, reported that the corridor smelled of bleach on Sunday night. Bleach is on none of my lists. Nobody in Golden Palm cleans on a Sunday night except me, and I had not.',
  'At 9:15 I knocked at 9B. The door of 9B is the same door as forty-seven others in this building; I hang them myself. It sounded different. A door sounds different when the unit behind it is empty, and different again when the unit behind it is pretending to be.',
  'This was the second kind of different.',
  'Regulations give a tenant seventy-two hours before a wellness entry. I gave Mr. Solano seventy-three, because eleven years of envelopes buys you one hour of courtesy. Then I took the master key, informed the guard on duty — Boyet, who was watching a cockfight on his phone and blessed me without looking up — and rode the forty-one seconds thinking about the four locks on the inside of the bedroom door.',
  'The master key was not required. The door of 9B was unlocked, which in eleven years it had never been, not once, not even for the leak. An unlocked door in a building like this is not carelessness. It is a message, and messages left for no one in particular are generally meant for the superintendent.',
  'Inside, the apartment was clean of everything, hotel-clean, as before — except for the kitchen table, where three items had been arranged in a straight line, squared to the table\'s edge, in a way that things left behind by accident never are: a rent envelope, sealed, marked "For the month." A key I did not recognize, stamped 9B, though it fit no lock I have hung. And my notebook. The third list. The one I keep in my own quarters, under the floorboard, behind the toolbox, in the place where nobody — I would have sworn this on my mother\'s grave — nobody had ever looked.',
  'The envelope, I have submitted to management. The key and the notebook I have not mentioned. There is no form for strange, and starting that morning, I stopped being the man who files reports and became the man the reports should be about — because whoever emptied 9B knows where I sleep, knows what I noticed, and paid the rent anyway. For the month.',
];

/** Shelf Life — Odette Ramas; a secondhand bookshop cozy. Warm, parenthetical,
 *  furnished with tea. */
const SHELF_CONTENT: string[] = [
  'People think a secondhand bookshop sells books. It rents them, really, on the longest and gentlest terms imaginable, to a series of owners who all believe they are the last.',
  'Every book that comes through the door is inspected for three things: mold (fatal), underlining (negotiable), and inclusions (the whole point). Inclusions is my word for what people leave inside — receipts, boarding passes, fern leaves, fourth-place ribbons, one entire love letter with the courage still in it.',
  'The shop cat is named Margination and answers to nothing, which is correct behavior for someone who sleeps on the poetry shelf.',
  'Tuesdays are for the box men — the widowers and downsizers who arrive with cartons tied in twine and stand there while I count, not watching the money, watching the books, the way you watch a child board a school bus.',
  'I keep the inclusions in a drawer marked HOLD. Officially, in case the owners return. Unofficially: some things you do not sell, you just keep them warm.',
];

const SHELF_OPENING: string[] = [
  'The shop opens at ten, which means the shop opens at 10:20, which everyone on Calle Real understands except the shop\'s own signage. I have owned Silid Aklatan for nine years, inherited it from my Tita Loleng along with its debts, its cat, and its one unbreakable rule, hand-lettered above the register: CHECK INSIDE THE BOOKS.',
  'Tita Loleng wrote the rule after the incident of 1987, which she never fully explained and I never fully believed — something involving a first-edition Noli, a land title, and a mayor\'s mistress, the three of which entered the shop inside one carton and left inside three separate scandals. "Books are envelopes, Odette," she used to say, tapping the sign. "The story is only the packaging."',
  '(She also said the shop cat must always be named after a book part — hence Margination, and her predecessors Appendix, Errata, and the much-mourned Foreword — but that rule is not above the register. That rule is simply enforced by the cats.)',
  'On the Tuesday this story starts, the bell above the door performed its one duty at 10:47, and a man came in carrying a balikbayan box the way you carry something you have decided not to feel anything about. Box men, I have learned, come in two kinds: the ones clearing a shelf and the ones clearing a house. You can tell by the knots. Shelf-clearers use tape. House-clearers use twine, tied and retied, because the box has been opened for one last look more times than they will admit.',
  'This was twine. Retied twice.',
  '"My mother\'s," he said, which box men always say, even the ones who mean my father\'s, because in this country the books belong to the mothers. "You buy?" I said what I always say — that I pay honestly for the good ones and kindly for the rest — and set the kettle going, because the second thing Tita Loleng taught me is that no one should watch their mother\'s library be appraised without a cup of something in their hands.',
  'The books were good. Gardening manuals annotated in two inks, a rosary-flattened missal, four romance novels rebacked with electrical tape — read to death, the highest condition grade I recognize, whatever the trade may say. And at the bottom, wrapped separately in a rice sack, a 1968 high school yearbook from a town four provinces south of here.',
  'CHECK INSIDE THE BOOKS. I checked. Page 63 of the yearbook was interrupted by an envelope — unstamped, unsealed, addressed in a schoolgirl\'s careful loops to a name that made the box man, who was reading over my shoulder as they always do, go very quiet. It was not his mother\'s name. It was his father\'s. And judging by the date, and by the fact that his parents — he said this slowly, sitting down at last on the stool I keep for exactly these moments — did not meet until 1974, the letter in my hand was about to make somebody\'s tidy family history roughly one love story longer.',
  '"Tea first," I said, because some envelopes should not be opened standing up, and Margination, who knows her cues, came down from poetry to supervise.',
];

/** The Things We Never Sent — Dain Villanueva; a drafts folder that talks
 *  back. Thriller: clipped, cold, second-person close. */
const UNSENT_CONTENT: string[] = [
  'Everyone has a drafts folder. It is the room where you keep the versions of yourself that lost the vote.',
  'You reread them the way you press a bruise: to confirm it still works.',
  'The first rule of the unsent message is that it stays unsent. That is the entire technology. That is the whole lock.',
  'She knew things that were only in the drafts. Not things I had said. Things I had almost said. There is a difference, and the difference is the whole of a person.',
  'The typing indicator appeared under a contact that has been dead for two years. It typed for a long time. Whatever it was writing, it was choosing its words carefully, and I sat in the dark extending it the same courtesy.',
];

const UNSENT_OPENING: string[] = [
  'You have 247 unsent drafts. This is not an estimate. The number sits at the top of the folder, patient as a meter, and you know it the way other people know their weight — approximately, on purpose.',
  'Some highlights of the archive, since you are the only one who will ever read it: to your father, 2019, four paragraphs, never sent, he was buried with the two sentences you said instead. To Mikaela, an apology structured in three drafts — the honest one, the acceptable one, the one that blamed her — none sent, friendship allowed to expire on schedule instead. To a number with no name, one line, "I saw what you did," which you typed at 3 a.m. six years ago and keep because deleting it feels like testifying.',
  'The folder is the truest thing you own. Which is why, on the night of June 30, when your phone lights the ceiling at 2:14 a.m., and the notification reads MIKAELA TORRES — and Mikaela Torres has been dead for two years, her number recycled by the carrier, you assume, you insist, some stranger in the city now carrying her digits like a hermit crab — you very nearly do not open it.',
  'You open it.',
  'The message is one line. "You were right not to send the second draft. The third one was worse. But the first one — the first one I would have liked."',
  'You do not reply. You are not an idiot; you have seen the films; you know that replying is the door. You put the phone face-down, which is the modern sign of the cross, and you lie in the dark conducting the inventory: who has touched your phone. Who knows your passcode. Who could know that there were three drafts — that there was an order to them, a chronology of cowardice, first honest, then acceptable, then cruel — when the folder has never synced, never backed up, never left the palm of your hand.',
  'The answer arrives on its own, the way answers do at 3 a.m., wearing the voice you least want: nobody. Nobody could know. YOU barely knew. You have not opened those three drafts since the funeral, because reading them costs more than the phone did.',
  'At 3:41 the typing indicator comes on under her name and stays on for nine minutes. You watch all nine. Whatever is on the other end, it is composing, deleting, recomposing — it is DRAFTING, and the recognition arrives in your chest before your head will sign for it: you know exactly what that hesitation feels like from the inside.',
  'At 3:50 the message comes through, and it is the length of a confession, and it begins with the words you have started seventeen messages with and finished none: "I never told you this when it mattered." You are reading your own unsent first line. Sent. At last. From her.',
];

/** Ang Ikatlong Katok — Remedios Cua; province-night horror. The rules,
 *  as told by a lola, in a voice that does not raise itself. */
const KATOK_CONTENT: string[] = [
  'In our town the doors are answered on the second knock. Never the first — the first is for testing. Never the third. If you have let it reach the third, you no longer answer. You pray.',
  'These are not superstitions. Superstitions are rules whose accidents have been forgotten. Ours are remembered. Ask the Bautistas. You cannot — that is the point. But ask.',
  'The knocker does not knock like the movies, all fists and hunger. It knocks politely. It has excellent manners and all the time in the world, and it has learned, the way all old things learn, that politeness opens more doors than force.',
  'Salt on the sill must be poured left to right, and you must not count the grains, because counting is a conversation and conversations are consent.',
  'My lola kept the rules on the wall, embroidered, framed, the way other houses keep the Last Supper. When visitors laughed, she offered them coffee and let them sleep near the door.',
];

const KATOK_OPENING: string[] = [
  'The first thing you must understand is that our house has two doors, and only one of them opens. The front door is for people. The kitchen door was nailed shut by my great-grandfather in 1936, from the outside, at noon, with the priest watching — and every year on the ninth of October my lola repainted it, sweetly, in fresh blue, the way you keep a grave.',
  'I was eleven the year I learned why, which in our family is the traditional age: old enough to keep the rules, young enough to still be teachable about the cost of breaking them.',
  'It was the wet season. The radio had died at dusk, mid-sentence, which my lola noted the way farmers note birds going quiet. She lit the lamp, took her embroidery down from the wall — the framed rules, which I had believed all my childhood were a decoration — and set them on the table between us like a document I was finally of age to sign.',
  'RULE ONE, in red thread: The first knock is not for you. Do not stand. Do not look at the door. The first knock is a question asked of the house, and the house knows how to be silent. It has had practice.',
  'RULE TWO, in blue: The second knock belongs to people. A neighbor, a cousin, a stranger soaked to the bone — on the second knock you may open, because whatever it is that visits, it cannot knock twice. Two is an honest number. Two is the pulse. This is why we answer on the second, always have, always will, and why the town\'s children are taught to knock twice at every door, twice, firmly, from the age they can reach the wood.',
  'RULE THREE had no color. The thread was old, older than the sampler around it, and whoever stitched it pressed hard enough to pucker the cloth: If the third knock comes, the visit is no longer a question.',
  'I asked what happened at three. My lola picked up her coffee, and I watched her decide — I actually watched the decision cross her face, the way you watch weather cross a field — between the kind lie and the useful truth.',
  '"At three," she said, "it has stopped asking the house. At three, anak, it is asking YOU. And the third knock is very hard not to answer, because it does not sound like knocking anymore. It sounds like someone you love, saying your name, in the voice they used when you were small."',
  'The rain went on. The lamp did its small work. And at nine minutes past nine — I checked, because eleven-year-olds check — something arrived on the porch out of the wet, settled itself, and knocked once, beautifully, and my lola put one finger on my wrist and went on embroidering, and the two of us sat there inside RULE ONE while the house, which has had practice, held its breath around us.',
  'We are still, you will have noticed, waiting on the second knock. That was thirty years ago. It is the waiting, my lola always said, that the rules are really for.',
];

/** Sunday Grocery List — Migs Ferrer; a year of lists. Slice of life:
 *  grief and love itemized, wry and exact. */
const GROCERY_CONTENT: string[] = [
  'SUNDAY. Rice (25kg — why do I still buy the 25). Eggs. Tomatoes, if cheap. Coffee, the red pack, NOT the gold, I don\'t care what the gold says about itself.',
  'Note: the red pack was her rule. I have kept all the rules and none of the reasons. The reasons went with her, which seems administratively careless of heaven.',
  'SUNDAY. Rice (10kg — progress, of a kind). Bangus, have them clean it, do NOT attempt this at home again. Bay leaves. The vinegar from Iloilo if Aling Susan has it, and she will make me ask for it by name, because grief has not made her merciful, only attentive.',
  'SUNDAY. Ube ice cream (Contested. See appendix.) Appendix: the boy says his mama always bought it. The boy is correct. The boy is also using this fact tactically. He is seven, and grieving, and a genius, and gets the ice cream.',
  'SUNDAY. Everything on the list, plus one item not on it, per doctor\'s orders. The doctor is the boy. The order is malunggay, "for your blood, Papa." He heard it somewhere. He wrote it himself at the bottom of the list, spelled maloongay, and I would rather die than correct it, so: maloongay, weekly, forever.',
];

const GROCERY_OPENING: string[] = [
  'My wife wrote the grocery list every Sunday for eleven years, and I did the buying, and this division of labor was so total that at her funeral, between the second and third eulogies, I caught myself worrying that nobody had told me what to get.',
  'This notebook was her list notebook. Sixty pages, spiral, a mango on the cover for no reason either of us could ever establish. She was four pages from the end. I am not a writer — I sell insurance, which is a way of writing about the future without adjectives — but the Sunday after we buried her, I sat at the kitchen table at her time, 6:30, with her pen, because the alternative was sitting there with nothing.',
  'FIRST LIST (mine). Rice. Eggs. The coffee she buys. The soap she buys. Whatever else she buys. — I stood in Save More for one hour and eleven minutes with that list, men of my age orbiting me with their own small papers, and I understood for the first time that the store is full of us, the entrusted, pushing carts through aisles our wives have alphabetized in some other notebook we never asked to see.',
  'Aling Susan at the vegetable stall asked after the boy. I said he was staying with his lola until I "got organized." She looked at my list, all five lines of it, and added kalabasa, sitaw, and okra with the pen from behind her ear. "Tinola on Wednesday," she said. "Sinigang Saturday. He eats squash if you don\'t announce it." My wife, it turns out, had briefed the market. I bought everything. Wednesday, there was tinola. He ate the squash. I did not announce it.',
  'SECOND LIST. Everything from the first list, plus: the red coffee, NOT the gold (correction issued from beyond, via Aling Susan, who watched me reach for the gold with the expression of a woman watching a man disgrace a memory).',
  'The boy came home the third week. He inspected the refrigerator like an auditor, opened the freezer, and stood there in the cold light for a while. "Mama buys ube," he said. Present tense. I have thought about that present tense every day since. "Then it goes on the list," I said, and he went and got the notebook himself, and that is how the list became a thing written by committee.',
  'THIRD LIST, fourth line, in pencil, in a seven-year-old\'s architecture: OOBEY ICE CREAM. I have preserved the spelling in every list since, the way the government preserves the misprints on old money. It is worth more that way.',
  'People at the office ask how I am managing, in the voice people use for that question, and I never know how to explain that the honest answer is a grocery list. That she is still telling me what to get — through a market vendor, through a boy\'s freezer memory, through eleven years of red-not-gold — and that every Sunday at 6:30 I sit down with her notebook and take the dictation.',
  'Four pages from the end, I said. I have decided what happens when the mango notebook runs out: nothing. It does not run out. Lists continue on other paper; that is the whole secret of lists. You keep buying the rice. You keep the rules past the reasons. And on Sundays, if your handwriting happens to drift a little toward hers — the market is open early, and nobody there will mention it.',
];

/** Saturday, Maybe — Clara Mendoza; the flower stall courtship. Romance
 *  that refuses to hurry: one sunflower a week, on purpose. */
const SABADO_CONTENT: string[] = [
  'The market sets up in the dark and pretends it didn\'t. By six the flowers are arranged by argument — roses up front to do the negotiating, the sunflowers behind them like tall cousins at a reunion, sure of their welcome.',
  'He bought one sunflower every Saturday. One. "Para kay Lola," he said, the first week, and Ana wrapped it in yesterday\'s newspaper and thought nothing of it, because grandsons are a common species at flower stalls on Saturdays.',
  'It was the fourth Saturday when she did the math on the lola. Nobody\'s lola needs a sunflower a week. A lola with a weekly sunflower habit would have said something by now — lolas audit. Either the lola did not exist, or the lola existed and was in on it.',
  'She started keeping the best one back. Not the biggest — the best, the one that had opened overnight and hadn\'t told the others. She kept it under the counter, in the tin pitcher, and if you had asked her who it was for she would have said inventory.',
  '"Sabado ulit?" he asked, paying, not leaving. "Saturday," she agreed, making change slowly. "Maybe," they both added, at the same time, which is how the word got into the story and never left.',
];

const SABADO_OPENING: string[] = [
  'Ana\'s stall was third from the corner, between the man who sold knives that never needed sharpening and the woman who sold herbs for conditions you had to whisper. Flowers, in that company, felt almost frivolous — until you watched who bought them, and learned that nobody buys flowers for no reason. The reason walks up to the stall holding money and looking like it isn\'t there.',
  'She could read the reasons by now. Anniversary, apology, anniversary-of-an-apology. New love, all cellophane and overcommitment. Hospital flowers, chosen quiet. Funeral flowers, chosen fast, because grief cannot stand in a market long. Eleven years at a stall and you learn the whole dictionary.',
  'The sunflower man did not fit the dictionary. He arrived at seven-forty, every Saturday, in a jacket too warm for the weather, and bought one sunflower — para kay Lola — and then stood there for exactly as long as it took her to wrap it, asking questions with the pacing of a man who had rationed them all week. What time does the market open. Do the flowers mind the rain. Is it hard, getting up in the dark. Normal questions, thrown badly on purpose, the way you throw a game of tumbang preso for a child.',
  'She answered every one. Four. The market opens at four. The flowers don\'t mind the rain, the sellers mind the rain. And no, getting up in the dark is not hard — the dark is the good part; the flowers are more honest before they\'ve been looked at all day. She heard herself say that last one and thought: huy. That is not a thing you tell a customer. That is a thing you tell a person.',
  'On the twelfth Saturday it rained the way it only rains on market days, sideways and personally offended. The knife man packed up. The whisper-herb woman packed up. Ana stayed, under the tarp, on principle and one stubborn feeling she declined to name, and at seven-forty exactly the sunflower man arrived, drowned to the collar, jacket finally correct for the weather, holding — she took a moment to understand it — a thermos.',
  '"Kape," he said, unnecessary and soaked. "In case you were open." The market was a river. Nothing was open. Everything about him said he had known that since the fifth week, and had come anyway, and the sunflower he bought that morning was, for the first time, visibly, provably, for no lola at all: he stood under her dripping tarp and gave it back to her, stem first, wet newspaper and all. "Sabado ulit?" he said. "Saturday," said Ana. Neither of them said maybe. That was the whole news of the day: nobody said maybe.',
];

/** Before the Last Train — Rafael Lim; the platform before the 11:42.
 *  Companion book to Window Seat: the not-going-home-yet hour. */
const BAGO_CONTENT: string[] = [
  'The 11:42 has a waiting room, and the waiting room has a census. By 11:15 they are all present: the overtime class, the almost-drunk, the nurses mid-shift-swap, the man with the guitar who never plays it here, out of a courtesy the platform has never had to request.',
  'Nobody on this platform is early for the train. Understand this and you understand the hour. They are late for everything else — dinner, apologies, their own beds — and the platform is the one place in the city where lateness has stopped counting.',
  'The vendor at the top of the stairs sells coffee, candy, and load. At this hour she also sells the last ensaymada at a discount she calls closing price and everyone else calls kindness with a receipt.',
  'Guard Bautista checks bags with a flashlight that has needed batteries since June. Everyone opens their bags anyway. It is not security. It is two people agreeing, nightly, to keep a small ceremony alive.',
];

const BAGO_OPENING: string[] = [
  'There is an hour in this city that belongs to no one, and it runs from the moment you could still make the earlier train to the moment you decide, quietly, not to. I have watched hundreds of people make that decision on the northbound platform, and it is always visible: the shoulders drop half an inch, the phone goes into the pocket, and the person joins the true congregation of the 11:42 — those who could have gone home at 11:19 and did not.',
  'I am not judging them. I am one of them. My apartment is fourteen minutes from my office by the 11:19 and I have taken it perhaps six times in three years, because the apartment at 11:33 is the same apartment at 11:56, and the platform, between those trains, is better company than the ceiling.',
  'The platform between trains is the city\'s most honest waiting room. Upstairs, at street level, everyone is still performing — hurrying, mattering, being expected somewhere. Down here the performance is cancelled nightly. The nurses take off the day shift the way you take off shoes. The call-center kids run their accents down like engines. The man with the guitar sets it against the bench and does not play it, which after two years I have come to understand IS the performance: a man showing the day that he could, and declining.',
  'At 11:26 the vendor begins her closing arithmetic out loud. The last ensaymada drops to fifteen pesos. The second-to-last coffee is free with anything, "para hindi masayang ang init" — so the heat won\'t go to waste. An economist would find nothing to study at her stall and a priest would find everything.',
  'I started writing these pages on this platform, standing up, in the notes app, because of a thing I saw on a Tuesday: a woman arrived at 11:18 at a dead run, heels in her hand, and made the 11:19 — doors closing, bag caught, the whole cinema of it — and then, as the train pulled out, I watched her through the window realize she had not wanted to catch it. You can see that realization through glass. It travels.',
  'She was back Thursday. 11:20 this time, unhurried, shoes on, a woman who had renegotiated something with her own evening. She bought the fifteen-peso ensaymada, sat on the bench beside the unplayed guitar, and waited for the last train like the rest of us: people not going home yet, together, for twenty-three more minutes.',
];

/** Sa Ilalim ng Sampaguita — Noemi Bautista; the hedge that returns what was
 *  buried on purpose. Polite impossibility, one bloom at a time. */
const SAMPAGUITA_CONTENT: string[] = [
  'The rules of the hedge, as the family keeps them: it returns only what was buried on purpose. It returns one thing per flowering. It returns things politely — at the doorstep, wrapped in leaves, before six in the morning — and it does not accept returns of its returns. The hedge is not a lending library.',
  'Lost things do not interest it. Drop your ring in the grass and the hedge will let it rust; the hedge has no sympathy for carelessness. But bury a thing at its roots with intention — bury it the way you bury a decision — and the sampaguita takes custody, and considers, and someday, on a morning it selects with no visible logic, gives it back.',
  'Tiya Loleng buried her engagement ring in 1974, three days before the wedding was called off, and the hedge kept it forty years before returning it — the same week her granddaughter met a boy from the same family. The family holds two positions on whether this was kindness. The family holds two positions on most things the hedge does.',
  'What everyone agrees: you do not plant sampaguita over a secret unless you are prepared, someday, to answer the door.',
];

const SAMPAGUITA_OPENING: string[] = [
  'The sampaguita hedge at the Villareal house has flowered every June for ninety years, and every June, on the first morning of blooming, it gives something back. The family does not find this remarkable. Families never find their own impossibilities remarkable; that is what makes them families and not case studies.',
  'The returns are small and exact. A hair comb, buried 1953, returned 1961, teeth intact, smelling of the perfume of a woman by then eight years abroad. A medal from the war that a great-uncle had buried "so it would stop looking at him," returned the June after he died, polished, as if to say: he is out of the room now, you may look at this again. A milk tooth. A letter, unopened, its seal somehow younger than its paper. The hedge has taste. It has never once returned money.',
  'Marisol Villareal was twenty-six, home for the summer to help her mother pack up the house — the house was being sold, this is what the story is about, although nobody in it will say so for some chapters — when the hedge, three weeks early and out of season, put its first bloom out in May and left on the doorstep a small object wrapped in two leaves, tied with a blade of grass, addressed in no handwriting to no one.',
  'Her mother saw it from the window and sat down slowly at the kitchen table, which in that house is what people do instead of screaming.',
  '"Anak," she said, in the voice of a woman selecting each word from a drawer of sharper ones, "before you open that, I need to tell you what your Lola buried the year you were born. And then I need you to understand na hindi tayo nagbebenta ng bahay dahil kailangan natin ng pera." We are not selling the house because we need money.',
  'Marisol, who had a return ticket for August and a life in another city arranged neatly around not knowing things like this, looked at the little leaf parcel on her palm. It weighed what a key weighs. The sampaguita by the gate stood there flowering out of season, ninety years old, patient as a relative, having started — in its polite and unanswerable way — the conversation the whole family had spent twenty-six years agreeing not to have.',
];

/** After Midnight — J. Salvador; timestamped prose poems for the hours
 *  no one supervises. Companion cycle to Mga Liham sa Dilim. */
const HATINGGABI_CONTENT: string[] = [
  '12:47. The city does not sleep, but it stops pretending to be awake. These are different conditions. Ask any window.',
  '1:33. Somewhere below my window a tricycle idles like a sentence the driver can\'t finish. Go home, kuya. Or don\'t. At this hour we are all idling in the same language.',
  '2:15. The refrigerator hums the only hymn it knows. I open it for the light, not the food. After midnight, hunger is mostly a wish to be lit from somewhere.',
  '3:58. The roosters begin their rumor. The rumor is morning. Like all rumors it arrives first in the poorer streets, who have to get up and check.',
];

const HATINGGABI_OPENING: string[] = [
  '12:01. Officially, nothing. The date has changed and no one felt it. Somewhere a security guard initials a logbook, and that signature is the only proof the old day made it out alive. This book is a logbook. I am initialing the hours.',
  '12:24. Streetlight through the jalousies files the room into strips: bed, floor, chair, me. Filed under what, I don\'t know yet. That is what the writing is for.',
  '12:58. Texted no one. Composed, polished, deleted — the full ritual. After midnight the drafts folder is the most honest room in the phone, and I have decided to live in it. Kung nabasa mo ito: hindi ko sinend. That was the point.',
  '1:41. The last jeepney passes with its lights on and nobody in it, upholstered in orange light, patient as a confessional. Every city has one vehicle that drives around all night carrying only the idea of passengers. Tonight I saluted it from the window. The driver did not see me. Attendance was still taken.',
  '2:30. My neighbor\'s baby practices crying and stops, mid-note, as if remembering the assignment isn\'t due till morning. The wall between us is thin as a page. For a moment the whole building listens together — one creature with forty windows — and then lets itself be a building again.',
  '3:12. This is the hour the letters used to go out, when there were letters: the hour with no supervision, no witnesses, no weather. Whatever is said at 3:12 is said under oath. Whatever is written survives on one condition — that it never, ever gets sent. Here. I am keeping all of it. Consider this book the evidence room.',
];

/** Alamat ng Huling Diwata — Elia Navarro; the bargain in the last acacia,
 *  and the girl who inherits it. Myth kept as family paperwork. */
const DIWATA_CONTENT: string[] = [
  'The bargain, as recorded in the notebook: the tree stands, the town drinks. Six generations have kept it, and the keeping is not incense and moonlight. The keeping is attendance. Someone sits with the tree on the last night of every month, because the one thing a diwata cannot survive is being believed in by no one.',
  'She is not beautiful the way the komiks drew them. She is beautiful the way weather is — approximately, and from a respectful distance, and differently every time you check.',
  'What she remembers is the forest. Four hundred hectares of it, and every tree had a tenant, and on certain nights the whole ridge would light up with them like a town seen from the sea. She is the last because she was the stubbornest. She would like this recorded: not the strongest. The stubbornest.',
  'The road survey crew came on a Tuesday. Orange vests, a theodolite, spray paint. They marked the acacia with an X and the diwata read it from inside the bark the way you\'d read a doctor\'s face, and that night she asked Amparo\'s granddaughter, very quietly, how many people would you say believe in me now. Be honest, apo. I can count the lights from here.',
];

const DIWATA_OPENING: string[] = [
  'Every family keeps something. Some keep land titles, some keep grudges, some keep a saint dressed and fed on her feast day. My family keeps a diwata, and has since 1897, and if you think that sounds romantic you have never had to explain to a diwata why the electric cooperative needs to trim her tree.',
  'She lives in the last acacia on the provincial road, the enormous one at kilometer eleven that the road bends around — and the road bends around it, you should understand, because in 1963 my Lolo Underong stood in front of the bulldozer for six days with a packed lunch, and the story made the papers as SUPERSTITION HALTS PROGRESS, and the diwata, who reads everything over your shoulder, thought the headline was very funny and has called herself Superstition in conversation ever since.',
  'I inherited her the way you inherit everything in this country: suddenly, at a funeral, with paperwork. Lola Amparo\'s notebook came to me in a biscuit tin — sixty years of entries in four handwritings, the bargain on the first page in ink gone brown as bark: ANG PUNO AY NAKATAYO, ANG BAYAN AY UMIINOM. The tree stands, the town drinks. Under it, in my lola\'s hand, the operating instructions: Last night of the month, sit with her. Bring nothing. Believe everything. Do not sign anything she gives you.',
  'I was nineteen and had a scholarship in the city and I want it noted that I tried to give the tin to my mother, who raised both hands like the notebook was a summons, and then to my Tito Bayani, who suddenly remembered work in Cebu. The notebook chooses, my lola had written on the last page, in the shaky letters of her final year. It has chosen four times. It is about to be very funny a fifth time.',
  'The last night of that month, I walked to kilometer eleven with a flashlight and my lola\'s tin and the specific anger of the newly chosen. The acacia at night is not a tree so much as a district — four hundred years of branches, a barangay of shadows — and I sat down between two roots the size of carabaos and said, out loud, to no one, feeling like an idiot: "Ako na raw. Ako na ang bahala sa\'yo." It\'s me now. I\'m in charge of you now.',
  'The laugh came from directly overhead, warm and old, like the ember-end of a bonfire remembering itself. "Ay," said the last diwata of the ridge, unseen, delighted, in the voice my family has been writing down phonetically for six generations. "The scholar. Sige. Sit up straight, apo ni Amparo — and get out your notebook, because I am going to tell you what your lola was too polite to write down about how this bargain actually ends."',
];

/** The Bookshop Beside the Bakery — Odette Ramas; Silid Aklatan, the party
 *  wall, and the 4 a.m. smell of pandesal in the paperbacks. */
const PANADERIA_CONTENT: string[] = [
  'The wall between the shops is one brick thick and has never once done its job. Heat comes through it, and the smell of pandesal at four in the morning, and the low sound of Nardo singing to his dough, which he denies, and which I have stopped reporting, because some testimony only makes the witness less believable.',
  'The trade agreement was never written down, which is how you know it is binding. Bread crosses the wall in the morning; books cross back at night. Nardo reads exactly one genre — sea stories, the wetter the better — and pays in ensaymada at an exchange rate he recalculates according to how the ending treated the boat.',
  'Customers say the books smell like mornings. They pick one up, open it, and get bread, warmth, six o\'clock — the whole panaderia, filed in the pages. I have stopped explaining the wall. Let them think the books do it themselves. In a good shop, after enough years, it comes to the same thing.',
  'Margination the cat holds dual citizenship. Mornings on the flour sacks, afternoons on the poetry shelf. Both establishments claim her on their signage. She has signed nothing.',
];

const PANADERIA_OPENING: string[] = [
  'Silid Aklatan shares a wall with Panaderia Luna, and the wall takes Luna\'s side. At four in the morning, when Nardo fires his ovens, the heat comes through the bricks into my back room, and with it the smell — pandesal first, then the ensaymada around five, then that last brown toasted note that means the day\'s first batch is already becoming somebody\'s breakfast. I have kept a bookshop beside a bakery for nineteen years. Every book in this shop has been proofing in that smell the whole time.',
  'I mention this because of what the customers say. They say the books smell like mornings. They say it the way people report a small miracle to a bored priest — shyly, ready to be laughed at. A woman once stood at the biographies inhaling a life of Magellan and said, "Ma\'am, bakit amoy almusal ang libro n\'yo?" Why do your books smell like breakfast? And I gave her the only true answer I have: because they have never known anything else.',
  'Nardo and I have run our two shops on either side of that wall since before either of us had gray hair to argue about. We have never had a contract, a partnership, or a single conversation about feelings. What we have is the ledge — the low window in the party wall, painter\'s-shelf width, that some sensible dead builder left there in another century — and across that ledge, for nineteen years, has moved the entire economy that matters: bread going east, books going west.',
  'It started with a flood, the way half the arrangements in this town did. The water came into his shop and not mine — the street tilts, the street has opinions — and Nardo passed his account books through the ledge for safekeeping, and I passed back coffee, and at some point near dawn, waiting out the rain, he asked, gruff as a man asking for contraband, kung may libro ba ako tungkol sa dagat. Did I have any books about the sea.',
  'I had thirty. I have since sold him — traded him — every one, plus every sea book I could hunt down at estate sales and Sunday markets for two decades, and I am not ashamed to say I have bought entire dead men\'s libraries because I spotted one storm-soaked Conrad in the carton. The baker beside me has never seen the ocean. He rises at three and feeds a town and sails, exclusively, between four and six a.m., by ladder, one shelf-window at a time.',
  'This book is the log of the two shops: the wall, the ledge, the cat who commutes over it, the customers who came in for bread and left with poetry or came in for poetry and left, always, with bread. Nineteen years of small trades faithfully recorded. Kettle\'s on. The ovens are lit next door — I can feel it in the bricks, right through the local history section. Everything in here smells like morning. Now you know why.',
];

/** Table for Two — Hankerism; the house novel, serialized as it is written.
 *  The prologue is the author's own text, VERBATIM (see also the Studio seed
 *  in lib/studio/work-repository.ts) — never rewritten, never summarized. */
const TABLE_FOR_TWO_PROLOGUE: string[] = [
  'Some people fall in love all at once.',
  'At least, that\'s how the stories usually tell it.',
  'One glance across a crowded room.',
  'One unforgettable conversation.',
  'One perfect moment that changes everything.',
  'Lianne never believed in that.',
  'Maybe because she spent most of her waking hours talking to people she had never met. Eight hours every night, five nights a week, she answered emails, joined meetings, and solved problems for clients who only knew her through a webcam and a profile picture.',
  'You\'d be surprised how much of a person\'s life could exist behind a screen.',
  'And how much of it couldn\'t.',
  'Adrian believed in routines.',
  'Not in a boring way.',
  'Just... quietly.',
  'He liked arriving ten minutes early. Drinking the same coffee. Taking the same route home. Replying when he said he would. There was comfort in knowing what tomorrow looked like.',
  'He didn\'t think that made him predictable.',
  'He thought it made life a little easier.',
  'If someone had asked either of them that Tuesday afternoon what they wanted from a dating app, neither would\'ve had an interesting answer.',
  '"Conversation, maybe."',
  '"Let\'s see."',
  'Nothing dramatic.',
  'Nothing worth writing a novel about.',
  'Because that\'s the funny thing about ordinary days.',
  'Most of them don\'t announce that they\'re about to change your life.',
  'They just begin like any other Tuesday.',
  'One person waking up at four in the afternoon.',
  'Another packing up his laptop before six.',
  'One person walking through familiar streets in Silang.',
  'Another sitting in traffic somewhere in Alabang.',
  'Two routines.',
  'Two different clocks.',
  'One message.',
  'It wasn\'t love at first sight.',
  'It wasn\'t destiny.',
  'It wasn\'t even good timing.',
  'It was simply two people who, without meaning to, started making room for each other inside lives that were already full.',
  'Neither of them knew it yet.',
  'But years later, if someone asked them where everything started...',
  'Neither would remember the exact date.',
  'They\'d remember something much smaller.',
  'A notification.',
  'A question about carbonara.',
  'And the strange feeling that talking to a complete stranger somehow felt... easy.',
  'Maybe that\'s how some love stories begin.',
  'Not with fireworks.',
  'Just with someone who quietly becomes your favorite notification.',
];

/* -- Catalogue ------------------------------------------------------------- */

/** Authored as an array (a JSON payload / query result satisfies this shape
 *  directly); keyed into the record below. Order here is catalogue order. */
const AUTHORED_BOOKS: KathaBook[] = [
  {
    /* The flagship — the platform's own author, publishing as she writes.
     * Leads the catalogue so the newest release fronts every shelf. */
    slug: 'table-for-two',
    title: 'Table for Two',
    authorId: 'auth-abigail-marte',
    category: 'Contemporary Romance',
    language: 'English / Filipino',
    status: 'Ongoing',
    updated: 'Today',
    publishedAt: '2026-07-04',
    cover: '/covers/table-for-two.svg',
    featured: true,
    synopsis:
      'Lianne answers other people\'s emails all night from Silang. Adrian likes the same coffee at the same time in Alabang. Between them: a dating app neither expected much from, a question about carbonara, and two schedules that should never have lined up. Hankerism\'s debut novel is a quiet, hopeful romance about slow burns, late-night conversations, and the person who — without fireworks, without warning — becomes your favorite notification. New chapters as they are written.',
    chapters: buildChapters([
      { slug: 'prologue', title: 'Prologue', content: TABLE_FOR_TWO_PROLOGUE },
    ]),
  },
  {
    slug: 'ang-mga-pahina-ni-lola',
    title: 'Ang Mga Pahina ni Lola',
    authorId: 'auth-lakambini-reyes',
    category: 'Literary Fiction',
    language: 'Filipino / English',
    status: 'Completed',
    updated: 'Last month',
    publishedAt: '2025-06-12',
    cover: '/covers/ang-mga-pahina-ni-lola.svg',
    synopsis:
      'The will said: the library goes to the one who will talk back to it. Fourteen boxes arrive on a Tuesday — Lola\'s whole reading life, sixty years of margins, arguments, pressed jacaranda, and one word written at the end of every finished sitting. A novel about inheritance measured in annotations, and a granddaughter who finally takes up her half of the correspondence.',
    chapters: buildChapters([
      { slug: 'labing-apat-na-kahon', title: 'Labing-apat na Kahon', content: PAHINA_OPENING },
      { slug: 'ang-gramatika-ng-guhit', title: 'Ang Gramatika ng Guhit', content: PAHINA_CONTENT },
      { slug: 'mga-bulaklak-sa-pahina', title: 'Mga Bulaklak sa Pahina', content: PAHINA_CONTENT },
      { slug: 'asuncion', title: 'Asuncion', content: PAHINA_CONTENT },
      { slug: 'ang-punong-naghihintay', title: 'Ang Punong Naghihintay', content: PAHINA_CONTENT },
      { slug: 'tapos', title: 'Tapos', content: PAHINA_CONTENT },
    ]),
  },
  {
    slug: 'liwanag-sa-kusina',
    title: 'Liwanag sa Kusina',
    authorId: 'auth-migs-ferrer',
    category: 'Slice of Life',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'This week',
    publishedAt: '2026-02-07',
    cover: '/covers/liwanag-sa-kusina.svg',
    synopsis:
      'The kitchen wakes before the house does, and these stories keep it company — the 5:41 light, the rice sighing in the pot, the fifth plate set on the second of the month for a sister eleven years gone. Migs Ferrer\'s dawn vignettes serve small mercies warm: read one with your first coffee and try not to call your mother.',
    chapters: buildChapters([
      { slug: 'alas-singko-kwarenta-y-uno', title: 'Alas-Singko Kwarenta y Uno', content: KUSINA_OPENING },
      { slug: 'ang-unang-tricycle', title: 'Ang Unang Tricycle', content: KUSINA_CONTENT },
      { slug: 'office-hours', title: 'Office Hours', content: KUSINA_CONTENT },
      { slug: 'ang-ikalimang-plato', title: 'Ang Ikalimang Plato', content: KUSINA_CONTENT },
      { slug: 'mga-upuan', title: 'Mga Upuan', content: KUSINA_CONTENT },
    ]),
  },
  {
    slug: 'ang-huling-tag-araw',
    title: 'Ang Huling Tag-araw',
    authorId: 'auth-lakambini-reyes',
    category: 'Literary Fiction',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'This week',
    publishedAt: '2026-03-14',
    cover: '/covers/ang-huling-tag-araw.svg',
    synopsis:
      'Ligaya comes home to sign the papers — nothing else, she tells the bus, the town, herself. But the blue gate still catches on the second push, the sea still keeps its appointment with the shore, and in a drawer upstairs her mother\'s letters have been holding their breath for eleven years. A luminous novel about the last summer a house is yours, and everything a family never said out loud.',
    chapters: buildChapters([
      { slug: 'the-letter-beneath-the-drawer', title: 'The Letter Beneath the Drawer', content: TAG_ARAW_OPENING },
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
    publishedAt: '2025-11-02',
    cover: '/covers/mga-liham-sa-dilim.svg',
    synopsis:
      'Dear dark: tonight the brownout took the whole street, and for once the city and I were the same shade. A slim cycle of letters addressed to the hours the light cannot supervise — candle stubs, last jeepneys, the sentences that only survive being said unseen. J. Salvador\'s most-shared collection, best read by exactly one lamp.',
    chapters: buildChapters([
      { slug: 'unang-liham', title: 'Unang Liham', content: LIHAM_OPENING },
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
    publishedAt: '2026-01-19',
    cover: '/covers/ang-bahay-sa-buwan.svg',
    featured: true,
    synopsis:
      'On the first night of every full moon, the Salazar house goes to the moon, and the family plans around it the way other families plan around the tide. Cover the mirrors. Turn the jars label-inward. Leave a window open so the house can breathe on the way up. A family saga in lunar cycles — until the year the house starts leaning moonward early, and eleven-year-old Tonio is the only one who notices.',
    chapters: buildChapters([
      { slug: 'ang-listahan-sa-paminggalan', title: 'Ang Listahan sa Paminggalan', content: BUWAN_OPENING },
      { slug: 'unang-paglalakbay', title: 'Unang Paglalakbay', content: BUWAN_CONTENT },
      { slug: 'ang-bubong-ni-tonio', title: 'Ang Bubong ni Tonio', content: BUWAN_CONTENT },
      { slug: 'mga-kapitbahay', title: 'Mga Kapitbahay', content: BUWAN_CONTENT },
      { slug: 'ang-bahay-na-nagbabalot', title: 'Ang Bahay na Nagbabalot', content: BUWAN_CONTENT },
      { slug: 'pagbabalik-sa-umaga', title: 'Pagbabalik sa Umaga', content: BUWAN_CONTENT },
    ]),
  },
  {
    slug: 'coffee-after-five',
    title: 'Coffee After Five',
    authorId: 'auth-clara-mendoza',
    category: 'Contemporary Romance',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: '3 days ago',
    publishedAt: '2026-05-08',
    cover: '/covers/coffee-after-five.svg',
    featured: true,
    synopsis:
      'The café closes at nine, but the good table — the one by the window, the one that fits exactly two — starts mattering at five. Dani makes the coffee. Marco keeps almost saying something. A warm, slow-burning romance about overtime hearts, shared outlets, and the ten minutes after your shift that quietly become the point of the day.',
    chapters: buildChapters([
      { slug: 'the-closing-shift', title: 'The Closing Shift', content: KAPE_OPENING },
      { slug: 'less-ice-extra-shot', title: 'Less Ice, Extra Shot', content: KAPE_CONTENT },
      { slug: 'ang-mesa-sa-may-bintana', title: 'Ang Mesa sa May Bintana', content: KAPE_CONTENT },
      { slug: 'thursdays-with-tita-baby', title: 'Thursdays with Tita Baby', content: KAPE_CONTENT },
      { slug: 'page-ninety', title: 'Page Ninety', content: KAPE_CONTENT },
      { slug: 'everything-after-five', title: 'Everything After Five', content: KAPE_CONTENT },
    ]),
  },
  {
    slug: 'window-seat',
    title: 'Window Seat',
    authorId: 'auth-rafael-lim',
    category: 'Contemporary Fiction',
    language: 'Filipino / English',
    status: 'Completed',
    updated: '2 weeks ago',
    publishedAt: '2025-08-30',
    cover: '/covers/window-seat.svg',
    synopsis:
      'The 11:42 is the most honest train in the city, and Rafael Lim has the window seat. A cake that missed its party, nurses comparing blisters like carpenters, an apology rehearsed until it breaks — linked stories that ride the last train home and find the whole city in one carriage. Wry, exact, and quietly devastating at closing time.',
    chapters: buildChapters([
      { slug: 'ang-11-42', title: 'Ang 11:42', content: TREN_OPENING },
      { slug: 'ang-keyk-ni-estelita', title: 'Ang Keyk ni Estelita', content: TREN_CONTENT },
      { slug: 'guadalupe', title: 'Guadalupe', content: TREN_CONTENT },
      { slug: 'walang-sumakay-sa-boni', title: 'Walang Sumakay sa Boni', content: TREN_CONTENT },
      { slug: 'huling-estasyon', title: 'Huling Estasyon', content: TREN_CONTENT },
    ]),
  },
  {
    slug: 'tomorrow-same-time',
    title: 'Tomorrow, Same Time?',
    authorId: 'auth-bea-cruz',
    category: 'Young Adult',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'Yesterday',
    publishedAt: '2026-06-21',
    cover: '/covers/tomorrow-same-time.svg',
    synopsis:
      'Eleven days of rain. One two-word message, still unanswered. A notebook that has been warned not to laugh. Isa Navarro\'s rainy-season diary is funny the way your best friend is funny — right up until it isn\'t, and you realize you\'ve been holding your breath about a boy named Migs for forty pages. For everyone who ever drafted "hey" seventeen times.',
    chapters: buildChapters([
      { slug: 'notebook-huwag-mo-akong-bibiguin', title: 'Notebook, Huwag Mo Akong Bibiguin', content: ULAN_OPENING },
      { slug: 'fact-one', title: 'Fact One', content: ULAN_CONTENT },
      { slug: 'walang-pasok', title: 'Walang Pasok', content: ULAN_CONTENT },
      { slug: 'baha-sa-uwian', title: 'Baha sa Uwian', content: ULAN_CONTENT },
      { slug: 'ang-bubong-sa-gabi', title: 'Ang Bubong sa Gabi', content: ULAN_CONTENT },
    ]),
  },
  {
    slug: 'bayan-ng-mga-alon',
    title: 'Bayan ng mga Alon',
    authorId: 'auth-emilio-santiago',
    category: 'Historical Fiction',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'Last week',
    publishedAt: '2025-09-15',
    cover: '/covers/bayan-ng-mga-alon.svg',
    synopsis:
      'The year the ships changed flags, San Isidro de las Olas kept two calendars: the friars\' printed one, and the one the sea wrote nightly along the shore. A nun hides the town\'s records in a rice jar. Twelve young men climb into the hills with two rifles. The whales come close to shore, and no proclamation mentions it. A novel of 1898 for everyone history assigned to surviving.',
    chapters: buildChapters([
      { slug: 'dalawang-kalendaryo', title: 'Dalawang Kalendaryo', content: ALON_OPENING },
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
    publishedAt: '2026-04-03',
    cover: '/covers/ang-mahiwagang-estasyon.svg',
    synopsis:
      'The station appears only to those who have missed something important, and it accepts one fare: a memory you will never have back. Odessa pays with the smell of her father\'s workshop and boards for a destination the board calls Home, But Earlier. A portal fantasy about grief, one-way tickets, and the vendors who sell bottled courage in three sizes — Mila Cruz\'s spellbound best.',
    chapters: buildChapters([
      { slug: 'ang-pamasahe', title: 'Ang Pamasahe', content: ESTASYON_OPENING },
      { slug: 'ang-tagapamahala', title: 'Ang Tagapamahala', content: ESTASYON_CONTENT },
      { slug: 'mga-tindahan-sa-plataporma', title: 'Mga Tindahan sa Plataporma', content: ESTASYON_CONTENT },
      { slug: 'home-but-earlier', title: 'Home, But Earlier', content: ESTASYON_CONTENT },
      { slug: 'ang-bintana', title: 'Ang Bintana', content: ESTASYON_CONTENT },
    ]),
  },
  {
    slug: 'apartment-9b',
    title: 'Apartment 9B',
    authorId: 'auth-tomas-reyes',
    category: 'Mystery',
    language: 'English / Filipino',
    status: 'Completed',
    updated: '2 weeks ago',
    publishedAt: '2025-10-21',
    cover: '/covers/apartment-9b.svg',
    synopsis:
      'For eleven years, the tenant in 9B paid his rent in person, on time, to the minute — which any superintendent will tell you is not a virtue but an alibi. Then the envelopes stop, the corridor smells of bleach, and Agapito Reyes lets himself into an apartment that has been emptied of everything except three items squared neatly to the kitchen table. One of them is his own private notebook. A locked-room mystery told in a building where the superintendent knows everything — and someone knows the superintendent.',
    chapters: buildChapters([
      { slug: 'the-third-list', title: 'The Third List', content: APT9B_OPENING },
      { slug: 'for-the-month', title: 'For the Month', content: APT9B_CONTENT },
      { slug: 'ang-susi', title: 'Ang Susi', content: APT9B_CONTENT },
      { slug: 'forty-one-seconds', title: 'Forty-one Seconds', content: APT9B_CONTENT },
      { slug: 'the-tenant-of-record', title: 'The Tenant of Record', content: APT9B_CONTENT },
    ]),
  },
  {
    slug: 'shelf-life',
    title: 'Shelf Life',
    authorId: 'auth-odette-ramas',
    category: 'Cozy Fiction',
    language: 'English / Filipino',
    status: 'Ongoing',
    updated: 'This week',
    publishedAt: '2026-01-30',
    cover: '/covers/shelf-life.svg',
    featured: true,
    synopsis:
      'Silid Aklatan opens at ten (meaning 10:20), keeps a cat named Margination on the poetry shelf, and lives by one hand-lettered rule: CHECK INSIDE THE BOOKS. When a box man\'s twine-tied carton yields a 1968 yearbook and an unsent love letter addressed to his father — dated before his parents ever met — Odette puts the kettle on. A warm, bookish charmer about secondhand stories, the things people leave between pages, and a shop where every carton is somebody\'s whole heart, appraised kindly.',
    chapters: buildChapters([
      { slug: 'check-inside-the-books', title: 'Check Inside the Books', content: SHELF_OPENING },
      { slug: 'ang-drawer-na-hold', title: 'Ang Drawer na HOLD', content: SHELF_CONTENT },
      { slug: 'box-men', title: 'Box Men', content: SHELF_CONTENT },
      { slug: 'margination', title: 'Margination', content: SHELF_CONTENT },
      { slug: 'page-63', title: 'Page 63', content: SHELF_CONTENT },
    ]),
  },
  {
    slug: 'the-things-we-never-sent',
    title: 'The Things We Never Sent',
    authorId: 'auth-dain-villanueva',
    category: 'Thriller',
    language: 'English',
    status: 'Completed',
    updated: 'Last month',
    publishedAt: '2025-12-05',
    cover: '/covers/the-things-we-never-sent.svg',
    synopsis:
      'You have 247 unsent drafts, and you know the number the way other people know their weight. Then at 2:14 a.m. a message arrives from a contact who has been dead for two years — quoting a draft you never sent, from a folder that has never left your hand. A psychological thriller about the versions of ourselves we keep locked in the drafts folder, and what happens when something on the other end starts drafting back. Read with the phone face-down.',
    chapters: buildChapters([
      { slug: 'two-forty-seven', title: '247', content: UNSENT_OPENING },
      { slug: 'the-honest-draft', title: 'The Honest Draft', content: UNSENT_CONTENT },
      { slug: 'typing', title: 'Typing…', content: UNSENT_CONTENT },
      { slug: 'read-receipts', title: 'Read Receipts', content: UNSENT_CONTENT },
      { slug: 'sent', title: 'Sent', content: UNSENT_CONTENT },
    ]),
  },
  {
    slug: 'ang-ikatlong-katok',
    title: 'Ang Ikatlong Katok',
    authorId: 'auth-remedios-cua',
    category: 'Horror',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'Yesterday',
    publishedAt: '2025-07-18',
    cover: '/covers/ang-ikatlong-katok.svg',
    synopsis:
      'In their town, doors are answered on the second knock. Never the first — the first is for testing. Never the third, because by the third it is no longer asking the house. It is asking you, in the voice of someone you love. A quietly terrifying novel of embroidered rules, nailed-shut kitchen doors, and a lola who keeps stitching while something patient waits out the rain on the porch. Cua\'s dread does not raise its voice. It doesn\'t need to.',
    chapters: buildChapters([
      { slug: 'ang-mga-patakaran', title: 'Ang Mga Patakaran', content: KATOK_OPENING },
      { slug: 'unang-katok', title: 'Unang Katok', content: KATOK_CONTENT },
      { slug: 'asin-sa-bintana', title: 'Asin sa Bintana', content: KATOK_CONTENT },
      { slug: 'ang-pintong-asul', title: 'Ang Pintong Asul', content: KATOK_CONTENT },
      { slug: 'ang-boses', title: 'Ang Boses', content: KATOK_CONTENT },
    ]),
  },
  {
    slug: 'sunday-grocery-list',
    title: 'Sunday Grocery List',
    authorId: 'auth-migs-ferrer',
    category: 'Slice of Life',
    language: 'English / Filipino',
    status: 'Completed',
    updated: 'Last week',
    publishedAt: '2026-03-27',
    cover: '/covers/sunday-grocery-list.svg',
    synopsis:
      'For eleven years his wife wrote the Sunday list and he did the buying. Now the mango-covered notebook is four pages from the end, the market has been briefed from beyond, and a seven-year-old auditor has added OOBEY ICE CREAM in pencil, spelling preserved forever. A year of grocery lists that is secretly a book about grief, fatherhood, and the red coffee, NOT the gold. You will laugh, and then somewhere around the tinola you will not.',
    chapters: buildChapters([
      { slug: 'ang-notebook-na-mangga', title: 'Ang Notebook na Mangga', content: GROCERY_OPENING },
      { slug: 'red-not-gold', title: 'Red, Not Gold', content: GROCERY_CONTENT },
      { slug: 'aling-susan', title: 'Aling Susan', content: GROCERY_CONTENT },
      { slug: 'oobey', title: 'Oobey', content: GROCERY_CONTENT },
      { slug: 'four-pages-left', title: 'Four Pages Left', content: GROCERY_CONTENT },
    ]),
  },
  {
    slug: 'saturday-maybe',
    title: 'Saturday, Maybe',
    authorId: 'auth-clara-mendoza',
    category: 'Contemporary Romance',
    language: 'Filipino / English',
    status: 'Completed',
    updated: 'Last month',
    publishedAt: '2025-10-11',
    cover: '/covers/saturday-maybe.svg',
    synopsis:
      'One sunflower, every Saturday, "para kay Lola" — except nobody\'s lola needs a sunflower a week, and by the fourth market day Ana has done the math. A courtship conducted at a flower stall, one wrapped stem and one rationed question at a time, until the morning it rains sideways and somebody shows up anyway, holding a thermos. Clara Mendoza\'s gentlest, surest romance: the whole plot is two people slowly retiring the word maybe.',
    chapters: buildChapters([
      { slug: 'para-kay-lola', title: 'Para Kay Lola', content: SABADO_OPENING },
      { slug: 'ang-pinakamagandang-bulaklak', title: 'Ang Pinakamagandang Bulaklak', content: SABADO_CONTENT },
      { slug: 'closing-price', title: 'Closing Price', content: SABADO_CONTENT },
      { slug: 'ulan-sa-palengke', title: 'Ulan sa Palengke', content: SABADO_CONTENT },
      { slug: 'walang-maybe', title: 'Walang Maybe', content: SABADO_CONTENT },
    ]),
  },
  {
    slug: 'before-the-last-train',
    title: 'Before the Last Train',
    authorId: 'auth-rafael-lim',
    category: 'Contemporary Fiction',
    language: 'English / Filipino',
    status: 'Ongoing',
    updated: '4 days ago',
    publishedAt: '2026-05-22',
    cover: '/covers/before-the-last-train.svg',
    synopsis:
      'The companion book to Window Seat — same platform, twenty-three minutes earlier. This is the hour that belongs to no one: the people who could have caught the 11:19 and quietly, nightly, decide not to. The vendor\'s closing arithmetic, the guard\'s dead flashlight, the guitar that is never played and always brought. Rafael Lim rides nothing this time; he just stands on the platform and takes the whole city\'s attendance.',
    chapters: buildChapters([
      { slug: 'the-11-19', title: 'The 11:19', content: BAGO_OPENING },
      { slug: 'closing-arithmetic', title: 'Closing Arithmetic', content: BAGO_CONTENT },
      { slug: 'ang-gitara', title: 'Ang Gitara', content: BAGO_CONTENT },
      { slug: 'flashlight-ni-bautista', title: 'Flashlight ni Bautista', content: BAGO_CONTENT },
    ]),
  },
  {
    slug: 'sa-ilalim-ng-sampaguita',
    title: 'Sa Ilalim ng Sampaguita',
    authorId: 'auth-noemi-bautista',
    category: 'Magical Realism',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'This week',
    publishedAt: '2026-06-05',
    cover: '/covers/sa-ilalim-ng-sampaguita.svg',
    synopsis:
      'The sampaguita hedge at the Villareal house returns things — only things buried on purpose, only one per flowering, always politely, wrapped in leaves at the doorstep before six. For ninety years the family has kept its rules and its silences. Then the house goes up for sale, the hedge blooms three weeks early, and it leaves on the step a small parcel addressed to no one that everyone recognizes. Noemi Bautista at her most quietly devastating: an impossibility with excellent manners, starting the one conversation a family swore never to have.',
    chapters: buildChapters([
      { slug: 'ang-unang-bulaklak', title: 'Ang Unang Bulaklak', content: SAMPAGUITA_OPENING },
      { slug: 'mga-patakaran-ng-halaman', title: 'Mga Patakaran ng Halaman', content: SAMPAGUITA_CONTENT },
      { slug: 'ang-singsing-ni-tiya-loleng', title: 'Ang Singsing ni Tiya Loleng', content: SAMPAGUITA_CONTENT },
      { slug: 'for-sale', title: 'For Sale', content: SAMPAGUITA_CONTENT },
      { slug: 'ang-sagot-sa-pinto', title: 'Ang Sagot sa Pinto', content: SAMPAGUITA_CONTENT },
    ]),
  },
  {
    slug: 'after-midnight',
    title: 'After Midnight',
    authorId: 'auth-j-salvador',
    category: 'Poetry',
    language: 'English / Filipino',
    status: 'Ongoing',
    updated: 'Yesterday',
    publishedAt: '2026-04-18',
    cover: '/covers/after-midnight.svg',
    synopsis:
      'The hours after twelve, taken down under oath. J. Salvador\'s second cycle timestamps the city nobody supervises — the empty jeepney upholstered in orange light, the refrigerator\'s one hymn, the drafts folder as the most honest room in the phone. Where Mga Liham sa Dilim wrote to the dark, After Midnight keeps its logbook: composed, polished, never sent. Kung nabasa mo ito — hindi ko sinend. That was the point.',
    chapters: buildChapters([
      { slug: 'logbook', title: 'Logbook', content: HATINGGABI_OPENING },
      { slug: 'ang-huling-jeep', title: 'Ang Huling Jeep', content: HATINGGABI_CONTENT },
      { slug: 'drafts-folder', title: 'Drafts Folder', content: HATINGGABI_CONTENT },
      { slug: 'alas-tres', title: 'Alas Tres', content: HATINGGABI_CONTENT },
    ]),
  },
  {
    slug: 'alamat-ng-huling-diwata',
    title: 'Alamat ng Huling Diwata',
    authorId: 'auth-elia-navarro',
    category: 'Fantasy',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: '3 days ago',
    publishedAt: '2026-05-30',
    cover: '/covers/alamat-ng-huling-diwata.svg',
    synopsis:
      'Some families keep land titles. The Navarros keep a diwata — in the last acacia at kilometer eleven, under a bargain written in 1897: the tree stands, the town drinks. Now the notebook has chosen a fifth keeper, a nineteen-year-old with a city scholarship and no patience for inheritance, and the road survey crew has marked the trunk with an X. Elia Navarro retells the old stories from the inside — myth as family paperwork, kept by hand, six generations deep, with the funniest and saddest diwata in Philippine fantasy waiting overhead.',
    chapters: buildChapters([
      { slug: 'ang-lata-ng-biskwit', title: 'Ang Lata ng Biskwit', content: DIWATA_OPENING },
      { slug: 'ang-kasunduan', title: 'Ang Kasunduan', content: DIWATA_CONTENT },
      { slug: 'superstition', title: 'Superstition', content: DIWATA_CONTENT },
      { slug: 'ang-ekis-sa-puno', title: 'Ang Ekis sa Puno', content: DIWATA_CONTENT },
      { slug: 'huling-gabi-ng-buwan', title: 'Huling Gabi ng Buwan', content: DIWATA_CONTENT },
    ]),
  },
  {
    slug: 'the-bookshop-beside-the-bakery',
    title: 'The Bookshop Beside the Bakery',
    authorId: 'auth-odette-ramas',
    category: 'Cozy Fiction',
    language: 'English / Filipino',
    status: 'Completed',
    updated: 'Last week',
    publishedAt: '2026-06-19',
    cover: '/covers/the-bookshop-beside-the-bakery.svg',
    synopsis:
      'Silid Aklatan shares a wall with Panaderia Luna, and the wall takes the bakery\'s side: nineteen years of 4 a.m. ovens have proofed every book in the shop, and customers swear the paperbacks smell like mornings. Through the ledge in the party wall runs the only economy that matters — bread going east, books going west, sea stories priced in ensaymada by a baker who has never seen the ocean. Odette Ramas\'s warmest book yet: two shops, one cat with dual citizenship, and a friendship conducted entirely in trade.',
    chapters: buildChapters([
      { slug: 'ang-pader', title: 'Ang Pader', content: PANADERIA_OPENING },
      { slug: 'the-ledge', title: 'The Ledge', content: PANADERIA_CONTENT },
      { slug: 'sea-stories', title: 'Sea Stories', content: PANADERIA_CONTENT },
      { slug: 'amoy-almusal', title: 'Amoy Almusal', content: PANADERIA_CONTENT },
      { slug: 'dual-citizenship', title: 'Dual Citizenship', content: PANADERIA_CONTENT },
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
  cover: string | null;
  chapters: Array<{ number: number; slug: string; title: string }>;
}

export function getSearchIndex(): BookSearchRecord[] {
  return getAllBooks().map((book) => ({
    slug: book.slug,
    title: book.title,
    authorId: book.authorId,
    category: book.category,
    cover: book.cover,
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
