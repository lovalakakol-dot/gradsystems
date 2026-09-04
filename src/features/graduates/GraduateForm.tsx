'use client';

import { useState, useMemo, useRef, useEffect, type FormEvent } from 'react';
import Select from '@/shared/components/Select';
import Button from '@/shared/components/Button';
import InlineAlert from '@/shared/components/InlineAlert';
import { COUNTRIES } from './countries';
import { useGraduateMutations, normalizeWhatsappNumber } from './useGraduateMutations';
import {
  ATTIRE_LABELS,
  ATTIRES,
  GENDER_LABELS,
  SHIRT_SIZES,
  SHIRT_SIZE_LABELS,
  VERIFICATION_LABELS,
  VERIFICATION_STATUSES,
  type Attire,
  type Gender,
  type ShirtSize,
  type VerificationStatus,
} from './types';

interface FieldErrors {
  full_name_ar?: string;
  gender?: string;
  country_code?: string;
  whatsapp_number?: string;
  attire?: string;
  shirt_size?: string;
  verification_status?: string;
}

export default function GraduateForm({ onSuccess }: { onSuccess: () => void }) {
  const { createGraduate, isCreating } = useGraduateMutations();

  const [fullNameAr, setFullNameAr] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [countryCode, setCountryCode] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [attire, setAttire] = useState<Attire | ''>('');
  const [shirtSize, setShirtSize] = useState<ShirtSize | ''>('');
  const [verification, setVerification] = useState<VerificationStatus | ''>('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Combobox State untuk Negara
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const comboboxRef = useRef<HTMLDivElement>(null);

  const selectedCountry = useMemo(() => {
    return COUNTRIES.find((c) => c.code === countryCode);
  }, [countryCode]);

  const filteredCountries = useMemo(() => {
    if (!countryQuery.trim()) return COUNTRIES;
    const q = countryQuery.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.nameAr.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countryQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!fullNameAr.trim()) next.full_name_ar = 'Nama wajib diisi.';
    if (!gender) next.gender = 'Jenis kelamin wajib dipilih.';
    if (!countryCode) next.country_code = 'Negara wajib dipilih.';

    const digits = normalizeWhatsappNumber(whatsapp);
    if (!whatsapp.trim()) {
      next.whatsapp_number = 'Nomor WhatsApp wajib diisi.';
    } else if (digits.length < 8 || digits.length > 15) {
      next.whatsapp_number = 'Nomor WhatsApp tidak valid.';
    }

    if (!attire) next.attire = 'Atribut wisuda wajib dipilih.';
    if (!shirtSize) next.shirt_size = 'Ukuran baju wajib dipilih.';
    if (!verification) next.verification_status = 'Status berkas wajib dipilih.';
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const { error } = await createGraduate({
      full_name_ar: fullNameAr.trim(),
      gender: gender as Gender,
      country_code: countryCode,
      whatsapp_number: normalizeWhatsappNumber(whatsapp),
      attire: attire as Attire,
      shirt_size: shirtSize as ShirtSize,
      verification_status: verification as VerificationStatus,
    });

    if (error) {
      setSubmitError(error);
      return;
    }

    setFullNameAr('');
    setGender('');
    setCountryCode('');
    setCountryQuery('');
    setWhatsapp('');
    setAttire('');
    setShirtSize('');
    setVerification('');
    setErrors({});
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
      {/* Group 1: Informasi Pribadi */}
      <div className="space-y-4">
        <div className="border-b border-gray-200/80 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Informasi Pribadi
          </h3>
        </div>

        {/* 1. Nama Lengkap — Full Width */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            dir="rtl"
            lang="ar"
            value={fullNameAr}
            onChange={(e) => setFullNameAr(e.target.value)}
            disabled={isCreating}
            placeholder="أحمد محمد"
            className={`block h-10 w-full rounded-lg border bg-white px-3 text-right font-['Amiri',serif] text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33]/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.full_name_ar ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
            }`}
          />
          {errors.full_name_ar && (
            <p className="mt-1 text-xs text-red-600">{errors.full_name_ar}</p>
          )}
        </div>

        {/* Grid 3 Kolom Presisi Sejajar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-start">
          {/* 2. Jenis Kelamin */}
          <div className="flex flex-col">
            <Select
              label="Jenis Kelamin"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              disabled={isCreating}
            >
              <option value="">Pilih Jenis Kelamin</option>
              {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABELS[g]}
                </option>
              ))}
            </Select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
            )}
          </div>

          {/* 3. Asal Negara (Searchable Combobox) */}
          <div className="relative flex flex-col" ref={comboboxRef}>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Asal Negara <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Pilih atau cari negara..."
                value={isCountryOpen ? countryQuery : selectedCountry ? `${selectedCountry.nameAr} (${selectedCountry.code})` : ''}
                onFocus={() => {
                  setIsCountryOpen(true);
                  setCountryQuery('');
                }}
                onChange={(e) => {
                  setCountryQuery(e.target.value);
                  if (!isCountryOpen) setIsCountryOpen(true);
                }}
                disabled={isCreating}
                className={`block h-9 w-full rounded-lg border bg-white px-3 text-xs text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33]/30 disabled:cursor-not-allowed disabled:opacity-60 ${
                  errors.country_code ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {isCountryOpen && (
              <div className="absolute top-full left-0 z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-xs shadow-lg ring-1 ring-black/5">
                {filteredCountries.length === 0 ? (
                  <div className="px-3 py-2 text-gray-400">Negara tidak ditemukan</div>
                ) : (
                  filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCountryCode(c.code);
                        setIsCountryOpen(false);
                        setCountryQuery('');
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-[#7A1E33]/5 hover:text-[#7A1E33] ${
                        countryCode === c.code ? 'bg-[#7A1E33]/10 font-semibold text-[#7A1E33]' : 'text-gray-700'
                      }`}
                    >
                      <span dir="rtl" className="font-['Amiri',serif] text-sm">{c.nameAr}</span>
                      <span className="text-[10px] font-mono text-gray-400">{c.code}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {errors.country_code && (
              <p className="mt-1 text-xs text-red-600">{errors.country_code}</p>
            )}
          </div>

          {/* 4. Nomor WhatsApp */}
          <div className="relative flex flex-col">
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              disabled={isCreating}
              placeholder="201012345678"
              className={`block h-9 w-full rounded-lg border bg-white px-3 text-xs text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33]/30 disabled:cursor-not-allowed disabled:opacity-60 ${
                errors.whatsapp_number ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.whatsapp_number ? (
              <p className="mt-1 text-xs text-red-600">{errors.whatsapp_number}</p>
            ) : (
              <p className="mt-1 text-right text-[10px] text-gray-400">
                Tanpa kode + (misal: 20... / 62...)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Group 2: Atribut & Status Berkas */}
      <div className="space-y-4 pt-1">
        <div className="border-b border-gray-200/80 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Atribut & Status Berkas
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-start">
          {/* 5. Atribut Wisuda */}
          <div>
            <Select
              label="Atribut Wisuda"
              value={attire}
              onChange={(e) => setAttire(e.target.value as Attire)}
              disabled={isCreating}
            >
              <option value="">Pilih Atribut</option>
              {ATTIRES.map((a) => (
                <option key={a} value={a}>
                  {ATTIRE_LABELS[a]}
                </option>
              ))}
            </Select>
            {errors.attire && (
              <p className="mt-1 text-xs text-red-600">{errors.attire}</p>
            )}
          </div>

          {/* 6. Ukuran Baju */}
          <div>
            <Select
              label="Ukuran Baju"
              value={shirtSize}
              onChange={(e) => setShirtSize(e.target.value as ShirtSize)}
              disabled={isCreating}
            >
              <option value="">Pilih Ukuran</option>
              {SHIRT_SIZES.map((s) => (
                <option key={s} value={s}>
                  {SHIRT_SIZE_LABELS[s]}
                </option>
              ))}
            </Select>
            {errors.shirt_size && (
              <p className="mt-1 text-xs text-red-600">{errors.shirt_size}</p>
            )}
          </div>

          {/* 7. Berkas Terverifikasi */}
          <div>
            <Select
              label="Status Berkas"
              value={verification}
              onChange={(e) => setVerification(e.target.value as VerificationStatus)}
              disabled={isCreating}
            >
              <option value="">Pilih Status</option>
              {VERIFICATION_STATUSES.map((v) => (
                <option key={v} value={v}>
                  {VERIFICATION_LABELS[v]}
                </option>
              ))}
            </Select>
            {errors.verification_status && (
              <p className="mt-1 text-xs text-red-600">{errors.verification_status}</p>
            )}
          </div>
        </div>
      </div>

      {submitError && <InlineAlert message={submitError} />}

      <div className="flex items-center justify-end pt-3 border-t border-gray-100">
        <Button type="submit" isLoading={isCreating} className="w-full sm:w-auto px-6 py-2 text-xs">
          {isCreating ? 'Menyimpan...' : 'Tambah Wisudawan'}
        </Button>
      </div>
    </form>
  );
}