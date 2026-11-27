import React from 'react';
import { Clock, Shirt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { formatRupiah, formatDateTime } from '@/lib/format';
import type { StsPsn, StsByr } from '@shared/schemas';

export interface PublicTrackingData {
  id_psn: string;
  nm_plgn: string;
  tgl_msk: string;
  est_sls: string;
  tot_hrg: number;
  sts_psn: StsPsn;
  sts_byr: StsByr | 'Belum Lunas';
  items: Array<{ nm_lyn: string; brt_kg: number; hrg_trans: number }>;
}

const STEPS: StsPsn[] = [
  'Antrean',
  'Sedang Dicuci',
  'Sedang Disetrika',
  'Siap Diambil',
  'Sudah Diambil',
];

export const PublicTrackingCard: React.FC<{ data: PublicTrackingData }> = ({ data }) => {
  const currentStepIdx = STEPS.indexOf(data.sts_psn);

  return (
    <Card className="rounded-lg border-[#D5E4E4] shadow-none bg-white overflow-hidden text-xs">
      {/* Header Tiket */}
      <div className="bg-[#0B253B] p-4 text-white flex justify-between items-center gap-2">
        <div>
          <span className="text-xs text-slate-300 block font-medium">Nomor Tiket Pesanan</span>
          <span className="font-mono font-bold text-sm tracking-tight tabular-nums">{data.id_psn}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <StatusBadge status={data.sts_psn} size="sm" />
          <StatusBadge status={data.sts_byr} size="sm" />
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Stepper Progres Ringkas */}
        <div className="space-y-1.5 pb-3 border-b border-[#D5E4E4]">
          <div className="flex justify-between text-xs text-[#425869] font-medium">
            <span>Tahap Pengerjaan</span>
            <span className="font-semibold text-[#006EB3]">{data.sts_psn}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {STEPS.slice(0, 4).map((step, idx) => {
              const isPastOrCurrent = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-sm transition-colors ${
                      isCurrent
                        ? 'bg-[#006EB3] ring-2 ring-[#D5ECEB]'
                        : isPastOrCurrent
                        ? 'bg-[#006EB3]'
                        : 'bg-[#D5E4E4]'
                    }`}
                  />
                  <span
                    className={`block text-xs truncate ${
                      isCurrent ? 'font-bold text-[#0B253B]' : 'text-[#425869]'
                    }`}
                  >
                    {step.replace('Sedang ', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Pemesan & Waktu */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#D5E4E4]">
          <div>
            <span className="text-[#425869] block text-xs">Nama Pemesan</span>
            <span className="font-semibold text-[#071422] text-xs">{data.nm_plgn}</span>
          </div>
          <div>
            <span className="text-[#425869] block text-xs">Estimasi Selesai</span>
            <span className="font-mono font-semibold text-[#071422] text-xs flex items-center gap-1 tabular-nums">
              <Clock className="size-3.5 text-[#006EB3] shrink-0" aria-hidden="true" />
              {formatDateTime(data.est_sls)}
            </span>
          </div>
        </div>

        {/* Rincian Layanan Cucian */}
        <div className="space-y-1.5">
          <span className="text-xs text-[#425869] font-medium block">Rincian Paket & Berat:</span>
          <div className="space-y-1.5">
            {data.items.map((it, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 px-3 bg-[#F6FFFF] rounded-md border border-[#D5E4E4]"
              >
                <div className="flex items-center gap-2">
                  <Shirt className="size-3.5 text-[#006EB3] shrink-0" aria-hidden="true" />
                  <span className="font-medium text-[#071422]">{it.nm_lyn}</span>
                  <span className="font-mono text-xs text-[#425869] tabular-nums">({it.brt_kg} kg)</span>
                </div>
                <span className="font-mono font-semibold tabular-nums text-[#0B253B]">
                  {formatRupiah(it.hrg_trans)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Pembayaran */}
        <div className="pt-2 flex justify-between items-center bg-[#F6FFFF] p-3 rounded-md border border-[#D5E4E4]">
          <div>
            <span className="text-xs text-[#425869] block">Total Biaya Cucian</span>
            <span className="text-xs text-[#425869] font-medium">
              Metode: {data.sts_byr === 'Lunas' ? 'Lunas Dikonfirmasi' : 'Bayar saat ambil'}
            </span>
          </div>
          <span className="font-heading font-bold text-base text-[#071422] tabular-nums">
            {formatRupiah(data.tot_hrg)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
