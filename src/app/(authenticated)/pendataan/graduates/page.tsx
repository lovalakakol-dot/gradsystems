import { getGraduates } from '@/features/graduates/Getgraduates';
import GraduatesBuilder from './GraduatesBuilder';

// Route protection (role gating) is handled by the existing
// proxy.ts + navConfig mechanism — nothing new added here, per
// scope lock. RLS (graduates_select_pendataan) is the real
// enforcement boundary regardless.
export default async function GraduatesPage() {
  const { entries, hasError } = await getGraduates();
  return <GraduatesBuilder initialEntries={entries} hasError={hasError} />;
}
