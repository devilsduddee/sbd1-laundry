import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Clock,
  ShieldCheck,
  CheckCircle,
  Shirt,
  ArrowRight,
  Droplets,
  Wind,
  PackageCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { QwashLogo } from '@/components/laundry/QwashLogo';
import { StatusBadge } from '@/components/laundry/StatusBadge';
import { formatRupiah, formatDateTime } from '@/lib/format';
import type { Layanan, StsPsn } from '@shared/schemas';

interface TrackingResult {
  id_psn: string;
  nm_plgn: string;
  tgl_msk: string;
  est_sls: string;
  tot_hrg: number;
  sts_psn: StsPsn;
  sts_byr: string;
  items: Array<{ nm_lyn: string; brt_kg: number; hrg_trans: number }>;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // State Pelacakan
  const [ticketQuery, setTicketQuery] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
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

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = ticketQuery.trim();
    if (!cleanId) return;

    try {
      setTrackingLoading(true);
      setTrackingError(null);
      setTrackingResult(null);

      const res = await fetch(`/api/pesanan/lacak/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Tiket pesanan tidak ditemukan');
      }

      setTrackingResult(data);
    } catch (err: any) {
      setTrackingError(err.message || 'Gagal melacak pesanan. Periksa ID tiket Anda.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#1A1A2E] flex flex-col font-sans">
      {/* Navbar Publik */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E4E7F2] pt-safe">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QwashLogo variant="lockup" size="md" className="text-[#1E1B4B]" />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#4B5563]">
            <a href="#lacak" className="hover:text-indigo-600 transition-colors">
              Lacak Pesanan
            </a>
            <a href="#layanan" className="hover:text-indigo-600 transition-colors">
              Paket Layanan
            </a>
            <a href="#higienis" className="hover:text-indigo-600 transition-colors">
              Standar Higienis
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="sm"
              className="rounded-xl border-[#E4E7F2] text-xs h-9 font-semibold hover:border-indigo-300 hover:text-indigo-600"
            >
              Masuk Petugas
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 bg-gradient-to-b from-white via-white to-[#F5F6FA]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-700">
            <Sparkles className="size-3.5" />
            <span>Qwash Standard: Higienis, Bersih Presisi, Tepat Waktu</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1A1A2E] leading-tight">
            Perawatan Pakaian Higienis dengan Transparansi Penuh
          </h1>

          <p className="text-sm md:text-base text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Layanan laundry kiloan dan satuan modern dengan kontrol kebersihan bertahap.
            Pantau setiap langkah pencucian cucian Anda secara langsung dari rumah.
          </p>

          {/* Form Lacak Pesanan Langsung di Hero */}
          <div id="lacak" className="pt-4 max-w-lg mx-auto">
            <form onSubmit={handleTrackSubmit} className="relative flex flex-col sm:flex-row gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                <Input
                  type="text"
                  placeholder="Masukkan Nomor Tiket (Contoh: PSN-202411-0001)"
                  value={ticketQuery}
                  onChange={(e) => setTicketQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-[#E4E7F2] bg-white text-xs md:text-sm font-mono shadow-xs focus-visible:ring-indigo-600"
                  autoCapitalize="characters"
                  spellCheck={false}
                />
              </div>
              <Button
                type="submit"
                disabled={trackingLoading}
                className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs md:text-sm font-semibold shrink-0 shadow-md shadow-indigo-100"
              >
                {trackingLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Lacak Status'
                )}
              </Button>
            </form>
          </div>

          {/* Kartu Hasil Pelacakan Pesanan */}
          {trackingError && (
            <div className="max-w-lg mx-auto p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2.5 text-left">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{trackingError}</span>
            </div>
          )}

          {trackingResult && (
            <div className="max-w-lg mx-auto text-left">
              <Card className="rounded-2xl border-[#E4E7F2] shadow-sm bg-white overflow-hidden">
                <div className="bg-[#1E1B4B] p-4 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-indigo-200 block">ID Tiket Pesanan</span>
                    <span className="font-mono font-bold text-sm">{trackingResult.id_psn}</span>
                  </div>
                  <StatusBadge status={trackingResult.sts_psn} size="sm" />
                </div>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#E4E7F2]">
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">Nama Pemesan</span>
                      <span className="font-semibold text-[#1A1A2E]">{trackingResult.nm_plgn}</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">Estimasi Selesai</span>
                      <span className="font-semibold text-[#1A1A2E]">{formatDateTime(trackingResult.est_sls)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#6B7280] font-medium block">Rincian Layanan:</span>
                    {trackingResult.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 bg-[#F8FAFC] px-2.5 rounded-lg">
                        <span className="font-medium text-[#1A1A2E]">{it.nm_lyn} ({it.brt_kg} kg)</span>
                        <span className="font-semibold tabular-nums text-indigo-600">{formatRupiah(it.hrg_trans)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="font-medium text-[#6B7280]">Total Pembayaran:</span>
                    <span className="font-extrabold text-sm text-[#1A1A2E] tabular-nums">
                      {formatRupiah(trackingResult.tot_hrg)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Katalog Paket Layanan */}
      <section id="layanan" className="py-16 px-4 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1A1A2E]">
            Daftar Paket Layanan Resmi
          </h2>
          <p className="text-xs md:text-sm text-[#6B7280]">
            Pilihan paket laundry transparan dengan tarif per kilogram yang kompetitif
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
                    <p className="text-xs text-[#6B7280]">
                      Perawatan menyeluruh dengan estimasi pengerjaan tepat waktu.
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
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1A1A2E]">
              Protokol Sanitasi 5 Langkah Qwash
            </h2>
            <p className="text-xs md:text-sm text-[#6B7280]">
              Menjaga kebersihan dan ketahanan serat kain melalui standar higienis bersertifikasi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Pemisahan Kain</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Pemisahan bahan sensitif, warna putih, dan pakaian berat secara ketat.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Deterjen Antibakteri</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Formula aktif yang membunuh 99.9% kuman tanpa merusak serat pakaian.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Suhu Air Presisi</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Kontrol suhu pembilasan optimal untuk menjaga kecerahan warna pakaian.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Setrika Uap Sanitasi</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Uap panas bersuhu tinggi melicinkan kerutan sekaligus mensterilkan kain.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E7F2] space-y-2">
              <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                05
              </div>
              <h4 className="font-semibold text-xs text-[#1A1A2E]">Kemasan Kedap Udara</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Penyegelan rapi menjaga aroma wangi segar hingga saat pakaian dikenakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#1E1B4B] text-white py-12 px-4 pb-safe">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-indigo-200">
          <div className="flex items-center gap-3">
            <QwashLogo variant="symbol" size="sm" className="text-white" />
            <span className="font-bold text-white text-sm">Qwash Laundry</span>
            <span className="text-indigo-300">• Sistem Informasi Pengelolaan & Basis Data</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="sm"
              className="border-indigo-400/40 text-white hover:bg-white/10 rounded-xl text-xs h-8"
            >
              Portal Petugas
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
