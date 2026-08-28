import { useState } from 'react';
import { X } from 'lucide-react';
import { buildGraduateExportRows, exportGraduatesToXlsx } from './exportGraduates';
import { GraduateExportPreview } from './GraduateExportPreview';
import { EXPORT_COLUMNS, EXPORT_COLUMN_LABELS, type ExportColumn, type GraduateEntry } from './types';

type Step = 'select' | 'preview';

export function GraduateExportModal({
  entries,
  onClose,
  onExported,
}: {
  entries: GraduateEntry[];
  onClose: () => void;
  onExported: () => void;
}) {
  const [step, setStep] = useState<Step>('select');
  const [selectedColumns, setSelectedColumns] = useState<ExportColumn[]>([...EXPORT_COLUMNS]);
  const [isExporting, setIsExporting] = useState(false);

  function toggleColumn(column: ExportColumn) {
    setSelectedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  }

  function handleExport() {
    setIsExporting(true);
    try {
      const rows = buildGraduateExportRows(entries, selectedColumns);
      exportGraduatesToXlsx(rows);
      onExported();
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        {step === 'select' ? (
          <>
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Pilih Kolom Export</h3>
              <button onClick={onClose} aria-label="Tutup">
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-2 p-4">
              {EXPORT_COLUMNS.map((column) => (
                <label key={column} className="flex items-center gap-2 text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => toggleColumn(column)}
                    className="h-4 w-4 rounded border-gray-300 text-[#7A1E33] focus:ring-[#7A1E33]"
                  />
                  {EXPORT_COLUMN_LABELS[column]}
                </label>
              ))}
              {selectedColumns.length === 0 && (
                <p className="text-xs text-red-600">Pilih minimal satu kolom untuk melanjutkan.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setStep('preview')}
                disabled={selectedColumns.length === 0}
                className="rounded-md bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white hover:bg-[#651729] disabled:opacity-60"
              >
                Preview
              </button>
            </div>
          </>
        ) : (
          <GraduateExportPreview
            entries={entries}
            columns={selectedColumns}
            isExporting={isExporting}
            onBack={() => setStep('select')}
            onExport={handleExport}
          />
        )}
      </div>
    </div>
  );
}

export default GraduateExportModal;
