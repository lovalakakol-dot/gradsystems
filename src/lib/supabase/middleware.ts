import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase session cookie on every request (Server
 * Components can't write cookies themselves — see server.ts — so
 * this is the one place that keeps the session alive across
 * navigations) and returns a verified user for route-protection
 * decisions in the root proxy.
 *
 * Uses getUser(), not getSession() — getSession() only reads
 * whatever is in the cookie without checking it against Supabase
 * Auth; a tampered or stale cookie would pass silently. getUser()
 * revalidates the token against the Auth server every time, which
 * is what a real security-adjacent check running in Middleware
 * needs.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}