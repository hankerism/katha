import Link from 'next/link';
import { initialsOf } from '@/lib/text';

/* ---------------------------------------------------------------------------
 * KATHA · AuthorCard
 * components/authors/AuthorCard.tsx
 *
 * The shared author discovery card — the FeaturedAuthors card promoted to a
 * reusable atom, consumed by the home shelf, the /authors index, and the
 * profile page's related-authors row.
 *
 * PURE PRESENTATIONAL + RSC-friendly: the caller resolves everything from the
 * Author domain + selectors (name, bio, derived genre line, derived book
 * count, profile href) and passes strings in. When `avatar` is null it falls
 * back to the initials portrait, so the card is already ready for uploaded
 * profile media. The whole card is the link.
 * ------------------------------------------------------------------------- */

export interface AuthorCardProps {
  name: string;
  /** Deep link to the author profile (/authors/[slug]). */
  href: string;
  bio: string;
  /** Derived from the bibliography, e.g. "Magical Realism". */
  genreLabel: string;
  /** Derived from the bibliography. */
  bookCount: number;
  /** Uploaded portrait URL; null → initials portrait. */
  avatar?: string | null;
}

export default function AuthorCard({
  name,
  href,
  bio,
  genreLabel,
  bookCount,
  avatar = null,
}: AuthorCardProps) {
  return (
    <Link
      href={href}
      aria-label={`View ${name}'s profile — ${genreLabel}, ${bookCount} ${bookCount === 1 ? 'book' : 'books'}`}
      className="group flex h-full flex-col items-center rounded-[18px] border border-border bg-card p-6 text-center shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Portrait — uploaded avatar when present, initials otherwise */}
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs; avoids next/image remote config
        <img
          src={avatar}
          alt=""
          className="size-20 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-black/10 transition-transform duration-300 ease-out group-hover:scale-105"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-20 shrink-0 place-items-center rounded-full font-heading text-xl font-semibold text-brand-secondary shadow-sm ring-1 ring-black/10 transition-transform duration-300 ease-out group-hover:scale-105 bg-[linear-gradient(150deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_58%,#000))]"
        >
          {initialsOf(name)}
        </span>
      )}

      <h3 className="mt-5 font-heading text-lg font-semibold leading-snug text-foreground">
        {name}
      </h3>
      <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-clay dark:text-accent">
        {genreLabel}
      </p>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
        {bio}
      </p>

      {/* Footer */}
      <div className="mt-auto w-full pt-5">
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="font-medium text-muted-foreground">
            {bookCount} {bookCount === 1 ? 'Book' : 'Books'}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-primary transition-colors duration-200 group-hover:text-clay dark:text-accent">
            View Profile
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
