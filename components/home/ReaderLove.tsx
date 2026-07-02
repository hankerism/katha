/* ---------------------------------------------------------------------------
 * KATHA · ReaderLove
 * components/home/ReaderLove.tsx
 *
 * Three quiet testimonial cards in the premium-bookstore register: an oversized
 * Cormorant quotation mark, a serif quote, and a small reader byline with an
 * initials avatar. Soft hover lift, no gradients. Server component, data kept
 * separate from the markup.
 * ------------------------------------------------------------------------- */

import { initialsOf } from '@/lib/text';

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'What surprised me was how peaceful reading felt here.',
    name: 'Andrea S.',
    role: 'Manila reader',
  },
  {
    quote: 'I found three Filipino authors in one night.',
    name: 'Miguel R.',
    role: 'Quezon City',
  },
  {
    quote: 'Finally, a platform that makes Filipino literature feel beautifully cared for.',
    name: 'Bea L.',
    role: 'Cebu reader',
  },
];

export default function ReaderLove() {
  return (
    <section aria-labelledby="reader-love-heading" className="bg-background">
      <div className="container-katha py-20">
        {/* Header */}
        <div className="max-w-xl">
          <h2
            id="reader-love-heading"
            className="font-heading text-3xl font-bold tracking-tight text-foreground"
          >
            Reader Love
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            A few words from readers who&rsquo;ve made KATHA part of their evenings.
          </p>
        </div>

        {/* Testimonials */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex h-full flex-col rounded-[18px] border border-border bg-card p-7 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-md"
            >
              <span
                aria-hidden="true"
                className="block font-logo text-5xl leading-none text-accent/30 dark:text-accent/40"
              >
                &ldquo;
              </span>

              <blockquote className="mt-3 font-heading text-lg font-medium leading-relaxed text-foreground text-pretty">
                {testimonial.quote}
              </blockquote>

              <figcaption className="mt-auto flex items-center gap-3 pt-7">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary font-heading text-xs font-semibold text-clay dark:text-accent"
                >
                  {initialsOf(testimonial.name)}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{testimonial.name}</span>
                  <span className="text-xs text-muted-foreground">{testimonial.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}