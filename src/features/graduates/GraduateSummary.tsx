import type { GraduateSummary as GraduateSummaryData } from './types';

export function GraduateSummary({ summary }: { summary: GraduateSummaryData }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Rekap</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Total Peserta</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.totalParticipants}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Besar</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.totalLarge}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Kecil</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.totalSmall}</p>
          </div>
        </div>
      </div>

      {summary.byCountry.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Negara</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {summary.byCountry.map((c) => (
              <div key={c.countryCode} className="flex items-baseline gap-1.5">
                <span dir="rtl" className="text-sm text-gray-900">
                  {c.countryNameAr}
                </span>
                <span className="text-sm font-medium text-gray-900">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GraduateSummary;
