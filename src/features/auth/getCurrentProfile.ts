import { createClient } from '../../lib/supabase/server';
import type { ProfileRow } from '../../types/database.types';

/**
 * Server Component equivalent of the old client AuthContext's
 * profile resolution — but there is no global context anymore.
 * Each Server Component that needs the current user's profile
 * calls this directly. This does mean one extra `profiles` query
 * per page render on top of the one Middleware already does for
 * route protection — a cheap, invisible-to-the-browser
 * indexed-by-primary-key SELECT, not the kind of client-perceived
 * redundant fetch the original "don't fetch profile per page" rule
 * was written against (that rule was about avoiding visible
 * loading flicker on the client; this runs server-side before any
 * HTML reaches the browser).
 */
export async function getCurrentProfile(): Promise<{
  user: { id: string } | null;
  profile: ProfileRow | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return { user: { id: user.id }, profile };
}