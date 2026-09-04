export const DIVISIONS = [
  'Badan Pengurus Harian',
  'Divisi Acara',
  'Divisi Pendataan',
  'Divisi Media',
  'Divisi Humas',
  'Divisi Logistik',
] as const;

export type Division = (typeof DIVISIONS)[number];

export const CURRENCIES = ['EGP', 'IDR'] as const;
export type Currency = (typeof CURRENCIES)[number];

export type TransactionType = 'income' | 'expense';

export const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Pemasukan',
  expense: 'Pengeluaran',
};

export const DEFAULT_PAYMENT_METHOD = 'Tidak dicatat';

/** Section 12 — category is auto-derived from type, never a form field. */
export function categoryForType(type: TransactionType): string {
  return type === 'income' ? 'Pemasukan' : 'Pengeluaran';
}

export interface CashbookEntry {
  id: string;
  transaction_date: string; // ISO 'YYYY-MM-DD' as stored in the DB
  type: TransactionType;
  category: string;
  description: string;
  division: Division;
  currency: Currency;
  amount: number; // always positive — sign comes from `type`, never the number
  payment_method: string;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

/** A CashbookEntry with its own-currency running balance attached. */
export interface CashbookDisplayRow extends CashbookEntry {
  balance: number;
}

export interface CreateCashbookInput {
  transaction_date: string; // ISO 'YYYY-MM-DD'
  type: TransactionType;
  description: string;
  division: Division;
  currency: Currency;
  amount: number;
  attachment_url: string | null;
}

// ---------------------------------------------------------------------
// Centralized DD/MM/YYYY date formatting (Section 5). Every date shown
// to the user — form, table, filter, export — MUST go through these
// functions so the format never drifts between components.
// ---------------------------------------------------------------------

/**
 * Formats an ISO 'YYYY-MM-DD' (or ISO timestamp) string as DD/MM/YYYY.
 * Pure string slicing — deliberately does NOT go through `Date`
 * parsing/local-getters, which can shift a date-only value by a day
 * in negative-UTC-offset timezones.
 */
export function formatDateDDMMYYYY(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

/** Parses a DD/MM/YYYY string to ISO 'YYYY-MM-DD', or null if invalid. */
export function parseDDMMYYYYToISODate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  // Reject calendar-invalid dates (e.g. 31/02/2026) by round-tripping
  // through a local-components Date constructor (no ISO/UTC parsing
  // involved, so no timezone shift risk).
  const date = new Date(year, month - 1, day);
  const isValid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isValid) return null;

  return `${yyyy}-${mm}-${dd}`;
}

