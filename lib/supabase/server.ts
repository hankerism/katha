import 'server-only';

/* ---------------------------------------------------------------------------
 * KATHA · Supabase — server client
 * lib/supabase/server.ts
 *
 * The request-scoped Supabase client for SERVER code (server components,
 * route handlers). Built with @supabase/ssr's createServerClient over
 * next/headers cookies, so the request's auth session — once authentication
 * lands — flows into every query and RLS sees the right user.
 *
 * Created PER REQUEST, never cached at module scope: cookies are request
 * state. The `server-only` import makes any accidental client-bundle import
 * a build error rather than a subtle leak.
 *
 * Callers MUST gate on isSupabaseConfigured() — this throws when
 * unconfigured, same contract as the browser client. Server components do
 * not set cookies; the setAll no-op below is the documented @supabase/ssr
 * pattern for that constraint (middleware takes over session refresh when
 * authentication arrives).
 * ------------------------------------------------------------------------- */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabaseEnv } from './env';
import type { Database } from './database-types';

/** A request-scoped Supabase client. Throws when Supabase is not
 *  configured — check isSupabaseConfigured() first. */
export async function getSupabaseServerClient(): Promise<
  SupabaseClient<Database>
> {
  const env = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server Components cannot write cookies; session refresh moves to
        // middleware when authentication lands. Intentional no-op until then.
      },
    },
  });
}
