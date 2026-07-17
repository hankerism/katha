import { paragraphAnchorId } from '@/lib/reading-location';
import { ClockIcon } from '@/components/ui/icons';

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
 *   • The body typography lives in .reader-prose (globals.css), driven by the
 *     preference variables set on the reader wrapper — Text Size, Line Height,
 *     and Paragraph Spacing all actually change the prose. Its fallbacks keep
 *     it sensible if the component is used outside the reader shell.
 *   • Paragraph spacing is em-based, so the gaps scale with the chosen text
 *     size instead of staying fixed.
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

      {/* Body — all typography (size, leading, paragraph rhythm) comes from
          .reader-prose in globals.css, driven by the preference variables on
          the reader shell. Nothing here hardcodes a value, so this component
          stays purely presentational. Colour is inherited from the warm
          .reading-surface paper. */}
      <div className="reader-prose mt-14">
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