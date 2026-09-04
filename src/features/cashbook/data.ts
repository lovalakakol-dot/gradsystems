import { createClient } from '@/lib/supabase/client';
import { DEFAULT_PAYMENT_METHOD, categoryForType } from './types';
import type { CashbookEntry, CreateCashbookInput } from './types';

/**
 * NOTE on import path: assumes the browser Supabase client lives at
 * `@/lib/supabase/client`, same assumption used in the RAB Builder
 * and User Management features. Adjust if the actual export differs.
 */

export async function fetchCashbookEntries(): Promise<{
  entries: CashbookEntry[];
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cashbook_entries')
    .select(
      'id, transaction_date, type, category, description, division, currency, amount, payment_method, attachment_url, created_at, updated_at'
    )
    .returns<CashbookEntry[]>();

  if (error) {
    console.error('Failed to load cashbook entries', error);
    return { entries: [], error: 'Gagal memuat data buku kas. Coba muat ulang halaman.' };
  }

  // Deliberately NOT ordered here — the canonical order used for
  // running balance (transaction_date → created_at → id) is applied
  // client-side in computeCashbookDisplayRows() over the FULL result,
  // so this fetch just needs to return every row.
  return { entries: data ?? [], error: null };
}

/**
 * `category` and `payment_method` are auto-filled here per the
 * project's existing decision (Section 12) — there is no UI for
 * either field, and the DB has both as NOT NULL.
 */
export async function createCashbookEntry(
  input: CreateCashbookInput
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from('cashbook_entries').insert({
    transaction_date: input.transaction_date,
    type: input.type,
    description: input.description,
    division: input.division,
    currency: input.currency,
    amount: input.amount,
    attachment_url: input.attachment_url,
    category: categoryForType(input.type),
    payment_method: DEFAULT_PAYMENT_METHOD,
  });

  if (error) {
    console.error('Failed to create cashbook entry', error);
    return { success: false, error: 'Gagal menambahkan transaksi. Coba lagi.' };
  }

  return { success: true, error: null };
}

export async function deleteCashbookEntry(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from('cashbook_entries').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete cashbook entry', error);
    return { success: false, error: 'Gagal menghapus transaksi. Coba lagi.' };
  }

  return { success: true, error: null };
}
