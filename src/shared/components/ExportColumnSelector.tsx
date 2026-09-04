'use client';

export interface ExportColumnOption<TKey extends string> {
  key: TKey;
  label: string;
}

interface ExportColumnSelectorProps<TKey extends string> {
  columns: readonly ExportColumnOption<TKey>[];
  selectedKeys: TKey[];
  onChange: (selectedKeys: TKey[]) => void;
  error?: string | null;
}

/**
 * Generic checkbox column-selector shared by RAB and Cashbook export
 * dialogs (Section 22's shared-component note). Selection is always
 * re-derived in the CALLER's canonical column order — clicking
 * checkboxes out of order never reorders the resulting array.
 */
export function ExportColumnSelector<TKey extends string>({
  columns,
  selectedKeys,
  onChange,
  error,
}: ExportColumnSelectorProps<TKey>) {
  const toggle = (key: TKey) => {
    if (selectedKeys.includes(key)) {
      onChange(selectedKeys.filter((selected) => selected !== key));
      return;
    }
    onChange(columns.map((column) => column.key).filter((k) => selectedKeys.includes(k) || k === key));
  };

  const selectAll = () => onChange(columns.map((column) => column.key));
  const clearAll = () => onChange([]);

  return (
    <div>
      <div className="space-y-1.5">
        {columns.map((column) => (
          <label
            key={column.key}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-900 transition-colors duration-150 hover:bg-white/40"
          >
            <input
              type="checkbox"
              checked={selectedKeys.includes(column.key)}
              onChange={() => toggle(column.key)}
              className="h-4 w-4 rounded border-slate-300 text-[#7A1E33] focus:outline-none focus:ring-2 focus:ring-[#7A1E33]/40"
            />
            {column.label}
          </label>
        ))}
      </div>

      <div className="mt-3 flex gap-4 text-xs font-medium">
        <button type="button" onClick={selectAll} className="text-[#7A1E33] hover:underline">
          Pilih Semua
        </button>
        <button type="button" onClick={clearAll} className="text-slate-500 hover:underline">
          Hapus Semua
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
