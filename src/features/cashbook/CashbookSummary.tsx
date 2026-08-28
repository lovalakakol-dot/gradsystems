import Card from '@/shared/components/Card';
import type { CashbookEntryWithBalance } from './calculateRunningBalance';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}

function sumBy(
  entries: CashbookEntryWithBalance[],
  currency: 'EGP' | 'IDR',
  type: 'income' | 'expense'
): number {
  return entries
    .filter((e) => e.currency === currency && e.type === type)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Deliberately computed from the FULL (unfiltered) entries — a
 * committee-wide financial overview that stays stable regardless of
 * whatever the user is currently filtering in the table below,
 * consistent with how running balance itself is never affected by
 * display-only filters.
 */
export default function CashbookSummary({ entries }: { entries: CashbookEntryWithBalance[] }) {
  const incomeEgp = sumBy(entries, 'EGP', 'income');
  const expenseEgp = sumBy(entries, 'EGP', 'expense');
  const saldoEgp = incomeEgp - expenseEgp;

  const incomeIdr = sumBy(entries, 'IDR', 'income');
  const expenseIdr = sumBy(entries, 'IDR', 'expense');
  const saldoIdr = incomeIdr - expenseIdr;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase text-gray-500">EGP</h3>
        <div className="grid grid-cols-3 gap-3">
          <Card title="Pemasukan">
            <p className="text-lg font-semibold text-gray-900">{formatNumber(incomeEgp)}</p>
          </Card>
          <Card title="Pengeluaran">
            <p className="text-lg font-semibold text-gray-900">{formatNumber(expenseEgp)}</p>
          </Card>
          <Card title="Saldo">
            <p className="text-lg font-semibold text-gray-900">{formatNumber(saldoEgp)}</p>
          </Card>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase text-gray-500">IDR</h3>
        <div className="grid grid-cols-3 gap-3">
          <Card title="Pemasukan">
            <p className="text-lg font-semibold text-gray-900">{formatNumber(incomeIdr)}</p>
          </Card>
          <Card title="Pengeluaran">
            <p className="text-lg font-semibold text-gray-900">{formatNumber(expenseIdr)}</p>
          </Card>
          <Card title="Saldo">
            <p className="text-lg font-semibold text-gray-900">{formatNumber(saldoIdr)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}