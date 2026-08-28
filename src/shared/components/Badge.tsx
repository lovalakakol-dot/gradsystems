import type { ReactNode } from 'react';

type Variant = 'neutral' | 'success' | 'danger';

const VARIANT_CLASSES: Record<Variant, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-gray-200 text-gray-600',
};

export default function Badge({
  children,
  variant = 'neutral',
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}