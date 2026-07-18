'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

/* ---------------------------------------------------------------------------
 * KATHA · HomeHero
 * components/home/HomeHero.tsx
 *
 * The homepage hero — the featured serial's editorial opening, moved verbatim
 * from app/(reader)/page.tsx when the home page became a server component
 * (Sprint 8: the shelves fetch the catalogue through CatalogueRepository and
 * must render on the server). This is the page's ONLY client-interactive
 * region: two Button CTAs that navigate via the router.
 * ------------------------------------------------------------------------- */

export default function HomeHero() {
  const router = useRouter();

  return (
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
              New from KATHA · Contemporary Romance
            </span>
          </p>

          <h1 className="mt-6 text-[clamp(2.6rem,1.6rem+4vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
            Table <span className="font-logo italic text-primary">for</span> Two
          </h1>

          <p className="mt-3 font-logo text-lg italic text-muted-foreground">
            by Hankerism
          </p>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Two busy lives, one dating app, and a question about carbonara. A
            quiet contemporary romance about timing, late-night conversations,
            and the people who slowly become home — serialized here as it is
            written.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/library/table-for-two')}
            >
              Start Reading
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/library')}
            >
              Explore Library
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <Link
            href="/library/table-for-two"
            aria-label="Read Table for Two by Hankerism"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-[18px]"
          >
            <article className="aspect-[3/4] overflow-hidden rounded-[18px] shadow-xl ring-1 ring-black/10 transition-transform duration-300 ease-out motion-safe:group-hover:-translate-y-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- local SVG cover art */}
              <img
                src="/covers/table-for-two.svg"
                alt="Cover of Table for Two by Hankerism"
                className="h-full w-full object-cover"
              />
            </article>
          </Link>
        </div>
      </section>
    </section>
  );
}
