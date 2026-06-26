'use client';

import FeaturedBooks from '@/components/home/FeaturedBooks';
import PopularCategories from '@/components/home/PopularCategories';
import ContinueReading from '../components/home/ContinueReading';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

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
            <p className="flex animate-fade-up items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay dark:text-accent">
                A Filipino-inspired digital library
              </span>
            </p>

            <h1 className="mt-6 animate-fade-up text-balance text-[clamp(2.6rem,1.6rem+4vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-foreground [animation-delay:60ms]">
              Stories deserve a{' '}
              <span className="font-logo font-medium italic text-primary dark:text-accent">
                beautiful
              </span>{' '}
              place to live.
            </h1>

            <p className="mt-6 max-w-xl animate-fade-up text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:120ms]">
              KATHA is a calm home for Filipino literature—novels, serials, and
              short fiction gathered in one unhurried, beautifully typeset
              space. Discover new voices, follow the authors you love, and
              settle in to read the way a good story deserves.
            </p>

            <div className="mt-9 flex animate-fade-up flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 [animation-delay:180ms]">
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

            <p className="mt-6 flex animate-fade-up flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground [animation-delay:240ms]">
              <span>Free to start reading</span>
              <span aria-hidden className="text-border-strong">
                ·
              </span>
              <span>New chapters every week</span>
              <span aria-hidden className="text-border-strong">
                ·
              </span>
              <span>Ad-free by design</span>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[19rem] animate-fade-up sm:max-w-sm lg:mx-0 lg:ml-auto [animation-delay:160ms]">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2.25rem] bg-accent/15 blur-2xl"
            />

            <article
              aria-labelledby="featured-title"
              className="relative aspect-[3/4] w-full overflow-hidden rounded-[18px] bg-[linear-gradient(155deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_55%,#000))] shadow-xl ring-1 ring-black/10"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.16),transparent_55%)]"
              />
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-4 bg-[linear-gradient(to_right,rgba(0,0,0,0.30),transparent)]"
              />
              <span
                aria-hidden
                className="absolute inset-y-0 left-4 w-px bg-brand-accent/40"
              />

              <div className="relative flex h-full flex-col justify-between p-7 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-logo text-lg font-semibold tracking-[0.18em] text-brand-secondary/90">
                    KATHA
                  </span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-accent">
                    Literary Fiction
                  </span>
                </div>

                <div>
                  <span
                    aria-hidden
                    className="mb-4 block h-px w-12 bg-brand-accent/70"
                  />
                  <h2
                    id="featured-title"
                    className="font-heading text-3xl font-bold leading-tight text-brand-secondary sm:text-[2.4rem]"
                  >
                    Ang Huling Tag-araw
                  </h2>
                  <p className="mt-3 text-sm text-brand-secondary/70">
                    A KATHA Featured Novel
                  </p>
                  <p className="mt-6 font-logo text-xl italic text-brand-secondary/85">
                    Lakambini Reyes
                  </p>
                </div>
              </div>
            </article>

            <div className="absolute -right-3 top-6 sm:-right-5">
              <span className="badge badge-accent shadow-md">
                ★ Editor&apos;s Pick
              </span>
            </div>

            <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-border bg-card/90 p-3 pr-4 shadow-lg backdrop-blur-sm sm:-left-7">
              <span className="grid size-10 place-items-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                LR
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">
                  Lakambini Reyes
                </p>
                <p className="text-xs text-muted-foreground">
                  New series · 7 chapters
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <FeaturedBooks />
      <PopularCategories />
      <ContinueReading />
    </>
  );
}