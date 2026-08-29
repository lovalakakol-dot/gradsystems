import Card from '../../../shared/components/Card';
import { Table, TableHead, TableBody, Th, Td } from '../../../shared/components/Table';
import ErrorState from '../../../shared/components/ErrorState';
import { getGraduates } from '../../../features/graduates/Getgraduates';
import { calculateGraduateSummary } from '../../../features/graduates/calculateGraduateSummary';

// Server Component: fetches real data via the same getGraduates()
// used by the Database Wisudawan feature. RLS (graduates_select_
// pendataan) already scopes this to an active pendataan user — no
// extra role check added here, per the existing convention that
// route protection lives in proxy.ts/navConfig, not per-page.
export default async function PendataanDashboardPage() {
  const { entries, hasError } = await getGraduates();

  if (hasError) {
    return (
      <div className="p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Dashboard</h2>
        <ErrorState message="Gagal memuat ringkasan wisudawan. Coba muat ulang halaman." />
      </div>
    );
  }

  const summary = calculateGraduateSummary(entries);

  return (
    <div className="p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card title="Total Wisudawan Terdaftar">
          <p className="text-4xl font-semibold text-gray-900">{summary.totalParticipants}</p>
          <p className="mt-1 text-xs text-gray-500">Wisudawan tercatat di Database Wisudawan.</p>
        </Card>

        <Card title="Rekap Ukuran Toga">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Besar</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalLarge}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Kecil</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalSmall}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Rekap Wisudawan per Negara">
          {summary.byCountry.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada data wisudawan.</p>
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <Th>Negara</Th>
                  <Th>Jumlah</Th>
                </tr>
              </TableHead>
              <TableBody>
                {summary.byCountry.map((c) => (
                  <tr key={c.countryCode}>
                    <Td>
                      <span dir="rtl" className="text-gray-900">
                        {c.countryNameAr}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-medium text-gray-900">{c.count}</span>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}