import React, { useEffect, useState } from 'react';
import { Download, Calendar, BarChart3, CheckCircle, ShieldAlert, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/laundry/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatRupiah, formatDateTime } from '@/lib/format';
import type { LaporanResponse } from '@shared/schemas';

export const ReportPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.level === 'Admin';

  const todayStr = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayStr.slice(0, 7) + '-01'); // Awal bulan ini
  const [endDate, setEndDate] = useState(todayStr);
  const [report, setReport] = useState<LaporanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const url = `/api/laporan?start_date=${startDate}&end_date=${endDate}`;
      const res = await api.get<LaporanResponse>(url);
      setReport(res);
    } catch (err: any) {
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
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
        <ShieldAlert className="size-5" />
        <span>Menu Laporan Transaksi hanya dapat diakses oleh peran <strong>Admin</strong>.</span>
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
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
            Laporan Transaksi Periode (Output 5)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rekapitulasi pendapatan dan rincian transaksi laundry berdasarkan rentang tanggal
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl gap-2 text-xs h-9 font-semibold"
        >
          <Download className="size-4" />
          Ekspor CSV
        </Button>
      </div>

      {/* Filter Periode Tanggal */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-4 rounded-2xl border border-[#E4E7F2] shadow-2xs flex flex-wrap items-end gap-3"
      >
        <div className="space-y-1">
          <Label htmlFor="start-date" className="text-xs font-medium text-muted-foreground">
            Tanggal Awal
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border-[#E4E7F2] text-xs h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="end-date" className="text-xs font-medium text-muted-foreground">
            Tanggal Akhir
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border-[#E4E7F2] text-xs h-9"
          />
        </div>
        <Button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs h-9 gap-1.5 shadow-xs"
        >
          <Filter className="size-3.5" />
          Terapkan Filter
        </Button>
      </form>

      {/* 3 KPI Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-[#E4E7F2] shadow-2xs hover-lift">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <BarChart3 className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Pesanan Masuk</p>
                <p className="text-2xl font-extrabold text-[#1A1A2E] tabular-nums">
                  {report.summary.total_pesanan}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#E4E7F2] shadow-2xs hover-lift">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <CheckCircle className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Transaksi Lunas</p>
                <p className="text-2xl font-extrabold text-blue-700 tabular-nums">
                  {report.summary.total_lunas}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#E4E7F2] shadow-2xs hover-lift">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Calendar className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Pendapatan (Lunas)</p>
                <p className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                  {formatRupiah(report.summary.total_pendapatan)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabel Rincian Transaksi Periode */}
      <div className="bg-white border border-[#E4E7F2] rounded-2xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow className="border-b border-[#E4E7F2] text-xs">
              <th className="py-3 px-4 font-semibold text-[#6B7280]">ID Tiket</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280]">Tanggal Masuk</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280]">Pelanggan</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-right">Total Tagihan</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-center">Status Cucian</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-center">Status Bayar</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-center">Metode</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  Memuat laporan...
                </TableCell>
              </TableRow>
            ) : !report || report.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  Tidak ada transaksi pada rentang tanggal ini.
                </TableCell>
              </TableRow>
            ) : (
              report.rows.map((r) => (
                <TableRow key={r.id_psn} className="hover:bg-[#F5F6FA] border-b border-[#E4E7F2]/60">
                  <TableCell className="font-mono text-xs font-semibold text-indigo-600 py-3 px-4">
                    {r.id_psn}
                  </TableCell>
                  <TableCell className="text-xs text-[#4B5563] tabular-nums py-3 px-4">
                    {formatDateTime(r.tgl_msk)}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-[#1A1A2E] py-3 px-4">
                    {r.nm_plgn}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-[#1A1A2E] text-right tabular-nums py-3 px-4">
                    {formatRupiah(r.tot_hrg)}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    <StatusBadge status={r.sts_psn} size="sm" />
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    <StatusBadge status={r.sts_byr} size="sm" />
                  </TableCell>
                  <TableCell className="text-center text-xs text-[#4B5563] py-3 px-4">
                    {r.met_byr || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
