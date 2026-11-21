import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, User, Loader2 } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernm || !passwd) {
      setError('Username dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(usernm, passwd);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali username dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsernm(u);
    setPasswd(p);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md shadow-lg border-[#E4E7F2] rounded-2xl overflow-hidden">
        {/* Header Biru Gelap Aksen Qwash */}
        <div className="bg-[#1E1B4B] p-6 text-white text-center">
          <div className="inline-flex size-12 rounded-2xl bg-indigo-600 items-center justify-center mb-3 shadow-md">
            <Sparkles className="size-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Qwash Laundry</h2>
          <p className="text-xs text-indigo-200 mt-1">
            Sistem Informasi Pengelolaan & Basis Data
          </p>
        </div>

        <CardHeader className="pt-6 pb-2 text-center">
          <CardTitle className="text-lg font-semibold text-[#1A1A2E]">
            Masuk ke Sistem
          </CardTitle>
          <CardDescription className="text-xs text-[#6B7280]">
            Silakan masukkan kredensial petugas untuk memulai sesi
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="usernm" className="text-xs font-medium text-[#1A1A2E]">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                <Input
                  id="usernm"
                  type="text"
                  placeholder="Masukkan username"
                  value={usernm}
                  onChange={(e) => setUsernm(e.target.value)}
                  className="pl-9 rounded-xl border-[#E4E7F2] focus-visible:ring-indigo-600 text-sm"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passwd" className="text-xs font-medium text-[#1A1A2E]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                <Input
                  id="passwd"
                  type="password"
                  placeholder="Masukkan password"
                  value={passwd}
                  onChange={(e) => setPasswd(e.target.value)}
                  className="pl-9 rounded-xl border-[#E4E7F2] focus-visible:ring-indigo-600 text-sm"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Quick Fill untuk Kemudahan Demo Tugas */}
            <div className="pt-2">
              <p className="text-[11px] text-[#6B7280] font-medium mb-1.5">
                Pilih Akun Demo:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('admin', 'admin123')}
                  className="text-xs rounded-lg border-[#E4E7F2] hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('kasir', 'kasir123')}
                  className="text-xs rounded-lg border-[#E4E7F2] hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Kasir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('operasional', 'opera123')}
                  className="text-xs rounded-lg border-[#E4E7F2] hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Operasional
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-semibold shadow-md shadow-indigo-100"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk Sekarang'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="text-xs text-[#9CA3AF] mt-6 text-center">
        Tugas Besar Sistem Basis Data • Kelas 3IA01
      </p>
    </div>
  );
};
