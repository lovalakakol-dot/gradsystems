'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';
import { CreateUserDialog } from './CreateUserDialog';
import { fetchUsers, updateUserRole, updateUserStatus } from './data';
import { DEFAULT_USER_FILTERS } from './types';
import type { UserFiltersState, UserProfile, UserRole } from './types';

interface UserManagementProps {
  currentUserId: string | null;
}

interface ActionFeedback {
  type: 'success' | 'error';
  message: string;
}

export function UserManagement({ currentUserId }: UserManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFiltersState>(DEFAULT_USER_FILTERS);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { users: fetched, error } = await fetchUsers();
    if (error) {
      setLoadError(error);
    } else {
      setUsers(fetched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Auto-dismiss transient success/error banners after a few seconds.
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Composable search + role + status filtering, applied client-side
  // over the already-loaded roster.
  const filteredUsers = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        query.length === 0 ||
        user.username.toLowerCase().includes(query) ||
        (user.full_name ?? '').toLowerCase().includes(query);
      const matchesRole = filters.role === 'all' || user.role === filters.role;
      const matchesStatus =
        filters.status === 'all' || (filters.status === 'active' ? user.is_active : !user.is_active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  const handleCreated = useCallback(() => {
    setCreateDialogOpen(false);
    setFeedback({ type: 'success', message: 'User berhasil dibuat.' });
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = useCallback(
    async (userId: string, role: UserRole) => {
      const { success, error } = await updateUserRole(userId, role);
      if (success) {
        setFeedback({ type: 'success', message: 'Role user berhasil diperbarui.' });
        loadUsers();
      } else {
        setFeedback({ type: 'error', message: error ?? 'Gagal mengubah role.' });
      }
    },
    [loadUsers]
  );

  const handleStatusChange = useCallback(
    async (userId: string, isActive: boolean) => {
      const { success, error } = await updateUserStatus(userId, isActive);
      if (success) {
        setFeedback({
          type: 'success',
          message: isActive ? 'User berhasil diaktifkan.' : 'User berhasil dinonaktifkan.',
        });
        loadUsers();
      } else {
        setFeedback({ type: 'error', message: error ?? 'Gagal mengubah status user.' });
      }
    },
    [loadUsers]
  );

  return (
    <div className="relative min-h-full">
      {/* Ambient background — very light warm gray with a subtle
          maroon/pink glow, per the "luxury academic" direction. Sits
          behind all page content, doesn't affect layout/scroll. */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#fdf8f6] via-[#faf5f3] to-[#f6ebee]">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#7A1E33]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#7A1E33]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola akun dan hak akses panitia Wisuda Mahad Internasional.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A1E33] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729] focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
          >
            <Plus className="h-4 w-4" />
            Tambah User
          </button>
        </div>

        {/* Inline banner for action feedback. Swap for the shared
            InlineAlert component if one already exists in
            `shared/` — kept as a plain styled div here so the build
            doesn't break on a guessed import path. */}
        {feedback && (
          <div
            role="status"
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200/60 bg-emerald-50/80 text-emerald-700'
                : 'border-rose-200/60 bg-rose-50/80 text-rose-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <UserFilters filters={filters} onChange={setFilters} />

        <div className="mt-4">
          <UserTable
            users={filteredUsers}
            loading={loading}
            loadError={loadError}
            hasAnyUsers={users.length > 0}
            currentUserId={currentUserId}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
            onRetry={loadUsers}
            onAddUser={() => setCreateDialogOpen(true)}
          />
        </div>
      </div>

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
