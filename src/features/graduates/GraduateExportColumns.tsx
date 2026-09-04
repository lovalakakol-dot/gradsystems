'use client';

import {
  EXPORT_COLUMNS,
  EXPORT_COLUMN_LABELS,
  type ExportColumn,
  type WhatsappExportFormat,
} from './types';

export default function GraduateExportColumns({
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  whatsappFormat,
  onWhatsappFormatChange,
  validationError,
}: {
  selected: Set<ExportColumn>;
  onToggle: (col: ExportColumn) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  whatsappFormat: WhatsappExportFormat;
  onWhatsappFormatChange: (format: WhatsappExportFormat) => void;
  validationError: string | null;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex gap-3 text-xs">
          <button type="button" onClick={onSelectAll} className="text-[#7A1E33] hover:underline">
            Pilih Semua
          </button>
          <button type="button" onClick={onClearAll} className="text-gray-500 hover:underline">
            Hapus Semua
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EXPORT_COLUMNS.map((col) => (
            <label key={col} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selected.has(col)}
                onChange={() => onToggle(col)}
                className="h-4 w-4 rounded border-gray-300 text-[#7A1E33] focus:ring-[#7A1E33]"
              />
              {EXPORT_COLUMN_LABELS[col]}
            </label>
          ))}
        </div>
        {validationError && <p className="mt-2 text-sm text-red-600">{validationError}</p>}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Format Nomor WhatsApp</p>
        <div className="flex gap-4 text-sm text-gray-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="whatsapp-format"
              checked={whatsappFormat === 'plain'}
              onChange={() => onWhatsappFormatChange('plain')}
              className="h-4 w-4 border-gray-300 text-[#7A1E33] focus:ring-[#7A1E33]"
            />
            Nomor biasa
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="whatsapp-format"
              checked={whatsappFormat === 'wa_me'}
              onChange={() => onWhatsappFormatChange('wa_me')}
              className="h-4 w-4 border-gray-300 text-[#7A1E33] focus:ring-[#7A1E33]"
            />
            wa.me (hyperlink di Excel)
          </label>
        </div>
      </div>
    </div>
  );
}
