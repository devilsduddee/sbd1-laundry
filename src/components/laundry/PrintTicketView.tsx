import React from 'react';
import { Printer, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
        >
          <Printer className="size-4" />
          Cetak Tiket / Struk
        </Button>
      </div>

      {/* Area Struk / Tiket Fisik */}
      <div className="bg-white border border-[#E4E7F2] rounded-2xl p-6 md:p-8 shadow-xs print:border-none print:shadow-none print:p-0 text-[#1A1A2E] text-sm">
        {/* Header Usaha */}
        <div className="flex justify-between items-start pb-6 border-b border-[#E4E7F2]">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-indigo-900">
              QWASH LAUNDRY & DRY CLEANING
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Layanan Cuci Higienis, Bersih, dan Terpercaya
            </p>
            <p className="text-xs text-[#6B7280]">
              Jl. Margonda Raya No. 100, Depok • Telp: 0812-3456-7890
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-[#6B7280] font-semibold">
              Tiket Pesanan
            </span>
            <p className="font-mono font-bold text-base text-indigo-600">
              {psn.id_psn}
            </p>
            <div className="mt-1 flex justify-end gap-1.5">
              <StatusBadge status={psn.sts_psn} size="sm" />
              <StatusBadge
                status={bayar ? 'Lunas' : 'Belum Lunas'}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Informasi Pelanggan & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 border-b border-[#E4E7F2] text-xs">
          <div>
            <span className="text-[#6B7280] font-medium">Pelanggan:</span>
            <p className="text-sm font-semibold text-[#1A1A2E] mt-0.5">
              {plgn.nm_plgn}
            </p>
            <p className="text-[#4B5563] tabular-nums">{plgn.no_hp}</p>
            <p className="text-[#6B7280] mt-0.5">{plgn.alamat}</p>
          </div>
          <div className="md:text-right flex flex-col md:items-end">
            <div>
              <span className="text-[#6B7280] font-medium">Tanggal Masuk:</span>
              <p className="font-medium text-[#1A1A2E] tabular-nums">
                {formatDateTime(psn.tgl_msk)}
              </p>
            </div>
            <div className="mt-2">
              <span className="text-[#6B7280] font-medium">Estimasi Selesai:</span>
              <p className="font-semibold text-indigo-600 tabular-nums">
                {formatDateTime(psn.est_sls)}
              </p>
            </div>
            <div className="mt-1 text-[#6B7280]">
              Kasir Pencatat: <span className="font-medium">{ptgs.nm_ptgs}</span>
            </div>
          </div>
        </div>

        {/* Tabel Rincian Layanan Cucian (Output 3) */}
        <div className="py-5 border-b border-[#E4E7F2]">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
            Rincian Layanan & Berat
          </h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E4E7F2] text-[#6B7280]">
                <th className="pb-2 font-medium">Layanan</th>
                <th className="pb-2 font-medium text-center">Estimasi</th>
                <th className="pb-2 font-medium text-right">Tarif/kg</th>
                <th className="pb-2 font-medium text-right">Berat (kg)</th>
                <th className="pb-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {items.map((it) => (
                <tr key={it.id_lyn}>
                  <td className="py-2.5 font-medium text-[#1A1A2E]">
                    {it.nm_lyn}
                  </td>
                  <td className="py-2.5 text-center text-[#6B7280]">
                    {it.est_hari} Hari
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-[#4B5563]">
                    {formatRupiah(it.hrg_trans)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums font-semibold text-[#1A1A2E]">
                    {it.brt_kg} kg
                  </td>
                  <td className="py-2.5 text-right tabular-nums font-semibold text-[#1A1A2E]">
                    {formatRupiah(Math.round(it.brt_kg * it.hrg_trans))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Tagihan */}
          <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#E4E7F2]">
            <span className="font-bold text-sm text-[#1A1A2E]">TOTAL TAGIHAN</span>
            <span className="font-extrabold text-base text-indigo-600 tabular-nums">
              {formatRupiah(psn.tot_hrg)}
            </span>
          </div>
        </div>

        {/* Informasi Pembayaran (Output 4 Bukti Pembayaran) */}
        {bayar ? (
          <div className="py-4 bg-[#F8FAFC] rounded-xl px-4 mt-4 border border-[#E4E7F2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-emerald-600" />
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-700">
                  BUKTI PEMBAYARAN LUNAS
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-[#4B5563]">
                {bayar.id_byr}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
              <div>
                <span className="text-[#6B7280]">Waktu Bayar:</span>
                <p className="font-medium tabular-nums">{formatDateTime(bayar.tgl_byr)}</p>
              </div>
              <div>
                <span className="text-[#6B7280]">Metode:</span>
                <p className="font-medium">{bayar.met_byr}</p>
              </div>
              <div>
                <span className="text-[#6B7280]">Jumlah Dibayar:</span>
                <p className="font-semibold text-emerald-700 tabular-nums">
                  {formatRupiah(bayar.jml_byr)}
                </p>
              </div>
              <div>
                <span className="text-[#6B7280]">Kasir Penerima:</span>
                <p className="font-medium">{bayar.nm_ptgs || '-'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 px-4 bg-red-50 border border-red-200 rounded-xl mt-4 flex items-center justify-between text-xs text-red-700">
            <span className="font-medium">
              Status Pembayaran: <strong>BELUM LUNAS</strong>
            </span>
            <span>Wajib dilunasi saat pengambilan cucian</span>
          </div>
        )}

        {/* Catatan / Ketentuan */}
        <div className="mt-6 pt-4 border-t border-dashed border-[#E4E7F2] text-[11px] text-[#6B7280] leading-relaxed">
          <p className="font-semibold text-[#4B5563]">Perhatian:</p>
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
