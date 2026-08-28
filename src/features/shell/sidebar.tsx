'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { getNavItemsForRole } from '../navigation/navConfig';
import type { UserRole } from '../../types/database.types';

export default function Sidebar({
  role,
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}: {
  role: UserRole;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const items = getNavItemsForRole(role);

  // Exact match only. A prefix match (pathname.startsWith(href))
  // would make the role-root "Dashboard" item (e.g. /admin) appear
  // active on every nested page too (/admin/users also starts with
  // /admin/) — every current route is a leaf page, so exact match
  // is both correct and simplest for this stage.
  const navList = (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-[#7A1E33]/10 text-[#7A1E33]'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-gray-200 bg-white transition-all md:block ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <span
            className={`truncate text-sm font-semibold text-gray-900 ${isCollapsed ? 'hidden' : ''}`}
          >
            Wisuda Management Tools
          </span>
        </div>
        {navList}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-gray-900/40" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
              <span className="text-sm font-semibold text-gray-900">Wisuda Management Tools</span>
              <button onClick={onCloseMobile} aria-label="Tutup menu">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {navList}
          </aside>
        </div>
      )}
    </>
  );
}