'use client';

import { useMemo, useState } from 'react';
import RABForm from '../../../../features/rab/RABForm';
import RABSummary from '../../../../features/rab/Rabsummary';
import RABFilters from '../../../../features/rab/Rabfilters';
import RABTable from '../../../../features/rab/Rabtable';
import RABDeleteModal from '../../../../features/rab/Rabdeletemodal';
import RABExportModal from '../../../../features/rab/Rabexportmodal';
import { Toast, type ToastState } from '@/shared/components/Toast';
import ErrorState from '@/shared/components/ErrorState';
import { useRabItemMutations } from '../../../../features/rab/Userabitemmutations';
import { exportRabItemsToXlsx } from '../../../../features/rab/Exportrab';
import {
  ALL_DIVISIONS,
  EXPORT_COLUMN_LABELS,
  type DivisionFilter,
  type ExportColumn,
  type RabItem,
  type SortOption,
} from '../../../../features/rab/types';

/**
 * Never mixes EGP and IDR into one ranking. For a currency-scoped
 * sort, items in that currency are ranked by amount first; items in
 * the OTHER currency stay visible below (not hidden by the sort),
 * just outside that particular ranking.
 */
function sortItems(items: RabItem[], sort: SortOption): RabItem[] {
  const byCurrency = (currency: 'EGP' | 'IDR', descending: boolean) => {
    const inCurrency = items
      .filter((i) => i.currency === currency)
      .sort((a, b) =>
        descending ? b.estimated_cost - a.estimated_cost : a.estimated_cost - b.estimated_cost
      );
    const rest = items.filter((i) => i.currency !== currency);
    return [...inCurrency, ...rest];
  };

  switch (sort) {
    case 'name_asc':
      return [...items].sort((a, b) => a.item_name.localeCompare(b.item_name));
    case 'name_desc':
      return [...items].sort((a, b) => b.item_name.localeCompare(a.item_name));
    case 'largest_egp':
      return byCurrency('EGP', true);
    case 'smallest_egp':
      return byCurrency('EGP', false);
    case 'largest_idr':
      return byCurrency('IDR', true);
    case 'smallest_idr':
      return byCurrency('IDR', false);
    case 'newest':
    default:
      return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

export default function RABBuilder({
  initialItems,
  hasError,
}: {
  initialItems: RabItem[];
  hasError: boolean;
}) {
  const { deleteRabItem, deletingId } = useRabItemMutations();

  const [divisionFilter, setDivisionFilter] = useState<DivisionFilter>(ALL_DIVISIONS);
  const [sort, setSort] = useState<SortOption>('newest');
  const [deleteTarget, setDeleteTarget] = useState<RabItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const filteredSorted = useMemo(() => {
    const filtered =
      divisionFilter === ALL_DIVISIONS
        ? initialItems
        : initialItems.filter((i) => i.division === divisionFilter);
    return sortItems(filtered, sort);
  }, [initialItems, divisionFilter, sort]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const { error } = await deleteRabItem(target.id);
    if (error) {
      setToast({ kind: 'error', message: error });
    } else {
      setToast({ kind: 'success', message: `${target.item_name} berhasil dihapus.` });
      setDeleteTarget(null);
    }
  }

  function handleExportConfirm(columns: ExportColumn[]) {
    // Exports exactly what's currently shown (already filtered by
    // division and sorted) — no extra database query, no service
    // role, and no currency conversion (see exportRAB.ts).
    exportRabItemsToXlsx(filteredSorted, columns, EXPORT_COLUMN_LABELS);
    setIsExportOpen(false);
    setToast({ kind: 'success', message: 'RAB_Wisuda.xlsx berhasil diunduh.' });
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">RAB Builder</h1>
        <p className="text-sm text-gray-500">
          Catat dan kelola rencana anggaran seluruh divisi kepanitiaan.
        </p>
      </div>

      {hasError ? (
        <ErrorState message="Gagal memuat data RAB. Coba muat ulang halaman." />
      ) : (
        <>
          <div className="mb-6">
            <RABSummary items={initialItems} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 lg:col-span-2">
              <h2 className="mb-3 text-sm font-medium text-gray-500">Tambah Item Anggaran</h2>
              <RABForm
                onSuccess={() => setToast({ kind: 'success', message: 'Item anggaran berhasil disimpan.' })}
              />
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-medium text-gray-500">Filter &amp; Export</h2>
              <RABFilters
                divisionFilter={divisionFilter}
                onDivisionFilterChange={setDivisionFilter}
                sort={sort}
                onSortChange={setSort}
                onExportClick={() => setIsExportOpen(true)}
              />
            </div>
          </div>

          <h2 className="mb-3 text-sm font-medium text-gray-500">Database Anggaran</h2>
          <RABTable items={filteredSorted} deletingId={deletingId} onRequestDelete={setDeleteTarget} />
        </>
      )}

      {deleteTarget && (
        <RABDeleteModal
          item={deleteTarget}
          isDeleting={deletingId === deleteTarget.id}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isExportOpen && (
        <RABExportModal onClose={() => setIsExportOpen(false)} onConfirm={handleExportConfirm} />
      )}

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}