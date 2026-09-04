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

export interface RABItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  division: Division;
  estimated_cost: number;
  currency: Currency;
  description: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRABInput {
  item_name: string;
  quantity: number;
  unit: string;
  division: Division;
  currency: Currency;
  estimated_cost: number;
  description: string | null;
}

export type RABDivisionFilter = 'all' | Division;

export type RABSortOption =
  | 'newest'
  | 'name_asc'
  | 'name_desc'
  | 'egp_desc'
  | 'egp_asc'
  | 'idr_desc'
  | 'idr_asc';

export const SORT_LABELS: Record<RABSortOption, string> = {
  newest: 'Terbaru',
  name_asc: 'Nama A-Z',
  name_desc: 'Nama Z-A',
  egp_desc: 'Anggaran Terbesar EGP',
  egp_asc: 'Anggaran Terkecil EGP',
  idr_desc: 'Anggaran Terbesar IDR',
  idr_asc: 'Anggaran Terkecil IDR',
};

export interface RABFiltersState {
  search: string;
  division: RABDivisionFilter;
  sort: RABSortOption;
}

export const DEFAULT_RAB_FILTERS: RABFiltersState = {
  search: '',
  division: 'all',
  sort: 'newest',
};

export interface RABFormData {
  item_name: string;
  quantity: string;
  unit: string;
  division: Division;
  currency: Currency;
  estimated_cost: string;
  description: string;
}

export const EMPTY_RAB_FORM: RABFormData = {
  item_name: '',
  quantity: '',
  unit: '',
  division: 'Badan Pengurus Harian',
  currency: 'EGP',
  estimated_cost: '',
  description: '',
};

export interface RABFormErrors {
  item_name?: string;
  quantity?: string;
  unit?: string;
  division?: string;
  currency?: string;
  estimated_cost?: string;
  form?: string;
}

/**
 * Client-side mirror of Section 10's validation rules. RLS + the
 * database are the real source of truth; this only gives fast
 * feedback before a round trip.
 */
export function validateRABForm(form: RABFormData): RABFormErrors {
  const errors: RABFormErrors = {};

  if (!form.item_name.trim()) {
    errors.item_name = 'Nama item tidak boleh kosong.';
  }

  const quantity = Number(form.quantity);
  if (!form.quantity.trim() || Number.isNaN(quantity) || quantity <= 0) {
    errors.quantity = 'Quantity harus lebih dari 0.';
  }

  if (!form.unit.trim()) {
    errors.unit = 'Satuan tidak boleh kosong.';
  }

  if (!DIVISIONS.includes(form.division)) {
    errors.division = 'Divisi tidak valid.';
  }

  if (!CURRENCIES.includes(form.currency)) {
    errors.currency = 'Mata uang tidak valid.';
  }

  const cost = Number(form.estimated_cost);
  if (!form.estimated_cost.trim() || Number.isNaN(cost) || cost <= 0) {
    errors.estimated_cost = 'Estimasi biaya harus lebih dari 0.';
  }

  return errors;
}
