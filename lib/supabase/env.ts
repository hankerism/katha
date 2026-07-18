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
