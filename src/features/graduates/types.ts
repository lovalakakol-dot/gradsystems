export type ShirtSize = 'large' | 'small';

export const SHIRT_SIZE_LABEL: Record<ShirtSize, string> = {
  large: 'Besar',
  small: 'Kecil',
};

export const ALL_SHIRT_SIZES = 'Semua Ukuran' as const;
export type ShirtSizeFilter = ShirtSize | typeof ALL_SHIRT_SIZES;

export type VerificationStatus = 'done' | 'not_yet';

export const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  done: 'Sudah',
  not_yet: 'Belum',
};

export const ALL_VERIFICATION_STATUSES = 'Semua Status' as const;
export type VerificationStatusFilter = VerificationStatus | typeof ALL_VERIFICATION_STATUSES;

export const ALL_COUNTRIES = 'Semua Negara' as const;
// A country filter value is either a country_code (ISO 3166-1 alpha-2)
// or the "show everything" sentinel above.
export type CountryFilter = string | typeof ALL_COUNTRIES;

/**
 * Shape of a row returned from public.graduates.
 *
 * `full_name` is the original, pre-existing NOT NULL column. It is
 * intentionally not exposed as its own form field in this feature —
 * see CreateGraduateInput below.
 */
export interface GraduateEntry {
  id: string;
  full_name: string;
  full_name_ar: string | null;
  country_code: string | null;
  shirt_size: ShirtSize | null;
  verification_status: VerificationStatus;
  participant_number: string | null;
  whatsapp_number: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Data required when creating a new graduate.
 *
 * full_name is required by the existing database schema (NOT NULL,
 * predates this feature) but is not a user-facing field here — the
 * mutation layer derives it from full_name_ar automatically, same
 * convention as category/payment_method in the Cashbook feature.
 */
export interface CreateGraduateInput {
  full_name: string;
  full_name_ar: string;
  country_code: string;
  shirt_size: ShirtSize;
  participant_number: string;
  whatsapp_number: string;
  verification_status: VerificationStatus;
}

/**
 * Kept for table-contract completeness (mirrors the Cashbook/RAB
 * pattern). Not currently wired to any edit UI — this feature only
 * ships create + delete per the current requirement.
 */
export interface UpdateGraduateInput {
  full_name?: string;
  full_name_ar?: string | null;
  country_code?: string | null;
  shirt_size?: ShirtSize | null;
  participant_number?: string | null;
  whatsapp_number?: string | null;
  verification_status?: VerificationStatus;
}

/**
 * Table-shape override for feature-local Supabase typing, following
 * the same pattern used by RAB and Cashbook. Relationships is
 * required by postgrest-js's GenericTable constraint even though
 * graduates has no foreign-table relationships modeled here.
 */
export interface GraduateTable {
  Row: GraduateEntry;
  Insert: CreateGraduateInput;
  Update: UpdateGraduateInput;
  Relationships: [];
}

export type SortOption = 'name_asc' | 'name_desc' | 'participant_number_asc';

export const SORT_LABELS: Record<SortOption, string> = {
  name_asc: 'Nama A-Z',
  name_desc: 'Nama Z-A',
  participant_number_asc: 'No. Peserta (Awal-Akhir)',
};

export interface GraduateFiltersState {
  search: string;
  country: CountryFilter;
  shirtSize: ShirtSizeFilter;
  verificationStatus: VerificationStatusFilter;
  sort: SortOption;
}

export const DEFAULT_GRADUATE_FILTERS: GraduateFiltersState = {
  search: '',
  country: ALL_COUNTRIES,
  shirtSize: ALL_SHIRT_SIZES,
  verificationStatus: ALL_VERIFICATION_STATUSES,
  sort: 'name_asc',
};

/**
 * One country's contribution to the recap. Only countries that
 * actually have at least one graduate are ever produced by
 * calculateGraduateSummary — zero-count countries are never
 * included.
 */
export interface CountryCount {
  countryCode: string;
  countryNameAr: string;
  count: number;
}

/**
 * Summary derived from the COMPLETE graduates dataset, not the
 * filtered/displayed subset — same convention as Cashbook's
 * summary, which always reflects full history regardless of the
 * table's current filters.
 */
export interface GraduateSummary {
  totalParticipants: number;
  byCountry: CountryCount[];
  totalLarge: number;
  totalSmall: number;
}

/**
 * Export/preview columns.
 */
export const EXPORT_COLUMNS = [
  'participant_number',
  'full_name_ar',
  'country',
  'shirt_size',
  'whatsapp_number',
  'verification_status',
] as const;

export type ExportColumn = (typeof EXPORT_COLUMNS)[number];

export const EXPORT_COLUMN_LABELS: Record<ExportColumn, string> = {
  participant_number: 'No. Peserta',
  full_name_ar: 'Nama Lengkap',
  country: 'Asal Negara',
  shirt_size: 'Ukuran Baju',
  whatsapp_number: 'No. WhatsApp',
  verification_status: 'Status Verifikasi',
};

/**
 * A single row shared verbatim by the export preview table and the
 * XLSX writer (see utils/exportGraduates.ts) — keys are the human
 * column labels themselves, in selected-column order, so both the
 * on-screen preview and the workbook header row are guaranteed to
 * match.
 */
export type GraduateExportRow = Record<string, string | number>;

export interface GraduateFormErrors {
  full_name_ar?: string;
  country_code?: string;
  shirt_size?: string;
  participant_number?: string;
  whatsapp_number?: string;
}

/**
 * Field order here matches the form's visual order: No. Peserta,
 * Nama Lengkap (Arab), Asal Negara, Ukuran Baju, No. WhatsApp,
 * Berkas Terverifikasi.
 */
export interface GraduateFormValues {
  participant_number: string;
  full_name_ar: string;
  country_code: string;
  shirt_size: ShirtSize | '';
  whatsapp_number: string;
  verification_status: VerificationStatus;
}

export const DEFAULT_GRADUATE_FORM_VALUES: GraduateFormValues = {
  participant_number: '',
  full_name_ar: '',
  country_code: '',
  shirt_size: '',
  whatsapp_number: '',
  verification_status: 'not_yet',
};

/**
 * Builds a wa.me click-to-chat link from a raw WhatsApp number.
 *
 * This only strips formatting characters (spaces, dashes,
 * parentheses, a leading +) — it does NOT guess or rewrite a
 * country code from a bare leading 0, since graduates come from
 * many different countries and a wrong guess would silently
 * produce a link to the wrong person. The form expects the number
 * already in international format (e.g. 6281234567890) and hints
 * that at entry time.
 */
export function buildWhatsAppLink(rawNumber: string): string {
  const digits = rawNumber.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}