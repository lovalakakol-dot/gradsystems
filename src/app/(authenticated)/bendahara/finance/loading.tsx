import LoadingState from '@/shared/components/LoadingState';

export default function Loading() {
  return (
    <div className="p-6">
      <LoadingState label="Memuat laporan keuangan..." />
    </div>
  );
}
