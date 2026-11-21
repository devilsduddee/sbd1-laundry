import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  PlusCircle,
  Search,
  Clock,
  Sparkles,
  Shirt,
  CheckCircle2,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/laundry/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatRupiah, formatDateTime } from '@/lib/format';
import type { PesananSummary, StsPsn } from '@shared/schemas';

const STATUS_TABS = [
  'Semua',
  'Antrean',
  'Sedang Dicuci',
  'Sedang Disetrika',
  'Siap Diambil',
  'Sudah Diambil',
] as const;

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreateOrder = user?.level === 'Admin' || user?.level === 'Kasir';
  const containerRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<PesananSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('Semua');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const stsParam = activeTab === 'Semua' ? '' : activeTab;
      const url = `/api/pesanan?sts_psn=${encodeURIComponent(stsParam)}&q=${encodeURIComponent(search)}`;
      const res = await api.get<{ data: PesananSummary[] }>(url);
      setOrders(res.data);
    } catch (err) {
      console.error('Gagal mengambil daftar pesanan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  // GSAP animation for KPI cards (mount once, clearProps agar sejajar simetris)
  useGSAP(
    () => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!isReduced) {
        gsap.fromTo(
          '.kpi-card',
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          }
        );
      }
    },
    { scope: containerRef, dependencies: [] }
  );

  // Counts for KPI
  const countAntrean = orders.filter((o) => o.sts_psn === 'Antrean').length;
  const countDicuci = orders.filter((o) => o.sts_psn === 'Sedang Dicuci').length;
  const countDisetrika = orders.filter((o) => o.sts_psn === 'Sedang Disetrika').length;
  const countSiap = orders.filter((o) => o.sts_psn === 'Siap Diambil').length;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
            Daftar Pesanan Laundry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pantau dan kelola seluruh antrean pengerjaan cucian pelanggan
          </p>
        </div>
        {canCreateOrder && (
          <Button
            onClick={() => navigate('/pesanan/baru')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-sm font-semibold"
          >
            <PlusCircle className="size-4" />
            Buat Tiket Baru
          </Button>
        )}
      </div>

      {/* KPI Cards Ringkas (Adaptasi Qwash) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
        <Card className="kpi-card hover-lift border-[#E4E7F2] rounded-2xl shadow-2xs h-full">
          <CardContent className="p-4 flex items-center gap-3.5 h-full">
            <div className="size-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
              <Clock className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Antrean</p>
              <p className="text-xl font-extrabold text-[#1A1A2E] tabular-nums">
                {countAntrean}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card hover-lift border-[#E4E7F2] rounded-2xl shadow-2xs h-full">
          <CardContent className="p-4 flex items-center gap-3.5 h-full">
            <div className="size-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Sedang Dicuci</p>
              <p className="text-xl font-extrabold text-[#1A1A2E] tabular-nums">
                {countDicuci}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card hover-lift border-[#E4E7F2] rounded-2xl shadow-2xs h-full">
          <CardContent className="p-4 flex items-center gap-3.5 h-full">
            <div className="size-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Shirt className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Sedang Disetrika</p>
              <p className="text-xl font-extrabold text-[#1A1A2E] tabular-nums">
                {countDisetrika}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card hover-lift border-[#E4E7F2] rounded-2xl shadow-2xs h-full">
          <CardContent className="p-4 flex items-center gap-3.5 h-full">
            <div className="size-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Siap Diambil</p>
              <p className="text-xl font-extrabold text-purple-700 tabular-nums">
                {countSiap}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-[#EEF0F8] p-1 rounded-xl flex-wrap h-auto gap-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-xs rounded-lg px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:font-semibold shadow-none"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
            <Input
              type="text"
              placeholder="Cari ID / Pelanggan / HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-[#E4E7F2] text-xs h-9"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="rounded-xl border-[#E4E7F2] h-9"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </form>
      </div>

      {/* Tabel Pesanan */}
      <div className="bg-white border border-[#E4E7F2] rounded-2xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow className="border-b border-[#E4E7F2] text-xs">
              <th className="py-3 px-4 font-semibold text-[#6B7280]">ID Tiket</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280]">Pelanggan</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280]">Tgl Masuk</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-right">Total Tagihan</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-center">Status Cucian</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-center">Pembayaran</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-right">Aksi</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  Memuat data pesanan...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  Tidak ada data pesanan pada filter ini.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow
                  key={o.id_psn}
                  className="hover:bg-[#F5F6FA] cursor-pointer transition-colors border-b border-[#E4E7F2]/60"
                  onClick={() => navigate(`/pesanan/${o.id_psn}`)}
                >
                  <TableCell className="font-mono font-semibold text-xs text-indigo-600 py-3 px-4">
                    {o.id_psn}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <p className="font-semibold text-xs text-[#1A1A2E]">{o.nm_plgn}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">{o.no_hp}</p>
                  </TableCell>
                  <TableCell className="text-xs text-[#4B5563] tabular-nums py-3 px-4">
                    {formatDateTime(o.tgl_msk)}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-[#1A1A2E] text-right tabular-nums py-3 px-4">
                    {formatRupiah(o.tot_hrg)}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    <StatusBadge status={o.sts_psn} size="sm" />
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    <StatusBadge status={o.sts_byr} size="sm" />
                  </TableCell>
                  <TableCell className="text-right py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/pesanan/${o.id_psn}`);
                      }}
                      className="rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 px-2.5 text-xs gap-1.5"
                    >
                      <Eye className="size-3.5" />
                      Detail
                    </Button>
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
