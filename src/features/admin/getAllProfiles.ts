import { createClient } from '../../lib/supabase/server';
import type { ProfileRow } from '@/types/database.types';

/**
 * Relies entirely on the profiles_select_admin_all RLS policy —
 * only returns rows at all when the caller is an active admin.
 * The /admin route is already gated to active admins by the root
 * proxy, so this is expected to succeed whenever it's called; if
 * it somehow weren't (defense in depth), RLS would just yield an
 * empty/filtered result, not an error.
 */
export async function getAllProfiles(): Promise<ProfileRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load profiles list', error);
    return [];
  }
  return data ?? [];
}