/** Today's date as DD/MM/YYYY, for defaulting the form. */
export function todayAsDDMMYYYY(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${now.getFullYear()}`;
}

/** Auto-inserts slashes as the user types digits into the date field. */
export function maskDateInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// Comma-separated thousands for both currencies, matching Section 13's
// literal example ("EGP 5,000" / "IDR 2,500,000").
export function formatCashAmount(currency: Currency, value: number): string {
  return `${currency} ${new Intl.NumberFormat('en-US').format(Math.round(value))}`;
}

// ---------------------------------------------------------------------
// Canonical order + running balance (Section 6 & 7).
// ---------------------------------------------------------------------

/** transaction_date → created_at → id, all deterministic string compares. */
export function compareCanonicalOrder(a: CashbookEntry, b: CashbookEntry): number {
  if (a.transaction_date !== b.transaction_date) {
    return a.transaction_date < b.transaction_date ? -1 : 1;
  }
  if (a.created_at !== b.created_at) {
    return a.created_at < b.created_at ? -1 : 1;
  }
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

/**
 * Computes running balance PER CURRENCY over canonical order, on the
 * FULL dataset passed in — callers must pass every entry, never an
 * already-filtered subset (Section 7). Each row is tagged with its
 * own currency's balance at that point in time; filtering/sorting the
 * returned array afterward for display never touches `balance`.
 */
export function computeCashbookDisplayRows(entries: CashbookEntry[]): CashbookDisplayRow[] {
  const canonical = [...entries].sort(compareCanonicalOrder);
  let runningEGP = 0;
  let runningIDR = 0;

  return canonical.map((entry) => {
    const delta = entry.type === 'income' ? entry.amount : -entry.amount;
    if (entry.currency === 'EGP') {
      runningEGP += delta;
    } else {
      runningIDR += delta;
    }
    return { ...entry, balance: entry.currency === 'EGP' ? runningEGP : runningIDR };
  });
}

// ---------------------------------------------------------------------
// Filters & sort (display-only — never affects balance, Section 7).
// ---------------------------------------------------------------------

export type CashbookTypeFilter = 'all' | TransactionType;
export type CashbookDivisionFilter = 'all' | Division;
export type CashbookCurrencyFilter = 'all' | Currency;
export type CashbookSortOption = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc';

export const SORT_LABELS: Record<CashbookSortOption, string> = {
  newest: 'Terbaru',
  oldest: 'Terlama',
  amount_desc: 'Nominal Terbesar',
  amount_asc: 'Nominal Terkecil',
};

export interface CashbookFiltersState {
  search: string;
  type: CashbookTypeFilter;
  division: CashbookDivisionFilter;
  currency: CashbookCurrencyFilter;
  sort: CashbookSortOption;
}

export const DEFAULT_CASHBOOK_FILTERS: CashbookFiltersState = {
  search: '',
  type: 'all',
  division: 'all',
  currency: 'all',
  sort: 'newest',
};

/** Display-only ordering; balance values on each row are untouched. */
export function sortCashbookRows(
  rows: CashbookDisplayRow[],
  sort: CashbookSortOption
): CashbookDisplayRow[] {
  switch (sort) {
    case 'oldest':
      return [...rows].sort(compareCanonicalOrder);
    case 'amount_desc':
      return [...rows].sort((a, b) => b.amount - a.amount);
    case 'amount_asc':
      return [...rows].sort((a, b) => a.amount - b.amount);
    case 'newest':
    default:
      return [...rows].sort((a, b) => compareCanonicalOrder(b, a));
  }
}

// ---------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------

export interface CashbookFormData {
  transaction_date: string; // DD/MM/YYYY as typed by the user
  type: TransactionType;
  description: string;
  division: Division;
  currency: Currency;
  amount: string;
  attachment_url: string;
}

/** Fresh empty form, `transaction_date` defaulted to today. Call this
 * (don't use a module-level const) so "today" is evaluated live each
 * time the dialog opens, not once at module load. */
export function emptyCashbookForm(): CashbookFormData {
  return {
    transaction_date: todayAsDDMMYYYY(),
    type: 'income',
    description: '',
    division: 'Badan Pengurus Harian',
    currency: 'EGP',
    amount: '',
    attachment_url: '',
  };
}

export interface CashbookFormErrors {
  transaction_date?: string;
  type?: string;
  description?: string;
  division?: string;
  currency?: string;
  amount?: string;
  form?: string;
}

/** Client-side mirror of Section 11's validation rules. */
export function validateCashbookForm(form: CashbookFormData): CashbookFormErrors {
  const errors: CashbookFormErrors = {};

  if (!parseDDMMYYYYToISODate(form.transaction_date)) {
    errors.transaction_date = 'Tanggal tidak valid. Gunakan format DD/MM/YYYY.';
  }
  if (form.type !== 'income' && form.type !== 'expense') {
    errors.type = 'Tipe wajib dipilih.';
  }
  if (!form.description.trim()) {
    errors.description = 'Keterangan tidak boleh kosong.';
  }
  if (!DIVISIONS.includes(form.division)) {
    errors.division = 'Divisi tidak valid.';
  }
  if (!CURRENCIES.includes(form.currency)) {
    errors.currency = 'Mata uang tidak valid.';
  }
  const amount = Number(form.amount);
  if (!form.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Nominal harus lebih dari 0.';
  }

  return errors;
}
