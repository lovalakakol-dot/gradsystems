'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  CURRENCIES,
  DIVISIONS,
  TYPE_LABELS,
  emptyCashbookForm,
  maskDateInput,
  parseDDMMYYYYToISODate,
  validateCashbookForm,
} from './types';
import type { CashbookFormData, CashbookFormErrors, CreateCashbookInput } from './types';

interface CashbookFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateCashbookInput) => Promise<{ success: boolean; error: string | null }>;
}

const TYPE_OPTIONS: CashbookFormData['type'][] = ['income', 'expense'];

export function CashbookForm({ open, onClose, onSubmit }: CashbookFormProps) {
  const [form, setForm] = useState<CashbookFormData>(emptyCashbookForm);
  const [errors, setErrors] = useState<CashbookFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    if (submitting) return;
    setForm(emptyCashbookForm());
    setErrors({});
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validateCashbookForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Guaranteed non-null here — validateCashbookForm already checked
    // parseDDMMYYYYToISODate() succeeds.
    const isoDate = parseDDMMYYYYToISODate(form.transaction_date) as string;

    setSubmitting(true);
    const { success, error } = await onSubmit({
      transaction_date: isoDate,
      type: form.type,
      description: form.description.trim(),
      division: form.division,
      currency: form.currency,
      amount: Number(form.amount),
      attachment_url: form.attachment_url.trim() || null,
    });
    setSubmitting(false);

    if (success) {
      setForm(emptyCashbookForm());
      setErrors({});
    } else {
      setErrors({ form: error ?? 'Gagal menambahkan transaksi. Coba lagi.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Tambah Transaksi</h2>
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
              Tanggal Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.transaction_date}
              onChange={(event) => setForm({ ...form, transaction_date: maskDateInput(event.target.value) })}
              placeholder="DD/MM/YYYY"
              maxLength={10}
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            />
            {errors.transaction_date && (
              <p className="mt-1 text-xs text-rose-600">{errors.transaction_date}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tipe <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as CashbookFormData['type'] })}
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            >
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Keterangan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Pembelian konsumsi"
              className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Divisi <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.division}
              onChange={(event) =>
                setForm({ ...form, division: event.target.value as CashbookFormData['division'] })
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
                  setForm({ ...form, currency: event.target.value as CashbookFormData['currency'] })
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
                Nominal <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-900 backdrop-blur transition-colors duration-200 focus:border-[#7A1E33]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
              />
              {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Bukti Nota (URL)</label>
            <input
              type="text"
              value={form.attachment_url}
              onChange={(event) => setForm({ ...form, attachment_url: event.target.value })}
              placeholder="Opsional — tautan bukti nota"
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
