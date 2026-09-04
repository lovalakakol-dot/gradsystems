'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import Button from '@/shared/components/Button';
import { Toast, type ToastState } from '@/shared/components/Toast';
import { useGraduateMutations } from '@/features/graduates/useGraduateMutations';
import { compareArabic, compareArabicDescending, normalizeArabic } from '@/features/graduates/arabicSort';
import { countryNameFor, type Country } from '@/features/graduates/countries';
import {
  ALL_COUNTRIES,
  ALL_SHIRT_SIZES,
  ALL_VERIFICATION,
  type CountryFilter,
  type GraduateRow,
  type ShirtSizeFilter,
  type SortOption,
  type VerificationFilter,
} from '@/features/graduates/types';
import GraduateForm from '@/features/graduates/GraduateForm';
import GraduateFilters from '@/features/graduates/GraduateFilters';
import GraduateTable from '@/features/graduates/GraduateTable';
import GraduateDeleteModal from '@/features/graduates/GraduateDeleteModal';
import GraduateExportDialog from '@/features/graduates/GraduateExportDialog';

export default function Graduates({ initialGraduates }: { initialGraduates: GraduateRow[] }) {
  const { deleteGraduate, deletingId } = useGraduateMutations();

  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>(ALL_COUNTRIES);
  const [shirtSizeFilter, setShirtSizeFilter] = useState<ShirtSizeFilter>(ALL_SHIRT_SIZES);
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>(ALL_VERIFICATION);
  const [sort, setSort] = useState<SortOption>('name_asc');

  const [pendingDelete, setPendingDelete] = useState<GraduateRow | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Section 17: filter negara hanya menampilkan negara yang benar-benar
  // ada di data saat ini — dibangun dari initialGraduates, bukan dari
  // seluruh daftar dunia di countries.ts.
  const availableCountries: Country[] = useMemo(() => {
    const codes = new Set(initialGraduates.map((g) => g.country_code).filter((c): c is string => !!c));
    return Array.from(codes)
      .map((code) => ({ code, nameAr: countryNameFor(code) }))
      .sort((a, b) => compareArabic(a.nameAr, b.nameAr));
  }, [initialGraduates]);

  const filtered = useMemo(() => {
    const normalizedSearch = normalizeArabic(search.trim());
    return initialGraduates.filter((g) => {
      if (countryFilter !== ALL_COUNTRIES && g.country_code !== countryFilter) return false;
      if (shirtSizeFilter !== ALL_SHIRT_SIZES && g.shirt_size !== shirtSizeFilter) return false;
      if (verificationFilter !== ALL_VERIFICATION && g.verification_status !== verificationFilter) return false;

      if (normalizedSearch) {
        const name = normalizeArabic(g.full_name_ar ?? g.full_name);
        const country = normalizeArabic(countryNameFor(g.country_code));
        if (!name.includes(normalizedSearch) && !country.includes(normalizedSearch)) return false;
      }
      return true;
    });
  }, [initialGraduates, countryFilter, shirtSizeFilter, verificationFilter, search]);

  const displayed = useMemo(() => {
    const sorted = [...filtered];
    switch (sort) {
      case 'name_asc':
        return sorted.sort((a, b) => compareArabic(a.full_name_ar ?? a.full_name, b.full_name_ar ?? b.full_name));
      case 'name_desc':
        return sorted.sort((a, b) =>
          compareArabicDescending(a.full_name_ar ?? a.full_name, b.full_name_ar ?? b.full_name)
        );
      case 'country_asc':
        return sorted.sort((a, b) => compareArabic(countryNameFor(a.country_code), countryNameFor(b.country_code)));
      case 'country_desc':
        return sorted.sort((a, b) =>
          compareArabicDescending(countryNameFor(a.country_code), countryNameFor(b.country_code))
        );
      default:
        return sorted;
    }
  }, [filtered, sort]);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const { error } = await deleteGraduate(pendingDelete.id);
    if (error) {
      setToast({ kind: 'error', message: error });
    } else {
      setToast({ kind: 'success', message: 'Data wisudawan berhasil dihapus.' });
    }
    setPendingDelete(null);
  }

  const emptyMessage =
    initialGraduates.length === 0
      ? 'Belum ada data wisudawan.'
      : 'Tidak ada wisudawan yang sesuai dengan pencarian atau filter.';

  return (
    <div className="space-y-6">
      {/* Form berada di atas — section 2 */}
      <div className="rounded-xl border border-white/40 bg-white/60 p-5 shadow-md backdrop-blur-xl sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Tambah Wisudawan</h2>
        <GraduateForm
          onSuccess={() => setToast({ kind: 'success', message: 'Data wisudawan berhasil ditambahkan.' })}
        />
      </div>

      {/* Database di bawah form — section 2 & 40 */}
      <div className="rounded-xl border border-white/40 bg-white/60 p-5 shadow-md backdrop-blur-xl sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">Database Wisudawan</h2>
          <Button variant="secondary" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4" />
            Export XLSX
          </Button>
        </div>

        <div className="space-y-4">
          <GraduateFilters
            search={search}
            onSearchChange={setSearch}
            availableCountries={availableCountries}
            countryFilter={countryFilter}
            onCountryFilterChange={setCountryFilter}
            shirtSizeFilter={shirtSizeFilter}
            onShirtSizeFilterChange={setShirtSizeFilter}
            verificationFilter={verificationFilter}
            onVerificationFilterChange={setVerificationFilter}
            sort={sort}
            onSortChange={setSort}
          />

          <GraduateTable
            graduates={displayed}
            emptyMessage={emptyMessage}
            deletingId={deletingId}
            onRequestDelete={setPendingDelete}
          />
        </div>
      </div>

      {pendingDelete && (
        <GraduateDeleteModal
          graduate={pendingDelete}
          isDeleting={deletingId === pendingDelete.id}
          onClose={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {showExportDialog && (
        <GraduateExportDialog
          graduates={displayed}
          onClose={() => setShowExportDialog(false)}
          onExported={() => {
            setShowExportDialog(false);
            setToast({ kind: 'success', message: 'File Database_Wisudawan.xlsx berhasil dibuat.' });
          }}
        />
      )}

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
