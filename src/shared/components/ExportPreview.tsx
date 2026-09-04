interface ExportPreviewProps {
  filename: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  rows: Record<string, string | number>[];
  dataLabel?: string;
}

/**
 * Excel-print-preview-style table shared by RAB and Cashbook export
 * dialogs. Callers must pass the SAME rows/headers that get handed
 * to the XLSX generator (Section 13) — this component renders
 * whatever it's given, it doesn't re-derive or transform anything.
 */
export function ExportPreview({
  filename,
  rowCount,
  columnCount,
  headers,
  rows,
  dataLabel = 'data',
}: ExportPreviewProps) {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900">Preview Export</h3>
      <p className="mt-1 text-sm text-slate-500">
        {filename} · {rowCount} {dataLabel} · {columnCount} kolom
      </p>

      <div className="mt-4 max-h-80 overflow-auto rounded-xl border border-white/50 bg-white/80 shadow-inner">
        <table className="min-w-full divide-y divide-slate-200/60 text-sm">
          <thead className="sticky top-0 bg-white/95 backdrop-blur">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-3 py-6 text-center text-sm text-slate-400">
                  Tidak ada data untuk ditampilkan.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index} className="transition-colors duration-150 hover:bg-white/50">
                  {headers.map((header) => (
                    <td key={header} className="whitespace-nowrap px-3 py-2 text-slate-900">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
