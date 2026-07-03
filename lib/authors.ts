/* ---------------------------------------------------------------------------
 * KATHA · Author domain
 * lib/authors.ts
 *
 * The single source of truth for author identity and metadata. Books reference
 * authors ONLY by `authorId`; every displayed author fact (name, bio, avatar,
 * location) comes from here. Framework-agnostic, like lib/books.ts: plain
 * serializable data plus pure lookups, shaped for a real source later.
 *
 * Identity is deliberately two fields:
 *   · `id`   — the stable foreign key books store. Never changes.
 *   · `slug` — the /authors/[slug] route segment. May be renamed/localized in
 *              the future without touching any book row.
 *
 * `avatar` / `banner` are ready for uploaded profile media: null today, a URL
 * later, and the UI already branches on them (initials portrait / plain band
 * as fallbacks). Derived facts — genres, book counts, bibliographies — are
 * intentionally NOT stored; they come from lib/author-selectors.ts so they
 * can never drift from the catalogue.
 * ------------------------------------------------------------------------- */

export interface KathaAuthor {
  /** Stable foreign key (what KathaBook.authorId stores). Never changes. */
  id: string;
  /** The ACCOUNT this writing identity belongs to (User.id) — the person
   *  behind the pen. Null for the sample catalogue authors, who predate
   *  accounts; always set for author profiles created through the ladder.
   *  Linking a profile never creates a second account. */
  userId: string | null;
  /** URL-safe route segment for /authors/[slug]. Renameable, unlike `id`.
   *  Only authors have public slugs — readers never do. */
  slug: string;
  /** The public byline — the user's own name, or a pen name. */
  displayName: string;
  bio: string;
  location: string;
  /** Profile media — null until authors can upload; the UI falls back to an
   *  initials portrait / plain band. */
  avatar: string | null;
  banner: string | null;
  /** Editorial pick — surfaces on the featured authors shelf. */
  featured?: boolean;
  /** On the Writing Desk — in-progress manuscripts shown on the public
   *  profile. Editorial content, not catalogue entries: these have no pages
   *  in the library until the author places them there. */
  desk?: Array<{ title: string; category: string; note?: string }>;
}

/** Authored as an array (a JSON payload / query result satisfies this shape
 *  directly); keyed into the record below by the stable id. */
