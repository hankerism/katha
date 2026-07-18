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
 *            display name may be a pen name.
 *
 * The ladder: Guest → Join → Reader → Become an Author → Complete Author
 * Profile → the Writing Desk.
 *
 * Sprint 9: getViewer() IS the authentication seam it always promised to be.
 * Two implementations live behind these exports, chosen by the EXPLICIT
 * NEXT_PUBLIC_AUTH_PROVIDER selection (never inferred from credentials):
 *
 *   local     — the pre-auth membership record in localStorage (the house
 *               pattern, unchanged: one-click join, the Abigail Marte stub).
 *   supabase  — real authentication. The Viewer derives from the session +
 *               the profiles row (person) + the authors row (pen), cached in
 *               memory so getViewer() stays synchronous; onAuthStateChange
 *               refreshes the cache and dispatches MEMBERSHIP_CHANGED_EVENT,
 *               the same event consumers already listen to.
 *
 * Transitions are async in both modes (the local ones resolve immediately,
 * with their storage writes still performed synchronously at call time).
 * Reading data is never touched by any transition, and resetMembership()
 * keeps the whole onboarding walkable — in supabase mode it signs out.
 *
 * The supabase client loads via dynamic import inside supabase-mode paths
 * only, so local mode ships none of it.
 * ------------------------------------------------------------------------- */

import type { KathaUser } from './users';
import { getAllAuthors, type KathaAuthor } from './authors';
import { foldText } from './text';
import { getAuthProvider, type AuthProvider } from './supabase/env';
import { adoptLocalWorks } from './studio/work-repository';

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

/** The assumed person, until sessions exist (local mode). */
const PRE_AUTH_USER_ID = 'user-abigail-marte';
const PRE_AUTH_FIRST_NAME = 'Abigail';
const PRE_AUTH_LAST_NAME = 'Marte';

/** Legacy author id (kept so works written before the User/Author split still
 *  resolve to the migrated profile). */
export const DEFAULT_STUDIO_AUTHOR_ID = 'auth-abigail-marte';

const GUEST: Viewer = { tier: 'guest' };

/** The active membership implementation — explicit, never inferred. */
export const activeAuthProvider: AuthProvider = getAuthProvider();

function announce(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(MEMBERSHIP_CHANGED_EVENT));
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOCAL implementation — the pre-auth membership record (unchanged behavior)
 * ════════════════════════════════════════════════════════════════════════ */

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
  return isUser(r.user) && (r.author === undefined || isAuthorProfile(r.author));
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
  // Reconstruct the PUBLIC identity (the pen name), never the account name.
  const seeded = getAllAuthors().find((author) => author.userId === user.id);
  return {
    user,
    author: seeded ?? {
      id: legacy.authorId ?? DEFAULT_STUDIO_AUTHOR_ID,
      userId: user.id,
      slug: 'hankerism',
      displayName: 'Hankerism',
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
      window.localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(record));
    } else {
      window.localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
    }
    announce();
  } catch {
    // Storage unavailable — best-effort; the viewer simply stays a guest.
  }
}

