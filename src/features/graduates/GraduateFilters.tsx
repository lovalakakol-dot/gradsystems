'use client';

import { Search } from 'lucide-react';
import Select from '@/shared/components/Select';
import {
  ALL_COUNTRIES,
  ALL_SHIRT_SIZES,
  ALL_VERIFICATION,
  SHIRT_SIZES,
  SHIRT_SIZE_LABELS,
  SORT_LABELS,
  VERIFICATION_LABELS,
  VERIFICATION_STATUSES,
  type CountryFilter,
  type ShirtSizeFilter,
  type SortOption,
  type VerificationFilter,
} from './types';

export default function GraduateFilters({
  search,
  onSearchChange,
  availableCountries,
  countryFilter,
  onCountryFilterChange,
  shirtSizeFilter,
  onShirtSizeFilterChange,
  verificationFilter,
  onVerificationFilterChange,
  sort,
  onSortChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  availableCountries: { code: string; nameAr: string }[];
  countryFilter: CountryFilter;
  onCountryFilterChange: (value: CountryFilter) => void;
  shirtSizeFilter: ShirtSizeFilter;
  onShirtSizeFilterChange: (value: ShirtSizeFilter) => void;
  verificationFilter: VerificationFilter;
  onVerificationFilterChange: (value: VerificationFilter) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          dir="rtl"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama atau negara (أحمد، مصر...)"
          className="block w-full rounded-lg border border-black/25 bg-white/70 py-2 pl-3 pr-9 text-right text-gray-900 backdrop-blur-xl transition focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33]"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Filter Negara"
          value={countryFilter}
          onChange={(e) => onCountryFilterChange(e.target.value as CountryFilter)}
        >
          <option value={ALL_COUNTRIES}>{ALL_COUNTRIES}</option>
          {availableCountries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.nameAr}
            </option>
          ))}
        </Select>

        <Select
          label="Filter Ukuran"
          value={shirtSizeFilter}
          onChange={(e) => onShirtSizeFilterChange(e.target.value as ShirtSizeFilter)}
        >
          <option value={ALL_SHIRT_SIZES}>{ALL_SHIRT_SIZES}</option>
          {SHIRT_SIZES.map((s) => (
            <option key={s} value={s}>
              {SHIRT_SIZE_LABELS[s]}
            </option>
          ))}
        </Select>

        <Select
          label="Filter Status"
          value={verificationFilter}
          onChange={(e) => onVerificationFilterChange(e.target.value as VerificationFilter)}
        >
          <option value={ALL_VERIFICATION}>{ALL_VERIFICATION}</option>
          {VERIFICATION_STATUSES.map((v) => (
            <option key={v} value={v}>
              {VERIFICATION_LABELS[v]}
            </option>
          ))}
        </Select>

        <Select label="Urutkan" value={sort} onChange={(e) => onSortChange(e.target.value as SortOption)}>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
