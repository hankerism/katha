'use client';

/* ---------------------------------------------------------------------------
 * KATHA · Supabase — browser client
 * lib/supabase/client.ts
 *
 * The browser-side Supabase client, created once per tab and shared (the
 * house singleton pattern — like the repository instances). Built with
 * @supabase/ssr's createBrowserClient so auth sessions live in cookies the
 * server client (lib/supabase/server.ts) can also read — the pair is what
 * makes server-rendered pages auth-aware later.
 *
 * Callers MUST gate on isSupabaseConfigured() (lib/supabase/env.ts) —
 * getSupabaseBrowserClient() throws when unconfigured, by design: reaching
 * it without a backend is a wiring bug, not a runtime condition. Future
 * cloud repositories do that gating internally; UI code never imports this.
 * ------------------------------------------------------------------------- */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabaseEnv } from './env';
import type { Database } from './database-types';

let client: SupabaseClient<Database> | null = null;

/** The tab's one Supabase client. Throws when Supabase is not configured —
 *  check isSupabaseConfigured() first. */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (client) return client;
  const env = requireSupabaseEnv();
  client = createBrowserClient<Database>(env.url, env.anonKey);
  return client;
}
