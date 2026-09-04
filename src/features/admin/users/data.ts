import { createClient } from '@/lib/supabase/client';
import type { CreateUserFormData, UserProfile, UserRole } from './types';

/**
 * NOTE on import path: assumes the browser Supabase client lives at
 * `@/lib/supabase/client` (the client-side sibling of the async
 * `@/lib/supabase/server` factory used elsewhere in the project).
 * Adjust this import if the actual file/export name differs.
 */

/**
 * Loads every committee account. RLS on `profiles` is the actual
 * boundary here — only an active admin's session can select the full
 * roster; no client-side role check is needed on top of that.
 *
 * `.returns<UserProfile[]>()` pins the result shape explicitly. Use
 * this (not a `.from<TableName, Table>()` generic override) so the
 * query doesn't depend on a generic collapsing to `never` if
 * `database.types.ts` and the live schema ever drift — same pattern
 * used to fix getGraduates.ts.
 */
export async function fetchUsers(): Promise<{ users: UserProfile[]; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: true })
    .returns<UserProfile[]>();

  if (error) {
    console.error('Failed to load users', error);
    return { users: [], error: 'Gagal memuat daftar user. Coba muat ulang halaman.' };
  }

  return { users: data ?? [], error: null };
}

/**
 * Creates a new committee account. MUST go through the server
 * endpoint — the service-role key that provisions Supabase Auth +
 * the profile row never touches the browser (Section 4.2/4.3 of the
 * spec).
 */
export async function createUser(
  form: Pick<CreateUserFormData, 'full_name' | 'username' | 'role' | 'password'>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name.trim() || null,
        username: form.username.trim(),
        role: form.role,
        password: form.password,
      }),
    });

    if (response.ok) {
      return { success: true, error: null };
    }

    if (response.status === 409) {
      return { success: false, error: 'Username sudah digunakan.' };
    }
    if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Kamu tidak memiliki akses untuk membuat user.' };
    }
    if (response.status === 400) {
      return { success: false, error: 'Data yang dikirim tidak valid. Periksa kembali form.' };
    }

    return { success: false, error: 'Gagal membuat user. Coba lagi.' };
  } catch (err) {
    console.error('Failed to create user', err);
    return { success: false, error: 'Gagal terhubung ke server. Coba lagi.' };
  }
}

/**
 * Role & status updates both go through the same SECURITY DEFINER
 * RPC (Section 4.4) — pass null for whichever field isn't changing.
 * Every call is written with concretely typed arguments, no
 * `as any` / `as never` shortcuts (Section 5's strict-typing rule).
 *
 * IMPORTANT: this RPC will only typecheck cleanly once
 * `admin_update_user` is present under `Database['public']['Functions']`
 * in the project's real database.types.ts. If it isn't there yet
 * (it's one of the functions already flagged in the project's
 * outstanding typecheck errors), TypeScript will correctly complain
 * here — that's intentional, so the gap stays visible instead of
 * being papered over. Regenerate database.types.ts to resolve it;
 * see the reference file included alongside this feature.
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.rpc('admin_update_user', {
    p_target_user_id: userId,
    p_new_role: role,
    p_new_is_active: null,
  });

  if (error) {
    console.error('Failed to update role', error);
    return { success: false, error: 'Gagal mengubah role. Coba lagi.' };
  }

  return { success: true, error: null };
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.rpc('admin_update_user', {
    p_target_user_id: userId,
    p_new_role: null,
    p_new_is_active: isActive,
  });

  if (error) {
    console.error('Failed to update status', error);
    return { success: false, error: 'Gagal mengubah status user. Coba lagi.' };
  }

  return { success: true, error: null };
}
