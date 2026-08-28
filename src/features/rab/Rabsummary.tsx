import Card from '@/shared/components/Card';
import type { RabItem } from './types';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}

export default function RABSummary({ items }: { items: RabItem[] }) {
  const totalEgp = items
    .filter((i) => i.currency === 'EGP')
    .reduce((sum, i) => sum + i.estimated_cost, 0);
  const totalIdr = items
    .filter((i) => i.currency === 'IDR')
    .reduce((sum, i) => sum + i.estimated_cost, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card title="Total Anggaran EGP">
        <p className="text-2xl font-semibold text-gray-900">{formatNumber(totalEgp)}</p>
      </Card>
      <Card title="Total Anggaran IDR">
        <p className="text-2xl font-semibold text-gray-900">{formatNumber(totalIdr)}</p>
      </Card>
    </div>
  );
}