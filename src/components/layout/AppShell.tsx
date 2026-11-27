import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ClipboardList,
  PlusCircle,
  Users,
  Shirt,
  ShieldCheck,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { QwashLogo } from '@/components/laundry/QwashLogo';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LevelPtgs } from '@shared/schemas';

interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  allowedRoles?: LevelPtgs[];
}

const DESKTOP_NAV_ITEMS: NavItem[] = [
  { to: '/pesanan', label: 'Daftar Pesanan', shortLabel: 'Pesanan', icon: ClipboardList },
  { to: '/pesanan/baru', label: 'Buat Pesanan', shortLabel: 'Buat Baru', icon: PlusCircle, allowedRoles: ['Admin', 'Kasir'] },
  { to: '/pelanggan', label: 'Data Pelanggan', shortLabel: 'Pelanggan', icon: Users, allowedRoles: ['Admin', 'Kasir'] },
  { to: '/layanan', label: 'Data Layanan', shortLabel: 'Layanan', icon: Shirt },
  { to: '/laporan', label: 'Laporan Transaksi', shortLabel: 'Laporan', icon: BarChart3, allowedRoles: ['Admin'] },
  { to: '/petugas', label: 'Kelola Petugas', shortLabel: 'Petugas', icon: ShieldCheck, allowedRoles: ['Admin'] },
];