const AUTHORED_AUTHORS: KathaAuthor[] = [
  {
    /* The platform's first author — a PEN NAME linked to a real account
     * (userId), so the ladder ADOPTS this profile rather than creating a
     * second identity. The id is a stable internal key and never renders;
     * the public identity is the displayName and slug. */
    id: 'auth-abigail-marte',
    userId: 'user-abigail-marte',
    slug: 'hankerism',
    displayName: 'Hankerism',
    bio: 'Some stories begin with grand adventures. Mine usually begin with ordinary days, quiet conversations, and someone becoming your favorite notification.',
    location: 'Philippines',
    avatar: null,
    banner: null,
    featured: true,
    desk: [
      {
        title: 'Table for Two',
        category: 'Contemporary Romance',
        note: 'Currently writing — the first pages are taking shape inside KATHA’s Writing Studio.',
      },
    ],
  },
  {
    id: 'auth-lakambini-reyes',
    userId: null,
    slug: 'lakambini-reyes',
    displayName: 'Lakambini Reyes',
    bio: 'Writes quiet literary fiction about memory, family, and the houses that keep both. Her chapters read like long afternoons in a coastal town.',
    location: 'Manila',
    avatar: null,
    banner: null,
    featured: true,
  },
  {
    id: 'auth-j-salvador',
    userId: null,
    slug: 'j-salvador',
    displayName: 'J. Salvador',
    bio: 'Writes prose poems shaped like letters to the dark — brownouts, candlelight, and the hour after the last jeepney.',
    location: 'Quezon City',
    avatar: null,
    banner: null,
    featured: true,
  },
  {
    id: 'auth-noemi-bautista',
    userId: null,
    slug: 'noemi-bautista',
    displayName: 'Noemi Bautista',
    bio: 'Tells stories in which impossible things happen politely, inside ordinary Philippine homes. Her houses have errands of their own.',
    location: 'Dumaguete',
    avatar: null,
    banner: null,
    featured: true,
  },
  {
    id: 'auth-clara-mendoza',
    userId: null,
    slug: 'clara-mendoza',
    displayName: 'Clara Mendoza',
    bio: 'Writes slow, warm love stories that begin at flower stalls and take their time getting anywhere — on purpose.',
    location: 'Laguna',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-rafael-lim',
    userId: null,
    slug: 'rafael-lim',
    displayName: 'Rafael Lim',
    bio: 'Rides the last train home and writes down everything the city was too tired to say out loud. Linked vignettes, wry and exact.',
    location: 'Makati',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-tomas-reyes',
    userId: null,
    slug: 'tomas-reyes',
    displayName: 'Tomas Reyes',
    bio: 'Writes mysteries the way buildings keep records: precisely, patiently, and with a list for the things that have no form. The crime is always quieter than the silence around it.',
    location: 'Iloilo',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-emilio-santiago',
    userId: null,
    slug: 'emilio-santiago',
    displayName: 'Emilio Santiago',
    bio: 'Writes about coastal towns, changing flags, and the people history assigns to surviving. Formal cadence, salt air, and two calendars kept at all times.',
    location: 'Iloilo',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-bea-cruz',
    userId: null,
    slug: 'bea-cruz',
    displayName: 'Bea Cruz',
    bio: 'Writes rainy-season diaries for readers still figuring out who they are when nobody is asking them to be anything. Notebooks are sworn to secrecy.',
    location: 'Marikina',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-elia-navarro',
    userId: null,
    slug: 'elia-navarro',
    displayName: 'Elia Navarro',
    bio: 'Retells the old stories from the inside — diwata, engkanto, the bargains our grandmothers half-remember — in a Filipino fantasy voice that treats myth as family history.',
    location: 'Siquijor',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-odette-ramas',
    userId: null,
    slug: 'odette-ramas',
    displayName: 'Odette Ramas',
    bio: 'Keeps a secondhand bookshop and its opinions. Writes cozy fiction about the things people leave inside books, appraised honestly, held warm. The kettle is always on.',
    location: 'Vigan',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-dain-villanueva',
    userId: null,
    slug: 'dain-villanueva',
    displayName: 'Dain Villanueva',
    bio: 'Writes thrillers for the hour when the phone lights the ceiling. Interested in drafts folders, read receipts, and every technology we use to almost say things.',
    location: 'Taguig',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-remedios-cua',
    userId: null,
    slug: 'remedios-cua',
    displayName: 'Remedios Cua',
    bio: 'Collects the rules small towns keep and writes down what they cost. Her horror never raises its voice; it knocks politely, and it can wait longer than you can.',
    location: 'Capiz',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-migs-ferrer',
    userId: null,
    slug: 'migs-ferrer',
    displayName: 'Migs Ferrer',
    bio: 'Sells insurance on weekdays and keeps lists on Sundays. Writes slice-of-life about ordinary paperwork — groceries, receipts, forms — and the enormous things it quietly holds.',
    location: 'Pasig',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-mila-cruz',
    userId: null,
    slug: 'mila-cruz',
    displayName: 'Mila Cruz',
    bio: 'Builds stations between worlds and prices every ticket in memories. Portal fantasy with a conductor’s patience.',
    location: 'Baguio',
    avatar: null,
    banner: null,
  },
];

/** The author table, keyed by stable id. Swap AUTHORED_AUTHORS for a fetched
 *  payload and everything downstream follows. */
export const AUTHORS: Record<string, KathaAuthor> = Object.fromEntries(
  AUTHORED_AUTHORS.map((author) => [author.id, author]),
);

/* -- Lookups --------------------------------------------------------------- */

export function getAuthorById(id: string): KathaAuthor | undefined {
  return AUTHORS[id];
}

export function getAuthorBySlug(slug: string): KathaAuthor | undefined {
  return getAllAuthors().find((author) => author.slug === slug);
}

/** Every author, in catalogue order. */
export function getAllAuthors(): KathaAuthor[] {
  return Object.values(AUTHORS);
}

/** Editorial picks for the featured authors shelf, in catalogue order. */
export function getFeaturedAuthors(): KathaAuthor[] {
  return getAllAuthors().filter((author) => author.featured);
}
