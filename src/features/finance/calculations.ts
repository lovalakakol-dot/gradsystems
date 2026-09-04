import {
  DIVISIONS,
  type CashbookEntryRow,
  type Currency,
  type DivisionFinancialSummary,
  type FinancialSummary,
  type RabItemRow,
} from './types';

/**
 * Top-of-page summary: Total Pemasukan / Pengeluaran / Saldo, computed
 * separately per currency (never combined). Both numbers come only
 * from cashbook_entries (income and expense respectively) —
 * rab_items never contributes to this summary, only to the division
 * breakdown below.
 */
export function calculateFinancialSummary(cashbookEntries: CashbookEntryRow[]): FinancialSummary {
  function totalsFor(currency: Currency) {
    const income = cashbookEntries
      .filter((e) => e.currency === currency && e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    const expense = cashbookEntries
      .filter((e) => e.currency === currency && e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    return { income, expense, balance: income - expense };
  }

  return {
    EGP: totalsFor('EGP'),
    IDR: totalsFor('IDR'),
  };
}

/**
 * Guards against NaN/Infinity: a zero budget always reports 0%,
 * regardless of how much was actually spent. isOverBudget is judged
 * separately (actual > budget), so a division can still show
 * "Over Budget" with a 0% figure when its budget is zero — the
 * percentage just has no meaningful ratio to display against.
 */
function safePercentage(actual: number, budget: number): number {
  if (budget <= 0) return 0;
  return (actual / budget) * 100;
}

/**
 * Anggaran vs Realisasi per division, for ONE currency at a time
 * (division + currency is the comparison unit — see spec section 8).
 * Anggaran = SUM(rab_items.estimated_cost); Realisasi =
 * SUM(cashbook_entries.amount) where type = 'expense' only — income
 * never counts toward realisasi.
 */
export function calculateDivisionBreakdown(
  rabItems: RabItemRow[],
  cashbookEntries: CashbookEntryRow[],
  currency: Currency
): DivisionFinancialSummary[] {
  const budgetItems = rabItems.filter((i) => i.currency === currency);
  const expenseEntries = cashbookEntries.filter((e) => e.type === 'expense' && e.currency === currency);

  return DIVISIONS.map((division) => {
    const budget = budgetItems
      .filter((i) => i.division === division)
      .reduce((sum, i) => sum + i.estimated_cost, 0);
    const actual = expenseEntries
      .filter((e) => e.division === division)
      .reduce((sum, e) => sum + e.amount, 0);
    const remaining = budget - actual;

    return {
      division,
      currency,
      budget,
      actual,
      remaining,
      percentage: safePercentage(actual, budget),
      isOverBudget: actual > budget,
    };
  });
}
