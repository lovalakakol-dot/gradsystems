'use client';

import { AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import type { RABItem } from './types';

interface RABTableProps {
  items: RABItem[];
  loading: boolean;
  loadError: string | null;
  hasAnyItems: boolean;
  onDelete: (item: RABItem) => void;
  onRetry: () => void;
  onAddItem: () => void;
}

// Comma-separated thousands for both currencies, matching Section 12's
// literal example in the spec.
function formatAmount(currency: 'EGP' | 'IDR', value: number): string {
  return `${currency} ${new Intl.NumberFormat('en-US').format(Math.round(value))}`;
}

export function RABTable({
  items,
  loading,
  loadError,
  hasAnyItems,
  onDelete,
  onRetry,
  onAddItem,
}: RABTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-white/40 bg-white/60 p-12 shadow-lg shadow-black/5 backdrop-blur-xl">
        <Loader2 className="h-5 w-5 animate-spin text-[#7A1E33]" />
        <span className="ml-2 text-sm text-slate-500">Memuat...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-200/60 bg-rose-50/70 p-12 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
        <AlertCircle className="h-6 w-6 text-rose-500" />
        <p className="text-sm text-rose-700">{loadError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-rose-300 bg-white/60 px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors duration-200 hover:bg-white/90"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!hasAnyItems) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/40 bg-white/60 p-12 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-sm text-slate-500">Belum ada item RAB.</p>
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729]"
        >
          <Plus className="h-4 w-4" />
          Tambah Item
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/40 bg-white/60 p-12 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-sm text-slate-500">Tidak ada item yang sesuai dengan filter/pencarian.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/40 bg-white/60 shadow-lg shadow-black/5 backdrop-blur-xl">
      <table className="min-w-full divide-y divide-slate-200/60">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Divisi</th>
            <th className="px-4 py-3">Nama Item</th>
            <th className="px-4 py-3">Satuan</th>
            <th className="px-4 py-3">Estimasi EGP</th>
            <th className="px-4 py-3">Estimasi IDR</th>
            <th className="px-4 py-3">Catatan</th>
            <th className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors duration-150 hover:bg-white/40">
              <td className="px-4 py-3 text-sm text-slate-900">{item.division}</td>
              <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.item_name}</td>
              <td className="px-4 py-3 text-sm text-slate-900">{item.unit}</td>
              <td className="px-4 py-3 text-sm text-slate-900">
                {item.currency === 'EGP' ? formatAmount('EGP', item.estimated_cost) : '—'}
              </td>
              <td className="px-4 py-3 text-sm text-slate-900">
                {item.currency === 'IDR' ? formatAmount('IDR', item.estimated_cost) : '—'}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{item.description || '—'}</td>
              <td className="px-4 py-3 text-sm">
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/60 bg-rose-50/60 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors duration-200 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