function localViewer(): Viewer {
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

function newLocalUser(now: string): KathaUser {
  return {
    id: PRE_AUTH_USER_ID,
    email: '',
    firstName: PRE_AUTH_FIRST_NAME,
    lastName: PRE_AUTH_LAST_NAME,
    tier: 'reader',
    joinedAt: now,
  };
}

function localJoinAsReader(): Viewer {
  if (readRecord()) return localViewer();
  writeRecord({ user: newLocalUser(new Date().toISOString()) });
  return localViewer();
}

function localCompleteAuthorProfile(input: AuthorProfileInput): Viewer {
  const now = new Date().toISOString();
  const existing = readRecord();
  const user: KathaUser = {
    ...(existing?.user ?? newLocalUser(now)),
    tier: 'author',
  };

  const displayName =
    input.displayName.trim() || `${user.firstName} ${user.lastName}`.trim();

  // A catalogue author row already linked to this account (a seeded first
  // author, or later a server-provisioned profile) is ADOPTED, not shadowed:
  // its id and slug stay, so its published books connect to this Studio.
  const seeded = getAllAuthors().find((author) => author.userId === user.id);

  const author: KathaAuthor = existing?.author
    ? {
        ...existing.author,
        displayName,
        bio: input.bio?.trim() ?? existing.author.bio,
        location: input.location?.trim() ?? existing.author.location,
      }
    : seeded
      ? {
          ...seeded,
          displayName,
          bio: input.bio?.trim() || seeded.bio,
          location: input.location?.trim() || seeded.location,
        }
      : {
          id: newAuthorProfileId(),
          userId: user.id,
          slug: authorSlugFor(displayName, new Set(getAllAuthors().map((a) => a.slug))),
          displayName,
          bio: input.bio?.trim() ?? '',
          location: input.location?.trim() ?? '',
          avatar: null,
          banner: null,
        };

  writeRecord({ user, author });
  return localViewer();
}

/* ══════════════════════════════════════════════════════════════════════════
 * SUPABASE implementation — real authentication behind the same seam
 * ════════════════════════════════════════════════════════════════════════ */

let supabaseViewerCache: Viewer = GUEST;
let supabaseHydration: Promise<Viewer> | null = null;

type SupabaseClientT = import('@supabase/supabase-js').SupabaseClient<
  import('./supabase/database-types').Database
>;

async function supabaseClient(): Promise<SupabaseClientT> {
  const { getSupabaseBrowserClient } = await import('./supabase/client');
  return getSupabaseBrowserClient();
}

/** Derive the Viewer the seam always promised: session → profiles (person)
 *  → authors (pen). Missing profile rows degrade to metadata, never crash. */
async function viewerFromSession(
  client: SupabaseClientT,
  session: import('@supabase/supabase-js').Session,
): Promise<Viewer> {
  const uid = session.user.id;
  const [{ data: profile }, { data: authorRow }] = await Promise.all([
    client.from('profiles').select('*').eq('id', uid).maybeSingle(),
    client.from('authors').select('*').eq('user_id', uid).maybeSingle(),
  ]);

  const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
  const tier: MembershipTier = profile?.tier === 'author' ? 'author' : 'reader';
  const user: KathaUser = {
    id: uid,
    email: session.user.email ?? '',
    firstName: profile?.first_name ?? (meta.first_name as string) ?? '',
    lastName: profile?.last_name ?? (meta.last_name as string) ?? '',
    tier,
    joinedAt: profile?.joined_at ?? session.user.created_at ?? '',
  };
  const author: KathaAuthor | undefined = authorRow
    ? {
        id: authorRow.id,
        userId: authorRow.user_id,
        slug: authorRow.slug,
        displayName: authorRow.display_name,
        bio: authorRow.bio,
        location: authorRow.location,
        avatar: authorRow.avatar_url,
        banner: authorRow.banner_url,
      }
    : undefined;

  return { tier, user, author, authorId: author?.id, joinedAt: user.joinedAt };
}

async function refreshSupabaseViewer(client: SupabaseClientT): Promise<Viewer> {
  const {
    data: { session },
  } = await client.auth.getSession();
  supabaseViewerCache = session ? await viewerFromSession(client, session) : GUEST;
  return supabaseViewerCache;
}

/** One-time hydration: resolve the session into the cache and subscribe to
 *  auth changes, which refresh the cache and announce through the SAME event
 *  every membership consumer already listens to. */
function supabaseHydrate(): Promise<Viewer> {
  if (typeof window === 'undefined') return Promise.resolve(GUEST);
  if (supabaseHydration) return supabaseHydration;
  supabaseHydration = (async () => {
    const client = await supabaseClient();
    const viewer = await refreshSupabaseViewer(client);
    client.auth.onAuthStateChange(() => {
      void refreshSupabaseViewer(client).then(() => announce());
    });
    announce();
    return viewer;
  })();
  return supabaseHydration;
}

// Hydrate eagerly on first client-side import, so the cache is warm before
// most effects run (the mount-gates absorb the remainder of the window).
if (activeAuthProvider === 'supabase' && typeof window !== 'undefined') {
  void supabaseHydrate();
}

/* ── Supabase transitions ────────────────────────────────────────────────── */

export interface SignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpResult {
  viewer: Viewer;
  /** True when the project requires email confirmation before a session
   *  exists (production); the local stack auto-confirms. */
  needsEmailVerification: boolean;
}

async function supabaseSignUp(input: SignUpInput): Promise<SignUpResult> {
  const client = await supabaseClient();
  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
      },
    },
  });
  if (error) throw new Error(error.message);
  if (!data.session) {
    return { viewer: supabaseViewerCache, needsEmailVerification: true };
  }
  supabaseViewerCache = await viewerFromSession(client, data.session);
  announce();
  return { viewer: supabaseViewerCache, needsEmailVerification: false };
}

async function supabaseSignIn(input: SignInInput): Promise<Viewer> {
  const client = await supabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });
  if (error) throw new Error(error.message);
  supabaseViewerCache = await viewerFromSession(client, data.session);
  announce();
  return supabaseViewerCache;
}

async function supabaseSignOut(): Promise<void> {
  const client = await supabaseClient();
  await client.auth.signOut();
  supabaseViewerCache = GUEST;
  announce();
}

