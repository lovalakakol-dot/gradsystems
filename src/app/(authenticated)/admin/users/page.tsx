import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { UserManagement } from '@/features/admin/users/UserManagement';

export const metadata: Metadata = {
  title: 'User Management — Wisuda Management Tools',
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <UserManagement currentUserId={user?.id ?? null} />;
}
