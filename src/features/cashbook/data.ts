'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  CashbookEntry,
  CreateCashbookEntryInput,
} from './types';

export async function fetchCashbookEntries(): Promise<CashbookEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cashbook_entries')
    .select('*')
    .order('transaction_date', { ascending: true })
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to fetch cashbook_entries', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error('Gagal memuat data buku kas.');
  }

  return data as CashbookEntry[];
}

export async function createCashbookEntry(
  input: CreateCashbookEntryInput
): Promise<CashbookEntry> {
  const supabase = await createClient();

  const category =
    input.type === 'income'
      ? 'Pemasukan'
      : 'Pengeluaran';

  const paymentMethod = 'Tidak dicatat';

  const payload = {
    transaction_date: input.transaction_date,
    type: input.type,
    category,
    description: input.description.trim(),
    division: input.division,
    currency: input.currency,
    amount: input.amount,
    payment_method: paymentMethod,
    attachment_url: input.attachment_url?.trim() || null,
  };

  console.log('Creating cashbook_entry', {
    payload,
  });

  const { data, error } = await supabase
    .from('cashbook_entries')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to create cashbook_entry', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      payload,
    });

    throw new Error(
      [
        'Gagal menyimpan transaksi.',
        error.message,
        error.details,
        error.hint,
      ]
        .filter(Boolean)
        .join(' | ')
    );
  }

  revalidatePath('/bendahara/cashbook');

  return data as CashbookEntry;
}

export async function deleteCashbookEntry(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('cashbook_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete cashbook_entry', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      id,
    });

    throw new Error('Gagal menghapus transaksi.');
  }

  revalidatePath('/bendahara/cashbook');
}