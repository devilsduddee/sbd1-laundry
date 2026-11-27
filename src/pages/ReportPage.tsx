import React, { useEffect, useState } from 'react';
import { Download, Calendar, BarChart3, CheckCircle2, ShieldAlert, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/laundry/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatRupiah, formatDateTime } from '@/lib/format';
import type { LaporanResponse } from '@shared/schemas';

export const ReportPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.level === 'Admin';

  const todayStr = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayStr.slice(0, 7) + '-01');
  const [endDate, setEndDate] = useState(todayStr);
  const [report, setReport] = useState<LaporanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const url = `/api/laporan?start_date=${startDate}&end_date=${endDate}`;
      const res = await api.get<LaporanResponse>(url);
      setReport(res);
    } catch {
      toast.error('Gagal memuat laporan transaksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchReport();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div
        role="alert"
        className="p-6 bg-[#FEF2F2] border border-[#FECACA] rounded-md flex items-center gap-3 text-[#B91C1C] text-sm"
      >
        <ShieldAlert className="size-5 text-[#DC2626] shrink-0" aria-hidden="true" />
        <span>
          Menu Laporan Transaksi hanya dapat diakses oleh peran <strong>Admin</strong>.
        </span>
      </div>
    );
  }

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExportCSV = () => {
    if (!report || report.rows.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const headers = [
      'ID Tiket',
      'Tanggal Masuk',
      'Pelanggan',
      'No HP',
      'Total Tagihan (Rp)',
      'Status Pengerjaan',
      'Status Bayar',
      'Metode Bayar',
      'Petugas Kasir',
    ];

    const csvRows = [headers.join(',')];

    for (const r of report.rows) {
      const values = [
        `"${r.id_psn}"`,
        `"${r.tgl_msk}"`,
        `"${r.nm_plgn}"`,
        `"${r.no_hp}"`,
        r.tot_hrg,
        `"${r.sts_psn}"`,
        `"${r.sts_byr}"`,
        `"${r.met_byr || '-'}"`,
        `"${r.nm_ptgs}"`,
      ];
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-transaksi-${startDate}-sd-${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil diunduh');
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman (Output 5) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0B1723]">
            Laporan Transaksi Periode (Output 5)
          </h1>
          <p className="text-xs text-[#526474] mt-0.5">
            Rekapitulasi pendapatan dan rincian transaksi laundry berdasarkan rentang tanggal
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          className="gap-2 text-xs h-9 font-semibold"
        >
          <Download className="size-4" aria-hidden="true" />
          Ekspor CSV
        </Button>
      </div>

      {/* Filter Periode Tanggal (Glassy Card) */}
      <form
        onSubmit={handleFilterSubmit}
        className="glass-card p-4 rounded-xl flex flex-wrap items-end gap-3"
      >
        <div className="space-y-1">
          <Label htmlFor="start-date" className="text-xs font-medium text-[#526474]">
            Tanggal Awal
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="font-mono text-xs h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="end-date" className="text-xs font-medium text-[#526474]">
            Tanggal Akhir
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="font-mono text-xs h-9"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          className="text-xs h-9 gap-1.5 font-semibold"
        >
          <Filter className="size-3.5" aria-hidden="true" />
          Terapkan Filter
        </Button>
      </form>

      {/* 3 KPI Summary Cards (Glassy UI) */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="size-11 rounded-lg bg-white/75 border border-white/90 shadow-[0_1px_3px_rgba(11,23,35,0.06)] flex items-center justify-center text-[#006EB3]">
                <BarChart3 className="size-5 stroke-[1.75]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-[#526474] font-medium">Total Pesanan Masuk</p>
                <p className="font-mono text-2xl font-bold text-[#0B1723] tabular-nums">
                  {report.summary.total_pesanan}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="size-11 rounded-lg bg-white/75 border border-white/90 shadow-[0_1px_3px_rgba(11,23,35,0.06)] flex items-center justify-center text-[#006EB3]">
                <CheckCircle2 className="size-5 stroke-[1.75]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-[#526474] font-medium">Transaksi Lunas</p>
                <p className="font-mono text-2xl font-bold text-[#0B1723] tabular-nums">
                  {report.summary.total_lunas}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="size-11 rounded-lg bg-[#EEF6FB]/85 border border-[#C2DDF0] shadow-[0_1px_3px_rgba(0,110,179,0.1)] flex items-center justify-center text-[#006EB3]">
                <Calendar className="size-5 stroke-[1.75]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-[#526474] font-medium">Total Pendapatan (Lunas)</p>
                <p className="font-mono text-2xl font-bold text-[#006EB3] tabular-nums">
                  {formatRupiah(report.summary.total_pendapatan)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Semantic Tabel Rincian Transaksi Periode (Glassy Card) */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0B1723]/[0.025]">
              <TableRow className="border-b border-[#E1E8EB] text-xs hover:bg-transparent">
                <TableHead className="py-3 px-4 font-semibold text-[#526474]">ID Tiket</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#526474]">Tanggal Masuk</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#526474]">Pelanggan</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#526474] text-right">
                  Total Tagihan
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#526474] text-center">
                  Status Cucian
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#526474] text-center">
                  Status Bayar
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#526474] text-center">Metode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-[#526474]">
                    Memuat laporan...
                  </TableCell>
                </TableRow>
              ) : !report || report.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-[#526474]">
                    Tidak ada transaksi pada rentang tanggal ini.
                  </TableCell>
                </TableRow>
              ) : (
                report.rows.map((r) => (
                  <TableRow
                    key={r.id_psn}
                    className="hover:bg-[#F8FAFA] border-b border-[#E1E8EB] last:border-b-0"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-[#006EB3] py-3 px-4 tabular-nums whitespace-nowrap">
                      {r.id_psn}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#2E3E4E] tabular-nums py-3 px-4 whitespace-nowrap">
                      {formatDateTime(r.tgl_msk)}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#0B1723] py-3 px-4">
                      {r.nm_plgn}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-[#0B1723] text-right tabular-nums py-3 px-4 whitespace-nowrap">
                      {formatRupiah(r.tot_hrg)}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      <StatusBadge status={r.sts_psn} size="sm" />
                    </TableCell>
                    <TableCell className="text-center py-3 px-4">
                      <StatusBadge status={r.sts_byr} size="sm" />
                    </TableCell>
                    <TableCell className="text-center text-xs text-[#526474] py-3 px-4">
                      {r.met_byr || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
