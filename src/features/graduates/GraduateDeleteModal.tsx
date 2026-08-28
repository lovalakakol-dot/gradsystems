import { getCountryNameAr } from './countries';
import type { GraduateEntry } from './types';

export function GraduateDeleteModal({
  entry,
  isDeleting,
  onClose,
  onConfirm,
}: {
  entry: GraduateEntry;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-gray-900">Hapus data wisudawan?</h3>
        <p className="mt-2 text-sm text-gray-600">
          <span dir="rtl" className="font-medium text-gray-900">
            {entry.full_name_ar ?? '—'}
          </span>{' '}
          ({getCountryNameAr(entry.country_code)}) akan dihapus permanen. Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GraduateDeleteModal;
