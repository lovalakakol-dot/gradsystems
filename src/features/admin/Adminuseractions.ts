import { createClient } from '../../lib/supabase/client';
import type { ProfileRow, UserRole } from '@/types/database.types';

export interface CreateUserInput {
  username: string;
  full_name: string;
  role: UserRole;
  password: string;
}

export async function createUser(input: CreateUserInput): Promise<ProfileRow> {
  const res = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const body = await res.json();
  

  if (!res.ok) {
    throw new Error(body.error ?? 'Gagal membuat user.');
  }

  return body.user as ProfileRow;
}

export async function updateUserRoleStatus(input: {
  userId: string;
  role?: UserRole;
  isActive?: boolean;
}): Promise<ProfileRow> {
  const supabase = createClient();

  // admin_update_user() — SECURITY DEFINER RPC. The frontend never
  // issues a direct UPDATE on profiles; role/is_active changes
  // always go through this function (see the RLS & Authorization
  // migration, section 5b), which also enforces admin-only at the
  // database layer regardless of what this client believes.
  const { data, error } = await supabase.rpc('admin_update_user', {
    p_target_user_id: input.userId,
    p_new_role: input.role ?? null,
    p_new_is_active: input.isActive ?? null,
  });

  if (error) {
    console.error('admin_update_user RPC failed', error);
    throw new Error('Gagal memperbarui user.');
  }

  return data as ProfileRow;
}