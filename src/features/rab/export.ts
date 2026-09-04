import * as XLSX from 'xlsx';
import type { RABItem } from './types';

/** Canonical export column order (Section 4 & 7) — never reordered
 * by checkbox click order. */
export const RAB_EXPORT_COLUMNS = [
  { key: 'division', label: 'Divisi' },
  { key: 'item_name', label: 'Nama Item' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'unit', label: 'Satuan' },
  { key: 'currency', label: 'Mata Uang' },
  { key: 'estimated_cost', label: 'Estimasi Biaya' },
  { key: 'description', label: 'Catatan' },
] as const;

export type RABExportColumnKey = (typeof RAB_EXPORT_COLUMNS)[number]['key'];
export type RABExportRow = Record<string, string | number>;

/**
 * Single source of truth for export rows (Section 13) — the exact
 * same array is used for the preview table AND the XLSX file. Only
 * builds rows, never touches the DOM or triggers a download.
 */
export function buildRABExportRows(
  items: RABItem[],
  selectedKeys: RABExportColumnKey[]
): RABExportRow[] {
  const orderedColumns = RAB_EXPORT_COLUMNS.filter((column) => selectedKeys.includes(column.key));

  return items.map((item) => {
    const row: RABExportRow = {};
    for (const column of orderedColumns) {
      switch (column.key) {
        case 'division':
          row[column.label] = item.division;
          break;
        case 'item_name':
          row[column.label] = item.item_name;
          break;
        case 'quantity':
          row[column.label] = item.quantity;
          break;
        case 'unit':
          row[column.label] = item.unit;
          break;
        case 'currency':
          row[column.label] = item.currency;
          break;
        case 'estimated_cost':
          row[column.label] = item.estimated_cost;
          break;
        case 'description':
          row[column.label] = item.description ?? '';
          break;
      }
    }
    return row;
  });
}

export function getRABExportHeaders(selectedKeys: RABExportColumnKey[]): string[] {
  return RAB_EXPORT_COLUMNS.filter((column) => selectedKeys.includes(column.key)).map(
    (column) => column.label
  );
}

/**
 * Pure XLSX generation — takes rows already built by
 * buildRABExportRows() (the same ones the preview rendered) and
 * downloads the file. No row-building or UI logic here (Section 23).
 * No currency conversion; each row keeps its original currency/value.
 */
export function generateRABExportFile(rows: RABExportRow[], headers: string[]): void {
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'RAB');
  XLSX.writeFile(workbook, 'RAB_Wisuda.xlsx');
}
