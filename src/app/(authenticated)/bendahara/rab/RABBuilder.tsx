'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { RABForm } from '@/features/rab/RABForm';
import { RABFilters } from '@/features/rab/RABFilters';
import { RABTable } from '@/features/rab/RABTable';
import { RABSummary } from '@/features/rab/RABSummary';
import { DeleteRABDialog } from '@/features/rab/DeleteRABDialog';
import { RABExportDialog } from '@/features/rab/RABExportDialog';
import { createRABItem, deleteRABItem, fetchRABItems } from '@/features/rab/data';
import { DEFAULT_RAB_FILTERS } from '@/features/rab/types';
import type { CreateRABInput, RABFiltersState, RABItem } from '@/features/rab/types';

interface ActionFeedback {
  type: 'success' | 'error';
  message: string;
}

export function RABBuilder() {
  const [items, setItems] = useState<RABItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RABFiltersState>(DEFAULT_RAB_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RABItem | null>(null);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { items: fetched, error } = await fetchRABItems();
    if (error) {
      setLoadError(error);
    } else {
      setItems(fetched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Search + division filter never mutate `items` — this is a
  // derived view (Section 14).
  const visibleItems = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch = query.length === 0 || item.item_name.toLowerCase().includes(query);
      const matchesDivision = filters.division === 'all' || item.division === filters.division;
      return matchesSearch && matchesDivision;
    });
    return sortRABItems(filtered, filters.sort);
  }, [items, filters]);

  // Summary reflects the full roster regardless of the current
  // filter/search, consistent with how recap totals behave elsewhere
  // in this project (e.g. Database Wisudawan).
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        if (item.currency === 'EGP') acc.egp += item.estimated_cost;
        if (item.currency === 'IDR') acc.idr += item.estimated_cost;
        return acc;
      },
      { egp: 0, idr: 0 }
    );
  }, [items]);

  const handleCreate = useCallback(
    async (input: CreateRABInput) => {
      const result = await createRABItem(input);
      if (result.success) {
        setFormOpen(false);
        setFeedback({ type: 'success', message: 'Item RAB berhasil ditambahkan.' });
        loadItems();
      }
      return result;
    },
    [loadItems]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { success, error } = await deleteRABItem(deleteTarget.id);
    if (success) {
      setFeedback({ type: 'success', message: 'Item RAB berhasil dihapus.' });
      setDeleteTarget(null);
      loadItems();
    } else {
      setFeedback({ type: 'error', message: error ?? 'Gagal menghapus item RAB.' });
    }
  }, [deleteTarget, loadItems]);

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#fdf8f6] via-[#faf5f3] to-[#f6ebee]">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#7A1E33]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#7A1E33]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">RAB Builder</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola rencana anggaran kebutuhan Wisuda Mahad Internasional.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setExportDialogOpen(true)}
              disabled={items.length === 0}
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
              Tambah Item
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

        <RABSummary totalEGP={totals.egp} totalIDR={totals.idr} />

        <div className="mt-4">
          <RABFilters filters={filters} onChange={setFilters} />
        </div>

        <div className="mt-4">
          <RABTable
            items={visibleItems}
            loading={loading}
            loadError={loadError}
            hasAnyItems={items.length > 0}
            onDelete={setDeleteTarget}
            onRetry={loadItems}
            onAddItem={() => setFormOpen(true)}
          />
        </div>
      </div>

      <RABForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />

      <DeleteRABDialog item={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />

      {/* Export uses the same filtered/sorted view as the table
          (visibleItems) — preserves this feature's existing "export
          reflects the current filter" behavior (Section 18); this
          task only changes HOW that export happens, not which
          dataset it draws from. */}
      <RABExportDialog
        open={exportDialogOpen}
        items={visibleItems}
        onClose={() => setExportDialogOpen(false)}
      />
    </div>
  );
}

/**
 * EGP and IDR are never ranked against each other (Section 15). For
 * an EGP/IDR-specific sort, items of the OTHER currency are pushed to
 * the end (stable, by name) instead of being mixed into the ranking.
 */
function sortRABItems(items: RABItem[], sort: RABFiltersState['sort']): RABItem[] {
  const byNameAsc = (a: RABItem, b: RABItem) => a.item_name.localeCompare(b.item_name, 'id');

  switch (sort) {
    case 'name_asc':
      return [...items].sort(byNameAsc);
    case 'name_desc':
      return [...items].sort((a, b) => byNameAsc(b, a));
    case 'egp_desc':
      return sortByCurrencyAmount(items, 'EGP', 'desc');
    case 'egp_asc':
      return sortByCurrencyAmount(items, 'EGP', 'asc');
    case 'idr_desc':
      return sortByCurrencyAmount(items, 'IDR', 'desc');
    case 'idr_asc':
      return sortByCurrencyAmount(items, 'IDR', 'asc');
    case 'newest':
    default:
      return [...items].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}

function sortByCurrencyAmount(
  items: RABItem[],
  currency: RABItem['currency'],
  direction: 'asc' | 'desc'
): RABItem[] {
  return [...items].sort((a, b) => {
    const aMatches = a.currency === currency;
    const bMatches = b.currency === currency;

    if (aMatches && bMatches) {
      return direction === 'desc'
        ? b.estimated_cost - a.estimated_cost
        : a.estimated_cost - b.estimated_cost;
    }
    if (aMatches) return -1;
    if (bMatches) return 1;
    return a.item_name.localeCompare(b.item_name, 'id');
  });
}
