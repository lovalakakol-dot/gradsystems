'use client';

import { CheckCircle2, XCircle, X } from 'lucide-react';

export interface ToastState {
  kind: 'success' | 'error';
  message: string;
}

export function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-start gap-2 rounded-md px-4 py-3 text-sm shadow-lg ${
        toast.kind === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {toast.kind === 'success' ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      <span className="flex-1">{toast.message}</span>
      <button onClick={onDismiss} aria-label="Tutup">
        <X className="h-4 w-4 opacity-70 hover:opacity-100" />
      </button>
    </div>
  );
}