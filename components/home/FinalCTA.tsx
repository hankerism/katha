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

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/library"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-secondary px-8 font-semibold text-secondary-foreground transition hover:opacity-90"
            >
              Explore Library
            </Link>

            <Link
              href="/authors"
              className="font-semibold text-primary-foreground hover:text-accent transition"
            >
              Become an Author →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}