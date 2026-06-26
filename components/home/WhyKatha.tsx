import type { SVGProps } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · WhyKatha
 * components/home/WhyKatha.tsx
 *
 * An editorial breather between the catalog shelves: a centered mission spread
 * in the Aesop / Kinokuniya register. No cards, no gradients — just generous
 * white space, a Cormorant display pull quote as the focal point, and three
 * quiet value columns. Server component, presentation only.
 * ------------------------------------------------------------------------- */

function ReadersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 6c-1.6-1-4-1.5-6-1.5S2 5 2 5v13s2-.5 4-.5 4.4.5 6 1.5" />
      <path d="M12 6c1.6-1 4-1.5 6-1.5S22 5 22 5v13s-2-.5-4-.5-4.4.5-6 1.5" />
      <path d="M12 6v13" />
    </svg>
  );
}

function AuthorsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 20h5" />
      <path d="M15.5 4.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 11.5-11.5Z" />
    </svg>
  );
}

function HeritageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12h2.5M19 12h2.5M5.1 5.1l1.8 1.8M17.1 17.1l1.8 1.8M18.9 5.1l-1.8 1.8M6.9 17.1l-1.8 1.8" />
    </svg>
  );
}

const VALUES = [
  {
    title: 'Crafted for Readers',
    body: 'Beautiful typography, distraction-free reading, and immersive storytelling.',
    Icon: ReadersIcon,
  },
  {
    title: 'Built for Authors',
    body: 'A home where Filipino writers can publish, grow, and reach new audiences.',
    Icon: AuthorsIcon,
  },
  {
    title: 'Rooted in Filipino Stories',
    body: 'Celebrating local voices, culture, imagination, and literary heritage.',
    Icon: HeritageIcon,
  },
] as const;

export default function WhyKatha() {
  return (
    <section aria-labelledby="why-katha-heading" className="bg-background">
      <div className="container-katha py-28">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow */}
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay dark:text-accent">
            Our Mission
          </p>

          {/* Heading */}
          <h2
            id="why-katha-heading"
            className="mt-4 text-balance font-heading text-[clamp(2rem,1.4rem+2.4vw,3rem)] font-bold tracking-tight text-foreground"
          >
            Why KATHA Exists
          </h2>

          {/* Body */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Filipino stories deserve more than disappearing into endless feeds and noisy timelines.
            KATHA was created as a quiet digital home where readers can slow down, discover remarkable
            authors, and experience literature the way it deserves to be read.
          </p>

          {/* Pull quote — the focal point */}
          <figure className="mt-14">
            <span aria-hidden="true" className="mx-auto mb-7 block h-px w-12 bg-accent" />
            <blockquote className="text-balance font-logo text-[clamp(1.75rem,1.1rem+2.6vw,2.85rem)] font-medium italic leading-snug text-primary dark:text-accent">
              &ldquo;Every story deserves a reader. Every reader deserves a beautiful place.&rdquo;
            </blockquote>
          </figure>
        </div>

        {/* Supporting values */}
        <div className="mx-auto mt-20 grid max-w-3xl gap-12 sm:grid-cols-3 sm:gap-10">
          {VALUES.map(({ title, body, Icon }) => (
            <div key={title} className="text-center">
              <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full border border-border bg-secondary text-clay dark:text-accent">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{title}</h3>
              <p className="mx-auto mt-2 max-w-[30ch] text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}