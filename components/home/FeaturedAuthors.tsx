import { getFeaturedAuthors } from '@/lib/authors';
import { getAuthorStats } from '@/lib/author-selectors';
import { catalogueRepository } from '@/lib/catalogue-repository';
import AuthorCard from '@/components/authors/AuthorCard';

/* ---------------------------------------------------------------------------
 * KATHA · FeaturedAuthors
 * components/home/FeaturedAuthors.tsx
 *
 * Homepage authors shelf, rendered from the Author domain's editorial picks
 * (lib/authors.ts `featured` flag) through the shared AuthorCard — no author
 * data lives here, and the genre line / book counts derive from the catalogue
 * via getAuthorStats(), so this shelf can never contradict the shelves again.
 * ------------------------------------------------------------------------- */

export default async function FeaturedAuthors() {
  const books = await catalogueRepository.listBooks();
  const authors = getFeaturedAuthors();

  return (
    <section aria-labelledby="featured-authors-heading" className="bg-secondary">
      <div className="container-katha py-20">
        {/* Header */}
        <div className="max-w-xl">
          <h2
            id="featured-authors-heading"
            className="font-heading text-3xl font-bold tracking-tight text-foreground"
          >
            Featured Authors
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Meet the writers behind today&rsquo;s most loved Filipino stories.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {authors.map((author) => {
            const stats = getAuthorStats(author.id, books);
            return (
              <AuthorCard
                key={author.id}
                name={author.displayName}
                href={`/authors/${author.slug}`}
                bio={author.bio}
                genreLabel={stats.categories[0] ?? author.desk?.[0]?.category ?? 'New voice'}
                bookCount={stats.bookCount}
                avatar={author.avatar}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
