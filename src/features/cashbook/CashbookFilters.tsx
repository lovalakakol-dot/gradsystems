'use client';

import { Search } from 'lucide-react';
import { DIVISIONS, SORT_LABELS, TYPE_LABELS } from './types';
import type {
  CashbookCurrencyFilter,
  CashbookDivisionFilter,
  CashbookFiltersState,
  CashbookSortOption,
  CashbookTypeFilter,
} from './types';

interface CashbookFiltersProps {
  filters: CashbookFiltersState;
  onChange: (filters: CashbookFiltersState) => void;
}

const TYPE_OPTIONS: { value: CashbookTypeFilter; label: string }[] = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'income', label: TYPE_LABELS.income },
  { value: 'expense', label: TYPE_LABELS.expense },
];

const DIVISION_OPTIONS: { value: CashbookDivisionFilter; label: string }[] = [
  { value: 'all', label: 'Semua Divisi' },
  ...DIVISIONS.map((division) => ({ value: division, label: division })),
];

const CURRENCY_OPTIONS: { value: CashbookCurrencyFilter; label: string }[] = [
  { value: 'all', label: 'Semua Mata Uang' },
  { value: 'EGP', label: 'EGP' },
  { value: 'IDR', label: 'IDR' },
];

const SORT_OPTIONS = Object.entries(SORT_LABELS) as [CashbookSortOption, string][];

const selectClass =
  'rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40';

export function CashbookFilters({ filters, onChange }: CashbookFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/40 bg-white/60 p-4 shadow-lg shadow-black/5 backdrop-blur-xl lg:flex-row lg:items-center lg:flex-wrap">
      <div className="relative flex-1 lg:min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Cari keterangan..."
          className="w-full rounded-lg border border-white/60 bg-white/50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
        />
      </div>

      <select
        value={filters.type}
        onChange={(event) => onChange({ ...filters, type: event.target.value as CashbookTypeFilter })}
        className={`${selectClass} sm:w-40`}
      >
        {TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.division}
        onChange={(event) =>
          onChange({ ...filters, division: event.target.value as CashbookDivisionFilter })
        }
        className={`${selectClass} sm:w-56`}
      >
        {DIVISION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.currency}
        onChange={(event) =>
          onChange({ ...filters, currency: event.target.value as CashbookCurrencyFilter })
        }
        className={`${selectClass} sm:w-40`}
      >
        {CURRENCY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(event) => onChange({ ...filters, sort: event.target.value as CashbookSortOption })}
        className={`${selectClass} sm:w-48`}
      >
        {SORT_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
