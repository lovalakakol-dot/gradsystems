'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { CreateCashbookEntryInput, CashbookTable } from './types';

export function useCashbookMutations() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createEntry(input: CreateCashbookEntryInput): Promise<{ error: string | null }> {
    setIsCreating(true);
    try {
      const supabase = createClient();
      // RLS: cashbook_entries_insert_bendahara — only succeeds for
      // an active bendahara. created_by/updated_by are forced
      // server-side by the set_audit_columns trigger regardless of
      // what is sent here — the browser can't forge either, and
      // never uses a service-role key.
      const { error } = await supabase.from<'cashbook_entries', CashbookTable>('cashbook_entries').insert(input);
      if (error) {
        console.error('Failed to create cashbook_entry', error);
        return { error: 'Gagal menyimpan transaksi.' };
      }
      router.refresh();
      return { error: null };
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteEntry(id: string): Promise<{ error: string | null }> {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from<'cashbook_entries', CashbookTable>('cashbook_entries')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Failed to delete cashbook_entry', error);
        return { error: 'Gagal menghapus transaksi.' };
      }
      router.refresh();
      return { error: null };
    } finally {
      setDeletingId(null);
    }
  }

  return { createEntry, deleteEntry, isCreating, deletingId };
}