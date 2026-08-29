'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { CreateGraduateInput, GraduateFormValues, GraduateTable } from './types';
import type { Database } from '@/types/database.types';

type GraduatesInsert = Database['public']['Tables']['graduates']['Insert'];
//   ^^^^^^^^^^^^^^ arahkan kursor ke sini di editor — lihat tooltip-nya

const _sanityCheck: GraduatesInsert = {
  full_name: 'test',
  full_name_ar: 'test',
  country_code: 'ID',
  shirt_size: 'large',
  participant_number: '1',
  whatsapp_number: '0',
  verification_status: 'done',
};
/**
 * full_name is required by the existing schema but is not a form
 * field in this feature — derive it from full_name_ar so the insert
 * never violates the NOT NULL constraint. If full_name_ar is ever
 * blank (should be caught by form validation first), fall back to a
 * literal placeholder rather than sending an empty string, which
 * would fail the full_name_not_blank check.
 */
function toCreateInput(values: GraduateFormValues): CreateGraduateInput {
  const nameAr = values.full_name_ar.trim();
  return {
    full_name: nameAr.length > 0 ? nameAr : 'Tanpa Nama',
    full_name_ar: nameAr,
    country_code: values.country_code,
    shirt_size: values.shirt_size as CreateGraduateInput['shirt_size'],
    participant_number: values.participant_number.trim(),
    whatsapp_number: values.whatsapp_number.trim(),
    verification_status: values.verification_status,
  };
}

export function useGraduateMutations() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createGraduate(values: GraduateFormValues): Promise<{ error: string | null }> {
    setIsCreating(true);
    try {
      const supabase = createClient();
      // RLS: graduates_insert_pendataan — only succeeds for an
      // active pendataan user. created_by/updated_by are forced
      // server-side by the set_audit_columns trigger regardless of
      // what is sent here; no service-role key is ever used here.
      //
      // Explicit <'graduates', GraduateTable> override, restored:
      // plain .from('graduates') left the second (dependent) generic
      // unresolved and collapsed it to `never` instead of falling
      // back to Database['public']['Tables']['graduates']. Passing
      // GraduateTable explicitly sidesteps that inference gap — same
      // convention as RAB's RabTable and Cashbook's CashbookTable.
      const { error } = await supabase
        .from<'graduates', GraduateTable>('graduates')
        .insert(toCreateInput(values));
      if (error) {
        console.error('Failed to create graduate', error);
        return { error: 'Gagal menyimpan data wisudawan.' };
      }
      router.refresh();
      return { error: null };
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteGraduate(id: string): Promise<{ error: string | null }> {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from<'graduates', GraduateTable>('graduates')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Failed to delete graduate', error);
        return { error: 'Gagal menghapus data wisudawan.' };
      }
      router.refresh();
      return { error: null };
    } finally {
      setDeletingId(null);
    }
  }

  return { createGraduate, deleteGraduate, isCreating, deletingId };
}