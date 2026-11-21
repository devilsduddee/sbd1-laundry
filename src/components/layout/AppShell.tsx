import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ClipboardList,
  PlusCircle,
  Users,
  Shirt,
  ShieldCheck,
  BarChart3,
  LogOut,
  Menu,
} from 'lucide-react';
import { QwashLogo } from '@/components/laundry/QwashLogo';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { LevelPtgs } from '@shared/schemas';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  allowedRoles?: LevelPtgs[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Daftar Pesanan', icon: ClipboardList },
  { to: '/pesanan/baru', label: 'Buat Pesanan', icon: PlusCircle, allowedRoles: ['Admin', 'Kasir'] },
  { to: '/pelanggan', label: 'Data Pelanggan', icon: Users, allowedRoles: ['Admin', 'Kasir'] },
  { to: '/layanan', label: 'Data Layanan', icon: Shirt },
  { to: '/petugas', label: 'Kelola Petugas', icon: ShieldCheck, allowedRoles: ['Admin'] },
  { to: '/laporan', label: 'Laporan Transaksi', icon: BarChart3, allowedRoles: ['Admin'] },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
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
          {NAV_ITEMS.filter((item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.level))).map(
            (item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-[#4B5563] hover:bg-[#EEF0F8] hover:text-[#1A1A2E]'
                  )}
                >
                  <Icon className={cn('size-4.5', isActive ? 'text-white' : 'text-[#6B7280]')} />
                  <span>{item.label}</span>
                </NavLink>
              );
            }
          )}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="pt-4 border-t border-border flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#1A1A2E] leading-tight">
              {user?.nm_ptgs}
            </span>
            <span className="text-xs text-muted-foreground">
              @{user?.usernm} •{' '}
              <span className="font-medium text-indigo-600">{user?.level}</span>
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <LogOut className="size-4" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar (print:hidden) */}
      <aside className="print:hidden hidden md:flex flex-col w-64 bg-card border-r border-border p-5 sticky top-0 h-screen shrink-0">
        {navContent}
      </aside>

      {/* Mobile Header (print:hidden) */}
      <header className="print:hidden md:hidden flex items-center justify-between bg-card border-b border-border px-4 py-3 sticky top-0 z-30 pt-safe">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="size-4" />
          </div>
          <span className="font-bold text-sm text-[#1A1A2E]">Qwash Laundry</span>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9 rounded-xl">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-5 pt-safe pb-safe">
            {navContent}
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
