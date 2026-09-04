import { getFinanceData } from '@/features/finance/data';
import Finance from './Finance';
import ErrorState from '@/shared/components/ErrorState';

// Role protection (bendahara) is inherited from the existing
// (authenticated)/bendahara route group — no new guard/middleware is
// introduced here. This page is strictly read-only: it never
// inserts/updates/deletes rab_items or cashbook_entries. RLS on both
// tables remains the actual data security boundary.
export default async function FinancePage() {
  const { rabItems, cashbookEntries, rabError, cashbookError } = await getFinanceData();

  if (rabError || cashbookError) {
    return <ErrorState message="Gagal memuat data laporan keuangan." />;
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-white via-white to-[#7A1E33]/[0.04] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Laporan Keuangan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pantau pemasukan, pengeluaran, saldo, serta perbandingan anggaran dan realisasi Wisuda.
          </p>
        </div>
        <Finance rabItems={rabItems} cashbookEntries={cashbookEntries} />
      </div>
    </div>
  );
}
