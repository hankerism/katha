/* ---------------------------------------------------------------------------
 * KATHA · Membership — the viewer domain
 * lib/membership.ts
 *
 * One identity, three states: guest → reader → author. A tier, never separate
 * accounts — an Author IS a Reader whose viewer carries an authorId. Becoming
 * an author adds a field to the same record; it never creates a second one.
 *
 * Pre-authentication semantics: the membership record lives in localStorage
 * (house pattern: SSR-safe, validated on read). Guest is the default — an
 * absent or unrecognizable record means guest, and every server render is a
 * guest render. Joining is real state on THIS device; the UI says so
 * honestly ("cross-device sync — coming soon").
 *
 * Existing local reading data (bookmarks, history, continue-reading) is never
 * touched by any transition here: guests simply don't see it, members do.
 * Resetting to guest makes the complete onboarding walkable again and again.
 *
 * getViewer() is THE authentication seam. With Supabase, it derives the same
 * Viewer from the session (profiles: id, tier, author_id) and everything
 * downstream — gates, hooks, the Studio — is already correct.
 * ------------------------------------------------------------------------- */

export type MembershipTier = 'guest' | 'reader' | 'author';

export interface Viewer {
  tier: MembershipTier;
  /** Present when tier === 'author' — the Author-domain row this viewer
   *  writes as. */
  authorId?: string;
  joinedAt?: string;
}

export const MEMBERSHIP_STORAGE_KEY = 'katha:membership';

/** Fired on every membership transition so mounted surfaces (Navbar, gates,
 *  shelves) can refresh without a navigation. */
export const MEMBERSHIP_CHANGED_EVENT = 'katha:membership-changed';

/** Pre-auth, every author is Abigail Marte; with sessions this comes from the
 *  viewer's own profile row instead. */
export const DEFAULT_STUDIO_AUTHOR_ID = 'auth-abigail-marte';

const GUEST: Viewer = { tier: 'guest' };

/* ── Stored record ───────────────────────────────────────────────────────── */

interface MembershipRecord {
  tier: 'reader' | 'author';
  authorId?: string;
  joinedAt: string;
}

function isMembershipRecord(value: unknown): value is MembershipRecord {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    (r.tier === 'reader' || r.tier === 'author') &&
    typeof r.joinedAt === 'string' &&
    (r.authorId === undefined || typeof r.authorId === 'string')
  );
}

function readRecord(): MembershipRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isMembershipRecord(parsed) ? parsed : null;
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
  if (record.tier === 'author') {
    return {
      tier: 'author',
      authorId: record.authorId ?? DEFAULT_STUDIO_AUTHOR_ID,
      joinedAt: record.joinedAt,
    };
  }
  return { tier: 'reader', joinedAt: record.joinedAt };
}

/* ── Transitions ─────────────────────────────────────────────────────────── */

/** Guest → Reader. Idempotent; never downgrades an author. Any reading data
 *  already on the device simply becomes visible. */
export function joinAsReader(): Viewer {
  const existing = readRecord();
  if (existing) return getViewer();
  writeRecord({ tier: 'reader', joinedAt: new Date().toISOString() });
  return getViewer();
}

/** Reader → Author (a guest walking in becomes a member in the same step —
 *  the ladder is one identity). Adds the authorId; changes nothing else. */
export function becomeAuthor(): Viewer {
  const existing = readRecord();
  writeRecord({
    tier: 'author',
    authorId: DEFAULT_STUDIO_AUTHOR_ID,
    joinedAt: existing?.joinedAt ?? new Date().toISOString(),
  });
  return getViewer();
}

/** Back to guest — the membership record only; bookmarks, history, and works
 *  stay where they are, waiting behind the invitation again. Exists so the
 *  complete onboarding can be walked repeatedly. */
export function resetMembership(): void {
  writeRecord(null);
}
