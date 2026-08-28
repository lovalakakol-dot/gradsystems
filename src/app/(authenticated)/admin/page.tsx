import { getAllProfiles } from '../../../features/admin/getAllProfiles';
import Card from '../../../shared/components/Card';

// Reuses the existing getAllProfiles() query (already built for
// Admin User Management) — no new query added just to produce
// these two numbers.
export default async function AdminDashboardPage() {
  const users = await getAllProfiles();
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card title="Total Users">
          <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
        </Card>
        <Card title="Active Users">
          <p className="text-2xl font-semibold text-gray-900">{activeUsers}</p>
        </Card>
      </div>
    </div>
  );
}