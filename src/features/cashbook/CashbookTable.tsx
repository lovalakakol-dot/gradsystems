'use client';

import { useState } from 'react';
import { AlertCircle, Loader2, Paperclip, Plus, Trash2 } from 'lucide-react';
import { formatCashAmount, formatDateDDMMYYYY, TYPE_LABELS } from './types';
import type { CashbookDisplayRow } from './types';

interface CashbookTableProps {
  rows: CashbookDisplayRow[];
  loading: boolean;
  loadError: string | null;
  hasAnyEntries: boolean;
  onDelete: (id: string) => Promise<void>;
  onRetry: () => void;
  onAddTransaction: () => void;
}

export function CashbookTable({
  rows,
  loading,
  loadError,
  hasAnyEntries,
  onDelete,
  onRetry,
  onAddTransaction,
}: CashbookTableProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pendingRow = rows.find((row) => row.id === pendingDeleteId) ?? null;

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    await onDelete(pendingDeleteId);
    setDeleting(false);
    setPendingDeleteId(null);
  };

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

  if (!hasAnyEntries) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/40 bg-white/60 p-12 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-sm text-slate-500">Belum ada transaksi.</p>
        <button
          type="button"
          onClick={onAddTransaction}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729]"
        >
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-white/40 bg-white/60 p-12 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-sm text-slate-500">Tidak ada transaksi yang sesuai dengan filter/pencarian.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-white/40 bg-white/60 shadow-lg shadow-black/5 backdrop-blur-xl">
        <table className="min-w-full divide-y divide-slate-200/60">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3">Divisi</th>
              <th className="px-4 py-3">Mata Uang</th>
              <th className="px-4 py-3">Nominal</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Bukti</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors duration-150 hover:bg-white/40">
                <td className="px-4 py-3 text-sm text-slate-900">{formatDateDDMMYYYY(row.transaction_date)}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                      row.type === 'income'
                        ? 'border-emerald-200/60 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200/60 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {TYPE_LABELS[row.type]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.description}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{row.division}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{row.currency}</td>
                <td className="px-4 py-3 text-sm text-slate-900">
                  {formatCashAmount(row.currency, row.amount)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {formatCashAmount(row.currency, row.balance)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.attachment_url ? (
                    <a
                      href={row.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#7A1E33] hover:underline"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Lihat
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(row.id)}
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

      {pendingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-base font-semibold text-slate-900">Hapus transaksi ini?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Transaksi yang dihapus tidak dapat dikembalikan.
            </p>
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
              {pendingRow.description} — {formatCashAmount(pendingRow.currency, pendingRow.amount)}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                disabled={deleting}
                className="rounded-lg border border-white/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
