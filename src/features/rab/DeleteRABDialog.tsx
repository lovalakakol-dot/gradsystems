'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { RABItem } from './types';

interface DeleteRABDialogProps {
  item: RABItem | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteRABDialog({ item, onCancel, onConfirm }: DeleteRABDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!item) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-base font-semibold text-slate-900">Hapus item RAB?</h2>
        <p className="mt-2 text-sm text-slate-600">Data yang dihapus tidak dapat dikembalikan.</p>
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
          {item.item_name}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-white/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
