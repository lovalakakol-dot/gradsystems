import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

// Used by Client Components only ('use client'). Session lives in
// cookies (managed by @supabase/ssr under the hood), not
// localStorage — this is what lets the server read the same
// session in the proxy and in Server Components.
//
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — the modern replacement
// for the legacy "anon key" naming. It is safe to ship to the
// browser (that's what "publishable" means); it carries no
// privilege beyond what RLS grants an authenticated/anon request.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}