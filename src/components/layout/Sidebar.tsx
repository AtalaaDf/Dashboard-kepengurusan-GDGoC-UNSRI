import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Squares2X2Icon,
  UserGroupIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/data/auth/auth-context';
import type { UserRole } from '@/types';
import { ANIMATIONS } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Squares2X2Icon,
    roles: ['superadmin', 'admin', 'executive', 'po'],
  },
  {
    name: 'Member',
    href: '/members',
    icon: UserGroupIcon,
    roles: ['superadmin', 'admin'],
  },
  {
    name: 'Event',
    href: '/events',
    icon: CalendarIcon,
    roles: ['superadmin', 'admin', 'po'],
  },
  {
    name: 'Kas',
    href: '/cash',
    icon: BanknotesIcon,
    roles: ['superadmin', 'executive'],
  },
];

export const Sidebar: React.FC = () => {
  const { role, signOut } = useAuth();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );

  const getRoleLabel = (r: UserRole | null): string => {
    switch (r) {
      case 'superadmin':
        return 'Superadmin';
      case 'admin':
        return 'Admin';
      case 'executive':
        return 'Executive (Treasurer)';
      case 'po':
        return 'Project Officer';
      default:
        return 'Pengguna';
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#1e1e1e]/10 p-5">
      <div className="flex items-center gap-3 pb-6 border-b border-[#1e1e1e]/10">
        <img
          src="/logoGDG.png"
          alt="GDG on Campus"
          className="h-8 w-auto object-contain"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#1e1e1e]">GDGoC UNSRI</span>
          <span className="text-xs text-[#1e1e1e]/60">Sistem Manajemen</span>
        </div>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setIsOpenMobile(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  ANIMATIONS.HOVER_TRANSITION,
                  isActive
                    ? 'bg-[#c3ecf6] text-[#4285f4]'
                    : 'text-[#1e1e1e] hover:bg-[#f0f0f0]'
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-[#1e1e1e]/10 flex flex-col gap-3">
        <div className="px-3.5 py-2 bg-[#f0f0f0] rounded-lg">
          <p className="text-xs text-[#1e1e1e]/60">Peran Aktif</p>
          <p className="text-sm font-medium text-[#1e1e1e] truncate">
            {getRoleLabel(role)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className={cn(
            'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#ea4335] hover:bg-[#f8d8d8]',
            ANIMATIONS.HOVER_TRANSITION
          )}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 rounded-lg bg-white border border-[#1e1e1e]/10 shadow-none text-[#1e1e1e]"
          aria-label="Buka Navigasi"
        >
          {isOpenMobile ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 animate-dialog-fade"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
};

