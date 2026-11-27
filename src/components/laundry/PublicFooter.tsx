import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QwashLogo } from '@/components/laundry/QwashLogo';

export const PublicFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="mt-auto bg-[#0B253B] text-white border-t border-slate-800 pb-safe">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Kolom 1: Brand & Filosofi (5 Kolom) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-md bg-[#006EB3] flex items-center justify-center text-white shrink-0">
                <QwashLogo variant="symbol" size="sm" className="text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-heading font-bold text-white text-sm block tracking-tight">
                  Qwash Laundry &amp; Hygienic Care
                </span>
                <span className="text-slate-400 text-xs block mt-0.5">
                  Sistem Pengelolaan Operasional dan Basis Data Laundry
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              Layanan perawatan pakaian kiloan dan satuan modern berstandar higienis. Pantau progres pencucian secara transparan langsung dari ponsel Anda.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 font-medium select-none">
              <span className="size-2 rounded-full bg-emerald-400" />
              OPERASIONAL_AKTIF
            </div>
          </div>

          {/* Kolom 2: Navigasi Tautan (3 Kolom) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-semibold text-white text-xs tracking-wider uppercase">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a href="#lacak" className="hover:text-white transition-colors">
                  Pelacakan Nomor Tiket
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-white transition-colors">
                  Daftar Paket &amp; Tarif Resmi
                </a>
              </li>
              <li>
                <a href="#higienis" className="hover:text-white transition-colors">
                  Standar Sanitasi 5 Tahap
                </a>
              </li>
              <li>
                <a href="#lokasi" className="hover:text-white transition-colors">
                  Lokasi Outlet &amp; Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Jam & Outlet (2 Kolom) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading font-semibold text-white text-xs tracking-wider uppercase">
              Jam Buka
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="font-medium text-white">Senin - Minggu</p>
              <p className="font-mono text-xs text-[#00A2FF]">07.00 - 21.00 WIB</p>
              <p className="text-xs text-slate-400 pt-1 leading-snug">
                Jl. Margonda Raya No. 100, Depok
              </p>
            </div>
          </div>

          {/* Kolom 4: Akses Petugas (2 Kolom) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading font-semibold text-white text-xs tracking-wider uppercase">
              Portal Internal
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Khusus staf kasir, operasional, dan admin.
            </p>
            <div className="pt-1">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#006EB3] hover:bg-[#00588F] text-white font-semibold rounded-md text-xs h-9 px-3 gap-1.5 touch-manipulation active:scale-[0.98]"
              >
                <span>Masuk Staf</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Baris Bawah: Copyright & Akademik */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <p>
            &copy; 2026 Qwash Laundry &amp; Hygienic Care. Seluruh hak cipta dilindungi.
          </p>
          <p className="font-mono text-slate-400">
            Tugas Besar Sistem Basis Data Kelas 3IA01
          </p>
        </div>
      </div>
    </footer>
  );
};
