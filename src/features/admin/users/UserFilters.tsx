'use client';

import { Search } from 'lucide-react';
import { ROLE_LABELS, ROLE_ORDER } from './types';
import type { RoleFilterValue, StatusFilterValue, UserFiltersState } from './types';

interface UserFiltersProps {
  filters: UserFiltersState;
  onChange: (filters: UserFiltersState) => void;
}

const ROLE_OPTIONS: { value: RoleFilterValue; label: string }[] = [
  { value: 'all', label: 'Semua Role' },
  ...ROLE_ORDER.map((role) => ({ value: role, label: ROLE_LABELS[role] })),
];

const STATUS_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
];

export function UserFilters({ filters, onChange }: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/40 bg-white/60 p-4 shadow-lg shadow-black/5 backdrop-blur-xl sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Cari nama atau username..."
          className="w-full rounded-lg border border-white/60 bg-white/50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
        />
      </div>

      <select
        value={filters.role}
        onChange={(event) => onChange({ ...filters, role: event.target.value as RoleFilterValue })}
        className="rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40 sm:w-48"
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(event) => onChange({ ...filters, status: event.target.value as StatusFilterValue })}
        className="rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40 sm:w-40"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
