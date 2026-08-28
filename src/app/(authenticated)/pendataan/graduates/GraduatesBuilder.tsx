'use client';

import { useMemo, useState } from 'react';
import ErrorState from '@/shared/components/ErrorState';
import { Toast, type ToastState } from '@/shared/components/Toast';
import { useGraduateMutations } from '@/features/graduates/Usegraduatemutations';
import { calculateGraduateSummary } from '@/features/graduates/calculateGraduateSummary';
import { filterGraduates, sortGraduates } from '@/features/graduates/filterGraduates';
import {
  DEFAULT_GRADUATE_FILTERS,
  type CountryFilter,
  type GraduateEntry,
  type GraduateFiltersState,
  type ShirtSizeFilter,
  type SortOption,
  type VerificationStatusFilter,
} from '@/features/graduates/types';
import GraduateForm from '@/features/graduates/GraduateForm';
import { GraduateSummary } from '@/features/graduates/GraduateSummary';
import { GraduateFilters } from '@/features/graduates/GraduateFilters';
import { GraduateTable } from '@/features/graduates/GraduateTable';
import { GraduateDeleteModal } from '@/features/graduates/GraduateDeleteModal';
import { GraduateExportModal } from '@/features/graduates/GraduateExportModal';

export default function GraduatesBuilder({
  initialEntries,
  hasError,
}: {
  initialEntries: GraduateEntry[];
  hasError: boolean;
}) {
  const { deleteGraduate, deletingId } = useGraduateMutations();

  const [filters, setFilters] = useState<GraduateFiltersState>(DEFAULT_GRADUATE_FILTERS);
  const [deleteTarget, setDeleteTarget] = useState<GraduateEntry | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Recap always reflects the complete dataset, independent of the
  // table's current search/filter — same convention as Cashbook.
  const summary = useMemo(() => calculateGraduateSummary(initialEntries), [initialEntries]);

  const displayed = useMemo(() => {
    const filtered = filterGraduates(initialEntries, filters);
    return sortGraduates(filtered, filters.sort);
  }, [initialEntries, filters]);

  function updateFilter<K extends keyof GraduateFiltersState>(
    key: K,
    value: GraduateFiltersState[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const { error } = await deleteGraduate(target.id);
    if (error) {
      setToast({ kind: 'error', message: error });
    } else {
      setToast({ kind: 'success', message: 'Data wisudawan berhasil dihapus.' });
      setDeleteTarget(null);
    }
  }

  function handleExported() {
    setIsExportOpen(false);
    setToast({ kind: 'success', message: 'Database_Wisudawan.xlsx berhasil diunduh.' });
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Database Wisudawan</h1>
        <p className="text-sm text-gray-500">Kelola data peserta wisuda Ma&apos;had Internasional.</p>
      </div>

      {hasError ? (
        <ErrorState message="Gagal memuat data wisudawan. Coba muat ulang halaman." />
      ) : (
        <>
          <div className="mb-6">
            <GraduateSummary summary={summary} />
          </div>

          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <GraduateFilters
              search={filters.search}
              onSearchChange={(value) => updateFilter('search', value)}
              country={filters.country}
              onCountryChange={(value: CountryFilter) => updateFilter('country', value)}
              shirtSize={filters.shirtSize}
              onShirtSizeChange={(value: ShirtSizeFilter) => updateFilter('shirtSize', value)}
              verificationStatus={filters.verificationStatus}
              onVerificationStatusChange={(value: VerificationStatusFilter) =>
                updateFilter('verificationStatus', value)
              }
              sort={filters.sort}
              onSortChange={(value: SortOption) => updateFilter('sort', value)}
              onExportClick={() => setIsExportOpen(true)}
            />
          </div>

          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-medium text-gray-500">Tambah Wisudawan</h2>
            <GraduateForm
              onSuccess={() =>
                setToast({ kind: 'success', message: 'Data wisudawan berhasil disimpan.' })
              }
            />
          </div>

          <h2 className="mb-3 text-sm font-medium text-gray-500">Database Wisudawan</h2>
          <GraduateTable
            entries={displayed}
            deletingId={deletingId}
            onRequestDelete={setDeleteTarget}
          />
        </>
      )}

      {deleteTarget && (
        <GraduateDeleteModal
          entry={deleteTarget}
          isDeleting={deletingId === deleteTarget.id}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isExportOpen && (
        <GraduateExportModal
          entries={displayed}
          onClose={() => setIsExportOpen(false)}
          onExported={handleExported}
        />
      )}

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
