'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Modal from '../../shared/components/Modal';
import { Toast, type ToastState } from '../../shared/components/Toast';
import CreateUserModal from './CreateUserModal';
import { updateUserRoleStatus } from './Adminuseractions';
import type { ProfileRow, UserRole } from '@/types/database.types';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  bendahara: 'Bendahara',
  pendataan: 'Pendataan',
  acara: 'Acara',
};
const ROLE_OPTIONS: UserRole[] = ['admin', 'bendahara', 'pendataan', 'acara'];

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
      Aktif
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      Nonaktif
    </span>
  );
}

export default function AdminUsersView({ users }: { users: ProfileRow[] }) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<ProfileRow | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function notifySuccess(message: string) {
    setToast({ kind: 'success', message });
  }
  function notifyError(message: string) {
    setToast({ kind: 'error', message });
  }

  async function handleRoleChange(user: ProfileRow, newRole: UserRole) {
    if (newRole === user.role) return;
    setPendingUserId(user.id);
    try {
      await updateUserRoleStatus({ userId: user.id, role: newRole });
      notifySuccess(`Role ${user.username} diubah ke ${ROLE_LABEL[newRole]}.`);
      router.refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Gagal mengubah role.');
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleActivate(user: ProfileRow) {
    setPendingUserId(user.id);
    try {
      await updateUserRoleStatus({ userId: user.id, isActive: true });
      notifySuccess(`${user.username} diaktifkan kembali.`);
      router.refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Gagal mengaktifkan user.');
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleConfirmDeactivate() {
    if (!deactivateTarget) return;
    const user = deactivateTarget;
    setPendingUserId(user.id);
    try {
      await updateUserRoleStatus({ userId: user.id, isActive: false });
      notifySuccess(`${user.username} dinonaktifkan.`);
      setDeactivateTarget(null);
      router.refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Gagal menonaktifkan user.');
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Kelola akun dan role panitia.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-md bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white hover:bg-[#932347]"
        >
          <Plus className="h-4 w-4" />
          Buat User Baru
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {users.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Belum ada user. Klik &quot;Buat User Baru&quot; untuk mulai.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isPending = pendingUserId === user.id;
                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3 font-mono text-gray-900">{user.username}</td>
                      <td className="px-4 py-3 text-gray-700">{user.full_name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={isPending}
                          onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-60"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABEL[r]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={user.is_active} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-3 text-xs">
                          {user.is_active ? (
                            <button
                              onClick={() => setDeactivateTarget(user)}
                              disabled={isPending}
                              className="text-red-600 hover:text-red-800 disabled:opacity-60"
                            >
                              Nonaktifkan
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user)}
                              disabled={isPending}
                              className="text-green-700 hover:text-green-900 disabled:opacity-60"
                            >
                              {isPending ? 'Memproses...' : 'Aktifkan'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      {isCreateOpen && (
        <CreateUserModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(username) => {
            setIsCreateOpen(false);
            notifySuccess(`User ${username} berhasil dibuat.`);
            router.refresh();
          }}
        />
      )}

      {deactivateTarget && (
        <Modal title="Nonaktifkan User" onClose={() => setDeactivateTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Nonaktifkan <strong>{deactivateTarget.username}</strong>? Yang bersangkutan tidak
              akan bisa login sampai diaktifkan kembali.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeactivateTarget(null)}
                disabled={pendingUserId === deactivateTarget.id}
                className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeactivate}
                disabled={pendingUserId === deactivateTarget.id}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {pendingUserId === deactivateTarget.id ? 'Memproses...' : 'Nonaktifkan'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}