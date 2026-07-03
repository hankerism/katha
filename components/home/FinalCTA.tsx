import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden bg-primary"
    >
      <div className="container-katha py-28 text-center sm:py-32">
        <div className="mx-auto max-w-2xl">
          {/* Eyebrow */}
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Start Reading Today
          </p>

          {/* Heading */}
          <h2
            id="final-cta-heading"
            className="mt-5 font-heading text-[clamp(2.25rem,1.5rem+3.2vw,3.75rem)] font-bold leading-tight text-primary-foreground"
          >
            Discover your next{" "}
            <span className="font-logo italic text-accent">
              favorite
            </span>{" "}
            Filipino story.
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80">
            From timeless novels to modern serials, KATHA brings together
            beautiful Filipino storytelling in one peaceful place.
          </p>

          {/* Buttons — the design system's radius, motion, and focus ring */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/library"
              className="inline-flex h-14 items-center justify-center rounded-[18px] bg-secondary px-8 font-semibold text-secondary-foreground shadow-sm transition-[transform,box-shadow,filter] duration-200 ease-out motion-safe:hover:-translate-y-px hover:shadow-md hover:brightness-[1.02] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Explore Library
            </Link>

            <Link
              href="/authors"
              className="group inline-flex items-center gap-1.5 rounded-sm font-semibold text-primary-foreground transition-colors duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Become an Author
              <span
                aria-hidden="true"
                className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}