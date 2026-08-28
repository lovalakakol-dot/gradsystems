import { getCurrentProfile } from './getCurrentProfile';
import SignOutButton from './SignOutButton';
import type { UserRole } from '../../types/database.types';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  bendahara: 'Bendahara',
  pendataan: 'Pendataan',
  acara: 'Acara',
};

/**
 * Shared by every role's page.tsx — confirms auth/role resolution
 * end-to-end without building any real dashboard (RAB/Buku
 * Kas/Finance/Graduates/Rundown/Admin User Management are all out
 * of scope for this stage).
 */
export default async function RoleHomePlaceholder() {
  const { profile } = await getCurrentProfile();

  // Middleware already guarantees only an active, correctly-roled
  // user reaches this far — this is a defensive fallback, not the
  // real gate.
  if (!profile) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm text-gray-500">Masuk sebagai</p>
      <h1 className="text-xl font-semibold text-gray-900">
        {profile.full_name ?? profile.username}
      </h1>
      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
        {ROLE_LABEL[profile.role]}
      </span>
      <p className="mt-2 max-w-xs text-sm text-gray-500">
        Dashboard {ROLE_LABEL[profile.role]} akan dibangun di tahap berikutnya.
      </p>
      <SignOutButton />
    </div>
  );
}