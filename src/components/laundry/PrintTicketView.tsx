import React from 'react';
import { Printer, BadgeCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QwashLogo } from './QwashLogo';
import { StatusBadge } from './StatusBadge';
import { formatRupiah, formatDateTime } from '@/lib/format';
import type { PesananDetailResponse } from '@shared/schemas';

interface PrintTicketViewProps {
  data: PesananDetailResponse;
}

export const PrintTicketView: React.FC<PrintTicketViewProps> = ({ data }) => {
  const { psn, plgn, ptgs, items, bayar } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tombol Cetak (print:hidden) */}
      <div className="print:hidden flex justify-end">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="gap-2 border-[#D5E4E4] text-[#0B253B] hover:bg-[#E8F2F2] rounded-md"
        >
          <Printer className="size-4 stroke-[1.75]" aria-hidden="true" />
          Cetak Tiket / Struk
        </Button>
      </div>

      {/* Area Struk / Tiket Fisik */}
      <div className="bg-white border border-[#D5E4E4] rounded-lg p-6 md:p-8 print:border-slate-300 print:shadow-none print:bg-white print:p-4 text-[#071422] text-sm">
        {/* Header Usaha */}
        <div className="flex justify-between items-start pb-6 border-b border-[#D5E4E4]">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-md bg-[#0B253B] flex items-center justify-center text-white shrink-0 print:border print:border-[#0B253B] print:text-[#0B253B] print:bg-white">
              <QwashLogo variant="symbol" size="sm" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold tracking-tight text-[#0B253B] leading-tight">
                QWASH LAUNDRY & HYGIENIC CARE
              </h2>
              <p className="text-xs text-[#425869] mt-0.5">
                Layanan Cuci Higienis, Bersih Presisi, dan Terpercaya
              </p>
              <p className="text-xs text-[#425869]">
                Jl. Margonda Raya No. 100, Depok | Telp: 0812-3456-7890
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-[#425869] font-medium">
              Tiket Pesanan
            </span>
            <p className="font-mono font-bold text-base text-[#006EB3] tabular-nums">
              {psn.id_psn}
            </p>
            <div className="mt-1.5 flex justify-end gap-1.5 print:hidden">
              <StatusBadge status={psn.sts_psn} size="sm" />
              <StatusBadge
                status={bayar ? 'Lunas' : 'Belum Lunas'}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Informasi Pelanggan & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 border-b border-[#D5E4E4] text-xs">
          <div>
            <span className="text-[#425869] font-medium">Pelanggan:</span>
            <p className="text-sm font-semibold text-[#071422] mt-0.5">
              {plgn.nm_plgn}
            </p>
            <p className="font-mono text-[#2D4659] tabular-nums mt-0.5">{plgn.no_hp}</p>
            <p className="text-[#425869] mt-0.5">{plgn.alamat}</p>
          </div>
          <div className="md:text-right flex flex-col md:items-end">
            <div>
              <span className="text-[#425869] font-medium">Tanggal Masuk:</span>
              <p className="font-mono font-medium text-[#071422] tabular-nums">
                {formatDateTime(psn.tgl_msk)}
              </p>
            </div>
            <div className="mt-2">
              <span className="text-[#425869] font-medium">Estimasi Selesai:</span>
              <p className="font-mono font-semibold text-[#006EB3] tabular-nums">
                {formatDateTime(psn.est_sls)}
              </p>
            </div>
            <div className="mt-1.5 text-[#425869]">
              Kasir Pencatat: <span className="font-medium text-[#071422]">{ptgs.nm_ptgs}</span>
            </div>
          </div>
        </div>

        {/* Tabel Rincian Layanan Cucian (Output 3) */}
        <div className="py-5 border-b border-[#D5E4E4]">
          <h3 className="text-xs font-semibold text-[#425869] uppercase tracking-wider mb-3">
            Rincian Layanan & Berat
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D5E4E4] text-[#425869]">
                  <th className="pb-2 font-medium">Layanan</th>
                  <th className="pb-2 font-medium text-center">Estimasi</th>
                  <th className="pb-2 font-medium text-right">Tarif/kg</th>
                  <th className="pb-2 font-medium text-right">Berat (kg)</th>
                  <th className="pb-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5E4E4]">
                {items.map((it) => (
                  <tr key={it.id_lyn}>
                    <td className="py-2.5 font-medium text-[#071422]">
                      {it.nm_lyn}
                    </td>
                    <td className="py-2.5 text-center font-mono text-[#425869] tabular-nums">
                      {it.est_hari} Hari
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[#2D4659]">
                      {formatRupiah(it.hrg_trans)}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums font-semibold text-[#071422]">
                      {it.brt_kg} kg
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums font-semibold text-[#071422]">
                      {formatRupiah(Math.round(it.brt_kg * it.hrg_trans))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Tagihan */}
          <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#D5E4E4]">
            <span className="font-heading font-bold text-sm text-[#0B253B]">TOTAL TAGIHAN</span>
            <span className="font-heading font-bold text-lg text-[#071422] tabular-nums">
              {formatRupiah(psn.tot_hrg)}
            </span>
          </div>
        </div>

        {/* Informasi Pembayaran (Output 4 Bukti Pembayaran) */}
        {bayar ? (
          <div className="py-4 bg-[#F6FFFF] rounded-md px-4 mt-4 border border-[#D5E4E4]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-[#15803D]" aria-hidden="true" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#15803D]">
                  BUKTI PEMBAYARAN LUNAS
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-[#2D4659] tabular-nums">
                {bayar.id_byr}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
              <div>
                <span className="text-[#425869]">Waktu Bayar:</span>
                <p className="font-mono font-medium text-[#071422] tabular-nums mt-0.5">
                  {formatDateTime(bayar.tgl_byr)}
                </p>
              </div>
              <div>
                <span className="text-[#425869]">Metode:</span>
                <p className="font-medium text-[#071422] mt-0.5">{bayar.met_byr}</p>
              </div>
              <div>
                <span className="text-[#425869]">Jumlah Dibayar:</span>
                <p className="font-mono font-semibold text-[#15803D] tabular-nums mt-0.5">
                  {formatRupiah(bayar.jml_byr)}
                </p>
              </div>
              <div>
                <span className="text-[#425869]">Kasir Penerima:</span>
                <p className="font-medium text-[#071422] mt-0.5">{bayar.nm_ptgs || '-'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 px-4 bg-[#FEE2E2] border border-[#FECACA] rounded-md mt-4 flex items-center justify-between text-xs text-[#B91C1C]">
            <span className="font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              Status Pembayaran: <strong>BELUM LUNAS</strong>
            </span>
            <span>Wajib dilunasi saat pengambilan cucian</span>
          </div>
        )}

        {/* Catatan / Ketentuan */}
        <div className="mt-6 pt-4 border-t border-dashed border-[#D5E4E4] text-xs text-[#425869] leading-relaxed">
          <p className="font-semibold text-[#2D4659]">Perhatian:</p>
          <ul className="list-disc pl-4 space-y-0.5 mt-1">
            <li>Pengambilan cucian wajib membawa tiket/bukti pembayaran ini.</li>
            <li>Cucian yang tidak diambil dalam 30 hari di luar tanggung jawab kami.</li>
            <li>Terima kasih telah mempercayakan cucian Anda kepada Qwash Laundry.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
