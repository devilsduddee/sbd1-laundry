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
  { to: '/', label: 'Daftar Pesanan', shortLabel: 'Pesanan', icon: ClipboardList },
  { to: '/pesanan/baru', label: 'Buat Pesanan', shortLabel: 'Buat Baru', icon: PlusCircle, allowedRoles: ['Admin', 'Kasir'] },
  { to: '/pelanggan', label: 'Data Pelanggan', shortLabel: 'Pelanggan', icon: Users, allowedRoles: ['Admin', 'Kasir'] },
  { to: '/layanan', label: 'Data Layanan', shortLabel: 'Layanan', icon: Shirt },
  { to: '/laporan', label: 'Laporan Transaksi', shortLabel: 'Laporan', icon: BarChart3, allowedRoles: ['Admin'] },
  { to: '/petugas', label: 'Kelola Petugas', shortLabel: 'Petugas', icon: ShieldCheck, allowedRoles: ['Admin'] },
];

const getMobileNavItems = (role?: LevelPtgs): NavItem[] => {
  if (role === 'Admin') {
    return [
      { to: '/', label: 'Daftar Pesanan', shortLabel: 'Pesanan', icon: ClipboardList },
      { to: '/pesanan/baru', label: 'Buat Pesanan', shortLabel: 'Buat Baru', icon: PlusCircle },
      { to: '/pelanggan', label: 'Data Pelanggan', shortLabel: 'Pelanggan', icon: Users },
      { to: '/layanan', label: 'Data Layanan', shortLabel: 'Layanan', icon: Shirt },
      { to: '/laporan', label: 'Laporan Transaksi', shortLabel: 'Laporan', icon: BarChart3 },
      { to: '/petugas', label: 'Kelola Petugas', shortLabel: 'Petugas', icon: ShieldCheck },
    ];
  }

  if (role === 'Kasir') {
    return [
      { to: '/', label: 'Daftar Pesanan', shortLabel: 'Pesanan', icon: ClipboardList },
      { to: '/pesanan/baru', label: 'Buat Pesanan', shortLabel: 'Buat Baru', icon: PlusCircle },
      { to: '/pelanggan', label: 'Data Pelanggan', shortLabel: 'Pelanggan', icon: Users },
      { to: '/layanan', label: 'Data Layanan', shortLabel: 'Layanan', icon: Shirt },
    ];
  }

  // Operasional: Khusus Pantau Cucian & Katalog Layanan (Tanpa Akses Pembuatan Tiket)
  return [
    { to: '/', label: 'Daftar Pesanan', shortLabel: 'Pesanan', icon: ClipboardList },
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
    <div className="min-h-screen bg-[#F5F6FA] text-[#1A1A2E] flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar (print:hidden) */}
      <aside className="print:hidden hidden md:flex flex-col w-64 bg-white border-r border-[#E4E7F2] p-5 sticky top-0 h-screen shrink-0 justify-between">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <QwashLogo variant="symbol" size="sm" className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-[#1A1A2E] leading-tight tracking-tight">
                Qwash Laundry
              </h1>
              <p className="text-xs text-muted-foreground">Sistem Pengelolaan</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {desktopFilteredItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/'
                  ? location.pathname === '/' || location.pathname === '/pesanan'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all touch-manipulation active:scale-[0.98]',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-[#4B5563] hover:bg-[#EEF0F8] hover:text-[#1A1A2E]'
                  )}
                >
                  <Icon className={cn('size-4 shrink-0', isActive ? 'text-white' : 'text-[#6B7280]')} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Desktop */}
        <div className="pt-4 border-t border-[#E4E7F2] flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1A1A2E] leading-tight">
                {user?.nm_ptgs}
              </span>
              <span className="text-[11px] text-muted-foreground">
                @{user?.usernm} &bull;{' '}
                <span className="font-semibold text-indigo-600">{user?.level}</span>
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl h-9 text-xs font-semibold touch-manipulation active:scale-[0.98]"
          >
            <LogOut className="size-3.5" />
            Keluar Sesi
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header (Ramping & Bersih, print:hidden) */}
      <header className="print:hidden md:hidden flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-[#E4E7F2] px-4 h-14 sticky top-0 z-30 pt-safe">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <QwashLogo variant="symbol" size="sm" className="text-white" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-xs text-[#1A1A2E] block">
              {user?.nm_ptgs}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Peran: <strong className="text-indigo-600">{user?.level}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.level === 'Admin' && (
            <NavLink
              to="/petugas"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all touch-manipulation active:scale-95',
                location.pathname.startsWith('/petugas')
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
              )}
            >
              <ShieldCheck className="size-3.5 shrink-0" />
              <span className="text-[11px]">Petugas</span>
            </NavLink>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2.5 text-xs rounded-lg gap-1.5 font-medium touch-manipulation active:scale-95"
            title="Keluar dari sesi"
          >
            <LogOut className="size-3.5" />
            <span className="text-[11px]">Keluar</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area (diberi pb-24 pada mobile agar tidak tertutup Bottom Bar) */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Sama Rata & Simetris, print:hidden) */}
      <nav
        aria-label="Navigasi Bawah Ponsel"
        className="print:hidden md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E4E7F2] pb-safe shadow-lg shadow-black/5"
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
              item.to === '/'
                ? location.pathname === '/' || location.pathname === '/pesanan'
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'group flex flex-col items-center justify-center h-full py-1.5 px-0.5 touch-manipulation select-none min-w-0 transition-transform duration-150 active:scale-[0.94]',
                  isActive ? 'text-indigo-600' : 'text-[#6B7280] hover:text-[#1A1A2E]'
                )}
              >
                <div
                  className={cn(
                    'p-1.5 rounded-xl transition-colors duration-150 flex items-center justify-center',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                      : 'text-[#6B7280] group-hover:bg-[#F3F4F6] group-hover:text-[#1A1A2E]'
                  )}
                >
                  <Icon className="size-5 shrink-0 stroke-[1.8]" />
                </div>
                <span
                  className={cn(
                    'text-[10px] tracking-tight leading-none mt-1 text-center truncate max-w-full px-0.5 transition-colors',
                    isActive ? 'font-bold text-indigo-600' : 'font-medium text-[#6B7280]'
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
