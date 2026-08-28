'use client';

import { usePathname } from 'next/navigation';
import { Menu, PanelLeft } from 'lucide-react';
import Badge from '../../shared/components/Badge';
import SignOutButton from '../auth/SignOutButton';
import { getNavItemsForRole } from '../navigation/navConfig';
import type { ProfileRow, UserRole } from '../../types/database.types';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  bendahara: 'Bendahara',
  pendataan: 'Pendataan',
  acara: 'Acara',
};

export default function Header({
  profile,
  onToggleCollapse,
  onOpenMobileNav,
}: {
  profile: ProfileRow;
  onToggleCollapse: () => void;
  onOpenMobileNav: () => void;
}) {
  const pathname = usePathname();
  const items = getNavItemsForRole(profile.role);
  // Same exact-match rule as Sidebar — see comment there.
  const current = items.find((item) => pathname === item.href);

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="text-gray-500 hover:text-gray-700 md:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleCollapse}
          className="hidden text-gray-400 hover:text-gray-600 md:block"
          aria-label="Ciutkan/lebarkan sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900">{current?.label ?? ''}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-900">
            {profile.full_name ?? profile.username}
          </p>
          <p className="text-xs text-gray-500">@{profile.username}</p>
        </div>
        <Badge variant="neutral">{ROLE_LABEL[profile.role]}</Badge>
        <SignOutButton />
      </div>
    </header>
  );
}