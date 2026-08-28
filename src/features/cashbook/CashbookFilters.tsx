'use client';

import { Download } from 'lucide-react';
import Select from '@/shared/components/Select';
import Button from '@/shared/components/Button';
import {
  ALL_CURRENCIES,
  ALL_DIVISIONS,
  ALL_TYPES,
  DIVISIONS,
  SORT_LABELS,
  type CurrencyFilter,
  type DivisionFilter,
  type SortOption,
  type TypeFilter,
} from './types';

export default function CashbookFilters({
  divisionFilter,
  onDivisionFilterChange,
  typeFilter,
  onTypeFilterChange,
  currencyFilter,
  onCurrencyFilterChange,
  sort,
  onSortChange,
  onExportClick,
}: {
  divisionFilter: DivisionFilter;
  onDivisionFilterChange: (value: DivisionFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  currencyFilter: CurrencyFilter;
  onCurrencyFilterChange: (value: CurrencyFilter) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onExportClick: () => void;
}) {
  return (
    <div className="space-y-3">
      <Select
        label="Filter Divisi"
        value={divisionFilter}
        onChange={(e) => onDivisionFilterChange(e.target.value as DivisionFilter)}
      >
        <option value={ALL_DIVISIONS}>{ALL_DIVISIONS}</option>
        {DIVISIONS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>

      <Select
        label="Filter Tipe"
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value as TypeFilter)}
      >
        <option value={ALL_TYPES}>{ALL_TYPES}</option>
        <option value="income">Pemasukan</option>
        <option value="expense">Pengeluaran</option>
      </Select>

      <Select
        label="Filter Mata Uang"
        value={currencyFilter}
        onChange={(e) => onCurrencyFilterChange(e.target.value as CurrencyFilter)}
      >
        <option value={ALL_CURRENCIES}>{ALL_CURRENCIES}</option>
        <option value="EGP">EGP</option>
        <option value="IDR">IDR</option>
      </Select>

      <Select label="Urutkan" value={sort} onChange={(e) => onSortChange(e.target.value as SortOption)}>
        {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </Select>

      <Button variant="secondary" onClick={onExportClick} className="w-full">
        <Download className="h-4 w-4" />
        Export to Spreadsheet
      </Button>
    </div>
  );
}