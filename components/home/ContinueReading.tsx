import Link from 'next/link';

type ReadingProgress = {
  title: string;
  author: string;
  slug: string;
  currentChapter: number;
  progress: number;
};

const CONTINUE_READING: ReadingProgress[] = [
  {
    title: 'Ang Huling Tag-araw',
    author: 'Lakambini Reyes',
    slug: 'ang-huling-tag-araw',
    currentChapter: 5,
    progress: 64,
  },
  {
    title: 'Ang Bahay sa Buwan',
    author: 'Noemi Bautista',
    slug: 'ang-bahay-sa-buwan',
    currentChapter: 3,
    progress: 22,
  },
  {
    title: 'Huling Tren Pauwi',
    author: 'Rafael Lim',
    slug: 'huling-tren-pauwi',
    currentChapter: 8,
    progress: 88,
  },
];

export default function ContinueReading() {
  return (
    <section aria-labelledby="continue-reading-heading" className="bg-background">
      <div className="container-katha py-20">
        <div className="max-w-xl">
          <h2
            id="continue-reading-heading"
            className="font-heading text-3xl font-bold tracking-tight text-foreground"
          >
            Continue Reading
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Pick up right where you left off—your place is saved down to the chapter.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CONTINUE_READING.map((book) => {
            const progress = Math.max(0, Math.min(100, Math.round(book.progress)));

            return (
              <Link
                key={book.slug}
                href={`/read/${book.slug}`}
                aria-label={`Continue reading ${book.title} by ${book.author}, chapter ${book.currentChapter}, ${progress}% complete`}
                className="group flex h-full gap-4 rounded-[18px] border border-border bg-card p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div
                  aria-hidden="true"
                  className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-[10px] bg-[linear-gradient(155deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_55%,#000))] shadow-sm ring-1 ring-black/10 sm:w-[4.5rem]"
                >
                  <span className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.16),transparent_55%)]" />
                  <span className="absolute inset-y-0 left-0 w-1.5 bg-[linear-gradient(to_right,rgba(0,0,0,0.30),transparent)]" />
                  <span className="absolute inset-0 grid place-items-center font-logo text-2xl font-semibold text-brand-secondary/85">
                    {book.title.charAt(0)}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="truncate font-heading text-base font-semibold leading-snug text-foreground">
                    {book.title}
                  </h3>

                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {book.author}
                  </p>

                  <div className="mt-auto space-y-2 pt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>Chapter {book.currentChapter}</span>
                      <span>{progress}%</span>
                    </div>

                    <div
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${progress}% complete`}
                      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500 ease-out group-hover:bg-primary dark:group-hover:bg-accent"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-primary transition-colors duration-200 group-hover:text-clay dark:text-accent">
                      Continue Reading
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
          })}
        </div>
      </div>
    </section>
  );
}