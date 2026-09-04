'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { CashbookForm } from '@/features/cashbook/CashbookForm';
import { CashbookFilters } from '@/features/cashbook/CashbookFilters';
import { CashbookTable } from '@/features/cashbook/CashbookTable';
import { CashbookSummary } from '@/features/cashbook/CashbookSummary';
import { CashbookExportDialog } from '@/features/cashbook/CashbookExportDialog';
import { createCashbookEntry, deleteCashbookEntry, fetchCashbookEntries } from '@/features/cashbook/data';
import { DEFAULT_CASHBOOK_FILTERS, computeCashbookDisplayRows, sortCashbookRows } from '@/features/cashbook/types';
import type { CashbookEntry, CashbookFiltersState, CreateCashbookInput } from '@/features/cashbook/types';

interface ActionFeedback {
  type: 'success' | 'error';
  message: string;
}

export function Cashbook() {
  const [entries, setEntries] = useState<CashbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CashbookFiltersState>(DEFAULT_CASHBOOK_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { entries: fetched, error } = await fetchCashbookEntries();
    if (error) {
      setLoadError(error);
    } else {
      setEntries(fetched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Running balance is computed ONCE over the FULL dataset in
  // canonical order (Section 6, 7 & 19) — filtering/sorting below
  // never recomputes it, it only reorders/subsets the tagged rows.
  const allDisplayRows = useMemo(() => computeCashbookDisplayRows(entries), [entries]);

  const visibleRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const filtered = allDisplayRows.filter((row) => {
      const matchesSearch = query.length === 0 || row.description.toLowerCase().includes(query);
      const matchesType = filters.type === 'all' || row.type === filters.type;
      const matchesDivision = filters.division === 'all' || row.division === filters.division;
      const matchesCurrency = filters.currency === 'all' || row.currency === filters.currency;
      return matchesSearch && matchesType && matchesDivision && matchesCurrency;
    });
    return sortCashbookRows(filtered, filters.sort);
  }, [allDisplayRows, filters]);

  // Summary reflects the full roster regardless of the current
  // filter/search, consistent with RAB Builder & Database Wisudawan.
  const summary = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        const bucket = entry.currency === 'EGP' ? acc.egp : acc.idr;
        if (entry.type === 'income') bucket.income += entry.amount;
        else bucket.expense += entry.amount;
        return acc;
      },
      { egp: { income: 0, expense: 0 }, idr: { income: 0, expense: 0 } }
    );
  }, [entries]);

  const handleCreate = useCallback(
    async (input: CreateCashbookInput) => {
      const result = await createCashbookEntry(input);
      if (result.success) {
        setFormOpen(false);
        setFeedback({ type: 'success', message: 'Transaksi berhasil ditambahkan.' });
        loadEntries();
      }
      return result;
    },
    [loadEntries]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const { success, error } = await deleteCashbookEntry(id);
      if (success) {
        setFeedback({ type: 'success', message: 'Transaksi berhasil dihapus.' });
        loadEntries();
      } else {
        setFeedback({ type: 'error', message: error ?? 'Gagal menghapus transaksi.' });
      }
    },
    [loadEntries]
  );

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#fdf8f6] via-[#faf5f3] to-[#f6ebee]">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#7A1E33]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#7A1E33]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Buku Kas Digital</h1>
            <p className="mt-1 text-sm text-slate-500">
              Catat dan pantau seluruh transaksi keuangan Wisuda Mahad Internasional.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setExportDialogOpen(true)}
              disabled={entries.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-800 backdrop-blur transition-colors duration-200 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export XLSX
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1E33] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729] focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            >
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </button>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200/60 bg-emerald-50/80 text-emerald-700'
                : 'border-rose-200/60 bg-rose-50/80 text-rose-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <CashbookSummary
          egpIncome={summary.egp.income}
          egpExpense={summary.egp.expense}
          egpBalance={summary.egp.income - summary.egp.expense}
          idrIncome={summary.idr.income}
          idrExpense={summary.idr.expense}
          idrBalance={summary.idr.income - summary.idr.expense}
        />

        <div className="mt-4">
          <CashbookFilters filters={filters} onChange={setFilters} />
        </div>

        <div className="mt-4">
          <CashbookTable
            rows={visibleRows}
            loading={loading}
            loadError={loadError}
            hasAnyEntries={entries.length > 0}
            onDelete={handleDelete}
            onRetry={loadEntries}
            onAddTransaction={() => setFormOpen(true)}
          />
        </div>
      </div>

      <CashbookForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />

      {/* Export uses the same filtered/sorted view as the table
          (visibleRows, balance already attached) — preserves this
          feature's existing "export reflects the current filter"
          behavior (Section 18); this task only changes HOW that
          export happens, not which dataset it draws from. */}
      <CashbookExportDialog
        open={exportDialogOpen}
        rows={visibleRows}
        onClose={() => setExportDialogOpen(false)}
      />
    </div>
  );
}
