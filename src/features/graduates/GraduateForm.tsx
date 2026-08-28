'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRIES_UNIQUE, getCountryNameAr } from './countries';
import { useGraduateMutations } from './Usegraduatemutations';
import {
  DEFAULT_GRADUATE_FORM_VALUES,
  SHIRT_SIZE_LABEL,
  VERIFICATION_STATUS_LABEL,
  type GraduateFormErrors,
  type GraduateFormValues,
  type ShirtSize,
  type VerificationStatus,
} from './types';

const INPUT_CLASS =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33]';

function validate(values: GraduateFormValues): GraduateFormErrors {
  const errors: GraduateFormErrors = {};
  if (values.participant_number.trim().length === 0) {
    errors.participant_number = 'Nomor peserta wajib diisi.';
  }
  if (values.full_name_ar.trim().length === 0) {
    errors.full_name_ar = 'Nama lengkap (Arab) wajib diisi.';
  }
  if (values.country_code.trim().length === 0) {
    errors.country_code = 'Asal negara wajib dipilih.';
  }
  if (values.shirt_size === '') {
    errors.shirt_size = 'Ukuran baju wajib dipilih.';
  }
  const whatsappDigits = values.whatsapp_number.replace(/[^\d]/g, '');
  if (whatsappDigits.length === 0) {
    errors.whatsapp_number = 'Nomor WhatsApp wajib diisi.';
  } else if (whatsappDigits.length < 8) {
    errors.whatsapp_number = 'Nomor WhatsApp tidak valid.';
  }
  return errors;
}

function CountrySelect({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (code: string) => void;
  hasError: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES_UNIQUE;
    return COUNTRIES_UNIQUE.filter((c) => c.nameAr.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm ${
          hasError ? 'border-red-400' : 'border-gray-300'
        } ${value ? 'text-gray-900' : 'text-gray-500'}`}
      >
        <span dir="rtl" className="truncate">
          {value ? getCountryNameAr(value) : 'Pilih negara'}
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari negara..."
              className="w-full text-sm text-gray-900 focus:outline-none"
              dir="rtl"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-500">Negara tidak ditemukan.</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-right text-sm text-gray-900 hover:bg-gray-50"
                  dir="rtl"
                >
                  {c.nameAr}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GraduateForm({ onSuccess }: { onSuccess: () => void }) {
  const { createGraduate, isCreating } = useGraduateMutations();
  const [values, setValues] = useState<GraduateFormValues>(DEFAULT_GRADUATE_FORM_VALUES);
  const [errors, setErrors] = useState<GraduateFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    const { error } = await createGraduate(values);
    if (error) {
      setSubmitError(error);
      return;
    }
    setValues(DEFAULT_GRADUATE_FORM_VALUES);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 1. No. Peserta */}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-gray-500">No. Peserta</label>
        <input
          value={values.participant_number}
          onChange={(e) => setValues((v) => ({ ...v, participant_number: e.target.value }))}
          placeholder="Contoh: 014"
          className={`${INPUT_CLASS} ${errors.participant_number ? 'border-red-400' : ''}`}
        />
        {errors.participant_number && (
          <p className="mt-1 text-xs text-red-600">{errors.participant_number}</p>
        )}
      </div>

      {/* 2. Nama Lengkap (Arab) */}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-gray-500">Nama Lengkap (Arab)</label>
        <input
          value={values.full_name_ar}
          onChange={(e) => setValues((v) => ({ ...v, full_name_ar: e.target.value }))}
          dir="rtl"
          placeholder="الاسم الكامل"
          className={`${INPUT_CLASS} ${errors.full_name_ar ? 'border-red-400' : ''}`}
        />
        {errors.full_name_ar && <p className="mt-1 text-xs text-red-600">{errors.full_name_ar}</p>}
      </div>

      {/* 3. Asal Negara */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Asal Negara</label>
        <CountrySelect
          value={values.country_code}
          onChange={(code) => setValues((v) => ({ ...v, country_code: code }))}
          hasError={Boolean(errors.country_code)}
        />
        {errors.country_code && <p className="mt-1 text-xs text-red-600">{errors.country_code}</p>}
      </div>

      {/* 4. Ukuran Baju */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Ukuran Baju</label>
        <select
          value={values.shirt_size}
          onChange={(e) =>
            setValues((v) => ({ ...v, shirt_size: e.target.value as ShirtSize | '' }))
          }
          className={`${INPUT_CLASS} ${errors.shirt_size ? 'border-red-400' : ''}`}
        >
          <option value="">Pilih ukuran</option>
          {(Object.entries(SHIRT_SIZE_LABEL) as [ShirtSize, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.shirt_size && <p className="mt-1 text-xs text-red-600">{errors.shirt_size}</p>}
      </div>

      {/* 5. No. WhatsApp */}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-gray-500">No. WhatsApp</label>
        <input
          value={values.whatsapp_number}
          onChange={(e) => setValues((v) => ({ ...v, whatsapp_number: e.target.value }))}
          type="tel"
          placeholder="Contoh: 6281234567890 (kode negara, tanpa +)"
          className={`${INPUT_CLASS} ${errors.whatsapp_number ? 'border-red-400' : ''}`}
        />
        {errors.whatsapp_number ? (
          <p className="mt-1 text-xs text-red-600">{errors.whatsapp_number}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">
            Gunakan format internasional tanpa tanda +, contoh 6281234567890.
          </p>
        )}
      </div>

      {/* 6. Berkas Terverifikasi */}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-gray-500">Berkas Terverifikasi</label>
        <select
          value={values.verification_status}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              verification_status: e.target.value as VerificationStatus,
            }))
          }
          className={INPUT_CLASS}
        >
          {(Object.entries(VERIFICATION_STATUS_LABEL) as [VerificationStatus, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
      </div>

      {submitError && (
        <p className="sm:col-span-2 text-sm text-red-600">{submitError}</p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isCreating}
          className="rounded-md bg-[#7A1E33] px-4 py-2 text-sm font-medium text-white hover:bg-[#651729] disabled:opacity-60"
        >
          {isCreating ? 'Menyimpan...' : 'Simpan Wisudawan'}
        </button>
      </div>
    </form>
  );
}
