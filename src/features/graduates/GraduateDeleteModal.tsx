'use client';

import Modal from '@/shared/components/Modal';
import Button from '@/shared/components/Button';
import type { GraduateRow } from './types';

export default function GraduateDeleteModal({
  graduate,
  isDeleting,
  onClose,
  onConfirm,
}: {
  graduate: GraduateRow;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title="Hapus Data Wisudawan" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Hapus data wisudawan <strong dir="rtl">{graduate.full_name_ar ?? graduate.full_name}</strong>?
          <br />
          Data yang dihapus tidak dapat dikembalikan.
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
