'use client';

import { useState } from 'react';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { ROLE_LABELS, ROLE_ORDER } from './types';
import type { UserProfile, UserRole } from './types';

interface UserTableProps {
  users: UserProfile[];
  loading: boolean;
  loadError: string | null;
  hasAnyUsers: boolean;
  currentUserId: string | null;
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
  onStatusChange: (userId: string, isActive: boolean) => Promise<void>;
  onRetry: () => void;
  onAddUser: () => void;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function UserTable({
  users,
  loading,
  loadError,
  hasAnyUsers,
  currentUserId,
  onRoleChange,
  onStatusChange,
  onRetry,
  onAddUser,
}: UserTableProps) {
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const userToDeactivate = users.find((user) => user.id === pendingDeactivateId) ?? null;

  const runAction = async (userId: string, action: () => Promise<void>) => {
    setBusyUserId(userId);
    try {
      await action();
    } finally {
      setBusyUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-white/40 bg-white/60 p-12 shadow-lg shadow-black/5 backdrop-blur-xl">
        <Loader2 className="h-5 w-5 animate-spin text-[#7A1E33]" />
        <span className="ml-2 text-sm text-slate-500">Memuat...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-200/60 bg-rose-50/70 p-12 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
        <AlertCircle className="h-6 w-6 text-rose-500" />
        <p className="text-sm text-rose-700">{loadError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-rose-300 bg-white/60 px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors duration-200 hover:bg-white/90"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!hasAnyUsers) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/40 bg-white/60 p-12 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-sm text-slate-500">Belum ada user.</p>
        <button
          type="button"
          onClick={onAddUser}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729]"
        >
          <UserPlus className="h-4 w-4" />
          Tambah User
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-white/40 bg-white/60 p-12 text-center shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-sm text-slate-500">Tidak ada user yang sesuai dengan filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-white/40 bg-white/60 shadow-lg shadow-black/5 backdrop-blur-xl">
        <table className="min-w-full divide-y divide-slate-200/60">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {users.map((user, index) => {
              const isSelf = currentUserId !== null && user.id === currentUserId;
              const isBusy = busyUserId === user.id;

              return (
                <tr key={user.id} className="transition-colors duration-150 hover:bg-white/40">
                  <td className="px-4 py-3 text-sm text-slate-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{user.full_name || user.username}</span>
                      {isSelf && (
                        <span className="rounded-full bg-[#7A1E33] px-2 py-0.5 text-[10px] font-medium text-white">
                          Anda
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">{user.username}</td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      value={user.role}
                      disabled={isSelf || isBusy}
                      onChange={(event) =>
                        runAction(user.id, () => onRoleChange(user.id, event.target.value as UserRole))
                      }
                      title={isSelf ? 'Tidak bisa mengubah role akun sendiri' : undefined}
                      className="rounded-lg border border-[#7A1E33]/20 bg-[#7A1E33]/10 px-2 py-1 text-xs font-medium text-[#7A1E33] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {ROLE_ORDER.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                        user.is_active
                          ? 'border-emerald-200/60 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200/60 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.is_active ? (
                      <button
                        type="button"
                        disabled={isSelf || isBusy}
                        title={isSelf ? 'Tidak bisa menonaktifkan akun sendiri' : undefined}
                        onClick={() => setPendingDeactivateId(user.id)}
                        className="rounded-lg border border-white/60 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Nonaktifkan
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => runAction(user.id, () => onStatusChange(user.id, true))}
                        className="rounded-lg border border-[#7A1E33]/30 bg-[#7A1E33]/10 px-3 py-1.5 text-xs font-medium text-[#7A1E33] transition-colors duration-200 hover:bg-[#7A1E33]/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Aktifkan
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {userToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-base font-semibold text-slate-900">Nonaktifkan user ini?</h2>
            <p className="mt-2 text-sm text-slate-600">
              User yang dinonaktifkan tidak dapat menggunakan akun sampai diaktifkan kembali.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDeactivateId(null)}
                className="rounded-lg border border-white/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-white/80"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = pendingDeactivateId;
                  setPendingDeactivateId(null);
                  if (id) runAction(id, () => onStatusChange(id, false));
                }}
                className="rounded-lg bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729]"
              >
                Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
