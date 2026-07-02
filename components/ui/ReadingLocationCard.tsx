'use client';

import Link from 'next/link';
import type { MouseEvent, SVGProps } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · ReadingLocationCard
 * components/ui/ReadingLocationCard.tsx
 *
 * The shared "reading location" card — a warm sheet of paper that presents one
 * passage and links back into the reader. It is the reusable atom behind three
 * features:
 *   • Bookmarks       → passage preview + saved time + hover-revealed remove
 *   • Reading History → same card, no remove, timestamp in `meta`
 *   • Continue Reading→ a single featured instance with a `progress` bar
 *
 * PURE PRESENTATIONAL. It imports nothing from lib/: the caller resolves the
 * display strings (e.g. `preview` via resolvePreview(), the chapter number via
 * getChapterNumber()) and passes them in. That keeps this component free of
 * book-content coupling and identical across all consumers.
 *
 * Interaction (from the approved mockup): the whole card is the deep link; the
 * "Continue reading →" cue and a subtle lift appear on hover; the optional
 * remove control is a DOM sibling of the link (never nested inside the anchor),
 * revealed on hover / focus, and stops the click from navigating. Tokens only.
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** Passage marker — a small ribbon glyph echoing the reader's chapter markers. */
function RibbonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export interface ReadingLocationCardProps {
  /** Deep link into the reader (the whole card navigates here, incl. #p-anchor). */
  href: string;
  /** Small tracked attribution line, e.g. "Chapter 2 · A House Facing the Sea".
   *  The caller composes this (History might use "Book · Chapter", etc.). */
  eyebrow: string;
  /** The passage — the hero. Already resolved by the caller (resolvePreview). */
  preview: string;
  /** Small muted label, e.g. "Saved yesterday" or "Opened today". */
  meta?: string;
  /** Accessible name for the card link. Defaults to the eyebrow. */
  ariaLabel?: string;
  /** Show the ribbon/passage glyph beside the eyebrow. Default true. */
  showRibbon?: boolean;
  /** Max preview lines before clamping. Default 3. */
  previewLines?: number;
  /** Trailing cue text. Default "Continue reading". */
  continueLabel?: string;
  /** When provided, renders a hover/focus-revealed remove control. */
  onRemove?: () => void;
  /** Accessible label for the remove control. Default "Remove bookmark". */
  removeLabel?: string;
  /** 0–100 reading progress; when set, renders a slim progress bar. */
  progress?: number | null;
}

export default function ReadingLocationCard({
  href,
  eyebrow,
  preview,
  meta,
  ariaLabel,
  showRibbon = true,
  previewLines = 3,
  continueLabel = 'Continue reading',
  onRemove,
  removeLabel = 'Remove bookmark',
  progress = null,
}: ReadingLocationCardProps) {
  // Render progress only for a real, finite number (rejects null / NaN /
  // ±Infinity). The typeof check also narrows to `number` for the math.
  const clampedProgress =
    typeof progress === 'number' && Number.isFinite(progress)
      ? Math.min(100, Math.max(0, Math.round(progress)))
      : null;

  function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    // The button is a sibling of the link, but guard anyway so a click can
    // never navigate the card.
    event.preventDefault();
    event.stopPropagation();
    onRemove?.();
  }

  return (
    <div className="group relative">
      <Link
        href={href}
        aria-label={ariaLabel ?? eyebrow}
        className={cx(
          'block rounded-xl border border-border/60 reading-surface p-6 sm:p-7',
          'shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-out',
          'group-hover:border-border-strong/70 group-hover:shadow-[var(--ds-shadow-md)]',
          'motion-safe:group-hover:-translate-y-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        {/* Tier 2 · attribution (chapter as a quiet citation) */}
        <div
          className={cx(
            'flex items-center gap-2 font-body text-[0.68rem] font-medium uppercase tracking-[0.15em] text-muted-foreground',
            onRemove && 'pr-8',
          )}
        >
          {showRibbon && (
            <RibbonIcon className="size-3 shrink-0 text-primary/70" />
          )}
          <span className="truncate">{eyebrow}</span>
        </div>

        {/* Tier 1 · the passage — the hero */}
        <p
          className="mt-3 font-reader text-[1.075rem] leading-[1.62] text-reader-foreground [text-wrap:pretty]"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: previewLines,
            overflow: 'hidden',
          }}
        >
          {preview}
        </p>

        {/* Optional progress (Continue Reading) */}
        {clampedProgress !== null && (
          <div className="mt-4 flex items-center gap-3">
            <div
              role="progressbar"
              aria-valuenow={clampedProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1 w-full overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <span className="shrink-0 font-body text-[0.7rem] tabular-nums text-muted-foreground">
              {clampedProgress}%
            </span>
          </div>
        )}

        {/* Tier 3 · meta + the continue cue */}
        <div className="mt-4 flex items-center justify-between gap-4">
          {meta ? (
            <span className="font-body text-[0.74rem] text-reader-muted">
              {meta}
            </span>
          ) : null}
          <span className="ml-auto inline-flex items-center gap-1.5 font-body text-[0.78rem] font-medium text-muted-foreground transition-colors group-hover:text-primary">
            {continueLabel}
            <ArrowRightIcon className="size-[15px] transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>

      {/* Quiet remove control — a sibling of the link (not nested), revealed on
          hover / focus. Present only when onRemove is supplied (Bookmarks). */}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label={removeLabel}
          title={removeLabel}
          className={cx(
            'absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg text-muted-foreground',
            'opacity-0 transition-[opacity,color,background-color] duration-200',
            'group-hover:opacity-60 hover:!opacity-100 hover:bg-muted/70 hover:text-foreground',
            'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <CloseIcon className="size-[15px]" />
        </button>
      )}
    </div>
  );
}