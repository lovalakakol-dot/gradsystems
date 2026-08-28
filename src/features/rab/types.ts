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

/**
 * Mirrors rab_items exactly, per the Step 7 migration
 * (20260824000000_domain_schema_refinement.sql) — not a guess,
 * transcribed from the migration I authored. Scoped to this
 * feature only; does not touch src/types/database.types.ts.
 */
export interface RabItem {
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

export interface CreateRabItemInput {
  item_name: string;
  quantity: number;
  unit: string;
  division: Division;
  currency: Currency;
  estimated_cost: number;
  description: string | null;
}

export type SortOption =
  | 'newest'
  | 'name_asc'
  | 'name_desc'
  | 'largest_egp'
  | 'smallest_egp'
  | 'largest_idr'
  | 'smallest_idr';

export const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Terbaru',
  name_asc: 'Nama A-Z',
  name_desc: 'Nama Z-A',
  largest_egp: 'Anggaran Terbesar — EGP',
  smallest_egp: 'Anggaran Terkecil — EGP',
  largest_idr: 'Anggaran Terbesar — IDR',
  smallest_idr: 'Anggaran Terkecil — IDR',
};

export const EXPORT_COLUMNS = [
  'division',
  'item_name',
  'quantity',
  'unit',
  'estimated_egp',
  'estimated_idr',
  'description',
] as const;

export type ExportColumn = (typeof EXPORT_COLUMNS)[number];

export const EXPORT_COLUMN_LABELS: Record<ExportColumn, string> = {
  division: 'Divisi',
  item_name: 'Nama Item Anggaran',
  quantity: 'Quantity',
  unit: 'Unit',
  estimated_egp: 'Estimasi EGP',
  estimated_idr: 'Estimasi IDR',
  description: 'Catatan',
};
/**
 * Explicit table-shape override for Supabase's `.from<T>()` generic
 * escape hatch — the documented mechanism for querying a table that
 * the client's bound Database type doesn't know about, without
 * resorting to `any`/`as never`/casts. Used as
 * `supabase.from<RabTable>('rab_items')` everywhere this feature
 * talks to the database.
 */
export interface RabTable {
  Row: RabItem;
  Insert: CreateRabItemInput;
  Update: Partial<CreateRabItemInput>;
}

export const ALL_DIVISIONS = 'Semua Divisi' as const;
export type DivisionFilter = Division | typeof ALL_DIVISIONS;