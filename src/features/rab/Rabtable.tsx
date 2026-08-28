import { Trash2 } from 'lucide-react';
import { Table, TableHead, TableBody, Th, Td } from '@/shared/components/Table';
import EmptyState from '@/shared/components/EmptyState';
import type { RabItem } from './types';
import { estimasiEGP, estimasiIDR, formatSatuan } from './Formatrab';

export default function RABTable({
  items,
  deletingId,
  onRequestDelete,
}: {
  items: RabItem[];
  deletingId: string | null;
  onRequestDelete: (item: RabItem) => void;
}) {
  if (items.length === 0) {
    return <EmptyState message="Belum ada item anggaran. Tambahkan lewat form di atas." />;
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <Th>Divisi</Th>
          <Th>Nama Item Anggaran</Th>
          <Th>Satuan</Th>
          <Th>Estimasi EGP</Th>
          <Th>Estimasi IDR</Th>
          <Th>Catatan</Th>
          <Th>Aksi</Th>
        </tr>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <tr key={item.id}>
            <Td>{item.division}</Td>
            <Td>{item.item_name}</Td>
            <Td>{formatSatuan(item)}</Td>
            <Td>{estimasiEGP(item)}</Td>
            <Td>{estimasiIDR(item)}</Td>
            <Td>
              <span className="block max-w-[200px] truncate">{item.description ?? '—'}</span>
            </Td>
            <Td>
              <button
                onClick={() => onRequestDelete(item)}
                disabled={deletingId === item.id}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deletingId === item.id ? 'Menghapus...' : 'Hapus'}
              </button>
            </Td>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
}