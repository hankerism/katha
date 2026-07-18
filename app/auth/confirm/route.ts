import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthProvider, getSupabaseEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/supabase/database-types';
import type { EmailOtpType } from '@supabase/supabase-js';

/* ---------------------------------------------------------------------------
 * KATHA · Auth confirmation callback
 * app/auth/confirm/route.ts
 *
 * Where authentication emails land (Sprint 11 — the missing last step of the
 * sign-up flow): the confirmation link verifies here, the session cookies are
 * written, and the reader is returned INTO the application at `next`.
 *
 * Two verification shapes are accepted, per the Supabase SSR guidance:
 *   • ?token_hash=…&type=…  — the token-hash style (works in any browser,
 *     including one that never saw the sign-up form)
 *   • ?code=…               — the PKCE code style the default email
 *     templates produce for browser-initiated sign-ups
 *
 * Invalid or expired links never dead-end: they redirect to /join with a
 *
 * calm, named error the join page explains. A route handler (unlike a server
 * component) may write cookies, so the client here uses the real cookie
 * store — this is deliberately NOT lib/supabase/server.ts, whose setAll is
 * a server-component no-op.
 * ------------------------------------------------------------------------- */

function safeNext(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/library';
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get('next'));

  const env = getSupabaseEnv();
  if (getAuthProvider() !== 'supabase' || !env) {
    // Local mode has no email confirmations; anyone landing here belongs home.
    return NextResponse.redirect(new URL('/', url.origin));
  }

  const { createServerClient } = await import('@supabase/ssr');
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const code = url.searchParams.get('code');

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    return NextResponse.redirect(
      new URL('/join?auth_error=expired', url.origin),
    );
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    return NextResponse.redirect(
      new URL('/join?auth_error=expired', url.origin),
    );
  }

  // No recognizable credentials in the link at all.
  return NextResponse.redirect(new URL('/join?auth_error=invalid', url.origin));
}
