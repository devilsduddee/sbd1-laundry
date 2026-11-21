import React from 'react';
import { Clock, Shirt, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <Card className="rounded-2xl border-[#E4E7F2] shadow-sm bg-white overflow-hidden text-xs">
      {/* Header Tiket */}
      <div className="bg-[#1E1B4B] p-4 text-white flex justify-between items-center">
        <div>
          <span className="text-[11px] text-indigo-200 block font-medium">Nomor Tiket Pesanan</span>
          <span className="font-mono font-bold text-sm tracking-wide">{data.id_psn}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={data.sts_psn} size="sm" />
          <StatusBadge status={data.sts_byr} size="sm" />
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Stepper Progres Ringkas */}
        <div className="space-y-1.5 pb-3 border-b border-[#E4E7F2]">
          <div className="flex justify-between text-[11px] text-[#6B7280] font-medium">
            <span>Tahap Pengerjaan</span>
            <span className="font-semibold text-indigo-600">{data.sts_psn}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {STEPS.slice(0, 4).map((step, idx) => {
              const isPastOrCurrent = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      isCurrent
                        ? 'bg-indigo-600 ring-2 ring-indigo-200'
                        : isPastOrCurrent
                        ? 'bg-indigo-600'
                        : 'bg-[#E4E7F2]'
                    }`}
                  />
                  <span
                    className={`block text-[10px] truncate ${
                      isCurrent ? 'font-bold text-indigo-700' : 'text-[#9CA3AF]'
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
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#E4E7F2]">
          <div>
            <span className="text-[#6B7280] block text-[11px]">Nama Pemesan</span>
            <span className="font-semibold text-[#1A1A2E] text-xs">{data.nm_plgn}</span>
          </div>
          <div>
            <span className="text-[#6B7280] block text-[11px]">Estimasi Selesai</span>
            <span className="font-semibold text-[#1A1A2E] text-xs flex items-center gap-1">
              <Clock className="size-3 text-indigo-500 shrink-0" />
              {formatDateTime(data.est_sls)}
            </span>
          </div>
        </div>

        {/* Rincian Layanan Cucian */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-[#6B7280] font-medium block">Rincian Paket & Berat:</span>
          <div className="space-y-1">
            {data.items.map((it, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-1.5 px-3 bg-[#F8FAFC] rounded-xl border border-[#E4E7F2]/60"
              >
                <div className="flex items-center gap-2">
                  <Shirt className="size-3.5 text-indigo-500 shrink-0" />
                  <span className="font-medium text-[#1A1A2E]">{it.nm_lyn}</span>
                  <span className="text-[11px] text-[#6B7280] tabular-nums">({it.brt_kg} kg)</span>
                </div>
                <span className="font-semibold tabular-nums text-indigo-600">
                  {formatRupiah(it.hrg_trans)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Pembayaran */}
        <div className="pt-2 flex justify-between items-center bg-[#F5F6FA] p-3 rounded-xl border border-[#E4E7F2]">
          <div>
            <span className="text-[11px] text-[#6B7280] block">Total Biaya Cucian</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Metode: {data.sts_byr === 'Lunas' ? 'Lunas Dikonfirmasi' : 'Bayar saat ambil'}
            </span>
          </div>
          <span className="font-extrabold text-base text-[#1A1A2E] tabular-nums">
            {formatRupiah(data.tot_hrg)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
