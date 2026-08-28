import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getCurrentProfile } from '@/features/auth/getCurrentProfile';
import AppShell from '@/features/shell/AppShell';

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { profile } = await getCurrentProfile();

  // Defensive fallback only — the root proxy already guarantees
  // only an active, correctly-roled user reaches this far in
  // normal operation. This should never actually trigger.
  if (!profile) {
    redirect('/login');
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}