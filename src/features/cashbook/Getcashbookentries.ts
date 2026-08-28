import { createClient } from '../../lib/supabase/server';
import type { CashbookEntry, CashbookTable } from './types';

/**
 * Fetches the FULL transaction history, unfiltered — running
 * balance must be computed from complete history regardless of
 * which filter the UI currently applies (see
 * calculateRunningBalance.ts). Ordered deterministically:
 * transaction_date ASC, then created_at ASC, then id ASC as final
 * tie-breaker — exactly the order Section 10 requires.
 *
 * Opsi B: `.from<'cashbook_entries', CashbookTable>('cashbook_entries')` — same
 * generic-override pattern as RAB's RabTable.
 */
export async function getCashbookEntries(): Promise<{
  entries: CashbookEntry[];
  hasError: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from<'cashbook_entries', CashbookTable>('cashbook_entries')
    .select('*')
    .order('transaction_date', { ascending: true })
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to load cashbook_entries', error);
    return { entries: [], hasError: true };
  }
  return { entries: data ?? [], hasError: false };
}