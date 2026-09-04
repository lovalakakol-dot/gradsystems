'use client';

import { CURRENCIES, type Currency } from './types';

export default function CurrencySelector({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (currency: Currency) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Pilih mata uang"
      className="inline-flex rounded-xl border border-white/40 bg-white/60 p-1 backdrop-blur-xl"
    >
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          role="tab"
          aria-selected={value === c}
          onClick={() => onChange(c)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
            value === c ? 'bg-[#7A1E33] text-white shadow-sm' : 'text-gray-700 hover:bg-white/80'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
