import { Search } from 'lucide-react';
import { COUNTRIES_UNIQUE } from './countries';
import {
  ALL_COUNTRIES,
  ALL_SHIRT_SIZES,
  ALL_VERIFICATION_STATUSES,
  SHIRT_SIZE_LABEL,
  SORT_LABELS,
  VERIFICATION_STATUS_LABEL,
  type CountryFilter,
  type ShirtSizeFilter,
  type SortOption,
  type VerificationStatusFilter,
} from './types';

const SELECT_CLASS =
  'rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33]';

export function GraduateFilters({
  search,
  onSearchChange,
  country,
  onCountryChange,
  shirtSize,
  onShirtSizeChange,
  verificationStatus,
  onVerificationStatusChange,
  sort,
  onSortChange,
  onExportClick,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  country: CountryFilter;
  onCountryChange: (value: CountryFilter) => void;
  shirtSize: ShirtSizeFilter;
  onShirtSizeChange: (value: ShirtSizeFilter) => void;
  verificationStatus: VerificationStatusFilter;
  onVerificationStatusChange: (value: VerificationStatusFilter) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onExportClick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama atau negara"
          className={`${SELECT_CLASS} w-full pl-9`}
        />
      </div>

      <select
        value={country}
        onChange={(e) => onCountryChange(e.target.value)}
        className={SELECT_CLASS}
      >
        <option value={ALL_COUNTRIES}>{ALL_COUNTRIES}</option>
        {COUNTRIES_UNIQUE.map((c) => (
          <option key={c.code} value={c.code}>
            {c.nameAr}
          </option>
        ))}
      </select>

      <select
        value={shirtSize}
        onChange={(e) => onShirtSizeChange(e.target.value as ShirtSizeFilter)}
        className={SELECT_CLASS}
      >
        <option value={ALL_SHIRT_SIZES}>{ALL_SHIRT_SIZES}</option>
        {(Object.entries(SHIRT_SIZE_LABEL) as [ShirtSizeFilter, string][]).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={verificationStatus}
        onChange={(e) => onVerificationStatusChange(e.target.value as VerificationStatusFilter)}
        className={SELECT_CLASS}
      >
        <option value={ALL_VERIFICATION_STATUSES}>{ALL_VERIFICATION_STATUSES}</option>
        {(Object.entries(VERIFICATION_STATUS_LABEL) as [VerificationStatusFilter, string][]).map(
          ([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          )
        )}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className={SELECT_CLASS}
      >
        {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onExportClick}
        className="rounded-md border border-[#7A1E33] px-4 py-2 text-sm font-medium text-[#7A1E33] hover:bg-[#7A1E33]/5"
      >
        Export to Spreadsheet
      </button>
    </div>
  );
}

export default GraduateFilters;
