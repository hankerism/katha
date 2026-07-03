'use client';

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { BookSearchRecord } from '@/lib/books';
import type { KathaAuthor } from '@/lib/authors';
import { searchCatalogue, collectCategories } from '@/lib/search';
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  type RecentSearch,
} from '@/lib/recent-searches';
import SearchBox from './SearchBox';
import SearchSuggestions from './SearchSuggestions';
import SearchResults from './SearchResults';
import SearchNoResults from './SearchNoResults';

/* ---------------------------------------------------------------------------
 * KATHA · SearchExperience
 * components/search/SearchExperience.tsx
 *
 * The ONE stateful piece of Search — every component below it is
 * presentational, every rule it applies lives in a lib layer. It owns:
 *
 *   · query state — instant filtering on each keystroke via useDeferredValue
 *     + a memoized searchCatalogue() call, so typing never blocks on render
 *   · URL sync — the query is mirrored into ?q= (debounced router.replace,
 *     no scroll) so searches are shareable and survive back/forward; the
 *     initial query comes from the URL (hence the page wraps this in
 *     <Suspense> for useSearchParams)
 *   · recent searches — mount-gated read (the localStorage pattern shared
 *     with Bookmarks/History), recorded on COMMIT (Enter or result click),
 *     never per keystroke
 *   · keyboard flow — Enter opens the engine's top result (every result type
 *     carries an href, authors included); Escape/clear lives in SearchBox
 *   · a polite aria-live announcement of the result count
 *
 * Branching: no query → suggestions; results → grouped results; none → the
 * helpful dead end. All branches render below the always-present SearchBox.
 * ------------------------------------------------------------------------- */

const URL_SYNC_DELAY_MS = 250;

export interface SearchExperienceProps {
  /** The server-computed search index (no chapter prose) — passing it as
   *  props keeps lib/books.ts (and every book's full text) out of the client
   *  bundle entirely. */
  books: BookSearchRecord[];
  authors: KathaAuthor[];
}

export default function SearchExperience({
  books,
  authors,
}: SearchExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The URL is the initial source of truth; afterwards, state leads and the
  // URL follows (debounced), so back/forward re-lands on a shareable search.
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');

  const [recent, setRecent] = useState<RecentSearch[]>([]);
  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  // The two domain tables arrive as server-computed props; categories derive
  // from the index client-side.
  const catalogue = useMemo(() => ({ books, authors }), [books, authors]);
  const categories = useMemo(
    () => collectCategories(catalogue.books),
    [catalogue],
  );

  // Instant search: filtering runs against the deferred query so fast typing
  // stays responsive, and the memo prevents re-searching on unrelated renders.
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(
    () => searchCatalogue(deferredQuery, catalogue),
    [deferredQuery, catalogue],
  );
  const hasQuery = deferredQuery.trim().length > 0;

  // Mirror the query into ?q= without pushing a history entry per keystroke.
  const urlSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    urlSyncTimer.current = setTimeout(() => {
      const trimmed = query.trim();
      router.replace(
        trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search',
        { scroll: false },
      );
    }, URL_SYNC_DELAY_MS);
    return () => {
      if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    };
  }, [query, router]);

  /** Record the current query as a recent search (on commit, not keystroke).
   *  The functional updater works from the LATEST list, so quick successive
   *  commits can't race on a stale closure. */
  function commit() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((current) => addRecentSearch(trimmed, current));
  }

  /** Enter — open the engine's top result. Every result type has an href now
   *  (authors navigate to their profiles like everything else). */
  function handleSubmit() {
    const top = results.top;
    if (!top) return;
    commit();
    router.push(top.href);
  }

  function handleRemoveRecent(target: string) {
    setRecent((current) => removeRecentSearch(target, current));
  }

  function handleClearRecent() {
    clearRecentSearches();
    setRecent([]);
  }

  return (
    <div>
      <div className="max-w-xl">
        <SearchBox value={query} onChange={setQuery} onSubmit={handleSubmit} />
      </div>

      {/* Result count, announced politely for screen readers. */}
      <p aria-live="polite" className="sr-only">
        {hasQuery
          ? `${results.total} ${results.total === 1 ? 'result' : 'results'} for ${deferredQuery.trim()}`
          : ''}
      </p>

      <div className="mt-12">
        {!hasQuery ? (
          <SearchSuggestions
            recent={recent}
            categories={categories}
            onPick={(picked) => setQuery(picked)}
            onRemove={handleRemoveRecent}
            onClearAll={handleClearRecent}
          />
        ) : results.total > 0 ? (
          <SearchResults results={results} onCommit={commit} />
        ) : (
          <div className="mt-16">
            <SearchNoResults
              query={deferredQuery.trim()}
              categories={categories}
            />
          </div>
        )}
      </div>
    </div>
  );
}
