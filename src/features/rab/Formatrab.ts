import type { RabItem } from './types';

export function formatSatuan(item: RabItem): string {
  if (item.quantity == null || !item.unit) return '—';
  const qty = Number.isInteger(item.quantity)
    ? item.quantity.toString()
    : item.quantity.toFixed(2);
  return `${qty} ${item.unit}`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}

export function estimasiEGP(item: RabItem): string {
  return item.currency === 'EGP' ? formatNumber(item.estimated_cost) : '—';
}

export function estimasiIDR(item: RabItem): string {
  return item.currency === 'IDR' ? formatNumber(item.estimated_cost) : '—';
}