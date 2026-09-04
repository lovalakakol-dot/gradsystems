'use client';

import { useMemo, useState } from 'react';
import Modal from '@/shared/components/Modal';
import Button from '@/shared/components/Button';
import { buildExportRows, exportGraduatesToXlsx } from './export';
import { EXPORT_COLUMNS, type ExportColumn, type GraduateRow, type WhatsappExportFormat } from './types';
import GraduateExportColumns from './GraduateExportColumns';
import GraduateExportPreview from './GraduateExportPreview';

type Step = 'columns' | 'preview';

export default function GraduateExportDialog({
  graduates,
  onClose,
  onExported,
}: {
  /** Already the currently filtered+sorted/searched dataset on
   * screen — this dialog never queries the database itself. */
  graduates: GraduateRow[];
  onClose: () => void;
  onExported: () => void;
}) {
  const [step, setStep] = useState<Step>('columns');
  const [selected, setSelected] = useState<Set<ExportColumn>>(new Set(EXPORT_COLUMNS));
  const [whatsappFormat, setWhatsappFormat] = useState<WhatsappExportFormat>('plain');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const orderedColumns = useMemo(
    () => EXPORT_COLUMNS.filter((c) => selected.has(c)),
    [selected]
  );

  // Same buildExportRows call used for both preview and the actual
  // file — see export.ts. Preview is guaranteed to equal the XLSX
  // because there is only one row-building implementation.
  const previewRows = useMemo(
    () => buildExportRows(graduates, orderedColumns, whatsappFormat),
    [graduates, orderedColumns, whatsappFormat]
  );

  function toggleColumn(col: ExportColumn) {
    setValidationError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }

  function handleGoToPreview() {
    if (selected.size === 0) {
      setValidationError('Pilih minimal satu kolom untuk export.');
      return;
    }
    setStep('preview');
  }

  function handleExport() {
    setIsExporting(true);
    try {
      exportGraduatesToXlsx(previewRows, orderedColumns, whatsappFormat);
      onExported();
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Modal
      title={step === 'columns' ? 'Pilih Kolom Export' : 'Preview Export'}
      onClose={onClose}
    >
      <div className="space-y-4">
        {step === 'columns' ? (
          <>
            <GraduateExportColumns
              selected={selected}
              onToggle={toggleColumn}
              onSelectAll={() => {
                setValidationError(null);
                setSelected(new Set(EXPORT_COLUMNS));
              }}
              onClearAll={() => setSelected(new Set())}
              whatsappFormat={whatsappFormat}
              onWhatsappFormatChange={setWhatsappFormat}
              validationError={validationError}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={onClose}>
                Batal
              </Button>
              <Button onClick={handleGoToPreview}>Lanjut Preview</Button>
            </div>
          </>
        ) : (
          <>
            <GraduateExportPreview columns={orderedColumns} rows={previewRows} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setStep('columns')} disabled={isExporting}>
                Kembali
              </Button>
              <Button onClick={handleExport} isLoading={isExporting}>
                {isExporting ? 'Mempersiapkan file...' : 'Export XLSX'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
