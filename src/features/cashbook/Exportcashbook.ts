import * as XLSX from 'xlsx';
import { TYPE_LABEL, type ExportColumn } from './types';
import type { CashbookEntryWithBalance } from './calculateRunningBalance';

function cellValue(entry: CashbookEntryWithBalance, column: ExportColumn): string | number {
  switch (column) {
    case 'transaction_date':
      return entry.transaction_date;
    case 'type':
      return TYPE_LABEL[entry.type];
    case 'description':
      return entry.description ?? '';
    case 'division':
      return entry.division ?? '';
    case 'attachment_url':
      return entry.attachment_url ?? '';
    case 'amount_egp':
      return entry.currency === 'EGP' ? entry.amount : '';
    case 'amount_idr':
      return entry.currency === 'IDR' ? entry.amount : '';
    case 'running_egp':
      return entry.running_egp;
    case 'running_idr':
      return entry.running_idr;
  }
}

/**
 * Exports exactly the dataset already shown (already filtered +
 * sorted by the caller) — no additional database query, no service
 * role, no currency conversion. Saldo columns use the running
 * balance already attached to each row by calculateRunningBalance.
 */
export default function exportCashbookToXlsx(
  entries: CashbookEntryWithBalance[],
  columns: ExportColumn[],
  labels: Record<ExportColumn, string>
): void {
  const rows = entries.map((entry) => {
    const row: Record<string, string | number> = {};
    for (const col of columns) {
      row[labels[col]] = cellValue(entry, col);
    }
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buku Kas');
  XLSX.writeFile(workbook, 'Buku_Kas_Wisuda.xlsx');
}