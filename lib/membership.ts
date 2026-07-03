/* ---------------------------------------------------------------------------
 * KATHA · Membership — the viewer domain
 * lib/membership.ts
 *
 * One identity, three states: guest → reader → author. The record separates
 * the PERSON from the PEN:
 *
 *   User   — the account (first name, last name, email, tier). Readers are
 *            people: no username, no public slug, no profile page.
 *   Author — the public writing identity (display name, slug, bio, media),
 *            linked to the user by userId. Becoming an author never creates
 *            a second account — it links a profile to the same user, and the
 *            display name may be a pen name ("Abigail Marte" the person may
 *            write as "Luna Santiago").
 *
 * The ladder: Guest → Join → Reader → Become an Author → Complete Author
 * Profile → the Writing Desk.
 *
 * Pre-authentication semantics: the record lives in localStorage (house
 * pattern). Guest is the default; the local user stub is Abigail Marte (the
 * assumed person until sessions exist — the calm sign-up that collects first
 * name / last name / email / password arrives with real accounts). Reading
 * data is never touched by any transition, and resetMembership() keeps the
 * whole onboarding walkable.
 *
 * getViewer() remains THE authentication seam: with Supabase it derives the
 * same Viewer from users + authors rows, and everything downstream is
 * already correct.
 * ------------------------------------------------------------------------- */

import type { KathaUser } from './users';
import { getAllAuthors, type KathaAuthor } from './authors';
import { foldText } from './text';

export type MembershipTier = 'guest' | 'reader' | 'author';

export interface Viewer {
  tier: MembershipTier;
  /** The account (absent for guests). */
  user?: KathaUser;
  /** The public writing identity (authors only). */
  author?: KathaAuthor;
  /** Convenience mirrors, used across gates and the Studio. */
  authorId?: string;
  joinedAt?: string;
}

export const MEMBERSHIP_STORAGE_KEY = 'katha:membership';

/** Fired on every membership transition so mounted surfaces (Navbar, gates,
 *  shelves) can refresh without a navigation. */
export const MEMBERSHIP_CHANGED_EVENT = 'katha:membership-changed';

/** The assumed person, until sessions exist. */
const PRE_AUTH_USER_ID = 'user-abigail-marte';
const PRE_AUTH_FIRST_NAME = 'Abigail';
const PRE_AUTH_LAST_NAME = 'Marte';

/** Legacy author id (kept so works written before the User/Author split still
 *  resolve to the migrated profile). */
export const DEFAULT_STUDIO_AUTHOR_ID = 'auth-abigail-marte';

const GUEST: Viewer = { tier: 'guest' };

/* ── Stored record ───────────────────────────────────────────────────────── */

interface MembershipRecord {
  user: KathaUser;
  author?: KathaAuthor;
}

function isUser(value: unknown): value is KathaUser {
  if (!value || typeof value !== 'object') return false;
  const u = value as Record<string, unknown>;
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.firstName === 'string' &&
    typeof u.lastName === 'string' &&
    (u.tier === 'reader' || u.tier === 'author') &&
    typeof u.joinedAt === 'string'
  );
}

function isAuthorProfile(value: unknown): value is KathaAuthor {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.slug === 'string' &&
    typeof a.displayName === 'string' &&
    typeof a.bio === 'string' &&
    typeof a.location === 'string' &&
    (a.userId === null || typeof a.userId === 'string') &&
    (a.avatar === null || typeof a.avatar === 'string') &&
    (a.banner === null || typeof a.banner === 'string')
  );
}

function isMembershipRecord(value: unknown): value is MembershipRecord {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    isUser(r.user) &&
    (r.author === undefined || isAuthorProfile(r.author))
  );
}

/* Legacy shape (pre User/Author split): { tier, authorId?, joinedAt }. */
interface LegacyRecord {
  tier: 'reader' | 'author';
  authorId?: string;
  joinedAt: string;
}

function isLegacyRecord(value: unknown): value is LegacyRecord {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    (r.tier === 'reader' || r.tier === 'author') &&
    typeof r.joinedAt === 'string' &&
    !('user' in r)
  );
}

