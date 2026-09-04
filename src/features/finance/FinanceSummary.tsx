import type { Currency, CurrencyTotals } from './types';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}

export default function FinanceSummary({
  currency,
  totals,
}: {
  currency: Currency;
  totals: CurrencyTotals;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
        <p className="text-sm text-gray-500">Pemasukan</p>
        <p className="mt-2 text-xl font-semibold text-gray-900">
          {currency} {formatNumber(totals.income)}
        </p>
      </div>

      <div className="rounded-xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
        <p className="text-sm text-gray-500">Pengeluaran</p>
        <p className="mt-2 text-xl font-semibold text-gray-900">
          {currency} {formatNumber(totals.expense)}
        </p>
      </div>

      <div className="rounded-xl border border-white/40 bg-gradient-to-br from-white/80 to-[#7A1E33]/[0.06] p-5 shadow-md backdrop-blur-xl">
        <p className="text-sm text-gray-500">Saldo</p>
        <p className="mt-2 text-3xl font-bold text-[#7A1E33]">
          {currency} {formatNumber(totals.balance)}
        </p>
        <p className="mt-1 text-xs text-gray-500">Pemasukan − Pengeluaran</p>
      </div>
    </div>
  );
}
