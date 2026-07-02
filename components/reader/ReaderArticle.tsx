import type { SVGProps } from 'react';
import { paragraphAnchorId } from '@/lib/reading-location';

/* ---------------------------------------------------------------------------
 * KATHA · ReaderArticle
 * components/reader/ReaderArticle.tsx
 *
 * The reading column itself: a centered editorial header (book-title eyebrow,
 * chapter title, author + reading time, a hairline rule) above the serif body.
 * Presentational server component — no client state. Reading text uses
 * font-heading (Literata), KATHA's reader face; chrome uses font-body. Tokens
 * only.
 *
 * Rhythm & sizing are intentional:
 *   • The body font-size / line-height follow the reader's Text Size preference
 *     via --reader-font-size / --reader-line-height (set on the reader wrapper),
 *     so Small/Medium/Large actually change the prose. A clamp() fallback keeps
 *     it sensible if the component is used outside the reader shell.
 *   • Paragraph spacing is em-based (space-y-[1.5em]), so the gaps scale with
 *     the chosen text size instead of staying fixed.
 *
 * This component carries NO width or outer padding of its own — the caller's
 * page surface owns the measure and the book-margin padding.
 * ------------------------------------------------------------------------- */

interface ReaderArticleProps {
  bookTitle: string;
  author: string;
  chapterTitle: string;
  estimatedReadingTime: number;
  content: string[];
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function ReaderArticle({
  bookTitle,
  author,
  chapterTitle,
  estimatedReadingTime,
  content,
}: ReaderArticleProps) {
  return (
    <article aria-labelledby="chapter-heading">
      <header className="text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {bookTitle}
        </p>

        <h1
          id="chapter-heading"
          className="mt-4 font-heading text-3xl leading-tight text-foreground sm:text-4xl"
        >
          {chapterTitle}
        </h1>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-body text-sm text-muted-foreground">
          <span>{author}</span>
          <span aria-hidden="true" className="text-muted-foreground/40">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            {estimatedReadingTime} min read
          </span>
        </div>

        {/* Hairline rule — separates the header from the body */}
        <div aria-hidden="true" className="mx-auto mt-10 h-px w-12 bg-border" />
      </header>

      {/* Body — size + line-height follow the Text Size preference, nudged up
          a touch for long-form comfort (still derived from the vars, never a
          fixed size); paragraph spacing scales with the text via em units.
          Colour is inherited from the warm .reading-surface paper. */}
      <div
        className="mt-14 space-y-[1.9em]"
        style={{
          fontSize:
            'calc(var(--reader-font-size, clamp(1.0625rem, 0.95rem + 0.5vw, 1.25rem)) * 1.06)',
          lineHeight: 'calc(var(--reader-line-height, 1.85) * 1.05)',
        }}
      >
        {content.map((paragraph, i) => (
          <p
            key={i}
            id={paragraphAnchorId(i)}
            data-paragraph-index={i}
            className={cx(
              'scroll-mt-[calc(var(--navbar-height,4rem)+4rem)] font-heading [text-wrap:pretty]',
              i === 0 &&
                'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-logo first-letter:text-6xl first-letter:leading-none first-letter:text-primary',
            )}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}