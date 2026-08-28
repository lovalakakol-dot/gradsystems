'use client';

import { useState, type ReactNode } from 'react';
import Sidebar from './sidebar';
import Header from './Header';
import type { ProfileRow } from '../../types/database.types';

export default function AppShell({
  profile,
  children,
}: {
  profile: ProfileRow;
  children: ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        role={profile.role}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          profile={profile}
          onToggleCollapse={() => setIsCollapsed((v) => !v)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}