'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { CURRENCIES, DIVISIONS, EMPTY_RAB_FORM, validateRABForm } from './types';
import type { CreateRABInput, RABFormData, RABFormErrors } from './types';

interface RABFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateRABInput) => Promise<{ success: boolean; error: string | null }>;
}

export function RABForm({ open, onClose, onSubmit }: RABFormProps) {
  const [form, setForm] = useState<RABFormData>(EMPTY_RAB_FORM);
  const [errors, setErrors] = useState<RABFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    if (submitting) return;
    setForm(EMPTY_RAB_FORM);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validateRABForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    const { success, error } = await onSubmit({
      item_name: form.item_name.trim(),
      quantity: Number(form.quantity),
      unit: form.unit.trim(),
      division: form.division,
      currency: form.currency,
      estimated_cost: Number(form.estimated_cost),
      description: form.description.trim() || null,
    });
    setSubmitting(false);

    if (success) {
      setForm(EMPTY_RAB_FORM);
      setErrors({});
    } else {
      setErrors({ form: error ?? 'Gagal menambahkan item RAB. Coba lagi.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Tambah Item Anggaran</h2>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nama Item Anggaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.item_name}
              onChange={(event) => setForm({ ...form, item_name: event.target.value })}
              placeholder="Sewa Kursi"
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            />
            {errors.item_name && <p className="mt-1 text-xs text-rose-600">{errors.item_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
              />
              {errors.quantity && <p className="mt-1 text-xs text-rose-600">{errors.quantity}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                placeholder="pcs"
                className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
              />
              {errors.unit && <p className="mt-1 text-xs text-rose-600">{errors.unit}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Divisi <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.division}
              onChange={(event) =>
                setForm({ ...form, division: event.target.value as RABFormData['division'] })
              }
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            >
              {DIVISIONS.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mata Uang <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.currency}
                onChange={(event) =>
                  setForm({ ...form, currency: event.target.value as RABFormData['currency'] })
                }
                className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Estimasi Biaya <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.estimated_cost}
                onChange={(event) => setForm({ ...form, estimated_cost: event.target.value })}
                placeholder="Total, bukan harga satuan"
                className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
              />
              {errors.estimated_cost && (
                <p className="mt-1 text-xs text-rose-600">{errors.estimated_cost}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Catatan</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={2}
              placeholder="Opsional"
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            />
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
