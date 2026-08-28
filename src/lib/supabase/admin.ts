import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

/**
 * Service-role client — bypasses RLS entirely. NEVER import this
 * from a Client Component or anything that could reach the
 * browser bundle. Only ever call this from inside a Route Handler
 * (or, later, a Server Action), and only AFTER the caller has
 * already been verified as an active admin using the regular
 * cookie-aware server client (src/lib/supabase/server.ts).
 *
 * Stateless — no cookie awareness, no user session concept, since
 * these are always privileged one-off admin operations, not
 * actions performed "as" any particular signed-in user.
 *
 * SUPABASE_SECRET_KEY: the modern replacement for the legacy
 * "service_role key" naming, paired with
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Deliberately has NO
 * NEXT_PUBLIC_ prefix — Next.js only exposes prefixed env vars to
 * the client bundle, so this can only ever be read server-side.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}