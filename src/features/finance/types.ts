export type Division =
  | 'Badan Pengurus Harian'
  | 'Divisi Acara'
  | 'Divisi Pendataan'
  | 'Divisi Media'
  | 'Divisi Humas'
  | 'Divisi Logistik';

export const DIVISIONS: Division[] = [
  'Badan Pengurus Harian',
  'Divisi Acara',
  'Divisi Pendataan',
  'Divisi Media',
  'Divisi Humas',
  'Divisi Logistik',
];

export type Currency = 'EGP' | 'IDR';
export const CURRENCIES: Currency[] = ['EGP', 'IDR'];

export type CashbookType = 'income' | 'expense';

/* ========================================================================
 * RAW DATABASE ROW SHAPES — read-only source of truth for this report.
 * Mirrors rab_items / cashbook_entries exactly. This feature never
 * writes to either table — see data.ts.
 * ==================================================================== */

/** Mirrors rab_items (same shape used by the RAB feature). */
export interface RabItemRow {
  id: string;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  division: Division;
  estimated_cost: number;
  currency: Currency;
  description: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Mirrors cashbook_entries (same shape used by the Cashbook feature). */
export interface CashbookEntryRow {
  id: string;
  transaction_date: string;
  type: CashbookType;
  category: string;
  description: string | null;
  division: Division;
  amount: number;
  currency: Currency;
  payment_method: string;
  pic: string | null;
  attachment_url: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Table-shape override for Supabase's `.from<T>()` generic escape
 * hatch, same mechanism already used by the Cashbook feature —
 * cashbook_entries is not yet in database.types.ts. rab_items IS
 * already known there, so it needs no override.
 */
export interface CashbookTable {
  Row: CashbookEntryRow;
}

/* ========================================================================
 * DERIVED FINANCIAL DATA — computed in calculations.ts, never
 * persisted to the database.
 * ==================================================================== */

export interface CurrencyTotals {
  income: number;
  expense: number;
  balance: number;
}

/** One entry per currency — EGP and IDR are always kept apart, never summed. */
export type FinancialSummary = Record<Currency, CurrencyTotals>;

export interface DivisionFinancialSummary {
  division: Division;
  currency: Currency;
  budget: number;
  actual: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export function statusLabel(isOverBudget: boolean): string {
  return isOverBudget ? 'Over Budget' : 'Dalam Anggaran';
}

export const ALL_DIVISIONS = 'Semua Divisi' as const;
export type DivisionFilter = Division | typeof ALL_DIVISIONS;
