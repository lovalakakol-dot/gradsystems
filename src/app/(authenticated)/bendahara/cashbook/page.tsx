import type { Metadata } from 'next';
import { Cashbook } from './Cashbook';

export const metadata: Metadata = {
  title: 'Buku Kas Digital — Wisuda Management Tools',
};

export default function CashbookPage() {
  return <Cashbook />;
}
