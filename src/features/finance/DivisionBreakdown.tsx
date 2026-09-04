import EmptyState from '@/shared/components/EmptyState';
import type { Currency, DivisionFinancialSummary } from './types';
import { statusLabel } from './types';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}

export default function DivisionBreakdown({
  currency,
  rows,
  hasBudgetData,
  hasRealizationData,
}: {
  currency: Currency;
  rows: DivisionFinancialSummary[];
  hasBudgetData: boolean;
  hasRealizationData: boolean;
}) {
  if (!hasBudgetData) {
    return <EmptyState message="Belum ada data RAB untuk dibandingkan." />;
  }
  if (!hasRealizationData) {
    return <EmptyState message="Belum ada realisasi pengeluaran." />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/40 bg-white/60 shadow-sm backdrop-blur-xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/40 text-xs uppercase text-gray-500">
          <tr>
            <th className="whitespace-nowrap px-4 py-3 font-medium">Divisi</th>
            <th className="whitespace-nowrap px-4 py-3 font-medium">Anggaran</th>
            <th className="whitespace-nowrap px-4 py-3 font-medium">Realisasi</th>
            <th className="whitespace-nowrap px-4 py-3 font-medium">Sisa</th>
            <th className="whitespace-nowrap px-4 py-3 font-medium">% Realisasi</th>
            <th className="whitespace-nowrap px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/40">
          {rows.map((row) => (
            <tr key={row.division} className="transition hover:bg-white/50">
              <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{row.division}</td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                {currency} {formatNumber(row.budget)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                {currency} {formatNumber(row.actual)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                {currency} {formatNumber(row.remaining)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200/70">
                    <div
                      className={`h-full rounded-full ${row.isOverBudget ? 'bg-rose-400' : 'bg-[#7A1E33]'}`}
                      style={{ width: `${Math.min(row.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-gray-900">{Math.round(row.percentage)}%</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    row.isOverBudget ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {statusLabel(row.isOverBudget)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
