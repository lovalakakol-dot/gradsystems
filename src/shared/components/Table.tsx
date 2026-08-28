import type { ReactNode, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export function Table({ children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm" {...props}>
        {children}
      </table>
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
    <th className="px-4 py-3 font-medium" {...props}>
      {children}
    </th>
  );
}

export function Td({ children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className="px-4 py-3" {...props}>
      {children}
    </td>
  );
}