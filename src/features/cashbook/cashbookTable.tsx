import { Trash2, ExternalLink } from 'lucide-react';
import { Table, TableHead, TableBody, Th, Td } from '@/shared/components/Table';
import Badge from '@/shared/components/Badge';
import EmptyState from '@/shared/components/EmptyState';
import { TYPE_LABEL } from './types';
import type { CashbookEntryWithBalance } from './calculateRunningBalance';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));
}

export function CashbookTable({
  entries,
  deletingId,
  onRequestDelete,
}: {
  entries: CashbookEntryWithBalance[];
  deletingId: string | null;
  onRequestDelete: (entry: CashbookEntryWithBalance) => void;
}) {
  if (entries.length === 0) {
    return <EmptyState message="Belum ada transaksi. Tambahkan lewat form di samping." />;
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <Th>Tanggal</Th>
          <Th>Tipe</Th>
          <Th>Keterangan</Th>
          <Th>Divisi</Th>
          <Th>Bukti Nota</Th>
          <Th>Nominal EGP</Th>
          <Th>Nominal IDR</Th>
          <Th>Saldo EGP</Th>
          <Th>Saldo IDR</Th>
          <Th>Aksi</Th>
        </tr>
      </TableHead>
      <TableBody>
        {entries.map((entry) => (
          <tr key={entry.id}>
            <Td>
              <span className="text-gray-900">{formatDate(entry.transaction_date)}</span>
            </Td>
            <Td>
              {entry.type === 'income' ? (
                <Badge variant="success">{TYPE_LABEL.income}</Badge>
              ) : (
                <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                  {TYPE_LABEL.expense}
                </span>
              )}
            </Td>
            <Td>
              <span className="block max-w-[220px] truncate text-gray-900">
                {entry.description ?? '—'}
              </span>
            </Td>
            <Td>
              <span className="text-gray-900">{entry.division ?? '—'}</span>
            </Td>
            <Td>
              {entry.attachment_url ? (
                <a
                  href={entry.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#7A1E33] hover:underline"
                >
                  Lihat Bukti
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </Td>
            <Td>
              <span className="font-medium text-gray-900">
                {entry.currency === 'EGP' ? formatNumber(entry.amount) : '-'}
              </span>
            </Td>
            <Td>
              <span className="font-medium text-gray-900">
                {entry.currency === 'IDR' ? formatNumber(entry.amount) : '-'}
              </span>
            </Td>
            <Td>
              <span className="font-medium text-gray-900">{formatNumber(entry.running_egp)}</span>
            </Td>
            <Td>
              <span className="font-medium text-gray-900">{formatNumber(entry.running_idr)}</span>
            </Td>
            <Td>
              <button
                onClick={() => onRequestDelete(entry)}
                disabled={deletingId === entry.id}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deletingId === entry.id ? 'Menghapus...' : 'Hapus'}
              </button>
            </Td>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
}