import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '../../types/database.types';

// Used by Server Components, Route Handlers, and Server Actions.
// Never import this from a Client Component ('use client') file.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Thrown when called from a Server Component (not a
            // Route Handler or Server Action) — cookies() is
            // read-only there. Safe to ignore: Middleware already
            // refreshes the session cookie on every request, so a
            // Server Component doesn't need to be able to write it
            // itself.
          }
        },
      },
    }
  );
}