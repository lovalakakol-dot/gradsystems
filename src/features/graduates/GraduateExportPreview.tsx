import { EXPORT_COLUMN_LABELS, type ExportColumn, type ExportRow } from './types';

export default function GraduateExportPreview({
  columns,
  rows,
}: {
  columns: ExportColumn[];
  rows: ExportRow[];
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/40 bg-white/70 p-3 text-sm text-gray-700">
        <p>
          <span className="font-medium text-gray-900">Database_Wisudawan.xlsx</span>
        </p>
        <p>
          {rows.length} data &middot; {columns.length} kolom
        </p>
      </div>

      <div className="max-h-72 overflow-auto rounded-lg border border-white/40">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 border-b border-white/40 bg-white/90 uppercase text-gray-500">
            <tr>
              {columns.map((col) => (
                <th key={col} className="whitespace-nowrap px-3 py-2 font-medium">
                  {EXPORT_COLUMN_LABELS[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/60">
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap px-3 py-2 text-gray-900">
                    {col === 'whatsapp' && typeof row[col] === 'string' && row[col] ? (
                      <span className="text-[#7A1E33]">{row[col]}</span>
                    ) : (
                      String(row[col] ?? '')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
