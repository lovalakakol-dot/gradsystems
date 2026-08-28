import { getAllProfiles } from '../../../../features/admin/getAllProfiles';
import AdminUsersView from '../../../../features/admin/AdminUsersView';

export default async function AdminUsersPage() {
  const users = await getAllProfiles();
  return <AdminUsersView users={users} />;
}