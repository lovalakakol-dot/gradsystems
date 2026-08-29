import type { ReactNode, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export function Table({ children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Actual scroll happens here, one level in — the outer div above
          only keeps overflow-hidden for the rounded corners/border, it
          must never carry the scroll itself or the corners get clipped
          mid-scroll. min-w-full (not w-full) lets the table grow wider
          than its container when columns need the space, which is what
          actually gives this div something to scroll on small screens. */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm" {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function Th({ children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className="whitespace-nowrap px-4 py-3 font-medium" {...props}>
      {children}
    </th>
  );
}

export function Td({ children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className="whitespace-nowrap px-4 py-3" {...props}>
      {children}
    </td>
  );
}