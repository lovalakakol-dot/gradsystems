'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import Modal from '../../shared/components/Modal';
import { createUser } from './Adminuseractions';
import type { UserRole } from '@/types/database.types';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  bendahara: 'Bendahara',
  pendataan: 'Pendataan',
  acara: 'Acara',
};
const ROLE_OPTIONS: UserRole[] = ['admin', 'bendahara', 'pendataan', 'acara'];

export default function CreateUserModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (username: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('bendahara');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await createUser({ username, full_name: fullName, role, password });
      onSuccess(username);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal membuat user.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Class re-usable untuk input agar teks hitam pekat
  const inputStyle = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7A1E33] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500";

  return (
    <Modal title="Buat User Baru" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Username">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputStyle}
            placeholder="mis. ahmad"
            required
            disabled={isSubmitting}
          />
        </Field>
        <Field label="Nama Lengkap">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputStyle}
            required
            disabled={isSubmitting}
          />
        </Field>
        <Field label="Role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={inputStyle}
            disabled={isSubmitting}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r} className="text-gray-900 bg-white">
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Password Awal">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputStyle}
            placeholder="Minimal 8 karakter"
            required
            minLength={8}
            disabled={isSubmitting}
          />
        </Field>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white hover:bg-[#932347] disabled:opacity-60"
          >
            {isSubmitting ? 'Menyimpan...' : 'Buat User'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-900">{label}</span>
      {children}
    </label>
  );
}