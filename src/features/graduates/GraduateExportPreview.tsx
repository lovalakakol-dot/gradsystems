import { useMemo } from 'react';
import { buildGraduateExportRows } from './exportGraduates';
import type { ExportColumn, GraduateEntry } from './types';

/**
 * Renders exactly what buildGraduateExportRows produces — the same
 * function the XLSX writer consumes — so what's shown here is
 * guaranteed identical to the downloaded file (Section 17).
 */
export function GraduateExportPreview({
  entries,
  columns,
  isExporting,
  onBack,
  onExport,
}: {
  entries: GraduateEntry[];
  columns: ExportColumn[];
  isExporting: boolean;
  onBack: () => void;
  onExport: () => void;
}) {
  const rows = useMemo(() => buildGraduateExportRows(entries, columns), [entries, columns]);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Preview Export XLSX</h3>
        <p className="text-xs text-gray-500">Database_Wisudawan.xlsx</p>
        <p className="mt-1 text-xs text-gray-500">
          {rows.length} data · {columns.length} kolom
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i}>
                  {headers.map((h) => (
                    <td key={h} dir="rtl" className="whitespace-nowrap px-3 py-2 text-gray-900">
                      {row[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isExporting}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting || rows.length === 0}
          className="rounded-md bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white hover:bg-[#651729] disabled:opacity-60"
        >
          {isExporting ? 'Mengekspor...' : 'Export XLSX'}
        </button>
      </div>
    </div>
  );
}

export default GraduateExportPreview;
