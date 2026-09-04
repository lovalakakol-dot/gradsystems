'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { CreateGraduateInput, GraduateTable } from './types';

/**
 * Strips everything except digits (+, spaces, dashes, parens) so the
 * value written to the database is already the clean digit string
 * the wa.me link is built from directly — see migration comment on
 * graduates.whatsapp_number. Runs once, at entry; nothing downstream
 * re-normalizes or rewrites this value.
 */
export function normalizeWhatsappNumber(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function useGraduateMutations() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createGraduate(input: CreateGraduateInput): Promise<{ error: string | null }> {
    setIsCreating(true);
    try {
      const supabase = createClient();
      // full_name is a legacy NOT NULL column not exposed in this
      // feature's form (see types.ts comment) — filled with the same
      // Arabic value as full_name_ar purely to satisfy that
      // constraint, never read back by this feature.
      const { error } = await supabase.from<GraduateTable>('graduates').insert({
        full_name: input.full_name_ar,
        full_name_ar: input.full_name_ar,
        gender: input.gender,
        country_code: input.country_code,
        whatsapp_number: input.whatsapp_number,
        attire: input.attire,
        shirt_size: input.shirt_size,
        verification_status: input.verification_status,
      });
      if (error) {
        console.error('Failed to create graduate', error);
        return { error: 'Gagal menambahkan data wisudawan.' };
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
      const { error } = await supabase.from<GraduateTable>('graduates').delete().eq('id', id);
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
