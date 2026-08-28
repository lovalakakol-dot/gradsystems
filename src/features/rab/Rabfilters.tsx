'use client';

import { Download } from 'lucide-react';
import Select from '@/shared/components/Select';
import Button from '@/shared/components/Button';
import { ALL_DIVISIONS, DIVISIONS, SORT_LABELS, type DivisionFilter, type SortOption } from './types';

export default function RABFilters({
  divisionFilter,
  onDivisionFilterChange,
  sort,
  onSortChange,
  onExportClick,
}: {
  divisionFilter: DivisionFilter;
  onDivisionFilterChange: (value: DivisionFilter) => void;
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