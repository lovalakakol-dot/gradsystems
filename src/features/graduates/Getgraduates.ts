import { createClient } from '../../lib/supabase/server';
import type { GraduateEntry, GraduateTable } from './types';

/**
 * Fetches the full graduates list. RLS (graduates_select_pendataan)
 * scopes this to an active pendataan user automatically — no
 * additional role check needed here. Ordered by created_at so the
 * result is deterministic; the UI applies its own A-Z/Z-A sort on
 * top of this regardless (see utils/filterGraduates.ts).
 *
 * `.from<'graduates', GraduateTable>('graduates')` — same
 * generic-override pattern as RAB's RabTable and Cashbook's
 * CashbookTable.
 */
export async function getGraduates(): Promise<{
  entries: GraduateEntry[];
  hasError: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from<'graduates', GraduateTable>('graduates')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load graduates', error);
    return { entries: [], hasError: true };
  }
  return { entries: data ?? [], hasError: false };
}
