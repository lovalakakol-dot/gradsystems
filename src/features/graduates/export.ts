import * as XLSX from 'xlsx';
import { countryNameFor } from './countries';
import {
  ATTIRE_LABELS,
  EXPORT_COLUMN_LABELS,
  GENDER_LABELS,
  SHIRT_SIZE_LABELS,
  VERIFICATION_LABELS,
  type ExportCellValue,
  type ExportColumn,
  type ExportRow,
  type GraduateRow,
  type WhatsappExportFormat,
} from './types';

function whatsappCellValue(number: string | null, format: WhatsappExportFormat): string {
  if (!number) return '';
  return format === 'plain' ? number : `wa.me/${number}`;
}

/**
 * Builds the exact rows that both GraduateExportPreview and
 * exportGraduatesToXlsx render — one function, one definition of
 * "what a row looks like", so preview is guaranteed to equal the
 * XLSX content (section 33), never two parallel implementations.
 * `graduates` must already be the filtered+sorted list currently on
 * screen — this function does not query the database.
 */
export function buildExportRows(
  graduates: GraduateRow[],
  columns: ExportColumn[],
  whatsappFormat: WhatsappExportFormat
): ExportRow[] {
  return graduates.map((g, index) => {
    const row: ExportRow = {};
    for (const col of columns) {
      switch (col) {
        case 'no':
          row.no = index + 1;
          break;
        case 'full_name_ar':
          row.full_name_ar = g.full_name_ar ?? g.full_name;
          break;
        case 'gender':
          row.gender = g.gender ? GENDER_LABELS[g.gender] : '';
          break;
        case 'country':
          row.country = countryNameFor(g.country_code);
          break;
        case 'whatsapp':
          row.whatsapp = whatsappCellValue(g.whatsapp_number, whatsappFormat);
          break;
        case 'attire':
          row.attire = g.attire ? ATTIRE_LABELS[g.attire] : '';
          break;
        case 'shirt_size':
          row.shirt_size = g.shirt_size ? SHIRT_SIZE_LABELS[g.shirt_size] : '';
          break;
        case 'verification_status':
          row.verification_status = VERIFICATION_LABELS[g.verification_status];
          break;
      }
    }
    return row;
  });
}

/**
 * Writes exactly `rows` (already built by buildExportRows from the
 * currently filtered+sorted, on-screen dataset) to
 * Database_Wisudawan.xlsx. No additional database query. When
 * whatsappFormat is 'wa_me', the WhatsApp column cells get a real
 * Excel hyperlink (cell.l.Target) pointing at https://wa.me/{number}
 * while displaying the shorter wa.me/{number} text; 'plain' never
 * gets a hyperlink.
 */
export function exportGraduatesToXlsx(
  rows: ExportRow[],
  columns: ExportColumn[],
  whatsappFormat: WhatsappExportFormat
): void {
  const headers: ExportCellValue[] = columns.map((c) => EXPORT_COLUMN_LABELS[c]);
  const aoa: ExportCellValue[][] = rows.map((row) => columns.map((c) => row[c] ?? ''));

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...aoa]);

  if (whatsappFormat === 'wa_me') {
    const whatsappColIndex = columns.indexOf('whatsapp');
    if (whatsappColIndex !== -1) {
      rows.forEach((row, rowIndex) => {
        const cellValue = row.whatsapp;
        if (typeof cellValue === 'string' && cellValue) {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: whatsappColIndex });
          const cell = worksheet[cellRef];
          if (cell) {
            cell.l = { Target: `https://${cellValue}`, Tooltip: 'Buka WhatsApp' };
          }
        }
      });
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Wisudawan');
  XLSX.writeFile(workbook, 'Database_Wisudawan.xlsx');
}
