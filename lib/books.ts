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

/** Sa Ilalim ng Sampaguita — warm romance; banter over a flower stall. */
const SAMPAGUITA_CONTENT: string[] = [
  'The first thing Marisol ever sold him was a garland he did not want. "For your girlfriend," she said. "I don\'t have one," said Elias. "For your luck, then," she said. "You clearly need it."',
  'He came back the next Friday, and the one after that, until the sampaguita stall by the church steps had quietly become the fixed point around which his week arranged itself.',
  "She talked while she strung the buds — about the flower farms in Laguna, about her brother's tuition, about how rain was good for business because guilt, like jasmine, opens in bad weather. He mostly listened. He was good at that, and she noticed.",
  '"You buy flowers every week," she said once, tying off a garland, "and you give them to no one. I checked." Elias held the white loop of blossoms like a small verdict. "They\'re for the vendor," he said, before he could stop himself.',
  'The church bells counted six. Neither of them moved. Between them the sampaguita did what it always does at dusk — it opened, unhurried, certain it would be forgiven for taking its time.',
];

/** Sa Ilalim ng Sampaguita, Chapter One — the full opening. */
const SAMPAGUITA_OPENING: string[] = [
  'The first thing Marisol ever sold him was a garland he did not want. "For your girlfriend," she said. "I don\'t have one," said Elias. "For your luck, then," she said. "You clearly need it."',
  'He had only stopped at the stall because the jeepney had left without him, which he would later refuse to call luck and she would later refuse to call anything else.',
  'The stall stood at the foot of the church steps, in the wedge of shade the bell tower laid down every afternoon like a tablecloth. Sampaguita in looped strings, everlasting in stiff bundles, and on good days a bucket of roses that Marisol treated with the mild suspicion reserved for out-of-town relatives.',
  'Elias paid for the garland and then stood there holding it, a man who had solved the wrong problem. "You hang it on something," Marisol offered. "A mirror. A saint. A steering wheel, if you drive. Do you drive?" "I take the jeep." "Then hang it on your week," she said, turning to the next customer, "and see if it improves."',
  'He came back the next Friday, and the one after that, until the stall by the church steps had quietly become the fixed point around which his week arranged itself. He learned that Fridays were her long days, that she saved the unsold buds for the six o\'clock Mass crowd, that she could make change and an argument at the same time without dropping either.',
  "She talked while she strung the buds — about the flower farms in Laguna, about her brother's tuition, about how rain was good for business because guilt, like jasmine, opens in bad weather. He mostly listened. He was good at that, and she noticed, because people who sell flowers outside churches know exactly how rare good listening is.",
  '"You buy flowers every week," she said once, tying off a garland, "and you give them to no one. I checked." "You checked?" "I have sources," said Marisol, whose sources were the candle vendor and two of the more talkative parking boys. "Every Friday, one garland, and it goes home with you like a bachelor\'s conscience."',
  'Elias held the white loop of blossoms like a small verdict. "They\'re for the vendor," he said, before he could stop himself.',
  'The sentence stood between them in the flower-smelling air, more honest than either of them had dressed for. Marisol looked at him the way she looked at the sky in typhoon season — carefully, and with an expert\'s respect for what might be coming.',
  '"Well," she said at last, going back to her stringing, though her hands had lost their place, "the vendor charges extra for that."',
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

/* -- Catalogue ------------------------------------------------------------- */

/** Authored as an array (a JSON payload / query result satisfies this shape
 *  directly); keyed into the record below. Order here is catalogue order. */
const AUTHORED_BOOKS: KathaBook[] = [
  {
    slug: 'ang-mga-pahina-ni-lola',
    title: 'Ang Mga Pahina ni Lola',
    authorId: 'auth-abigail-marte',
    category: 'Literary Fiction',
    language: 'Filipino / English',
    status: 'Completed',
    updated: 'Last month',
    publishedAt: '2025-06-12',
    cover: '/covers/ang-mga-pahina-ni-lola.svg',
    featured: true,
    synopsis:
      'Fourteen boxes of annotated books, one clause in a will — "the library goes to the one who will talk back to it" — and a granddaughter who does. A novel about inheritance, marginalia, and the correspondence that outlives us, read one margin at a time.',
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
    authorId: 'auth-abigail-marte',
    category: 'Short Stories',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'This week',
    publishedAt: '2026-02-07',
    cover: '/covers/liwanag-sa-kusina.svg',
    synopsis:
      'Stories set in the hour the kitchen keeps for itself — before the alarms, before the chairs, when the first light lands on the table and the house is still deciding to exist. Small mercies, served warm, one dawn at a time.',
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
    featured: true,
    synopsis:
      'A tender literary novel about memory, family, and the final summer before everything changes. Set between Manila and a quiet coastal town, Ang Huling Tag-araw follows a young woman returning home to confront old letters, unfinished grief, and the kind of love that never fully leaves.',
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
    featured: true,
    synopsis:
      'A slim cycle of prose poems written as letters to the dark — brownouts, candlelight, the hour after the last jeepney. J. Salvador turns the nightly failures of the grid into a correspondence with everything the light leaves out.',
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
      'Once a month, on the full moon, the Salazar house quietly leaves for the moon and comes back by morning. A family saga told in lunar cycles, about the errands of houses, the habits of grief, and what it costs a home to love the quiet.',
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
    slug: 'sa-ilalim-ng-sampaguita',
    title: 'Sa Ilalim ng Sampaguita',
    authorId: 'auth-clara-mendoza',
    category: 'Romance',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: '3 days ago',
    publishedAt: '2026-05-08',
    cover: '/covers/sa-ilalim-ng-sampaguita.svg',
    synopsis:
      'Every Friday, Elias buys a garland he gives to no one from the sampaguita stall by the church steps. A slow, warm romance about flowers sold at dusk, tuition arithmetic, and the courage it takes to say who the flowers are for.',
    chapters: buildChapters([
      { slug: 'ang-unang-kwintas', title: 'Ang Unang Kwintas', content: SAMPAGUITA_OPENING },
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
    publishedAt: '2025-08-30',
    cover: '/covers/huling-tren-pauwi.svg',
    synopsis:
      'Linked vignettes from the 11:42 — the last train home. A cake missing its party, nurses comparing blisters, a rehearsed apology that gets worse on purpose. Rafael Lim rides the length of the line and finds the whole city in one carriage.',
    chapters: buildChapters([
      { slug: 'ang-11-42', title: 'Ang 11:42', content: TREN_OPENING },
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
    publishedAt: '2026-06-21',
    cover: '/covers/mga-tala-sa-ulan.svg',
    synopsis:
      'Eleven straight days of rain, one unanswered message, and a notebook that cannot laugh. A rainy-season diary about class suspensions, sari-sari store kwentuhan, and figuring out who you are when nobody expects you to be anything.',
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
    authorId: 'auth-tomas-reyes',
    category: 'Historical Fiction',
    language: 'Filipino / English',
    status: 'Ongoing',
    updated: 'Last week',
    publishedAt: '2025-09-15',
    cover: '/covers/bayan-ng-mga-alon.svg',
    synopsis:
      'San Isidro de las Olas, 1898: the ships change flags, the proclamations change hands, and a fishing town keeps its two calendars — the printed one and the one the sea writes nightly. A novel about the people history assigns to surviving.',
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
      'The station appears only to those who have missed something important, and the fare is a memory you will never have back. Odessa pays, boards, and learns what the departures board means by "Home, But Earlier." A portal fantasy about what travel costs.',
    chapters: buildChapters([
      { slug: 'ang-pamasahe', title: 'Ang Pamasahe', content: ESTASYON_OPENING },
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
