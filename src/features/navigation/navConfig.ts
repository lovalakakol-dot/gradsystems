import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  BookOpen,
  LineChart,
  GraduationCap,
  ListOrdered,
} from 'lucide-react';
import type { UserRole } from '../../types/database.types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Single source of truth for role -> navigation. Sidebar and
// Header both read from this; neither hardcodes role checks of
// its own.
const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: Users },
  ],
  bendahara: [
    { label: 'Dashboard', href: '/bendahara', icon: LayoutDashboard },
    { label: 'RAB Builder', href: '/bendahara/rab', icon: Wallet },
    { label: 'Buku Kas', href: '/bendahara/cashbook', icon: BookOpen },
    { label: 'Laporan Keuangan', href: '/bendahara/finance', icon: LineChart },
  ],
  pendataan: [
    { label: 'Dashboard', href: '/pendataan', icon: LayoutDashboard },
    { label: 'Database Wisudawan', href: '/pendataan/graduates', icon: GraduationCap },
  ],
  acara: [
    { label: 'Dashboard', href: '/acara', icon: LayoutDashboard },
    { label: 'Rundown Builder', href: '/acara/rundown', icon: ListOrdered },
  ],
};

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_BY_ROLE[role];
}