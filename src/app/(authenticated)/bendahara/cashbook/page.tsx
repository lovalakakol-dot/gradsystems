import { getCashbookEntries } from '@/features/cashbook/Getcashbookentries';
import Cashbook from './cashbook';

export default async function CashbookPage() {
  const { entries, hasError } = await getCashbookEntries();
  return <Cashbook initialEntries={entries} hasError={hasError} />;
}