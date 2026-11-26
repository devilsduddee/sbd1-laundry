import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  Shirt,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { QwashLogo } from '@/components/laundry/QwashLogo';
import { PublicTrackingCard, type PublicTrackingData } from '@/components/laundry/PublicTrackingCard';
import { PublicFooter } from '@/components/laundry/PublicFooter';
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#020617] flex flex-col font-sans overflow-x-clip">
      {/* Navbar Publik Sticky */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] pt-safe">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QwashLogo variant="lockup" size="md" className="text-[#0F172A]" />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#475569]">
            <a href="#lacak" className="hover:text-[#0369A1] transition-colors">
              Lacak Cucian
            </a>
            <a href="#layanan" className="hover:text-[#0369A1] transition-colors">
              Paket &amp; Tarif
            </a>
            <a href="#higienis" className="hover:text-[#0369A1] transition-colors">
              Standar Higienis
            </a>
            <a href="#lokasi" className="hover:text-[#0369A1] transition-colors">
              Outlet &amp; Jam Buka
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="sm"
              className="rounded-md border-[#E2E8F0] text-xs h-9 font-semibold text-[#0F172A] hover:bg-[#E8ECF1] touch-manipulation"
            >
              Masuk Portal Staf
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section (Swiss Clean Surface) */}
      <section className="relative py-12 md:py-20 px-4 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Kolom Kiri: Headline & Form Lacak */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#F1F5F9] border border-[#CBD5E1] text-xs font-mono font-medium text-[#0F172A] select-none">
              <ShieldCheck className="size-3.5 text-[#0369A1] shrink-0" aria-hidden="true" />
              <span>QWASH_STANDARD: HIGIENIS &amp; PRESISI</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F172A] leading-tight">
              Laundry Kiloan Terdata, Bersih, dan Siap Tepat Waktu
            </h1>

            <p className="text-sm md:text-base text-[#475569] leading-relaxed max-w-xl">
              Antar cucian Anda ke outlet, lalu pantau setiap tahap pengerjaan secara langsung tanpa perlu membuat akun. Setiap pakaian dicuci terpisah dengan deterjen antibakteri dan disetrika uap sanitasi.
            </p>

            {/* Form Lacak Pesanan Mandiri */}
            <div id="lacak" className="pt-2 space-y-2.5 max-w-xl">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full">
                  <Label htmlFor="ticket-query" className="sr-only">
                    Masukkan Nomor Tiket Pesanan
                  </Label>
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#475569]"
                    aria-hidden="true"
                  />
                  <Input
                    id="ticket-query"
                    type="text"
                    placeholder="Masukkan Nomor Tiket (Contoh: PSN-20261121-2014)"
                    value={ticketQuery}
                    onChange={(e) => setTicketQuery(e.target.value)}
                    className="pl-10 h-12 rounded-md border-[#E2E8F0] bg-white text-xs sm:text-sm font-mono focus-visible:ring-[#0F172A]"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={trackingLoading}
                  className="h-12 px-6 bg-[#0369A1] hover:bg-[#0284C7] text-white rounded-md text-xs sm:text-sm font-semibold shrink-0 touch-manipulation"
                >
                  {trackingLoading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    'Lacak Cucian'
                  )}
                </Button>
              </form>

              {/* Quick Demo Chip */}
              <div className="flex items-center gap-2 text-xs text-[#475569]">
                <span>Ingin mencoba fitur lacak?</span>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="inline-flex items-center gap-1 font-mono font-semibold text-[#0369A1] hover:text-[#0F172A] underline underline-offset-2 touch-manipulation cursor-pointer"
                >
                  Gunakan tiket contoh: {DEMO_TICKET}
                </button>
              </div>
            </div>

            {trackingError && (
              <div
                role="alert"
                className="p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-md text-xs text-[#B91C1C] flex items-center gap-2.5 max-w-xl"
              >
                <AlertCircle className="size-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
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
              <div className="p-6 md:p-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-md bg-[#0F172A] flex items-center justify-center text-white font-bold">
                      <Clock className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xs text-[#0F172A]">
                        Pelacakan Mandiri
                      </h3>
                      <p className="text-xs text-[#475569]">Update real-time dari sistem kasir</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-sm bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                    AKTIF
                  </span>
                </div>

                <div className="space-y-3 text-xs text-[#334155]">
                  <div className="flex items-start gap-2.5">
                    <div className="size-5 rounded-sm bg-[#0F172A] text-white flex items-center justify-center shrink-0 font-mono font-bold text-xs mt-0.5">
                      1
                    </div>
                    <p>Serahkan pakaian di kasir dan terima nomor tiket bukti penyerahan.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="size-5 rounded-sm bg-[#0F172A] text-white flex items-center justify-center shrink-0 font-mono font-bold text-xs mt-0.5">
                      2
                    </div>
                    <p>Ketik nomor tiket di kolom pelacakan untuk memantau status cuci dan setrika.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="size-5 rounded-sm bg-[#0F172A] text-white flex items-center justify-center shrink-0 font-mono font-bold text-xs mt-0.5">
                      3
                    </div>
                    <p>
                      Ambil cucian di outlet saat status menunjukkan{' '}
                      <strong className="text-[#020617]">Siap Diambil</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleQuickDemo}
                    variant="outline"
                    className="w-full rounded-md border-[#E2E8F0] bg-white text-[#0369A1] hover:bg-[#E8ECF1] hover:text-[#0F172A] text-xs font-semibold h-10 gap-1.5"
                  >
                    Coba Demo Lacak Pesanan
                    <ArrowRight className="size-3.5" aria-hidden="true" />
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
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
            Paket Layanan dan Tarif Resmi
          </h2>
          <p className="text-xs md:text-sm text-[#475569]">
            Harga kiloan transparan tanpa biaya tersembunyi. Dihitung akurat sesuai timbangan outlet.
          </p>
        </div>

        {servicesLoading ? (
          <div className="flex justify-center items-center h-32 text-xs text-[#475569]">
            <Loader2 className="mr-2 size-4 animate-spin text-[#0369A1]" aria-hidden="true" />
            Memuat daftar layanan...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((lyn) => (
              <Card key={lyn.id_lyn} className="rounded-lg border-[#E2E8F0] shadow-none hover-lift bg-white">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-2">
                    <div className="size-10 rounded-md bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center text-[#0369A1] mb-2">
                      <Shirt className="size-5 stroke-[1.75]" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-base text-[#020617]">{lyn.nm_lyn}</h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      Pencucian menyeluruh, sanitasi serat kain, dan pengemasan rapi.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#E2E8F0] flex justify-between items-end">
                    <div>
                      <span className="text-xs text-[#475569] block">Estimasi</span>
                      <span className="font-mono text-xs font-semibold text-[#020617] flex items-center gap-1 tabular-nums">
                        <Clock className="size-3.5 text-[#0369A1]" aria-hidden="true" />
                        {lyn.est_hari} Hari
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-[#0369A1] tabular-nums">
                        {formatRupiah(lyn.hrg_kg)}
                      </span>
                      <span className="text-xs text-[#475569] block">/ kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Standar Higienis 5 Langkah Qwash */}
      <section id="higienis" className="py-16 px-4 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A]">
              Standar Kebersihan 5 Tahap Qwash
            </h2>
            <p className="text-xs md:text-sm text-[#475569]">
              Kami menerapkan protokol pembersihan ketat untuk menjaga kebersihan higienis dan ketahanan serat pakaian Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                num: '01',
                title: 'Cuci Terpisah',
                desc: 'Pakaian satu pelanggan tidak pernah dicampur dengan cucian pelanggan lain.',
              },
              {
                num: '02',
                title: 'Deterjen Antibakteri',
                desc: 'Formula aktif membersihkan noda membandel dan mengeliminasi kuman.',
              },
              {
                num: '03',
                title: 'Bilas 3 Kali',
                desc: 'Pembilasan menyeluruh untuk memastikan serat kain bebas sisa residu sabun.',
              },
              {
                num: '04',
                title: 'Setrika Uap Sanitasi',
                desc: 'Uap panas bersuhu tinggi melicinkan kain sekaligus membunuh tungau debu.',
              },
              {
                num: '05',
                title: 'Pengemasan Segel',
                desc: 'Pengemasan plastik rapi menjaga aroma harum dan kebersihan hingga ke lemari.',
              },
            ].map((step) => (
              <div key={step.num} className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="inline-flex px-2 py-0.5 rounded-sm bg-[#0F172A] text-white font-mono font-bold text-xs">
                  {step.num}
                </div>
                <h4 className="font-semibold text-xs text-[#020617] pt-1">{step.title}</h4>
                <p className="text-xs text-[#475569] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lokasi & Jam Buka Outlet */}
      <section id="lokasi" className="py-16 px-4 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="size-10 rounded-md bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center text-[#0369A1] mb-2">
              <MapPin className="size-5 stroke-[1.75]" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#0F172A]">Lokasi Outlet</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Jl. Margonda Raya No. 100, Depok, Jawa Barat
            </p>
            <p className="text-xs text-[#475569]">Dekat halte dan area kampus</p>
          </div>

          <div className="space-y-2">
            <div className="size-10 rounded-md bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center text-[#0369A1] mb-2">
              <Clock className="size-5 stroke-[1.75]" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#0F172A]">Jam Operasional</h3>
            <p className="font-mono text-xs text-[#475569] leading-relaxed">
              Senin - Minggu | 07.00 - 21.00 WIB
            </p>
            <p className="text-xs text-[#15803D] font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Buka setiap hari termasuk tanggal merah
            </p>
          </div>

          <div className="space-y-2">
            <div className="size-10 rounded-md bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center text-[#0369A1] mb-2">
              <Phone className="size-5 stroke-[1.75]" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#0F172A]">Layanan Pelanggan</h3>
            <p className="text-xs text-[#020617] leading-relaxed font-mono">
              WhatsApp / Telp: 0812-3456-7890
            </p>
            <p className="text-xs text-[#475569]">Bantuan informasi pesanan dan konfirmasi</p>
          </div>
        </div>
      </section>

      {/* Footer Bersih dan Seimbang */}
      <PublicFooter />
    </div>
  );
};
