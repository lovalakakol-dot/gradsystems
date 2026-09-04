import { createClient } from '../../lib/supabase/server';
import type { CreateGraduateInput, GraduateRow, GraduateTable } from './types';

/**
 * Opsi B: `.from<GraduateTable>('graduates')` — same documented
 * generic escape hatch already used by Cashbook/Finance for tables
 * not yet in database.types.ts.
 */
export async function getGraduates(): Promise<{ graduates: GraduateRow[]; hasError: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from<GraduateTable>('graduates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load graduates', error);
    return { graduates: [], hasError: true };
  }
  return { graduates: data ?? [], hasError: false };
}
