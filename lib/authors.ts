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
  /** URL-safe route segment for /authors/[slug]. Renameable, unlike `id`. */
  slug: string;
  name: string;
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
    id: 'auth-lakambini-reyes',
    slug: 'lakambini-reyes',
    name: 'Lakambini Reyes',
    bio: 'Writes quiet literary fiction about memory, family, and the houses that keep both. Her chapters read like long afternoons in a coastal town.',
    location: 'Manila',
    avatar: null,
    banner: null,
    featured: true,
  },
  {
    id: 'auth-j-salvador',
    slug: 'j-salvador',
    name: 'J. Salvador',
    bio: 'Writes prose poems shaped like letters to the dark — brownouts, candlelight, and the hour after the last jeepney.',
    location: 'Quezon City',
    avatar: null,
    banner: null,
    featured: true,
  },
  {
    id: 'auth-noemi-bautista',
    slug: 'noemi-bautista',
    name: 'Noemi Bautista',
    bio: 'Tells stories in which impossible things happen politely, inside ordinary Philippine homes. Her houses have errands of their own.',
    location: 'Dumaguete',
    avatar: null,
    banner: null,
    featured: true,
  },
  {
    id: 'auth-clara-mendoza',
    slug: 'clara-mendoza',
    name: 'Clara Mendoza',
    bio: 'Writes slow, warm love stories that begin at flower stalls and take their time getting anywhere — on purpose.',
    location: 'Laguna',
    avatar: null,
    banner: null,
    featured: true,
  },
  {
    id: 'auth-rafael-lim',
    slug: 'rafael-lim',
    name: 'Rafael Lim',
    bio: 'Rides the last train home and writes down everything the city was too tired to say out loud. Linked vignettes, wry and exact.',
    location: 'Makati',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-isa-navarro',
    slug: 'isa-navarro',
    name: 'Isa Navarro',
    bio: 'Writes rainy-season diaries for readers still figuring out who they are when nobody is asking them to be anything.',
    location: 'Marikina',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-tomas-reyes',
    slug: 'tomas-reyes',
    name: 'Tomas Reyes',
    bio: 'Writes about coastal towns, changing flags, and the people history assigns to surviving. Formal cadence, salt air.',
    location: 'Iloilo',
    avatar: null,
    banner: null,
  },
  {
    id: 'auth-mila-cruz',
    slug: 'mila-cruz',
    name: 'Mila Cruz',
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
