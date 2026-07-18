import { NextResponse, type NextRequest } from 'next/server';
import { getAuthProvider, getSupabaseEnv } from '@/lib/supabase/env';

/* ---------------------------------------------------------------------------
 * KATHA · Proxy — session cookie refresh ONLY
 * proxy.ts (Next 16's successor to the middleware convention)
 *
 * The one job (Sprint 9): keep Supabase auth cookies fresh so the session
 * never silently expires mid-visit. No gating, no redirects — route
 * protection stays with the client gates (StudioGate, ChapterGate, the
 * member shelves), which is the product's voice: guests meet invitations,
 * not bounces.
 *
 * Local mode (the explicit AUTH_PROVIDER selection): straight pass-through;
 * no Supabase code loads at all.
 * ------------------------------------------------------------------------- */

export async function proxy(request: NextRequest) {
  if (getAuthProvider() !== 'supabase') return NextResponse.next();
  const env = getSupabaseEnv();
  if (!env) return NextResponse.next();

  const { createServerClient } = await import('@supabase/ssr');

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching the user triggers the token refresh when one is due; the
  // setAll above carries the fresh cookies to both the request (for this
  // render) and the response (for the browser).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Everything except static assets — the refresh matters on pages, not
  // on images/fonts/build output.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|covers/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