async function supabaseCompleteAuthorProfile(
  input: AuthorProfileInput,
): Promise<Viewer> {
  const client = await supabaseClient();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) {
    throw new Error('Sign in before becoming an author.');
  }
  const uid = session.user.id;
  const current = supabaseViewerCache;
  const fallbackName = current.user
    ? `${current.user.firstName} ${current.user.lastName}`.trim()
    : '';
  const displayName = input.displayName.trim() || fallbackName || 'Author';

  if (current.author) {
    // Refining the existing pen — id and slug stay stable.
    const { error } = await client
      .from('authors')
      .update({
        display_name: displayName,
        bio: input.bio?.trim() ?? current.author.bio,
        location: input.location?.trim() ?? current.author.location,
      })
      .eq('id', current.author.id);
    if (error) throw new Error(error.message);
  } else {
    // A new pen: insert with a slug derived from the display name; on a
    // collision (authors_slug_key), retry with numeric suffixes.
    const base = slugifyDisplayName(displayName);
    let inserted = false;
    for (let attempt = 0; attempt < 6 && !inserted; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const { error } = await client.from('authors').insert({
        id: newAuthorProfileId(),
        user_id: uid,
        slug,
        display_name: displayName,
        bio: input.bio?.trim() ?? '',
        location: input.location?.trim() ?? '',
      });
      if (!error) inserted = true;
      else if (!error.message.includes('duplicate key')) {
        throw new Error(error.message);
      }
    }
    if (!inserted) {
      throw new Error('That pen name is taken in too many variations — try another.');
    }
  }

  const { error: tierError } = await client
    .from('profiles')
    .update({ tier: 'author' })
    .eq('id', uid);
  if (tierError) throw new Error(tierError.message);

  const viewer = await refreshSupabaseViewer(client);

  // The desk survives the first sign-in: works written on this device under
  // the pre-auth identities follow the writer to the real author id.
  if (viewer.authorId) {
    const localRecord = readRecord();
    adoptLocalWorks(
      [DEFAULT_STUDIO_AUTHOR_ID, localRecord?.author?.id ?? ''],
      viewer.authorId,
    );
  }

  announce();
  return viewer;
}

/* ══════════════════════════════════════════════════════════════════════════
 * Shared helpers
 * ════════════════════════════════════════════════════════════════════════ */

function newAuthorProfileId(): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `auth_${random}`;
}

function slugifyDisplayName(displayName: string): string {
  return (
    foldText(displayName)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'author'
  );
}

/** Author slug from the display name, kept clear of a caller-supplied set of
 *  taken slugs (local mode checks the static catalogue's authors). */
function authorSlugFor(displayName: string, taken: ReadonlySet<string>): string {
  const base = slugifyDisplayName(displayName);
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/* ══════════════════════════════════════════════════════════════════════════
 * THE SEAM — public exports, mode-agnostic
 * ════════════════════════════════════════════════════════════════════════ */

/** Who is looking at the page. Synchronous by contract: local mode reads the
 *  record; supabase mode reads the in-memory session cache (hydrated eagerly
 *  at import and refreshed by onAuthStateChange). Guest on the server and
 *  until the cache resolves — the same mount-gate semantics as always. */
export function getViewer(): Viewer {
  if (activeAuthProvider === 'supabase') return supabaseViewerCache;
  return localViewer();
}

/** Resolve the viewer, waiting for the session on first call (supabase) —
 *  what useViewer awaits before flipping `loaded`. */
export function hydrateViewer(): Promise<Viewer> {
  if (activeAuthProvider === 'supabase') return supabaseHydrate();
  return Promise.resolve(localViewer());
}

/** Guest → Reader. Local mode: the one-click join, unchanged (idempotent;
 *  never downgrades an author). Supabase mode: joining requires credentials —
 *  use signUpWithPassword; calling this is a no-op returning the viewer. */
export async function joinAsReader(): Promise<Viewer> {
  if (activeAuthProvider === 'supabase') return supabaseViewerCache;
  return localJoinAsReader();
}

export interface AuthorProfileInput {
  /** The public byline — the user's own name, or a pen name. */
  displayName: string;
  bio?: string;
  location?: string;
}

/** Reader → Author: links a public writing identity (possibly a pen name) to
 *  the SAME account. Called again, it refines the existing profile — the id
 *  (and any works pointing at it) stays stable. */
export async function completeAuthorProfile(
  input: AuthorProfileInput,
): Promise<Viewer> {
  if (activeAuthProvider === 'supabase') {
    return supabaseCompleteAuthorProfile(input);
  }
  return localCompleteAuthorProfile(input);
}

/** Register with credentials (supabase mode). Local mode: equivalent to the
 *  one-click join — credentials are accepted and unused, so shared UI can
 *  call one function. */
export async function signUpWithPassword(
  input: SignUpInput,
): Promise<SignUpResult> {
  if (activeAuthProvider === 'supabase') return supabaseSignUp(input);
  return { viewer: localJoinAsReader(), needsEmailVerification: false };
}

/** Sign in with credentials (supabase mode). Local mode has no credentials;
 *  resolves to the current viewer. */
export async function signInWithPassword(input: SignInInput): Promise<Viewer> {
  if (activeAuthProvider === 'supabase') return supabaseSignIn(input);
  return localViewer();
}

/** Back to guest. Local mode clears the membership record only; supabase
 *  mode signs out. Bookmarks, history, and works stay where they are —
 *  the domain's standing promise. */
export async function resetMembership(): Promise<void> {
  if (activeAuthProvider === 'supabase') {
    await supabaseSignOut();
    return;
  }
  writeRecord(null);
}
