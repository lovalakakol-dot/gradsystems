import { AlertCircle } from 'lucide-react';

/** Reusable inline feedback — used instead of browser alert(). */
export default function InlineAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}