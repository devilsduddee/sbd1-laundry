import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ClipboardList,
  Shirt,
  ShieldAlert,
} from 'lucide-react';
import { QwashLogo } from '@/components/laundry/QwashLogo';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const { login } = useAuth();
  const navigate = useNavigate();

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
      navigate('/');
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
    <div className="min-h-screen bg-[#F5F6FA] text-[#1A1A2E] flex flex-col justify-center overflow-x-clip select-none font-sans">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
        {/* Kolom Kiri: Brand Hero & Live System Preview (Khusus Desktop & Tablet Lebar) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#1E1B4B] text-white p-10 xl:p-16 flex-col justify-between relative overflow-hidden">
          {/* Subtle Geometric Background Waves */}
          <div className="absolute -top-24 -left-24 size-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/60">
                <QwashLogo variant="symbol" size="sm" className="text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight block text-white leading-tight">
                  Qwash Laundry
                </span>
                <span className="text-indigo-300 text-xs tracking-wider uppercase font-semibold">
                  Hygienic Care Portal
                </span>
              </div>
            </div>
          </div>

          {/* Middle Value Proposition & Mockup Card */}
          <div className="relative z-10 space-y-8 max-w-lg my-auto py-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-xs font-semibold text-indigo-200">
                <Sparkles className="size-3.5 text-cyan-400" />
                <span>Sistem Pengelolaan Terintegrasi</span>
              </div>
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Operasional Laundry Cepat, Terdata, dan Transparan
              </h1>
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                Kendali penuh siklus cucian mulai dari penerimaan kasir, penimbangan berat kiloan akurat, pelacakan proses cuci-setrika, hingga serah terima lunas.
              </p>
            </div>

            {/* Live System Preview Card (Design Taste Standout Moment) */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-indigo-200 text-[11px]">Sesi Operasional Aktif</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-semibold uppercase tracking-wider">
                  Turso libSQL
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] text-indigo-300 block">Antrean</span>
                  <span className="text-base font-extrabold text-white font-mono">Real-time</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] text-indigo-300 block">Kalkulasi</span>
                  <span className="text-base font-extrabold text-white font-mono">Server-side</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] text-indigo-300 block">Keamanan</span>
                  <span className="text-base font-extrabold text-white font-mono">Stateless JWT</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-indigo-300/80 pt-1">
                <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                <span>3 Peran Terpisah: Kasir, Tim Operasional Cuci, dan Administrator</span>
              </div>
            </div>
          </div>

          {/* Bottom Academic Credits */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex justify-between items-center text-[11px] text-indigo-300/60 font-mono">
            <span>Tugas Besar Sistem Basis Data</span>
            <span>Kelas 3IA01</span>
          </div>
        </div>

        {/* Kolom Kanan: Form Autentikasi Staf */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-5 p-6 sm:p-10 xl:p-14 flex flex-col justify-between max-w-md mx-auto w-full pt-safe pb-safe">
          {/* Header Bar dengan Tombol Kembali ke Landing Page */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="rounded-xl text-xs gap-1.5 text-[#6B7280] hover:text-indigo-600 hover:bg-[#F5F6FA] h-9 font-medium px-2.5 -ml-2.5 touch-manipulation"
            >
              <ArrowLeft className="size-3.5" />
              <span>Beranda Publik</span>
            </Button>

            <span className="text-[11px] font-mono font-medium text-[#9CA3AF]">
              Qwash v1.0
            </span>
          </div>

          {/* Form Container */}
          <div className="my-auto py-8 space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">
                Masuk ke Portal Petugas
              </h2>
              <p className="text-xs text-[#6B7280]">
                Masukkan kredensial akun staf untuk memulai pengerjaan
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Username */}
              <div className="space-y-1.5">
                <Label htmlFor="usernm" className="text-xs font-semibold text-[#1A1A2E]">
                  Username Petugas
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                  <Input
                    id="usernm"
                    type="text"
                    placeholder="Masukkan username akun staf"
                    value={usernm}
                    onChange={(e) => {
                      setUsernm(e.target.value);
                      setActiveRole(null);
                    }}
                    className="pl-10 h-11 rounded-xl border-[#E4E7F2] focus-visible:ring-indigo-600 text-xs sm:text-sm font-medium"
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
                <Label htmlFor="passwd" className="text-xs font-semibold text-[#1A1A2E]">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                  <Input
                    id="passwd"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={passwd}
                    onChange={(e) => {
                      setPasswd(e.target.value);
                      setActiveRole(null);
                    }}
                    className="pl-10 pr-10 h-11 rounded-xl border-[#E4E7F2] focus-visible:ring-indigo-600 text-xs sm:text-sm font-medium"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Akun Demo Cepat (Quick Login Tabs) */}
              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-[#4B5563]">Pilih Akun Demo Cepat:</span>
                  <span className="text-[#9CA3AF] text-[10px]">1-klik langsung terisi</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = activeRole === acc.role;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleSelectDemo(acc)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all touch-manipulation active:scale-[0.97] cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600'
                            : 'border-[#E4E7F2] bg-[#F8FAFC] text-[#4B5563] hover:border-indigo-300 hover:bg-white'
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight truncate">
                          {acc.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#9CA3AF] mt-1">
                          @{acc.user}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tombol Submit Utama */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 text-xs sm:text-sm font-semibold shadow-md shadow-indigo-100 touch-manipulation active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
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
          <div className="text-center text-[11px] text-[#9CA3AF] pt-4 border-t border-[#E4E7F2]">
            <span>&copy; 2024 Qwash Laundry &amp; Hygienic Care. Hak cipta dilindungi.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