const getMobileNavItems = (role?: LevelPtgs): NavItem[] => {
  if (role === 'Admin') {
    return [
      { to: '/pesanan', label: 'Daftar Pesanan', shortLabel: 'Pesanan', icon: ClipboardList },
      { to: '/pesanan/baru', label: 'Buat Pesanan', shortLabel: 'Buat Baru', icon: PlusCircle },
      { to: '/pelanggan', label: 'Data Pelanggan', shortLabel: 'Pelanggan', icon: Users },
      { to: '/layanan', label: 'Data Layanan', shortLabel: 'Layanan', icon: Shirt },
      { to: '/laporan', label: 'Laporan Transaksi', shortLabel: 'Laporan', icon: BarChart3 },
      { to: '/petugas', label: 'Kelola Petugas', shortLabel: 'Petugas', icon: ShieldCheck },
    ];
  }

  if (role === 'Kasir') {
    return [
      { to: '/pesanan', label: 'Daftar Pesanan', shortLabel: 'Pesanan', icon: ClipboardList },
      { to: '/pesanan/baru', label: 'Buat Pesanan', shortLabel: 'Buat Baru', icon: PlusCircle },
      { to: '/pelanggan', label: 'Data Pelanggan', shortLabel: 'Pelanggan', icon: Users },
      { to: '/layanan', label: 'Data Layanan', shortLabel: 'Layanan', icon: Shirt },
    ];
  }

  return [
    { to: '/pesanan', label: 'Daftar Pesanan', shortLabel: 'Pesanan', icon: ClipboardList },
    { to: '/layanan', label: 'Data Layanan', shortLabel: 'Layanan', icon: Shirt },
  ];
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const desktopFilteredItems = DESKTOP_NAV_ITEMS.filter(
    (item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.level))
  );

  const mobileNavItems = getMobileNavItems(user?.level);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#F6FFFF] via-[#F2F9F9] to-[#FAF3E8] text-[#071422] flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar (print:hidden) */}
      <aside className="print:hidden hidden md:flex flex-col w-64 bg-white/90 backdrop-blur-sm border-r border-[#D5E4E4] p-5 sticky top-0 h-screen shrink-0 justify-between">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="size-10 rounded-md bg-gradient-to-br from-[#00A2FF] to-[#006EB3] flex items-center justify-center text-white shrink-0">
              <QwashLogo variant="symbol" size="sm" className="text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm text-[#0B253B] leading-tight tracking-tight">
                Qwash Laundry
              </h1>
              <p className="text-xs text-[#425869]">Sistem Pengelolaan</p>
            </div>
          </div>

          {/* Navigation Links (Airy Neat Aqua Mist Active Pill) */}
          <nav className="flex flex-col gap-1" aria-label="Menu Utama">
            {desktopFilteredItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/pesanan'
                  ? location.pathname === '/pesanan'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs transition-colors touch-manipulation active:scale-[0.98]',
                    isActive
                      ? 'bg-[#D5ECEB] text-[#0B253B] font-semibold border border-[#B0D4D3]'
                      : 'text-[#425869] font-medium border border-transparent hover:bg-[#EFE2CE]/50 hover:text-[#0B253B]'
                  )}
                >
                  <Icon
                    className={cn(
                      'size-4 shrink-0 stroke-[1.75]',
                      isActive ? 'text-[#006EB3]' : 'text-[#425869]'
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Desktop */}
        <div className="pt-4 border-t border-[#D5E4E4] flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#071422] leading-tight truncate">
                {user?.nm_ptgs}
              </span>
              <span className="text-xs text-[#425869] font-mono mt-0.5 truncate">
                @{user?.usernm} |{' '}
                <span className="font-semibold text-[#006EB3] font-sans">{user?.level}</span>
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-center gap-2 text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEE2E2] border-[#FECACA] rounded-md h-9 text-xs font-semibold touch-manipulation active:scale-[0.98]"
          >
            <LogOut className="size-3.5 stroke-[1.75]" aria-hidden="true" />
            Keluar Sesi
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header (print:hidden) */}
      <header className="print:hidden md:hidden flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-[#D5E4E4] px-4 h-14 sticky top-0 z-30 pt-safe">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-md bg-gradient-to-br from-[#00A2FF] to-[#006EB3] flex items-center justify-center text-white shrink-0">
            <QwashLogo variant="symbol" size="sm" className="text-white" />
          </div>
          <div className="leading-tight min-w-0">
            <span className="font-semibold text-xs text-[#071422] block truncate">
              {user?.nm_ptgs}
            </span>
            <span className="text-xs text-[#425869] font-medium block">
              Peran: <strong className="text-[#006EB3]">{user?.level}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user?.level === 'Admin' && (
            <NavLink
              to="/petugas"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors touch-manipulation active:scale-95 min-h-[36px]',
                location.pathname.startsWith('/petugas')
                  ? 'bg-[#D5ECEB] text-[#0B253B] border border-[#B0D4D3]'
                  : 'bg-[#F6FFFF] text-[#0B253B] hover:bg-[#E8F2F2] border border-[#D5E4E4]'
              )}
            >
              <ShieldCheck className="size-3.5 shrink-0 text-[#006EB3]" aria-hidden="true" />
              <span className="text-xs">Petugas</span>
            </NavLink>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEE2E2] h-9 px-2.5 text-xs rounded-md gap-1.5 font-medium touch-manipulation active:scale-95"
            aria-label="Keluar dari sesi"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            <span className="text-xs">Keluar</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (print:hidden) */}
      <nav
        aria-label="Navigasi Bawah Ponsel"
        className="print:hidden md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#D5E4E4] pb-safe"
      >
        <div
          className={cn(
            'grid items-center h-16 px-1 max-w-md mx-auto',
            user?.level === 'Admin' && 'grid-cols-6',
            user?.level === 'Kasir' && 'grid-cols-4',
            user?.level === 'Operasional' && 'grid-cols-2',
            !user && 'grid-cols-2'
          )}
        >
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/pesanan'
                ? location.pathname === '/pesanan'
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'group flex flex-col items-center justify-center h-full py-1.5 px-0.5 touch-manipulation select-none min-w-0 transition-transform duration-150 active:scale-[0.94]',
                  isActive ? 'text-[#006EB3]' : 'text-[#425869] hover:text-[#071422]'
                )}
              >
                <div
                  className={cn(
                    'p-1.5 rounded-md transition-colors duration-150 flex items-center justify-center',
                    isActive
                      ? 'bg-[#D5ECEB] text-[#006EB3] border border-[#B0D4D3]'
                      : 'text-[#425869] group-hover:bg-[#EFE2CE]/50 group-hover:text-[#071422]'
                  )}
                >
                  <Icon className="size-4 shrink-0 stroke-[1.8]" aria-hidden="true" />
                </div>
                <span
                  className={cn(
                    'text-[11px] tracking-tight leading-none mt-1 text-center truncate max-w-full px-0.5 transition-colors',
                    isActive ? 'font-bold text-[#0B253B]' : 'font-medium text-[#425869]'
                  )}
                >
                  {item.shortLabel}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
