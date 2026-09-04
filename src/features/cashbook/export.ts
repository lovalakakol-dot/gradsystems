import * as XLSX from 'xlsx';
import { TYPE_LABELS, formatDateDDMMYYYY } from './types';
import type { CashbookDisplayRow } from './types';

/**
 * Canonical export column order (Section 5 & 7). "Bukti Nota" is
 * included because attachment_url is genuinely available on every
 * CashbookDisplayRow (not a fabricated column) — rows with no
 * attachment export as "—", same as the table's display.
 */
export const CASHBOOK_EXPORT_COLUMNS = [
  { key: 'transaction_date', label: 'Tanggal' },
  { key: 'type', label: 'Tipe' },
  { key: 'description', label: 'Keterangan' },
  { key: 'division', label: 'Divisi' },
  { key: 'currency', label: 'Mata Uang' },
  { key: 'amount', label: 'Nominal' },
  { key: 'balance', label: 'Saldo' },
  { key: 'attachment_url', label: 'Bukti Nota' },
] as const;

export type CashbookExportColumnKey = (typeof CASHBOOK_EXPORT_COLUMNS)[number]['key'];
export type CashbookExportRow = Record<string, string | number>;

/**
 * Single source of truth for export rows (Section 13) — same array
 * feeds both the preview table and the XLSX file. `rows` must already
 * carry `balance` computed from the FULL dataset in canonical order
 * (Section 19) — this function only shapes/labels columns, it never
 * recomputes balance or re-sorts.
 */
export function buildCashbookExportRows(
  rows: CashbookDisplayRow[],
  selectedKeys: CashbookExportColumnKey[]
): CashbookExportRow[] {
  const orderedColumns = CASHBOOK_EXPORT_COLUMNS.filter((column) => selectedKeys.includes(column.key));

  return rows.map((row) => {
    const exportRow: CashbookExportRow = {};
    for (const column of orderedColumns) {
      switch (column.key) {
        case 'transaction_date':
          exportRow[column.label] = formatDateDDMMYYYY(row.transaction_date);
          break;
        case 'type':
          exportRow[column.label] = TYPE_LABELS[row.type];
          break;
        case 'description':
          exportRow[column.label] = row.description;
          break;
        case 'division':
          exportRow[column.label] = row.division;
          break;
        case 'currency':
          exportRow[column.label] = row.currency;
          break;
        case 'amount':
          exportRow[column.label] = row.amount;
          break;
        case 'balance':
          exportRow[column.label] = row.balance;
          break;
        case 'attachment_url':
          exportRow[column.label] = row.attachment_url ?? '—';
          break;
      }
    }
    return exportRow;
  });
}

export function getCashbookExportHeaders(selectedKeys: CashbookExportColumnKey[]): string[] {
  return CASHBOOK_EXPORT_COLUMNS.filter((column) => selectedKeys.includes(column.key)).map(
    (column) => column.label
  );
}

/**
 * Pure XLSX generation — no row-building or UI logic here (Section
 * 23). No currency conversion.
 */
export function generateCashbookExportFile(rows: CashbookExportRow[], headers: string[]): void {
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buku Kas');
  XLSX.writeFile(workbook, 'Buku_Kas_Wisuda.xlsx');
}
