'use client';

import { useMemo, useState } from 'react';
import CashbookForm from '@/features/cashbook/CashbookForm';
import CashbookSummary from '@/features/cashbook/CashbookSummary';
import CashbookFilters from '@/features/cashbook/CashbookFilters';
import { CashbookTable } from '@/features/cashbook/cashbookTable';
import CashbookDeleteModal from '@/features/cashbook/CashbookDeleteModal';
import CashbookExportModal from '@/features/cashbook/CashbookExportModal';
import { Toast, type ToastState } from '@/shared/components/Toast';
import ErrorState from '@/shared/components/ErrorState';
import { useCashbookMutations } from '@/features/cashbook/Usecashbookmutations';
import {
  calculateRunningBalance,
  type CashbookEntryWithBalance,
} from '@/features/cashbook/calculateRunningBalance';
import exportCashbookToXlsx from '@/features/cashbook/Exportcashbook';
import {
  ALL_CURRENCIES,
  ALL_DIVISIONS,
  ALL_TYPES,
  EXPORT_COLUMN_LABELS,
  type CashbookEntry,
  type CurrencyFilter,
  type DivisionFilter,
  type ExportColumn,
  type SortOption,
  type TypeFilter,
} from '@/features/cashbook/types';

/**
 * Never mixes EGP and IDR into one ranking — a currency-scoped sort
 * ranks that currency by amount; the other currency's rows stay
 * visible below, just outside that ranking (same convention as RAB
 * Builder's sort).
 */
function sortEntries(
  entries: CashbookEntryWithBalance[],
  sort: SortOption
): CashbookEntryWithBalance[] {
  const byCurrency = (currency: 'EGP' | 'IDR', descending: boolean) => {
    const inCurrency = entries
      .filter((e) => e.currency === currency)
      .sort((a, b) => (descending ? b.amount - a.amount : a.amount - b.amount));
    const rest = entries.filter((e) => e.currency !== currency);
    return [...inCurrency, ...rest];
  };

  switch (sort) {
    case 'oldest':
      return [...entries].sort((a, b) => a.transaction_date.localeCompare(b.transaction_date));
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
      return [...entries].sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
  }
}

export default function Cashbook({
  initialEntries,
  hasError,
}: {
  initialEntries: CashbookEntry[];
  hasError: boolean;
}) {
  const { deleteEntry, deletingId } = useCashbookMutations();

  const [divisionFilter, setDivisionFilter] = useState<DivisionFilter>(ALL_DIVISIONS);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL_TYPES);
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>(ALL_CURRENCIES);
  const [sort, setSort] = useState<SortOption>('newest');
  const [deleteTarget, setDeleteTarget] = useState<CashbookEntryWithBalance | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Running balance computed ONCE over the full, chronologically
  // ordered history (initialEntries already arrives ordered that
  // way from getCashbookEntries.ts). Filters/sorting below only
  // ever change what's DISPLAYED — never recompute this.
  const withBalance = useMemo(() => calculateRunningBalance(initialEntries), [initialEntries]);

  const displayed = useMemo(() => {
    const filtered = withBalance.filter((e) => {
      if (divisionFilter !== ALL_DIVISIONS && e.division !== divisionFilter) return false;
      if (typeFilter !== ALL_TYPES && e.type !== typeFilter) return false;
      if (currencyFilter !== ALL_CURRENCIES && e.currency !== currencyFilter) return false;
      return true;
    });
    return sortEntries(filtered, sort);
  }, [withBalance, divisionFilter, typeFilter, currencyFilter, sort]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const { error } = await deleteEntry(target.id);
    if (error) {
      setToast({ kind: 'error', message: error });
    } else {
      setToast({ kind: 'success', message: 'Transaksi berhasil dihapus.' });
      setDeleteTarget(null);
    }
  }

  function handleExportConfirm(columns: ExportColumn[]) {
    // Exports exactly what's currently displayed (already filtered
    // + sorted) — no extra database query, no service role.
    exportCashbookToXlsx(displayed, columns, EXPORT_COLUMN_LABELS);
    setIsExportOpen(false);
    setToast({ kind: 'success', message: 'Buku_Kas_Wisuda.xlsx berhasil diunduh.' });
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Buku Kas Digital</h1>
        <p className="text-sm text-gray-500">Catat dan pantau transaksi kas kepanitiaan.</p>
      </div>

      {hasError ? (
        <ErrorState message="Gagal memuat data Buku Kas. Coba muat ulang halaman." />
      ) : (
        <>
          <div className="mb-6">
            <CashbookSummary entries={withBalance} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 lg:col-span-2">
              <h2 className="mb-3 text-sm font-medium text-gray-500">Tambah Transaksi</h2>
              <CashbookForm
                onSuccess={() =>
                  setToast({ kind: 'success', message: 'Transaksi berhasil disimpan.' })
                }
              />
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-medium text-gray-500">Filter &amp; Export</h2>
              <CashbookFilters
                divisionFilter={divisionFilter}
                onDivisionFilterChange={setDivisionFilter}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                currencyFilter={currencyFilter}
                onCurrencyFilterChange={setCurrencyFilter}
                sort={sort}
                onSortChange={setSort}
                onExportClick={() => setIsExportOpen(true)}
              />
            </div>
          </div>

          <h2 className="mb-3 text-sm font-medium text-gray-500">Database Transaksi</h2>
          <CashbookTable
            entries={displayed}
            deletingId={deletingId}
            onRequestDelete={setDeleteTarget}
          />
        </>
      )}

      {deleteTarget && (
        <CashbookDeleteModal
          entry={deleteTarget}
          isDeleting={deletingId === deleteTarget.id}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isExportOpen && (
        <CashbookExportModal onClose={() => setIsExportOpen(false)} onConfirm={handleExportConfirm} />
      )}

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}