import { createClient } from '@/lib/supabase/client';
import type { CreateRABInput, RABItem } from './types';

/**
 * ⚠️ FIELD NAME FLAG: this file uses `division` as the column name,
 * matching this task's spec (Section 3). Earlier in the project the
 * equivalent rab_items column was decided as `division_code` (an
 * enum shared with cashbook_entries). If the real table actually
 * uses `division_code`, rename every `division` reference in this
 * file and in types.ts to match — that mismatch, if it exists, will
 * surface as a real TypeScript error against database.types.ts
 * rather than being hidden, per Section 24's strict-typing rule.
 * See "Error yang Tersisa" in the final report for this flagged as
 * an open item.
 */

export async function fetchRABItems(): Promise<{ items: RABItem[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rab_items')
    .select(
      'id, item_name, quantity, unit, division, estimated_cost, currency, description, created_by, updated_by, created_at, updated_at'
    )
    .order('created_at', { ascending: false })
    .returns<RABItem[]>();

  if (error) {
    console.error('Failed to load RAB items', error);
    return { items: [], error: 'Gagal memuat data RAB. Coba muat ulang halaman.' };
  }

  return { items: data ?? [], error: null };
}

/**
 * `input` is typed as CreateRABInput end to end (Section 24 — no
 * `as any` / `as never`). If `rab_items`'s generated Insert type in
 * database.types.ts doesn't yet match this shape (missing/renamed
 * column, stale enum), TypeScript will correctly refuse this call —
 * that gap should be fixed at the type-definition source, not cast
 * away here.
 */
export async function createRABItem(
  input: CreateRABInput
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from('rab_items').insert(input);

  if (error) {
    console.error('Failed to create RAB item', error);
    return { success: false, error: 'Gagal menambahkan item RAB. Coba lagi.' };
  }

  return { success: true, error: null };
}

export async function deleteRABItem(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from('rab_items').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete RAB item', error);
    return { success: false, error: 'Gagal menghapus item RAB. Coba lagi.' };
  }

  return { success: true, error: null };
}
