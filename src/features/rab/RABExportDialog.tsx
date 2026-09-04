'use client';

import { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { ExportColumnSelector } from '@/shared/components/ExportColumnSelector';
import { ExportPreview } from '@/shared/components/ExportPreview';
import {
  RAB_EXPORT_COLUMNS,
  buildRABExportRows,
  generateRABExportFile,
  getRABExportHeaders,
} from './export';
import type { RABExportColumnKey } from './export';
import type { RABItem } from './types';

interface RABExportDialogProps {
  open: boolean;
  items: RABItem[];
  onClose: () => void;
}

type Step = 'columns' | 'preview';

const ALL_KEYS: RABExportColumnKey[] = RAB_EXPORT_COLUMNS.map((column) => column.key);

export function RABExportDialog({ open, items, onClose }: RABExportDialogProps) {
  const [step, setStep] = useState<Step>('columns');
  const [selectedKeys, setSelectedKeys] = useState<RABExportColumnKey[]>(ALL_KEYS);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Same rows feed both the preview table and the XLSX file (Section
  // 13) — built here once per selectedKeys change, not duplicated.
  const exportRows = useMemo(() => buildRABExportRows(items, selectedKeys), [items, selectedKeys]);
  const headers = useMemo(() => getRABExportHeaders(selectedKeys), [selectedKeys]);

  if (!open) return null;

  const resetState = () => {
    setStep('columns');
    setSelectedKeys(ALL_KEYS);
    setSelectionError(null);
    setGenerateError(null);
  };

  const handleClose = () => {
    if (generating) return;
    resetState();
    onClose();
  };

  const handleContinue = () => {
    if (selectedKeys.length === 0) {
      setSelectionError('Minimal pilih satu kolom untuk export.');
      return;
    }
    setSelectionError(null);
    setStep('preview');
  };

  const handleExport = () => {
    if (generating) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      generateRABExportFile(exportRows, headers);
      resetState();
      onClose();
    } catch (err) {
      console.error('Failed to generate RAB export file', err);
      setGenerateError('Gagal membuat file XLSX.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {step === 'columns' ? 'Export XLSX' : 'Preview Export'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={generating}
            className="rounded-lg p-1 text-slate-400 transition-colors duration-200 hover:bg-white/60 hover:text-slate-700 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === 'columns' ? (
          <>
            <p className="mb-3 text-sm text-slate-600">Pilih kolom yang ingin disertakan dalam file.</p>
            <ExportColumnSelector
              columns={RAB_EXPORT_COLUMNS}
              selectedKeys={selectedKeys}
              onChange={setSelectedKeys}
              error={selectionError}
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-white/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-white/80"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-xl bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729]"
              >
                Lanjut Preview
              </button>
            </div>
          </>
        ) : (
          <>
            <ExportPreview
              filename="RAB_Wisuda.xlsx"
              rowCount={exportRows.length}
              columnCount={headers.length}
              headers={headers}
              rows={exportRows}
              dataLabel="data"
            />
            {generateError && (
              <div className="mt-3 rounded-lg border border-rose-200/60 bg-rose-50/80 px-3 py-2 text-sm text-rose-700">
                {generateError}
              </div>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={generating}
                className="rounded-lg border border-white/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setStep('columns')}
                disabled={generating}
                className="rounded-lg border border-white/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                {generating ? 'Mempersiapkan file...' : 'Export XLSX'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
