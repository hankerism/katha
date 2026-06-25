import Link from 'next/link';
import type { SVGProps } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · BookCard
 * components/ui/BookCard.tsx
 *
 * A reusable discovery card in the Kindle / Apple Books / Kinokuniya register:
 * a portrait cover above editorial metadata, the whole card a single link.
 * When no cover image is supplied it renders a CSS-only placeholder built from
 * the brand palette, so a grid never shows a broken or empty tile.
 *   surface → bg-card, border-border, shadow-sm → shadow-md on hover
 *   cover   → brand-* statics (theme-stable), 3:4, scales gently on hover
 *   type    → font-heading (Literata) title, font-body author, font-logo flourish
 *
 * Presentational + RSC-friendly: no client runtime, just a Link and CSS.
 * Drop into a responsive grid for the 1 / 2 / 4 column layout, e.g.
 *   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface BookCardProps {
  title: string;
  author: string;
  cover?: string | null;
  category?: string;
  featured?: boolean;
  chapters?: number;
  href: string;
}

function ChaptersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 6h14M5 12h14M5 18h9" />
    </svg>
  );
}

/** CSS-only fallback cover, themed from the brand palette (stable in light + dark). */
function PlaceholderCover({
  title,
  author,
  category,
}: {
  title: string;
  author: string;
  category?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="size-full bg-[linear-gradient(155deg,var(--color-brand-primary),color-mix(in_oklab,var(--color-brand-primary)_55%,#000))]"
    >
      <span className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.16),transparent_55%)]" />
      <span className="absolute inset-y-0 left-0 w-3 bg-[linear-gradient(to_right,rgba(0,0,0,0.30),transparent)]" />
      <span className="absolute inset-y-0 left-3 w-px bg-brand-accent/40" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-logo text-base font-semibold tracking-[0.18em] text-brand-secondary/90">
            KATHA
          </span>
          {category ? (
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-brand-accent">
              {category}
            </span>
          ) : null}
        </div>

        <div>
          <span className="mb-3 block h-px w-10 bg-brand-accent/70" />
          <p className="font-heading text-xl font-bold leading-tight text-brand-secondary line-clamp-3">
            {title}
          </p>
          <p className="mt-2 font-logo text-sm italic text-brand-secondary/80 line-clamp-1">
            {author}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookCard({
  title,
  author,
  cover,
  category,
  featured = false,
  chapters,
  href,
}: BookCardProps) {
  const hasChapters = typeof chapters === 'number';
  const chapterLabel = hasChapters ? `${chapters} ${chapters === 1 ? 'chapter' : 'chapters'}` : null;

  const ariaLabel = [
    `${title} by ${author}`,
    category,
    featured ? 'Featured' : null,
    chapterLabel,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cx(
        'group flex h-full w-full flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-sm',
        'transition-[transform,box-shadow,border-color] duration-300 ease-out',
        'hover:-translate-y-1 hover:border-border-strong hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary external cover URLs; avoids next/image remote config
          <img
            src={cover}
            alt={`Cover of ${title} by ${author}`}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="size-full transition-transform duration-500 ease-out group-hover:scale-105">
            <PlaceholderCover title={title} author={author} category={category} />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-semibold leading-snug text-foreground line-clamp-2">
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{author}</p>

        {category ? <span className="badge mt-3 self-start">{category}</span> : null}

        {featured || hasChapters ? (
          <div className="mt-auto flex items-center gap-2 pt-4">
            {featured ? <span className="badge badge-accent">★ Featured</span> : null}
            {chapterLabel ? (
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ChaptersIcon className="size-3.5" />
                {chapterLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}