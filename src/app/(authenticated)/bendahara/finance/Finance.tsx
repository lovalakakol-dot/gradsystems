'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import LoadingState from '@/shared/components/LoadingState';
import EmptyState from '@/shared/components/EmptyState';
import { calculateDivisionBreakdown, calculateFinancialSummary } from '@/features/finance/calculations';
import { ALL_DIVISIONS, DIVISIONS, type CashbookEntryRow, type Currency, type DivisionFilter, type RabItemRow } from '@/features/finance/types';
import CurrencySelector from '@/features/finance/CurrencySelector';
import FinanceSummary from '@/features/finance/FinanceSummary';
import DivisionBreakdown from '@/features/finance/DivisionBreakdown';

export default function Finance({
  rabItems,
  cashbookEntries,
}: {
  rabItems: RabItemRow[];
  cashbookEntries: CashbookEntryRow[];
}) {
  const [currency, setCurrency] = useState<Currency>('EGP');
  const [divisionFilter, setDivisionFilter] = useState<DivisionFilter>(ALL_DIVISIONS);
  const [isPending, startTransition] = useTransition();

  // Derived data only — nothing here is written back to rab_items or
  // cashbook_entries. Switching currency/division only changes which
  // already-computed numbers are visible, never how they're computed.
  const summary = useMemo(() => calculateFinancialSummary(cashbookEntries), [cashbookEntries]);

  const breakdown = useMemo(
    () => calculateDivisionBreakdown(rabItems, cashbookEntries, currency),
    [rabItems, cashbookEntries, currency]
  );

  const visibleBreakdown = useMemo(
    () => (divisionFilter === ALL_DIVISIONS ? breakdown : breakdown.filter((r) => r.division === divisionFilter)),
    [breakdown, divisionFilter]
  );

  const hasAnyData = rabItems.length > 0 || cashbookEntries.length > 0;
  const hasBudgetData = rabItems.some((i) => i.currency === currency);
  const hasRealizationData = cashbookEntries.some((e) => e.type === 'expense' && e.currency === currency);

  function handleCurrencyChange(next: Currency) {
    startTransition(() => setCurrency(next));
  }

  if (!hasAnyData) {
    return <EmptyState message="Belum ada data keuangan." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CurrencySelector value={currency} onChange={handleCurrencyChange} />
        <div className="flex gap-4 text-xs text-gray-500">
          <Link href="/bendahara/rab" className="hover:text-[#7A1E33] hover:underline">
            Ubah data RAB
          </Link>
          <Link href="/bendahara/cashbook" className="hover:text-[#7A1E33] hover:underline">
            Ubah data Buku Kas
          </Link>
        </div>
      </div>

      {isPending ? (
        <LoadingState label="Memuat data..." />
      ) : (
        <>
          <FinanceSummary currency={currency} totals={summary[currency]} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-gray-700">Breakdown per Divisi ({currency})</h2>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value as DivisionFilter)}
              className="rounded-lg border border-white/40 bg-white/60 px-3 py-1.5 text-sm text-gray-900 backdrop-blur-xl focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33]"
            >
              <option value={ALL_DIVISIONS}>{ALL_DIVISIONS}</option>
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <DivisionBreakdown
            currency={currency}
            rows={visibleBreakdown}
            hasBudgetData={hasBudgetData}
            hasRealizationData={hasRealizationData}
          />
        </>
      )}
    </div>
  );
}
