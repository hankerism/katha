/* ---------------------------------------------------------------------------
 * KATHA · Supabase — environment seam
 * lib/supabase/env.ts
 *
 * The one place the Supabase configuration is read. Everything Supabase-
 * facing asks THIS module whether the backend exists; nothing else touches
 * process.env for these values.
 *
 * The contract, deliberately: Supabase is OPTIONAL. With no configuration
 * the app runs entirely on the local repository implementations — future
 * cloud repositories gate on isSupabaseConfigured() and the exported
 * instances fall back to the local implementations. Local-first development
 * never requires a backend.
 * ------------------------------------------------------------------------- */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

/** The configured environment, or null when Supabase is not set up.
 *  NEXT_PUBLIC_* so the same values serve the browser and the server. */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/** True when a Supabase project is configured for this environment. */
export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

/* ── Authentication provider selection ───────────────────────────────────── */

export type AuthProvider = 'local' | 'supabase';

let warnedFallback = false;

/** Which membership implementation is active — an EXPLICIT selection, never
 *  inferred from credential presence: local development keeps the local
 *  membership system even when Supabase credentials exist, unless
 *  NEXT_PUBLIC_AUTH_PROVIDER=supabase says otherwise. Defaults to 'local'.
 *  'supabase' without credentials is a misconfiguration: warn once and run
 *  local, so the app stays usable. */
export function getAuthProvider(): AuthProvider {
  if (process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'supabase') {
    if (getSupabaseEnv()) return 'supabase';
    if (!warnedFallback) {
      warnedFallback = true;
      console.warn(
        'NEXT_PUBLIC_AUTH_PROVIDER=supabase, but NEXT_PUBLIC_SUPABASE_URL / ' +
          'NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — falling back to the ' +
          'local membership system.',
      );
    }
  }
  return 'local';
}

/* ── Catalogue provider selection ────────────────────────────────────────── */

export type CatalogueProvider = 'local' | 'supabase';

let warnedCatalogueFallback = false;

/** Which catalogue implementation is active — independent of AUTH_PROVIDER
 *  by design (Sprint 13 amendment): repository seams stay independently
 *  swappable, so a deployment can run cloud auth over the compiled demo
 *  catalogue, or the cloud catalogue over local membership, or both.
 *  Explicit, defaults to 'local', warns-and-falls-back when credentials are
 *  missing — the same contract as the auth switch. */
export function getCatalogueProvider(): CatalogueProvider {
  if (process.env.NEXT_PUBLIC_CATALOGUE_PROVIDER === 'supabase') {
    if (getSupabaseEnv()) return 'supabase';
    if (!warnedCatalogueFallback) {
      warnedCatalogueFallback = true;
      console.warn(
        'NEXT_PUBLIC_CATALOGUE_PROVIDER=supabase, but Supabase env is not ' +
          'set — falling back to the compiled local catalogue.',
      );
    }
  }
  return 'local';
}

/* ── Works (publishing) provider selection ───────────────────────────────── */

export type WorksProvider = 'local' | 'supabase';

let warnedWorksFallback = false;

/** Which work repository is active — explicit like its siblings, with ONE
 *  approved coupling: cloud works require cloud auth (writing works is an
 *  authenticated, RLS-governed act; there is no session to write with in
 *  local auth mode). supabase works + local auth is a misconfiguration:
 *  warn once and run local works. The reverse (cloud auth over local works)
 *  remains a valid mixed mode. */
export function getWorksProvider(): WorksProvider {
  if (process.env.NEXT_PUBLIC_WORKS_PROVIDER === 'supabase') {
    if (getSupabaseEnv() && getAuthProvider() === 'supabase') return 'supabase';
    if (!warnedWorksFallback) {
      warnedWorksFallback = true;
      console.warn(
        'NEXT_PUBLIC_WORKS_PROVIDER=supabase requires Supabase credentials ' +
          'AND NEXT_PUBLIC_AUTH_PROVIDER=supabase (publishing writes are ' +
          'authenticated) — falling back to the local work repository.',
      );
    }
  }
  return 'local';
}

/** The environment, or a thrown error naming what is missing — for code
 *  paths that must not run unconfigured (the client factories). */
export function requireSupabaseEnv(): SupabaseEnv {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      'Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example). The app runs on ' +
        'local storage without them — this path should have checked ' +
        'isSupabaseConfigured() first.',
    );
  }
  return env;
}
