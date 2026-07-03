import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAuthorProfile,
  getAuthorStats,
  getRelatedAuthors,
} from '@/lib/author-selectors';
import BookCard from '@/components/ui/BookCard';
import AuthorCard from '@/components/authors/AuthorCard';
import { initialsOf } from '@/lib/text';

/* ---------------------------------------------------------------------------
 * KATHA · Author profile
 * app/authors/[slug]/page.tsx
 *
 * One writer, in full: a banner-ready hero (plain gradient band until authors
 * can upload banners), the portrait, bio and derived stats, the Bibliography
 * as the standard BookCard grid, and Related authors via AuthorCard.
 *
 * Async server component, assembly only: getAuthorProfile() performs the one
 * join (author + books + stats); everything else is presentation. 404s on an
 * unknown slug. The route resolves by SLUG — the stable id stays internal to
 * the data layer, so slugs can be renamed without breaking book rows.
 * ------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getAuthorProfile(slug);
  if (!profile) return { title: 'Author not found' };
  return {
    title: profile.author.displayName,
    description: profile.author.bio,
  };
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getAuthorProfile(slug);
  if (!profile) notFound();

  const { author, books, stats } = profile;
  const related = getRelatedAuthors(author.id).slice(0, 3);

  return (
    <>
      {/* Hero ---------------------------------------------------------------- */}
      <section aria-labelledby="author-name">
        {/* Banner — uploaded media later; a quiet brand band today */}
        {author.banner ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded banner URLs; avoids next/image remote config
          <img
            src={author.banner}
            alt=""
            className="h-44 w-full object-cover sm:h-56"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-32 w-full bg-[linear-gradient(120deg,color-mix(in_oklab,var(--color-brand-primary)_14%,var(--background)),var(--background)_70%)] sm:h-40"
          />
        )}

        <div className="container-katha">
          <div className="-mt-12 flex flex-col gap-6 sm:-mt-14 sm:flex-row sm:items-end">
            {/* Portrait */}
            {author.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs; avoids next/image remote config
              <img
                src={author.avatar}
                alt={`Portrait of ${author.displayName}`}
                className="size-24 shrink-0 rounded-full border-4 border-background object-cover shadow-md sm:size-28"
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid size-24 shrink-0 place-items-center rounded-full border-4 border-background font-heading text-2xl font-semibold text-brand-secondary shadow-md sm:size-28 bg-[linear-gradient(150deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_58%,#000))]"
              >
                {initialsOf(author.displayName)}
              </span>
            )}

            <div className="min-w-0 pb-1">
              <h1
                id="author-name"
                className="font-heading text-3xl leading-tight text-foreground sm:text-4xl"
              >
                {author.displayName}
              </h1>
              <p className="mt-1.5 font-body text-sm text-muted-foreground">
                {author.location}
                {stats.categories.length > 0 ? (
                  <> · {stats.categories.join(' · ')}</>
                ) : (
                  author.desk &&
                  author.desk.length > 0 && (
                    <> · {author.desk[0].category}</>
                  )
                )}
              </p>
            </div>
          </div>

          <p className="mt-7 max-w-2xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            {author.bio}
          </p>

          {/* Derived stats */}
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="font-body text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Books
              </dt>
              <dd className="mt-1 font-heading text-2xl text-foreground">
                {stats.bookCount}
              </dd>
            </div>
            <div>
              <dt className="font-body text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Chapters
              </dt>
              <dd className="mt-1 font-heading text-2xl text-foreground">
                {stats.totalChapters}
              </dd>
            </div>
            <div>
              <dt className="font-body text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Reading time
              </dt>
              <dd className="mt-1 font-heading text-2xl text-foreground">
                ~{stats.totalMinutes} min
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Bibliography ---------------------------------------------------------- */}
      <section
        aria-labelledby="bibliography-heading"
        className="container-katha py-14 md:py-20"
      >
        <div className="flex items-end justify-between gap-4 border-t border-border pt-12">
          <h2
            id="bibliography-heading"
            className="font-heading text-2xl text-foreground sm:text-3xl"
          >
            Bibliography
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            {stats.bookCount} {stats.bookCount === 1 ? 'title' : 'titles'}
          </p>
        </div>

        {/* Published */}
        {books.length > 0 ? (
          <>
            <h3 className="mt-8 font-body text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Published
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {books.map((book) => (
                <BookCard
                  key={book.slug}
                  title={book.title}
                  author={author.displayName}
                  cover={book.cover}
                  category={book.category}
                  chapters={book.chapters.length}
                  featured={book.featured}
                  href={`/library/${book.slug}`}
                />
              ))}
            </div>
          </>
        ) : (
          /* No published titles AND no manuscript underway → the gentle line.
             When the desk section follows, it speaks for itself. */
          (!author.desk || author.desk.length === 0) && (
            <p className="mt-7 max-w-xl font-body text-base leading-relaxed text-muted-foreground">
              {author.displayName}&rsquo;s first title is on its way to the
              shelves.
            </p>
          )
        )}

        {/* On the Writing Desk — manuscripts in progress, no covers-of-nothing */}
        {author.desk && author.desk.length > 0 && (
          <>
            <h3 className="mt-12 font-body text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              On the Writing Desk
            </h3>
            <ul className="mt-5 space-y-3">
              {author.desk.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-dashed border-border bg-card/60 px-5 py-4"
                >
                  <p className="font-body text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-clay">
                    {item.category}
                  </p>
                  <p className="mt-1 font-heading text-lg text-foreground">
                    <span aria-hidden="true">✍️ </span>
                    {item.title}
                  </p>
                  {item.note && (
                    <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground">
                      {item.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Related authors -------------------------------------------------------- */}
      {related.length > 0 && (
        <section
          aria-labelledby="related-authors-heading"
          className="border-t border-border bg-secondary"
        >
          <div className="container-katha py-16 md:py-20">
            <h2
              id="related-authors-heading"
              className="font-heading text-2xl text-foreground sm:text-3xl"
            >
              Related authors
            </h2>
            <p className="mt-1.5 font-body text-sm text-muted-foreground">
              More voices from the KATHA shelves.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => {
                const otherStats = getAuthorStats(other.id);
                return (
                  <AuthorCard
                    key={other.id}
                    name={other.displayName}
                    href={`/authors/${other.slug}`}
                    bio={other.bio}
                    genreLabel={otherStats.categories[0] ?? other.desk?.[0]?.category ?? 'New voice'}
                    bookCount={otherStats.bookCount}
                    avatar={other.avatar}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
