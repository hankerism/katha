/* ---------------------------------------------------------------------------
 * KATHA · User domain
 * lib/users.ts
 *
 * The PERSON behind an account — deliberately separate from the Author
 * domain, which is a public writing identity. A user has a name and an email,
 * never a username and never a public slug: readers are people, not profiles.
 * A user may later be linked to an Author profile (Author.userId → User.id);
 * that link never creates a second account, and the display name it carries
 * may be a pen name.
 *
 * Pre-authentication there is no user table — the current user is a local
 * stub kept by lib/membership.ts. With accounts, this shape becomes the
 * `users`/`profiles` row (id from auth, email verified, names from the calm
 * sign-up: first name, last name, email, password — nothing else).
 * ------------------------------------------------------------------------- */

import type { MembershipTier } from './membership';

export interface KathaUser {
  /** Stable account id (the auth uid, later). */
  id: string;
  /** Empty pre-authentication — collected by the real sign-up. */
  email: string;
  firstName: string;
  lastName: string;
  /** guest is never STORED — a stored user is at least a reader; guest is
   *  the absence of a record (or a signed-out session). */
  tier: MembershipTier;
  joinedAt: string;
}

export function userFullName(user: Pick<KathaUser, 'firstName' | 'lastName'>): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ');
}
