import CashbookEntry from './types';

export interface CashbookEntryWithBalance extends CashbookEntry {
  running_egp: number;
  running_idr: number;
}

/**
 * Expects `entries` already ordered deterministically (transaction_date
 * ASC, created_at ASC, id ASC — see getCashbookEntries.ts). Running
 * balance is computed ONCE over the FULL, unfiltered history; any
 * UI-level filtering must happen AFTER this, on the already-annotated
 * list, so a filtered view never recalculates history from a partial
 * set (Section: "Filter UI tidak boleh mengubah historical running
 * balance").
 */
export function calculateRunningBalance(entries: CashbookEntry[]): CashbookEntryWithBalance[] {
  let runningEgp = 0;
  let runningIdr = 0;

  return entries.map((entry) => {
    const signedAmount = entry.type === 'income' ? entry.amount : -entry.amount;
    if (entry.currency === 'EGP') {
      runningEgp += signedAmount;
    } else {
      runningIdr += signedAmount;
    }
    return { ...entry, running_egp: runningEgp, running_idr: runningIdr };
  });

}
export function calculateSummary(entries: CashbookEntry[]) {
  const totalIncome = entries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpense = entries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, currentBalance };
}