function migrateLegacy(legacy: LegacyRecord): MembershipRecord {
  const user: KathaUser = {
    id: PRE_AUTH_USER_ID,
    email: '',
    firstName: PRE_AUTH_FIRST_NAME,
    lastName: PRE_AUTH_LAST_NAME,
    tier: legacy.tier,
    joinedAt: legacy.joinedAt,
  };
  if (legacy.tier !== 'author') return { user };
  return {
    user,
    author: {
      id: legacy.authorId ?? DEFAULT_STUDIO_AUTHOR_ID,
      userId: user.id,
      slug: 'abigail-marte',
      displayName: `${PRE_AUTH_FIRST_NAME} ${PRE_AUTH_LAST_NAME}`,
      bio: '',
      location: '',
      avatar: null,
      banner: null,
    },
  };
}

function readRecord(): MembershipRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isMembershipRecord(parsed)) return parsed;
    if (isLegacyRecord(parsed)) {
      const migrated = migrateLegacy(parsed);
      writeRecord(migrated); // persist the upgrade once
      return migrated;
    }
    return null;
  } catch {
    return null;
  }
}

function writeRecord(record: MembershipRecord | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (record) {
      window.localStorage.setItem(
        MEMBERSHIP_STORAGE_KEY,
        JSON.stringify(record),
      );
    } else {
      window.localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
    }
    window.dispatchEvent(new Event(MEMBERSHIP_CHANGED_EVENT));
  } catch {
    // Storage unavailable — best-effort; the viewer simply stays a guest.
  }
}

/* ── The seam ────────────────────────────────────────────────────────────── */

/** Who is looking at the page. Guest on the server and for any visitor who
 *  hasn't joined; the tier escalates within the SAME identity. */
export function getViewer(): Viewer {
  const record = readRecord();
  if (!record) return GUEST;
  return {
    tier: record.user.tier,
    user: record.user,
    author: record.author,
    authorId: record.author?.id,
    joinedAt: record.user.joinedAt,
  };
}

/* ── Transitions ─────────────────────────────────────────────────────────── */

function newUser(now: string): KathaUser {
  return {
    id: PRE_AUTH_USER_ID,
    email: '',
    firstName: PRE_AUTH_FIRST_NAME,
    lastName: PRE_AUTH_LAST_NAME,
    tier: 'reader',
    joinedAt: now,
  };
}

/** Guest → Reader. Idempotent; never downgrades an author. Any reading data
 *  already on the device simply becomes visible. */
export function joinAsReader(): Viewer {
  if (readRecord()) return getViewer();
  writeRecord({ user: newUser(new Date().toISOString()) });
  return getViewer();
}

/* ── Author profiles ─────────────────────────────────────────────────────── */

export interface AuthorProfileInput {
  /** The public byline — the user's own name, or a pen name. */
  displayName: string;
  bio?: string;
  location?: string;
}

function newAuthorProfileId(): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `auth_${random}`;
}

/** Author slug from the display name, kept clear of the catalogue's slugs. */
function authorSlugFor(displayName: string): string {
  const base =
    foldText(displayName)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'author';
  const taken = new Set(getAllAuthors().map((author) => author.slug));
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/** Reader → Author: links a public writing identity to the SAME user (a
 *  guest walking in becomes a member in the same step). Creating an Author
 *  never creates a second account. Called again, it refines the existing
 *  profile — the id (and any works pointing at it) stays stable. */
export function completeAuthorProfile(input: AuthorProfileInput): Viewer {
  const now = new Date().toISOString();
  const existing = readRecord();
  const user: KathaUser = {
    ...(existing?.user ?? newUser(now)),
    tier: 'author',
  };

  const displayName =
    input.displayName.trim() || `${user.firstName} ${user.lastName}`.trim();

  const author: KathaAuthor = existing?.author
    ? {
        ...existing.author,
        displayName,
        bio: input.bio?.trim() ?? existing.author.bio,
        location: input.location?.trim() ?? existing.author.location,
      }
    : {
        id: newAuthorProfileId(),
        userId: user.id,
        slug: authorSlugFor(displayName),
        displayName,
        bio: input.bio?.trim() ?? '',
        location: input.location?.trim() ?? '',
        avatar: null,
        banner: null,
      };

  writeRecord({ user, author });
  return getViewer();
}

/** Back to guest — the membership record only; bookmarks, history, and works
 *  stay where they are, waiting behind the invitation again. */
export function resetMembership(): void {
  writeRecord(null);
}
