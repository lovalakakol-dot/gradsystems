import { createClient } from '../../lib/supabase/server';
import type { CashbookEntryRow, CashbookTable, RabItemRow } from './types';

export interface FinanceRawData {
  rabItems: RabItemRow[];
  cashbookEntries: CashbookEntryRow[];
  rabError: boolean;
  cashbookError: boolean;
}

/**
 * Read-only: fetches the two source tables this report derives from.
 * No inserts/updates/deletes happen from this feature — RAB and
 * Cashbook stay editable only via /bendahara/rab and
 * /bendahara/cashbook respectively.
 *
 * `.from('rab_items')` uses native Database-type inference (already
 * known there). `.from<CashbookTable>('cashbook_entries')` uses the
 * same documented generic escape hatch as the Cashbook feature, since
 * cashbook_entries is not yet in database.types.ts.
 *
 * Fetched in parallel; each table's success/failure is reported
 * independently so the page can show one generic error message
 * without leaking raw database errors.
 */
export async function getFinanceData(): Promise<FinanceRawData> {
  const supabase = await createClient();

  const [rabResult, cashbookResult] = await Promise.all([
    supabase.from('rab_items').select('*'),
    supabase.from<CashbookTable>('cashbook_entries').select('*'),
  ]);

  if (rabResult.error) {
    console.error('Failed to load rab_items for finance report', rabResult.error);
  }
  if (cashbookResult.error) {
    console.error('Failed to load cashbook_entries for finance report', cashbookResult.error);
  }

  return {
    rabItems: rabResult.data ?? [],
    cashbookEntries: cashbookResult.data ?? [],
    rabError: !!rabResult.error,
    cashbookError: !!cashbookResult.error,
  };
}
