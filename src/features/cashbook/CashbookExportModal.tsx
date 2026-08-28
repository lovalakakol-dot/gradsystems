'use client';

import { useState } from 'react';
import Modal from '@/shared/components/Modal';
import Button from '@/shared/components/Button';
import { EXPORT_COLUMNS, EXPORT_COLUMN_LABELS, type ExportColumn } from './types';

export default function CashbookExportModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (columns: ExportColumn[]) => void;
}) {
  const [selected, setSelected] = useState<Set<ExportColumn>>(new Set(EXPORT_COLUMNS));
  const [validationError, setValidationError] = useState<string | null>(null);

  function toggle(col: ExportColumn) {
    setValidationError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }

  function selectAll() {
    setValidationError(null);
    setSelected(new Set(EXPORT_COLUMNS));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function handleConfirm() {
    if (selected.size === 0) {
      setValidationError('Pilih minimal satu kolom untuk export.');
      return;
    }
    onConfirm(EXPORT_COLUMNS.filter((c) => selected.has(c)));
  }

  return (
    <Modal title="Pilih Kolom Export" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex gap-3 text-xs">
          <button type="button" onClick={selectAll} className="text-[#7A1E33] hover:underline">
            Pilih Semua
          </button>
          <button type="button" onClick={clearAll} className="text-gray-500 hover:underline">
            Batalkan Semua
          </button>
        </div>

        {EXPORT_COLUMNS.map((col) => (
          <label key={col} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selected.has(col)}
              onChange={() => toggle(col)}
              className="h-4 w-4 rounded border-gray-300 text-[#7A1E33] focus:ring-[#7A1E33]"
            />
            {EXPORT_COLUMN_LABELS[col]}
          </label>
        ))}

        {validationError && <p className="text-sm text-red-600">{validationError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleConfirm}>Export</Button>
        </div>
      </div>
    </Modal>
  );
}