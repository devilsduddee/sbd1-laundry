import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  ShieldCheck,
  Shirt,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { QwashLogo } from '@/components/laundry/QwashLogo';
import { PublicTrackingCard, type PublicTrackingData } from '@/components/laundry/PublicTrackingCard';
import { formatRupiah } from '@/lib/format';
import type { Layanan } from '@shared/schemas';

const DEMO_TICKET = 'PSN-20261121-2014';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // State Pelacakan
  const [ticketQuery, setTicketQuery] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<PublicTrackingData | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // State Layanan
  const [services, setServices] = useState<Layanan[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    fetch('/api/layanan/publik')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setServices(res.data);
      })
      .catch(() => {})
      .finally(() => setServicesLoading(false));
  }, []);

  const handleTrackSubmit = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const query = (customId || ticketQuery).trim();
    if (!query) return;

    try {
      setTrackingLoading(true);
      setTrackingError(null);
      setTrackingResult(null);

      const res = await fetch(`/api/pesanan/lacak/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Tiket pesanan tidak ditemukan');
      }

      setTrackingResult(data);
      if (customId) setTicketQuery(customId);
    } catch (err: any) {
      setTrackingError(err.message || 'Gagal melacak pesanan. Periksa ID tiket Anda.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleQuickDemo = () => {
    handleTrackSubmit(undefined, DEMO_TICKET);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#1A1A2E] flex flex-col font-sans overflow-x-clip">
      {/* Navbar Publik Sticky */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E4E7F2] pt-safe">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QwashLogo variant="lockup" size="md" className="text-[#1E1B4B]" />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#4B5563]">
            <a href="#lacak" className="hover:text-indigo-600 transition-colors">
              Lacak Cucian
            </a>
            <a href="#layanan" className="hover:text-indigo-600 transition-colors">
              Paket & Tarif
            </a>
            <a href="#higienis" className="hover:text-indigo-600 transition-colors">
              Standar Higienis
            </a>
            <a href="#lokasi" className="hover:text-indigo-600 transition-colors">
              Outlet & Jam Buka
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="sm"
              className="rounded-xl border-[#E4E7F2] text-xs h-9 font-semibold hover:border-indigo-300 hover:text-indigo-600 touch-manipulation"
            >
              Masuk Portal Staf
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 bg-gradient-to-b from-white via-white to-[#F5F6FA] border-b border-[#E4E7F2]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Kolom Kiri: Headline & Form Lacak */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 select-none">
              <Sparkles className="size-3.5 shrink-0" />
              <span>Qwash Standard: Higienis, Bersih Presisi, Tepat Waktu</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1A1A2E] leading-tight">
              Laundry Kiloan Bersih Higienis, Rapi, dan Siap Tepat Waktu
            </h1>

            <p className="text-sm md:text-base text-[#6B7280] leading-relaxed max-w-xl">
              Antar cucian Anda ke outlet, lalu pantau setiap tahap pengerjaan secara langsung dari ponsel Anda tanpa perlu membuat akun. Setiap pakaian dicuci terpisah dengan deterjen antibakteri dan disetrika uap sanitasi.
            </p>

            {/* Form Lacak Pesanan Mandiri */}
            <div id="lacak" className="pt-2 space-y-2.5 max-w-xl">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                  <Input
                    type="text"
                    placeholder="Masukkan Nomor Tiket (Contoh: PSN-20261121-2014)"
                    value={ticketQuery}
                    onChange={(e) => setTicketQuery(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-[#E4E7F2] bg-white text-xs sm:text-sm font-mono shadow-2xs focus-visible:ring-indigo-600"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={trackingLoading}
                  className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shrink-0 shadow-sm shadow-indigo-200 touch-manipulation"
                >
                  {trackingLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    'Lacak Cucian'
                  )}
                </Button>
              </form>

              {/* Quick Demo Chip */}
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <span>Ingin mencoba fitur lacak?</span>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="inline-flex items-center gap-1 font-mono font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 touch-manipulation cursor-pointer"
                >
                  Gunakan tiket contoh: {DEMO_TICKET}
                </button>
              </div>
            </div>

            {trackingError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2.5 max-w-xl">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{trackingError}</span>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Live Interactive Tracking Card Preview */}
          <div className="lg:col-span-5">
            {trackingResult ? (
              <div className="animate-in fade-in duration-300">
                <PublicTrackingCard data={trackingResult} />
              </div>
            ) : (
              <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#E4E7F2] shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#E4E7F2]">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      <Clock className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#1A1A2E]">Pelacakan Mandiri</h3>
                      <p className="text-[11px] text-[#6B7280]">Update real-time dari sistem kasir</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aktif
                  </span>
                </div>

                <div className="space-y-3 text-xs text-[#4B5563]">
                  <div className="flex items-start gap-2.5">
                    <div className="size-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      1
                    </div>
                    <p>Serahkan pakaian di kasir dan terima nomor tiket bukti penyerahan.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="size-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      2
                    </div>
                    <p>Ketik nomor tiket di kolom pelacakan untuk memantau status cuci dan setrika.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="size-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      3
                    </div>
                    <p>Ambil cucian di outlet saat status menunjukkan <strong className="text-[#1A1A2E]">Siap Diambil</strong>.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleQuickDemo}
                    variant="outline"
                    className="w-full rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold h-10 gap-1.5"
                  >
                    Coba Demo Lacak Pesanan
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Katalog Paket Layanan */}
      <section id="layanan" className="py-16 px-4 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1A1A2E]">
            Paket Layanan dan Tarif Resmi
          </h2>
          <p className="text-xs md:text-sm text-[#6B7280]">
            Harga kiloan transparan tanpa biaya tersembunyi. Dihitung akurat sesuai timbangan outlet.
          </p>
        </div>

        {servicesLoading ? (
          <div className="flex justify-center items-center h-32 text-xs text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin text-indigo-600" />
            Memuat daftar layanan...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((lyn) => (
              <Card key={lyn.id_lyn} className="rounded-2xl border-[#E4E7F2] shadow-2xs hover-lift bg-white">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-2">
                    <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                      <Shirt className="size-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#1A1A2E]">{lyn.nm_lyn}</h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      Pencucian menyeluruh, sanitasi serat kain, dan pengemasan rapi.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#E4E7F2] flex justify-between items-end">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Estimasi</span>
                      <span className="text-xs font-semibold text-[#1A1A2E] flex items-center gap-1">
                        <Clock className="size-3.5 text-indigo-500" />
                        {lyn.est_hari} Hari
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-indigo-600 tabular-nums">
                        {formatRupiah(lyn.hrg_kg)}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">/ kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Standar Higienis 5 Langkah Qwash */}
      <section id="higienis" className="py-16 px-4 bg-white border-y border-[#E4E7F2]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1A1A2E]">
              Standar Kebersihan 5 Tahap Qwash
            </h2>
            <p className="text-xs md:text-sm text-[#6B7280]">
              Kami menerapkan protokol pembersihan ketat untuk menjaga kebersihan higienis dan ketahanan serat pakaian Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Cuci Terpisah</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Pakaian satu pelanggan tidak pernah dicampur dengan cucian pelanggan lain.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Deterjen Antibakteri</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Formula aktif membersihkan noda membandel dan mengeliminasi kuman.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Bilas 3 Kali</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Pembilasan menyeluruh untuk memastikan serat kain bebas sisa residu sabun.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Setrika Uap Sanitasi</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Uap panas bersuhu tinggi melicinkan kain sekaligus membunuh tungau debu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Pengemasan Segel</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Pengemasan plastik rapi menjaga aroma harum dan kebersihan hingga ke lemari.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lokasi & Jam Buka Outlet */}
      <section id="lokasi" className="py-16 px-4 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-[#E4E7F2] p-6 md:p-10 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
              <MapPin className="size-5" />
            </div>
            <h3 className="font-bold text-base text-[#1A1A2E]">Lokasi Outlet</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Jl. Margonda Raya No. 100, Depok, Jawa Barat
            </p>
            <p className="text-xs text-muted-foreground">Dekat halte dan area kampus</p>
          </div>

          <div className="space-y-2">
            <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
              <Clock className="size-5" />
            </div>
            <h3 className="font-bold text-base text-[#1A1A2E]">Jam Operasional</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Senin : Minggu, pukul 07.00 : 21.00 WIB
            </p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-3.5" />
              Buka setiap hari termasuk tanggal merah
            </p>
          </div>

          <div className="space-y-2">
            <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
              <Phone className="size-5" />
            </div>
            <h3 className="font-bold text-base text-[#1A1A2E]">Layanan Pelanggan</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed font-mono">
              WhatsApp / Telp: 0812-3456-7890
            </p>
            <p className="text-xs text-muted-foreground">Bantuan informasi pesanan dan konfirmasi</p>
          </div>
        </div>
      </section>

      {/* Footer Komprehensif */}
      <footer className="mt-auto bg-[#1E1B4B] text-white pt-16 pb-12 px-4 pb-safe border-t border-indigo-950">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-indigo-200">
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-900/50">
                  <QwashLogo variant="symbol" size="sm" className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-base block tracking-tight">
                    Qwash Laundry & Hygienic Care
                  </span>
                  <span className="text-indigo-300 text-xs">
                    Sistem Pengelolaan Operasional dan Basis Data Laundry
                  </span>
                </div>
              </div>
              <p className="text-indigo-200/80 leading-relaxed max-w-sm text-xs">
                Layanan perawatan pakaian kiloan dan satuan modern berstandar higienis. Dilengkapi transparansi pelacakan status cucian secara realtime untuk kepuasan pelanggan.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-emerald-300 font-medium">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Aktif & Terhubung ke Basis Data
              </div>
            </div>

            {/* Navigasi Tautan */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2 text-indigo-300">
                <li>
                  <a href="#lacak" className="hover:text-white transition-colors">
                    Pelacakan Nomor Tiket
                  </a>
                </li>
                <li>
                  <a href="#layanan" className="hover:text-white transition-colors">
                    Daftar Paket & Tarif Resmi
                  </a>
                </li>
                <li>
                  <a href="#higienis" className="hover:text-white transition-colors">
                    Standar Sanitasi 5 Tahap
                  </a>
                </li>
                <li>
                  <a href="#lokasi" className="hover:text-white transition-colors">
                    Lokasi Outlet & Kontak
                  </a>
                </li>
              </ul>
            </div>

            {/* Portal Staf & Akses Khusus */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
                Akses Internal Staf
              </h4>
              <p className="text-indigo-200/80 text-xs leading-relaxed">
                Pintu masuk khusus petugas kasir, tim operasional cuci-setrika, dan administrator outlet.
              </p>
              <div className="pt-1">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs h-10 px-5 gap-2 shadow-md shadow-indigo-950 touch-manipulation active:scale-[0.98]"
                >
                  Masuk Portal Petugas
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-indigo-300/70">
            <p>
              © 2024 Qwash Hygienic Care. Hak cipta dilindungi undang-undang.
            </p>
            <p className="font-mono text-indigo-300/90">
              Tugas Besar Sistem Basis Data Kelas 3IA01
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
