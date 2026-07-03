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
}

/** Authored as an array (a JSON payload / query result satisfies this shape
 *  directly); keyed into the record below by the stable id. */
const AUTHORED_AUTHORS: KathaAuthor[] = [
  {
    /* The platform's first author — linked to a real account (userId), so the
     * ladder ADOPTS this profile rather than creating a second identity. */
    id: 'auth-abigail-marte',
    userId: 'user-abigail-marte',
    slug: 'abigail-marte',
    displayName: 'Abigail Marte',
    bio: 'KATHA’s first author. Writes about inherited libraries, dawn kitchens, and the correspondence hidden in ordinary rooms — margins, lists, and the hour before the house wakes.',
    location: 'Manila',
    avatar: null,
    banner: null,
    featured: true,
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
    id: 'auth-isa-navarro',
    userId: null,
    slug: 'isa-navarro',
    displayName: 'Isa Navarro',
    bio: 'Writes rainy-season diaries for readers still figuring out who they are when nobody is asking them to be anything.',
    location: 'Marikina',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-tomas-reyes',
    userId: null,
    slug: 'tomas-reyes',
    displayName: 'Tomas Reyes',
    bio: 'Writes about coastal towns, changing flags, and the people history assigns to surviving. Formal cadence, salt air.',
    location: 'Iloilo',
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
