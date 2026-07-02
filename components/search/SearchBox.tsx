'use client';

import { useRef, type KeyboardEvent, type SVGProps } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · SearchBox
 * components/search/SearchBox.tsx
 *
 * The search field itself — the library hero's rounded-full input promoted to
 * a real, controlled component. PURE PRESENTATIONAL + local focus concerns:
 * the caller owns the query state; this only reports changes, submit (Enter)
 * and renders a clear control (Escape or ×) that keeps focus in the field so
 * a keyboard user can immediately retype.
 *
 * Accessible by construction: a real <input type="search"> with an sr-only
 * label, and a clear button with an explicit name. Tokens only.
 * ------------------------------------------------------------------------- */

function SearchIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  /** Enter — the caller opens its top result (no-op when it has none). */
  onSubmit: () => void;
  placeholder?: string;
  /** Focus the field on mount. Default true (the page is the search). */
  autoFocus?: boolean;
}

export default function SearchBox({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search books, authors, categories, chapters…',
  autoFocus = true,
}: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function clear() {
    onChange('');
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    } else if (event.key === 'Escape' && value) {
      // Only intercept Escape while there is something to clear.
      event.preventDefault();
      clear();
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3.5 shadow-sm transition-shadow duration-300 focus-within:shadow-md">
      <SearchIcon className="size-5 shrink-0 text-muted-foreground" />

      <label htmlFor="site-search" className="sr-only">
        Search the library
      </label>
      <input
        ref={inputRef}
        id="site-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        className="w-full bg-transparent font-body text-base text-foreground placeholder:text-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />

      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
