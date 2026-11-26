import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  PlusCircle,
  Search,
  Clock,
  Droplets,
  Flame,
  PackageCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/laundry/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatRupiah, formatDateTime } from '@/lib/format';
import type { PesananSummary } from '@shared/schemas';

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

  // GSAP stagger KPI cards dengan guard reduced motion & anti-overshoot (power2.out)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.kpi-card',
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            stagger: { each: 0.05, from: 'start' },
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          }
        );
      });
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
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Daftar Pesanan Laundry
          </h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Pantau dan kelola seluruh antrean pengerjaan cucian pelanggan
          </p>
        </div>
        {canCreateOrder && (
          <Button
            onClick={() => navigate('/pesanan/baru')}
            className="bg-[#0369A1] hover:bg-[#0284C7] text-white rounded-md gap-2 font-semibold min-h-[44px] sm:min-h-0"
          >
            <PlusCircle className="size-4 stroke-[1.75]" aria-hidden="true" />
            Buat Tiket Baru
          </Button>
        )}
      </div>

      {/* KPI Cards Ringkas (Minimalism & Swiss Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <Card className="kpi-card hover-lift border-[#E2E8F0] rounded-lg shadow-none bg-white h-full">
          <CardContent className="p-4 flex items-center gap-3.5 h-full">
            <div className="size-10 rounded-md bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center text-[#334155] shrink-0">
              <Clock className="size-5 stroke-[1.75]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#475569] font-medium truncate">Antrean</p>
              <p className="font-mono text-2xl font-bold text-[#020617] tabular-nums">
                {countAntrean}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card hover-lift border-[#E2E8F0] rounded-lg shadow-none bg-white h-full">
          <CardContent className="p-4 flex items-center gap-3.5 h-full">
            <div className="size-10 rounded-md bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0369A1] shrink-0">
              <Droplets className="size-5 stroke-[1.75]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#475569] font-medium truncate">Sedang Dicuci</p>
              <p className="font-mono text-2xl font-bold text-[#0369A1] tabular-nums">
                {countDicuci}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card hover-lift border-[#E2E8F0] rounded-lg shadow-none bg-white h-full">
          <CardContent className="p-4 flex items-center gap-3.5 h-full">
            <div className="size-10 rounded-md bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shrink-0">
              <Flame className="size-5 stroke-[1.75]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#475569] font-medium truncate">Sedang Disetrika</p>
              <p className="font-mono text-2xl font-bold text-[#B45309] tabular-nums">
                {countDisetrika}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card hover-lift border-[#E2E8F0] rounded-lg shadow-none bg-white h-full">
          <CardContent className="p-4 flex items-center gap-3.5 h-full">
            <div className="size-10 rounded-md bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] shrink-0">
              <PackageCheck className="size-5 stroke-[1.75]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#475569] font-medium truncate">Siap Diambil</p>
              <p className="font-mono text-2xl font-bold text-[#6D28D9] tabular-nums">
                {countSiap}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
          <TabsList className="bg-[#E8ECF1] p-1 rounded-md flex-wrap h-auto gap-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-xs rounded-sm px-3 py-1.5 text-[#475569] data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:font-semibold shadow-none"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
          <div className="relative w-full lg:w-64">
            <Label htmlFor="search-orders" className="sr-only">
              Cari nomor tiket, nama pelanggan, atau nomor HP
            </Label>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#475569]"
              aria-hidden="true"
            />
            <Input
              id="search-orders"
              type="text"
              placeholder="Cari ID / Pelanggan / HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-md border-[#E2E8F0] focus-visible:ring-[#0F172A] text-xs h-9 bg-white"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            aria-label="Muat ulang daftar pesanan"
            className="rounded-md border-[#E2E8F0] hover:bg-[#E8ECF1] text-[#0F172A] h-9 px-3"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
          </Button>
        </form>
      </div>

      {/* Semantic Tabel Pesanan dengan overflow-x-auto */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow className="border-b border-[#E2E8F0] text-xs hover:bg-transparent">
                <TableHead className="py-3 px-4 font-semibold text-[#475569]">ID Tiket</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#475569]">Pelanggan</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#475569]">Tgl Masuk</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#475569] text-right">
                  Total Tagihan
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#475569] text-center">
                  Status Cucian
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#475569] text-center">
                  Pembayaran
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#475569] text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-[#475569]">
                    Memuat data pesanan...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-[#475569]">
                    Tidak ada data pesanan pada filter ini.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow
                    key={o.id_psn}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors border-b border-[#E2E8F0] last:border-b-0"
                    onClick={() => navigate(`/pesanan/${o.id_psn}`)}
                  >
                    <TableCell className="font-mono font-semibold text-xs text-[#0369A1] py-3 px-4 tabular-nums whitespace-nowrap">
                      {o.id_psn}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <p className="font-semibold text-xs text-[#020617]">{o.nm_plgn}</p>
                      <p className="font-mono text-xs text-[#475569] tabular-nums">{o.no_hp}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#334155] tabular-nums py-3 px-4 whitespace-nowrap">
                      {formatDateTime(o.tgl_msk)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-[#020617] text-right tabular-nums py-3 px-4 whitespace-nowrap">
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
                        className="rounded-md text-[#0369A1] hover:text-[#0F172A] hover:bg-[#E8ECF1] h-8 px-2.5 text-xs gap-1.5 font-medium"
                      >
                        <Eye className="size-3.5" aria-hidden="true" />
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
    </div>
  );
};
