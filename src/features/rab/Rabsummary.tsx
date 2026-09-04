interface RABSummaryProps {
  totalEGP: number;
  totalIDR: number;
}

// Comma-separated thousands for both currencies, matching Section 12's
// literal example ("EGP 5,000" / "IDR 2,500,000") — not locale-specific
// dot separators.
function formatAmount(currency: 'EGP' | 'IDR', value: number): string {
  return `${currency} ${new Intl.NumberFormat('en-US').format(Math.round(value))}`;
}

export function RABSummary({ totalEGP, totalIDR }: RABSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-white/40 bg-white/60 p-5 shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total EGP</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{formatAmount('EGP', totalEGP)}</p>
      </div>
      <div className="rounded-xl border border-white/40 bg-white/60 p-5 shadow-lg shadow-black/5 backdrop-blur-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total IDR</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{formatAmount('IDR', totalIDR)}</p>
      </div>
    </div>
  );
}
