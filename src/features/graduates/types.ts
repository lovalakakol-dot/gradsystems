export type Gender = 'male' | 'female';
export const GENDER_LABELS: Record<Gender, string> = {
  male: 'بنين',
  female: 'بنات',
};

export type ShirtSize = 'large' | 'small' | 'none';
export const SHIRT_SIZE_LABELS: Record<ShirtSize, string> = {
  large: 'Besar',
  small: 'Kecil',
  none: 'Tidak ada',
};
export const SHIRT_SIZES: ShirtSize[] = ['large', 'small', 'none'];

export type Attire = 'full_set' | 'sash_only';
export const ATTIRE_LABELS: Record<Attire, string> = {
  full_set: 'Atribut lengkap',
  sash_only: 'Selempang saja',
};
export const ATTIRES: Attire[] = ['full_set', 'sash_only'];

export type VerificationStatus = 'done' | 'not_yet';
export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  done: 'Sudah',
  not_yet: 'Belum',
};
export const VERIFICATION_STATUSES: VerificationStatus[] = ['done', 'not_yet'];

/**
 * Mirrors graduates exactly, per the field-expansion migration
 * (20260904000000_graduates_field_expansion.sql) on top of
 * 20260813000000_initial_schema.sql +
 * 20260824000000_domain_schema_refinement.sql — not a guess,
 * transcribed from the migrations. Scoped to this feature only;
 * does not touch src/types/database.types.ts.
 *
 * full_name (legacy, NOT NULL) and full_name_ar are both present in
 * the real table. This feature treats full_name_ar as the sole
 * source of truth for display/search/sort/export, and writes the
 * same Arabic value into full_name at insert time purely to satisfy
 * its NOT NULL constraint (see data.ts) — full_name is never read
 * back by this feature.
 */
export interface GraduateRow {
  id: string;
  full_name: string;
  full_name_ar: string | null;
  gender: Gender | null;
  country_code: string | null;
  whatsapp_number: string | null;
  attire: Attire | null;
  shirt_size: ShirtSize | null;
  verification_status: VerificationStatus;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGraduateInput {
  full_name_ar: string;
  gender: Gender;
  country_code: string;
  whatsapp_number: string;
  attire: Attire;
  shirt_size: ShirtSize;
  verification_status: VerificationStatus;
}

/**
 * Explicit table-shape override for Supabase's `.from<T>()` generic
 * escape hatch — graduates is not yet in database.types.ts, same
 * documented mechanism already used by Cashbook/Finance.
 */
export interface GraduateTable {
  Row: GraduateRow;
  Insert: CreateGraduateInput & { full_name: string };
}

export const ALL_COUNTRIES = 'Semua Negara' as const;
export type CountryFilter = string | typeof ALL_COUNTRIES;

export const ALL_SHIRT_SIZES = 'Semua Ukuran' as const;
export type ShirtSizeFilter = ShirtSize | typeof ALL_SHIRT_SIZES;

export const ALL_VERIFICATION = 'Semua Status' as const;
export type VerificationFilter = VerificationStatus | typeof ALL_VERIFICATION;

export type SortOption = 'name_asc' | 'name_desc' | 'country_asc' | 'country_desc';
export const SORT_LABELS: Record<SortOption, string> = {
  name_asc: 'Nama A-Z',
  name_desc: 'Nama Z-A',
  country_asc: 'Negara A-Z',
  country_desc: 'Negara Z-A',
};

/* ===== Export ===== */

export const EXPORT_COLUMNS = [
  'no',
  'full_name_ar',
  'gender',
  'country',
  'whatsapp',
  'attire',
  'shirt_size',
  'verification_status',
] as const;
export type ExportColumn = (typeof EXPORT_COLUMNS)[number];

export const EXPORT_COLUMN_LABELS: Record<ExportColumn, string> = {
  no: 'No.',
  full_name_ar: 'Nama Lengkap',
  gender: 'Jenis Kelamin',
  country: 'Asal Negara',
  whatsapp: 'Nomor WhatsApp',
  attire: 'Atribut Wisuda',
  shirt_size: 'Ukuran Baju',
  verification_status: 'Status Berkas',
};

export type WhatsappExportFormat = 'plain' | 'wa_me';

/** One export/preview row — same shape feeds both the preview table
 * and the XLSX writer, so preview is guaranteed to equal the file
 * (section 33). */
export type ExportCellValue = string | number;
/** Partial because a row only ever carries the currently-selected
 * columns, never the full ExportColumn set. */
export type ExportRow = Partial<Record<ExportColumn, ExportCellValue>>;
