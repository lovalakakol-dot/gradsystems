'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { CreateRabItemInput, RabTable } from './types';

export function useRabItemMutations() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createRabItem(input: CreateRabItemInput): Promise<{ error: string | null }> {
    setIsCreating(true);
    try {
      const supabase = createClient();
      // RLS: rab_items_insert_bendahara — only succeeds for an
      // active bendahara (current_user_role(), is_active-aware).
      // created_by/updated_by are forced server-side by the
      // set_audit_columns trigger regardless of what is sent here
      // — the browser can't forge either, and never uses a
      // service-role key.
      const { error } = await supabase.from('rab_items').insert(input);
      if (error) {
        console.error('Failed to create rab_item', error);
        return { error: 'Gagal menyimpan item anggaran.' };
      }
      router.refresh();
      return { error: null };
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteRabItem(id: string): Promise<{ error: string | null }> {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('rab_items').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete rab_item', error);
        return { error: 'Gagal menghapus item anggaran.' };
      }
      router.refresh();
      return { error: null };
    } finally {
      setDeletingId(null);
    }
  }

  return { createRabItem, deleteRabItem, isCreating, deletingId };
}