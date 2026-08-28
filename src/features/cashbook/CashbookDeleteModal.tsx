'use client';

import Modal from '@/shared/components/Modal';
import Button from '@/shared/components/Button';
import type { CashbookEntryWithBalance } from './calculateRunningBalance';

export default function CashbookDeleteModal({
  entry,
  isDeleting,
  onClose,
  onConfirm,
}: {
  entry: CashbookEntryWithBalance;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title="Hapus Transaksi" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Hapus transaksi <strong>{entry.description ?? entry.id}</strong>? Data akan dihapus
          permanen dari database dan tidak bisa dibatalkan.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}