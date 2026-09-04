'use client';

import { Search } from 'lucide-react';
import { DIVISIONS, SORT_LABELS } from './types';
import type { RABDivisionFilter, RABFiltersState, RABSortOption } from './types';

interface RABFiltersProps {
  filters: RABFiltersState;
  onChange: (filters: RABFiltersState) => void;
}

const DIVISION_OPTIONS: { value: RABDivisionFilter; label: string }[] = [
  { value: 'all', label: 'Semua Divisi' },
  ...DIVISIONS.map((division) => ({ value: division, label: division })),
];

const SORT_OPTIONS = Object.entries(SORT_LABELS) as [RABSortOption, string][];

export function RABFilters({ filters, onChange }: RABFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/40 bg-white/60 p-4 shadow-lg shadow-black/5 backdrop-blur-xl sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Cari nama item..."
          className="w-full rounded-lg border border-white/60 bg-white/50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
        />
      </div>

      <select
        value={filters.division}
        onChange={(event) => onChange({ ...filters, division: event.target.value as RABDivisionFilter })}
        className="rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40 sm:w-56"
      >
        {DIVISION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(event) => onChange({ ...filters, sort: event.target.value as RABSortOption })}
        className="rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40 sm:w-56"
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
