'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { createUser } from './data';
import { EMPTY_CREATE_USER_FORM, ROLE_LABELS, ROLE_ORDER, validateCreateUserForm } from './types';
import type { CreateUserFormData, CreateUserFormErrors, UserRole } from './types';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateUserDialog({ open, onClose, onCreated }: CreateUserDialogProps) {
  const [form, setForm] = useState<CreateUserFormData>(EMPTY_CREATE_USER_FORM);
  const [errors, setErrors] = useState<CreateUserFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    if (submitting) return;
    setForm(EMPTY_CREATE_USER_FORM);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validateCreateUserForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    const { success, error } = await createUser(form);
    setSubmitting(false);

    if (success) {
      setForm(EMPTY_CREATE_USER_FORM);
      setErrors({});
      onCreated();
    } else {
      setErrors({ form: error ?? 'Gagal membuat user. Coba lagi.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Tambah User</h2>
          <button
            type="button"
            onClick={resetAndClose}
            disabled={submitting}
            className="rounded-lg p-1 text-slate-400 transition-colors duration-200 hover:bg-white/60 hover:text-slate-700 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors.form && (
            <div className="rounded-lg border border-rose-200/60 bg-rose-50/80 px-3 py-2 text-sm text-rose-700">
              {errors.form}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(event) => setForm({ ...form, full_name: event.target.value })}
              placeholder="Opsional"
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            />
            {errors.username && <p className="mt-1 text-xs text-rose-600">{errors.username}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            >
              {ROLE_ORDER.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            {errors.role && <p className="mt-1 text-xs text-rose-600">{errors.role}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Konfirmasi Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={form.confirm_password}
              onChange={(event) => setForm({ ...form, confirm_password: event.target.value })}
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            />
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-rose-600">{errors.confirm_password}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetAndClose}
              disabled={submitting}
              className="rounded-lg border border-white/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#7A1E33]/20 transition-colors duration-200 hover:bg-[#671729] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
