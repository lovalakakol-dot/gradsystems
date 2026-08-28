import * as XLSX from 'xlsx';
import type { RabItem, ExportColumn } from './types';

function cellValue(item: RabItem, column: ExportColumn): string | number {
  switch (column) {
    case 'division':
      return item.division;
    case 'item_name':
      return item.item_name;
    case 'quantity':
      return item.quantity ?? '';
    case 'unit':
      return item.unit ?? '';
    case 'estimated_egp':
      return item.currency === 'EGP' ? item.estimated_cost : '';
    case 'estimated_idr':
      return item.currency === 'IDR' ? item.estimated_cost : '';
    case 'description':
      return item.description ?? '';
  }
}

/**
 * Exports exactly the dataset already shown to the user (already
 * filtered + sorted by the caller) — no additional database query,
 * no service role. estimated_egp/estimated_idr are export-only
 * transformations of estimated_cost + currency; the database never
 * stores two separate amount columns (see Step 7 migration notes).
 * No currency conversion — EGP and IDR values are passed through
 * exactly as stored.
 */
export function exportRabItemsToXlsx(
  items: RabItem[],
  columns: ExportColumn[],
  labels: Record<ExportColumn, string>
): void {
  const rows = items.map((item) => {
    const row: Record<string, string | number> = {};
    for (const col of columns) {
      row[labels[col]] = cellValue(item, col);
    }
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'RAB');
  XLSX.writeFile(workbook, 'RAB_Wisuda.xlsx');
}