import type { Metadata } from 'next';
import { RABBuilder } from './RABBuilder';

export const metadata: Metadata = {
  title: 'RAB Builder — Wisuda Management Tools',
};

export default function RABBuilderPage() {
  return <RABBuilder />;
}
