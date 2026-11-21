import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { QwashLogo } from '@/components/laundry/QwashLogo';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usernm, setUsernm] = useState('');
  const [passwd, setPasswd] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'kasir' | 'operasional' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernm.trim() || !passwd) {
      setError('Username dan password wajib diisi');
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

  const handleQuickLogin = (role: 'admin' | 'kasir' | 'operasional', u: string, p: string) => {
    setSelectedRole(role);
    setUsernm(u);
    setPasswd(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col justify-center items-center p-4 relative overflow-x-clip select-none">
      {/* Tombol Navigasi Kembali ke Beranda Publik */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="rounded-xl text-xs gap-1.5 text-[#6B7280] hover:text-indigo-600 hover:bg-white/80 h-9 font-medium"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Beranda Publik</span>
        </Button>

        <span className="text-[11px] font-mono text-[#9CA3AF]">
          Portal v1.0
        </span>
      </div>

      {/* Kartu Login Utama */}
      <Card className="w-full max-w-md shadow-lg shadow-indigo-950/5 border-[#E4E7F2] rounded-3xl overflow-hidden bg-white">
        {/* Header Biru Gelap Aksen Qwash */}
        <div className="bg-[#1E1B4B] p-6 text-white text-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="inline-flex size-14 rounded-2xl bg-indigo-600 items-center justify-center mb-3 shadow-md shadow-indigo-900/50">
            <QwashLogo variant="symbol" size="md" className="text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight leading-tight">
            Qwash Laundry &amp; Hygienic Care
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            Portal Masuk Petugas Kasir, Operasional &amp; Administrator
          </p>
        </div>

        <CardHeader className="pt-6 pb-2 text-center space-y-1">
          <CardTitle className="text-lg font-bold text-[#1A1A2E] tracking-tight">
            Masuk ke Sistem
          </CardTitle>
          <CardDescription className="text-xs text-[#6B7280]">
            Silakan masukkan kredensial akun staf untuk memulai sesi
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2.5">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

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
                  placeholder="Contoh: admin, kasir, operasional"
                  value={usernm}
                  onChange={(e) => {
                    setUsernm(e.target.value);
                    setSelectedRole(null);
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
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                <Input
                  id="passwd"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password akun"
                  value={passwd}
                  onChange={(e) => {
                    setPasswd(e.target.value);
                    setSelectedRole(null);
                  }}
                  className="pl-10 pr-10 h-11 rounded-xl border-[#E4E7F2] focus-visible:ring-indigo-600 text-xs sm:text-sm font-medium"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] p-0.5 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Akun Cepat Demo (Quick Fill) */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-center text-[11px] text-[#6B7280]">
                <span className="font-semibold text-[#4B5563]">Pilih Akun Demo Cepat:</span>
                <span className="text-[10px] text-muted-foreground">Otomatis terisi</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', 'admin', 'admin123')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation active:scale-[0.97] ${
                    selectedRole === 'admin'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-[#E4E7F2] bg-[#F8FAFC] text-[#4B5563] hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  <span className="text-xs">Admin</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">@admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('kasir', 'kasir', 'kasir123')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation active:scale-[0.97] ${
                    selectedRole === 'kasir'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-[#E4E7F2] bg-[#F8FAFC] text-[#4B5563] hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  <span className="text-xs">Kasir</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">@kasir</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('operasional', 'operasional', 'opera123')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all touch-manipulation active:scale-[0.97] ${
                    selectedRole === 'operasional'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-[#E4E7F2] bg-[#F8FAFC] text-[#4B5563] hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  <span className="text-xs">Operasional</span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">@operasional</span>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6 px-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 text-xs sm:text-sm font-semibold shadow-md shadow-indigo-200 touch-manipulation active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memverifikasi Akun...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Keterangan Hak Cipta & Akademik */}
      <footer className="mt-6 text-center space-y-1">
        <p className="text-[11px] text-[#6B7280]">
          &copy; 2024 Qwash Laundry &amp; Hygienic Care. Seluruh hak cipta dilindungi.
        </p>
        <p className="text-[10px] font-mono text-[#9CA3AF]">
          Tugas Besar Sistem Basis Data Kelas 3IA01
        </p>
      </footer>
    </div>
  );
};
