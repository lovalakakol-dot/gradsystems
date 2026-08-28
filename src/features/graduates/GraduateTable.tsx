import { MessageCircle, Trash2 } from 'lucide-react';
import { Table, TableHead, TableBody, Th, Td } from '@/shared/components/Table';
import Badge from '@/shared/components/Badge';
import EmptyState from '@/shared/components/EmptyState';
import { getCountryNameAr } from './countries';
import {
  SHIRT_SIZE_LABEL,
  VERIFICATION_STATUS_LABEL,
  buildWhatsAppLink,
  type GraduateEntry,
} from './types';

export function GraduateTable({
  entries,
  deletingId,
  onRequestDelete,
}: {
  entries: GraduateEntry[];
  deletingId: string | null;
  onRequestDelete: (entry: GraduateEntry) => void;
}) {
  if (entries.length === 0) {
    return <EmptyState message="Belum ada data wisudawan. Tambahkan lewat form di atas." />;
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <Th>Nomor</Th>
          <Th>No. Peserta</Th>
          <Th>Nama Lengkap</Th>
          <Th>Asal Negara</Th>
          <Th>Ukuran Baju</Th>
          <Th>No. WhatsApp</Th>
          <Th>Status Verifikasi</Th>
          <Th>Aksi</Th>
        </tr>
      </TableHead>
      <TableBody>
        {entries.map((entry, index) => (
          <tr key={entry.id}>
            <Td>
              <span className="text-gray-900">{index + 1}</span>
            </Td>
            <Td>
              <span className="text-gray-900">{entry.participant_number ?? '—'}</span>
            </Td>
            <Td>
              <span dir="rtl" className="block text-gray-900">
                {entry.full_name_ar ?? '—'}
              </span>
            </Td>
            <Td>
              <span dir="rtl" className="text-gray-900">
                {getCountryNameAr(entry.country_code)}
              </span>
            </Td>
            <Td>
              <span className="text-gray-900">
                {entry.shirt_size ? SHIRT_SIZE_LABEL[entry.shirt_size] : '—'}
              </span>
            </Td>
            <Td>
              {entry.whatsapp_number ? (
                <a
                  href={buildWhatsAppLink(entry.whatsapp_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gray-900 hover:text-green-700 hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                  {entry.whatsapp_number}
                </a>
              ) : (
                <span className="text-gray-900">—</span>
              )}
            </Td>
            <Td>
              {entry.verification_status === 'done' ? (
                <Badge variant="success">{VERIFICATION_STATUS_LABEL.done}</Badge>
              ) : (
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {VERIFICATION_STATUS_LABEL.not_yet}
                </span>
              )}
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

export default GraduateTable;
