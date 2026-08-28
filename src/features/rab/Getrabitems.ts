import { createClient } from '../../lib/supabase/server';
import type { RabItem, RabTable } from './types';

/**
 * Opsi B: `.from<RabTable>('rab_items')` — Supabase/PostgREST's
 * documented generic override for querying a table the client's
 * bound Database type doesn't know about yet. No `any`, no
 * `as never`, no suppressions — see types.ts for RabTable.
 */
export async function getRabItems(): Promise<{ items: RabItem[]; hasError: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rab_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load rab_items', error);
    return { items: [], hasError: true };
  }
  return { items: data ?? [], hasError: false };
}