import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '../../../src/lib/supabase/middleware';

type Role = 'admin' | 'bendahara' | 'pendataan' | 'acara';

const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  bendahara: '/bendahara',
  pendataan: '/pendataan',
  acara: '/acara',
};

const PROTECTED_PREFIXES = Object.values(ROLE_HOME);

/**
 * Next.js 16 proxy convention (root-level, replaces the older
 * Next.js Middleware naming from earlier Next.js versions). Still
 * fundamentally a routing/UX decision, not the security boundary
 * — it decides which PAGE gets served; it grants no database
 * access by itself. RLS (current_user_role(), is_active-aware)
 * remains the only thing that actually protects any table,
 * regardless of what happens here.
 */
export async function proxy(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  let profile: { role: Role; is_active: boolean } | null = null;
  if (user) {
    // profiles_select_own — works regardless of is_active, exactly
    // as it does for the client. is_active is checked explicitly
    // below, mirroring what current_user_role() enforces at the
    // database layer for every other query.
    const { data } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .maybeSingle();
    profile = data as { role: Role; is_active: boolean } | null;
  }

  const isAuthorized = !!profile && profile.is_active;
  const homePath = isAuthorized ? ROLE_HOME[profile!.role] : null;

  if (pathname === '/' || pathname === '/login') {
    if (isAuthorized && homePath) {
      return NextResponse.redirect(new URL(homePath, request.url));
    }
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response; // /login renders normally for a guest
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return response; // /unauthorized and anything else ungated here
  }

  if (!isAuthorized) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!homePath || !pathname.startsWith(homePath)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};