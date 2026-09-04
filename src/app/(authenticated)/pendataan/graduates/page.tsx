import { getGraduates } from '@/features/graduates/data';
import Graduates from './Graduates';
import ErrorState from '@/shared/components/ErrorState';

// Role protection (pendataan) is inherited from the existing
// (authenticated)/pendataan route group — no new guard/middleware is
// introduced here. RLS on graduates (pendataan-only) remains the
// actual data security boundary.
export default async function GraduatesPage() {
  const { graduates, hasError } = await getGraduates();

  if (hasError) {
    return <ErrorState message="Gagal memuat database wisudawan." />;
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-white via-white to-[#7A1E33]/[0.04] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Database Wisudawan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Input, cari, saring, dan urutkan data wisudawan, lalu export ke Excel.
          </p>
        </div>
        <Graduates initialGraduates={graduates} />
      </div>
    </div>
  );
}
