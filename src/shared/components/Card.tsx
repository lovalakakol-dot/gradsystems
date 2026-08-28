import type { ReactNode } from 'react';

export default function Card({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-5 ${className}`}>
      {title && <h3 className="mb-3 text-sm font-medium text-gray-500">{title}</h3>}
      {children}
    </div>
  );
}