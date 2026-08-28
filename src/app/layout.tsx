import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Wisuda Management Tools',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}