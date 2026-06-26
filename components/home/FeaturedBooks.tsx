import Link from 'next/link';
import BookCard, { type BookCardProps } from '@/components/ui/BookCard';

const FEATURED_BOOKS: BookCardProps[] = [
  {
    title: 'Ang Huling Tag-araw',
    author: 'Lakambini Reyes',
    category: 'Literary Fiction',
    featured: true,
    chapters: 7,
    href: '/library/ang-huling-tag-araw',
  },
  {
    title: 'Mga Liham sa Dilim',
    author: 'J. Salvador',
    category: 'Poetry',
    featured: true,
    chapters: 24,
    href: '/library/mga-liham-sa-dilim',
  },
  {
    title: 'Ang Bahay sa Buwan',
    author: 'Noemi Bautista',
    category: 'Magical Realism',
    featured: true,
    chapters: 15,
    href: '/library/ang-bahay-sa-buwan',
  },
  {
    title: 'Huling Tren Pauwi',
    author: 'Rafael Lim',
    category: 'Short Stories',
    featured: true,
    chapters: 9,
    href: '/library/huling-tren-pauwi',
  },
];

export default function FeaturedBooks() {
  return (
    <section aria-labelledby="featured-books-heading" className="bg-background">
      <div className="container-katha py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2
              id="featured-books-heading"
              className="font-heading text-3xl font-bold tracking-tight text-foreground"
            >
              Featured Books
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              A curated selection of stories our readers are loving this week.
            </p>
          </div>

          <Link
            href="/library"
            className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-sm text-sm font-semibold text-primary transition-colors hover:text-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-accent sm:self-auto"
          >
            View All
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_BOOKS.map((book) => (
            <BookCard key={book.href} {...book} />
          ))}
        </div>
      </div>
    </section>
  );
}