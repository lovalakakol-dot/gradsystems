import * as XLSX from 'xlsx';
import { getCountryNameAr } from './countries';
import {
  EXPORT_COLUMN_LABELS,
  SHIRT_SIZE_LABEL,
  VERIFICATION_STATUS_LABEL,
  type ExportColumn,
  type GraduateEntry,
  type GraduateExportRow,
} from './types';

/**
 * The ONE transformation shared by both the export preview and the
 * actual XLSX file (Section 17 — preview and workbook must never
 * diverge). Callers must pass data that has already had search,
 * filter, and sort applied — this function does not re-derive any
 * of that, it only shapes rows for display/export. Row numbering
 * ("Nomor") is the array position, matching whatever order the
 * table is currently displayed in.
 */
export function buildGraduateExportRows(
  entries: GraduateEntry[],
  columns: ExportColumn[]
): GraduateExportRow[] {
  return entries.map((entry, index) => {
    const row: GraduateExportRow = {};
    for (const column of columns) {
      const label = EXPORT_COLUMN_LABELS[column];
      switch (column) {
        case 'no':
          row[label] = index + 1;
          break;
        case 'full_name_ar':
          row[label] = entry.full_name_ar ?? '—';
          break;
        case 'country':
          row[label] = getCountryNameAr(entry.country_code);
          break;
        case 'shirt_size':
          row[label] = entry.shirt_size ? SHIRT_SIZE_LABEL[entry.shirt_size] : '—';
          break;
        case 'verification_status':
          row[label] = VERIFICATION_STATUS_LABEL[entry.verification_status];
          break;
      }
    }
    return row;
  });
}

/**
 * Generates and downloads Database_Wisudawan.xlsx from rows already
 * built by buildGraduateExportRows — this function never re-derives
 * or re-filters data, so what the user previewed is exactly what
 * gets written.
 */
export function exportGraduatesToXlsx(rows: GraduateExportRow[]): void {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Database Wisudawan');
  XLSX.writeFile(workbook, 'Database_Wisudawan.xlsx');
}
