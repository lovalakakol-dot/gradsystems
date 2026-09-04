import { countryNameFor } from './countries';
import { SHIRT_SIZE_LABELS, VERIFICATION_LABELS, type GraduateRow } from './types';

function GlassStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/40 bg-white/60 p-4 text-center shadow-sm backdrop-blur-xl">
      <p className="text-2xl font-bold text-[#7A1E33]">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function GraduateSummary({ graduates }: { graduates: GraduateRow[] }) {
  const total = graduates.length;

  const perCountry = new Map<string, number>();
  for (const g of graduates) {
    if (!g.country_code) continue;
    perCountry.set(g.country_code, (perCountry.get(g.country_code) ?? 0) + 1);
  }
  const countryEntries = Array.from(perCountry.entries()).sort((a, b) => b[1] - a[1]);

  const large = graduates.filter((g) => g.shirt_size === 'large').length;
  const small = graduates.filter((g) => g.shirt_size === 'small').length;
  const none = graduates.filter((g) => g.shirt_size === 'none').length;
  const done = graduates.filter((g) => g.verification_status === 'done').length;
  const notYet = graduates.filter((g) => g.verification_status === 'not_yet').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <GlassStat label="Total Wisudawan" value={total} />
        <GlassStat label={`Berkas ${VERIFICATION_LABELS.done}`} value={done} />
        <GlassStat label={`Berkas ${VERIFICATION_LABELS.not_yet}`} value={notYet} />
        <GlassStat label={`Ukuran ${SHIRT_SIZE_LABELS.large}`} value={large} />
        <GlassStat label={`Ukuran ${SHIRT_SIZE_LABELS.small}`} value={small} />
        <GlassStat label={`Ukuran ${SHIRT_SIZE_LABELS.none}`} value={none} />
      </div>

      {countryEntries.length > 0 && (
        <div className="rounded-xl border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur-xl">
          <p className="mb-2 text-xs font-medium text-gray-500">Total per Negara</p>
          <div className="flex flex-wrap gap-2">
            {countryEntries.map(([code, count]) => (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-sm text-gray-900"
              >
                <span dir="rtl">{countryNameFor(code)}</span>
                <span className="font-semibold text-[#7A1E33]">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
