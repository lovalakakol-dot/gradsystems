import { formatCashAmount } from './types';

interface CashbookSummaryProps {
  egpIncome: number;
  egpExpense: number;
  egpBalance: number;
  idrIncome: number;
  idrExpense: number;
  idrBalance: number;
}

export function CashbookSummary({
  egpIncome,
  egpExpense,
  egpBalance,
  idrIncome,
  idrExpense,
  idrBalance,
}: CashbookSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-white/40 bg-white/60 p-5 shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ringkasan EGP</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Pemasukan</span>
          <span className="font-medium text-slate-900">{formatCashAmount('EGP', egpIncome)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Pengeluaran</span>
          <span className="font-medium text-slate-900">{formatCashAmount('EGP', egpExpense)}</span>
        </div>
        <div className="mt-3 border-t border-slate-200/60 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#7A1E33]">Saldo EGP</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCashAmount('EGP', egpBalance)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/40 bg-white/60 p-5 shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ringkasan IDR</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Pemasukan</span>
          <span className="font-medium text-slate-900">{formatCashAmount('IDR', idrIncome)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Pengeluaran</span>
          <span className="font-medium text-slate-900">{formatCashAmount('IDR', idrExpense)}</span>
        </div>
        <div className="mt-3 border-t border-slate-200/60 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#7A1E33]">Saldo IDR</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCashAmount('IDR', idrBalance)}</p>
        </div>
      </div>
    </div>
  );
}
