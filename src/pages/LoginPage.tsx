import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { QwashLogo } from '@/components/laundry/QwashLogo';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const NeatBackground = lazy(() => import('@/components/laundry/NeatBackground'));

type DemoRole = 'admin' | 'kasir' | 'operasional';

interface DemoAccount {
  role: DemoRole;
  title: string;
  user: string;
  pass: string;
  desc: string;
  badge: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'admin',
    title: 'Administrator',
    user: 'admin',
    pass: 'admin123',
    desc: 'Kelola tarif layanan, akun staf & laporan',
    badge: 'Akses Penuh',
  },
  {
    role: 'kasir',
    title: 'Petugas Kasir',
    user: 'kasir',
    pass: 'kasir123',
    desc: 'Terima cucian, buat tiket & catat bayar',
    badge: 'Front Desk',
  },
  {
    role: 'operasional',
    title: 'Tim Cuci-Setrika',
    user: 'operasional',
    pass: 'opera123',
    desc: 'Update tahap pengerjaan cucian pelanggan',
    badge: 'Workshop',
  },
];

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/pesanan', { replace: true });
    }
  }, [user, navigate]);

  const [usernm, setUsernm] = useState('');
  const [passwd, setPasswd] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<DemoRole | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernm.trim() || !passwd) {
      setError('Silakan masukkan username dan password akun Anda');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(usernm.trim(), passwd);
      navigate('/pesanan');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali username dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (acc: DemoAccount) => {
    setActiveRole(acc.role);
    setUsernm(acc.user);
    setPasswd(acc.pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F6FFFF] text-[#071422] flex flex-col justify-center overflow-x-clip font-sans">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
        {/* Kolom Kiri: Swiss Slate Navy Brand & Spec Summary */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#0B253B] text-white p-10 xl:p-16 flex-col justify-between relative">
          {/* Top Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-[#006EB3] flex items-center justify-center text-white shrink-0">
              <QwashLogo variant="symbol" size="sm" className="text-white" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg tracking-tight block text-white leading-tight">
                Qwash Laundry
              </span>
              <span className="font-mono text-slate-400 text-xs tracking-wider uppercase">
                Operational POS Portal
              </span>
            </div>
          </div>

          {/* Middle Value Proposition & Technical Spec Box */}
          <div className="space-y-8 max-w-lg my-auto py-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-slate-800 border border-slate-700 text-xs font-mono text-[#00A2FF]">
                <Terminal className="size-3.5 text-[#00A2FF]" aria-hidden="true" />
                <span>SISTEM PENGELOLAAN BASIS DATA LAUNDRY</span>
              </div>
              <h1 className="font-heading text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-white">
                Operasional Cepat, Terdata, dan Presisi.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Kendali penuh siklus cucian mulai dari penerimaan kasir, penimbangan kiloan akurat, pelacakan proses cuci-setrika, hingga serah terima lunas.
              </p>
            </div>

            {/* Technical Matrix Card (Swiss Grid Style) */}
            <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-slate-300 text-xs">SYSTEM_STATUS: READY</span>
                </div>
                <span className="px-2 py-0.5 rounded-sm bg-[#071B2C] text-[#00A2FF] border border-[#006EB3] text-xs font-mono font-medium">
                  Turso libSQL
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-md bg-slate-800/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block">Antrean</span>
                  <span className="text-sm font-bold text-white font-mono block">Real-time</span>
                </div>
                <div className="p-3 rounded-md bg-slate-800/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block">Kalkulasi</span>
                  <span className="text-sm font-bold text-white font-mono block">Server-side</span>
                </div>
                <div className="p-3 rounded-md bg-slate-800/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block">Keamanan</span>
                  <span className="text-sm font-bold text-white font-mono block">Stateless JWT</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                <ShieldCheck className="size-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>3 Peran Terpisah: Kasir, Tim Operasional Cuci, dan Administrator</span>
              </div>
            </div>
          </div>

          {/* Bottom Academic Credits */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Tugas Besar Sistem Basis Data</span>
            <span>Kelas 3IA01</span>
          </div>
        </div>

        {/* Kolom Kanan: Form Autentikasi Staf di atas Ambient @firecms/neat (Opsi A) */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-5 relative overflow-hidden p-4 sm:p-8 xl:p-12 flex flex-col justify-center items-center w-full min-h-screen pt-safe pb-safe bg-[#F6FFFF]">
          <div className="absolute inset-0 z-0 pointer-events-none print:hidden" aria-hidden="true">
            <Suspense
              fallback={
                <div className="w-full h-full bg-gradient-to-br from-[#D5ECEB] via-[#FFFFFF] to-[#EFE2CE]" />
              }
            >
              <NeatBackground />
            </Suspense>
            <div className="absolute inset-0 bg-white/25" />
          </div>

          <div className="relative z-10 w-full max-w-md bg-white/92 backdrop-blur-md border border-[#D5E4E4] rounded-lg p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            {/* Header Bar dengan Tombol Kembali ke Landing Page */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="rounded-md text-xs gap-1.5 text-[#425869] hover:text-[#0B253B] hover:bg-[#E8F2F2] h-9 font-medium px-2.5 -ml-2.5 touch-manipulation"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                <span>Beranda Publik</span>
              </Button>

              <span className="text-xs font-mono font-medium text-[#425869]">
                Qwash v2.1
              </span>
            </div>

            {/* Form Container */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h2 className="font-heading text-2xl font-bold text-[#0B253B] tracking-tight">
                  Masuk ke Portal Petugas
                </h2>
                <p className="text-xs text-[#425869]">
                  Masukkan kredensial akun staf untuk memulai pengerjaan
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="p-3.5 bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-xs rounded-md font-medium flex items-center gap-2.5"
                >
                  <AlertCircle className="size-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="usernm" className="text-xs font-semibold text-[#071422]">
                    Username Petugas
                  </Label>
                  <div className="relative">
                    <User
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#425869]"
                      aria-hidden="true"
                    />
                    <Input
                      id="usernm"
                      type="text"
                      placeholder="Masukkan username akun staf"
                      value={usernm}
                      onChange={(e) => {
                        setUsernm(e.target.value);
                        setActiveRole(null);
                      }}
                      className="pl-10 h-11 rounded-md border-[#D5E4E4] focus-visible:ring-[#0B253B] text-sm font-medium text-[#071422] bg-white"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="passwd" className="text-xs font-semibold text-[#071422]">
                    Kata Sandi
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#425869]"
                      aria-hidden="true"
                    />
                    <Input
                      id="passwd"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      value={passwd}
                      onChange={(e) => {
                        setPasswd(e.target.value);
                        setActiveRole(null);
                      }}
                      className="pl-10 pr-10 h-11 rounded-md border-[#D5E4E4] focus-visible:ring-[#0B253B] text-sm font-medium text-[#071422] bg-white"
                      autoComplete="current-password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#425869] hover:text-[#0B253B] p-1 rounded-sm"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Akun Demo Cepat (Quick Login Tabs) */}
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#2D4659]">Pilih Akun Demo Cepat:</span>
                    <span className="text-[#425869]">1-klik langsung terisi</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map((acc) => {
                      const isSelected = activeRole === acc.role;
                      return (
                        <button
                          key={acc.role}
                          type="button"
                          onClick={() => handleSelectDemo(acc)}
                          className={`p-2.5 rounded-md border text-left flex flex-col justify-between transition-colors touch-manipulation active:scale-[0.97] cursor-pointer ${
                            isSelected
                              ? 'border-[#0B253B] bg-[#E8F2F2] text-[#0B253B] ring-1 ring-[#0B253B]'
                              : 'border-[#D5E4E4] bg-[#F6FFFF] text-[#2D4659] hover:border-[#006EB3] hover:bg-white'
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight truncate">
                            {acc.title}
                          </span>
                          <span className="text-xs font-mono text-[#425869] mt-1">
                            @{acc.user}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tombol Submit Utama (Ocean Action Blue #006EB3) */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#006EB3] hover:bg-[#00588F] text-white rounded-md h-11 text-sm font-semibold touch-manipulation active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                        Memverifikasi Sesi...
                      </>
                    ) : (
                      'Masuk ke Sistem'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Footer Bawah */}
            <div className="text-center text-xs text-[#425869] pt-4 border-t border-[#D5E4E4]">
              <span>&copy; 2026 Qwash Laundry &amp; Hygienic Care. Sistem Basis Data.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
