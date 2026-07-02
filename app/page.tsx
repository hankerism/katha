'use client';

import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';

import FeaturedBooks from '@/components/home/FeaturedBooks';
import PopularCategories from '@/components/home/PopularCategories';
import ContinueReading from '@/components/home/ContinueReading';
import BookmarksShelf from '@/components/home/BookmarksShelf';
import RecentlyRead from '@/components/home/RecentlyRead';
import WhyKatha from '@/components/home/WhyKatha';
import ReaderLove from '@/components/home/ReaderLove';
import FeaturedAuthors from '@/components/home/FeaturedAuthors';
import FinalCTA from '@/components/home/FinalCTA';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <section
        tabIndex={-1}
        className="relative isolate overflow-hidden outline-none"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute left-1/2 top-[-12%] h-[55vh] w-[130%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand-accent)_18%,transparent),transparent)]" />
          <div className="absolute -left-24 top-40 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-24 top-16 size-80 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute bottom-[-5rem] left-1/3 size-72 rounded-full bg-forest/10 blur-3xl" />
        </div>

        <section className="container-katha grid items-center gap-14 pb-20 pt-12 sm:pt-16 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-2 lg:gap-10 lg:pb-28 lg:pt-20">
          <div className="max-w-xl">
            <p className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                A Filipino-inspired digital library
              </span>
            </p>

            <h1 className="mt-6 text-[clamp(2.6rem,1.6rem+4vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
              Stories deserve a{' '}
              <span className="font-logo italic text-primary">
                beautiful
              </span>{' '}
              place to live.
            </h1>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              KATHA is a calm home for Filipino literature—novels, serials, and
              short fiction gathered in one beautifully typeset space.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/library')}
              >
                Explore Library
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/authors')}
              >
                Become an Author
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <article className="aspect-[3/4] overflow-hidden rounded-[18px] bg-[linear-gradient(155deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_55%,#000))] shadow-xl ring-1 ring-black/10">
              <div className="flex h-full flex-col justify-between p-8">
                <div className="flex justify-between">
                  <span className="font-logo text-lg tracking-[0.18em] text-brand-secondary">
                    KATHA
                  </span>

                  <span className="text-xs uppercase text-brand-accent">
                    Literary Fiction
                  </span>
                </div>

                <div>
                  <span className="mb-4 block h-px w-12 bg-brand-accent" />

                  <h2 className="font-heading text-4xl font-bold text-brand-secondary">
                    Ang Huling Tag-araw
                  </h2>

                  <p className="mt-3 text-brand-secondary/70">
                    A KATHA Featured Novel
                  </p>

                  <p className="mt-6 font-logo text-xl italic text-brand-secondary">
                    Lakambini Reyes
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </section>

      <ContinueReading />

      <BookmarksShelf />

      <RecentlyRead />

      <FeaturedBooks />

      <PopularCategories />

      <WhyKatha />

      <ReaderLove />

      <FeaturedAuthors />

      <FinalCTA />
    </>
  );
}