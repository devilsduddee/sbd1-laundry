import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, UserPlus, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuickCustomerDialog } from '@/components/laundry/QuickCustomerDialog';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/format';
import type { Pelanggan, Layanan, MetByr } from '@shared/schemas';

interface OrderRow {
  id_lyn: string;
  brt_kg: number;
}

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [selectedPlgnId, setSelectedPlgnId] = useState<string>('');
  const [items, setItems] = useState<OrderRow[]>([{ id_lyn: '', brt_kg: 1 }]);

  const [bayarSekarang, setBayarSekarang] = useState(false);
  const [metByr, setMetByr] = useState<MetByr>('Tunai');
  const [jmlByr, setJmlByr] = useState<number>(0);

  const [modalPlgnOpen, setModalPlgnOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, lRes] = await Promise.all([
          api.get<{ data: Pelanggan[] }>('/api/pelanggan'),
          api.get<{ data: Layanan[] }>('/api/layanan'),
        ]);
        setPelangganList(pRes.data);
        setLayananList(lRes.data);
        if (lRes.data.length > 0) {
          setItems([{ id_lyn: lRes.data[0].id_lyn, brt_kg: 1 }]);
        }
      } catch {
        toast.error('Gagal memuat data master');
      }
    }
    loadData();
  }, []);

  const handleAddItem = () => {
    const defaultLyn = layananList.length > 0 ? layananList[0].id_lyn : '';
    setItems([...items, { id_lyn: defaultLyn, brt_kg: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderRow, value: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: value };
    setItems(copy);
  };

  let totalHarga = 0;
  let maxEstHari = 1;
  for (const it of items) {
    const l = layananList.find((x) => x.id_lyn === it.id_lyn);
    if (l) {
      totalHarga += Math.round(Number(it.brt_kg || 0) * l.hrg_kg);
      if (l.est_hari > maxEstHari) maxEstHari = l.est_hari;
    }
  }

  useEffect(() => {
    if (bayarSekarang && jmlByr === 0) {
      setJmlByr(totalHarga);
    }
  }, [totalHarga, bayarSekarang]);

  const handleSubmitOrder = async () => {
    if (!selectedPlgnId) {
      toast.error('Pilih pelanggan terlebih dahulu');
      return;
    }

    if (items.some((it) => !it.id_lyn || it.brt_kg <= 0)) {
      toast.error('Pastikan seluruh item memiliki layanan dan berat lebih dari 0');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        id_plgn: selectedPlgnId,
        items: items.map((it) => ({
          id_lyn: it.id_lyn,
          brt_kg: Number(it.brt_kg),
        })),
      };

      if (bayarSekarang) {
        if (jmlByr < totalHarga) {
          toast.error(`Nominal bayar kurang dari total tagihan (${formatRupiah(totalHarga)})`);
          setSubmitting(false);
          return;
        }
        payload.bayar_langsung = {
          met_byr: metByr,
          jml_byr: Number(jmlByr),
        };
      }

      const res = await api.post<{ data: { id_psn: string } }>('/api/pesanan', payload);
      toast.success('Tiket pesanan berhasil dibuat!');
      navigate(`/pesanan/${res.data.id_psn}`);
    } catch (err: any) {
      // Preserve form inputs on server error
      toast.error(err.message || 'Gagal membuat pesanan');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlgn = pelangganList.find((p) => p.id_plgn === selectedPlgnId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/pesanan')}
          className="group h-9 gap-1.5 text-xs font-medium"
        >
          <ArrowLeft
            className="size-3.5 transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:-translate-x-[3px]"
            aria-hidden="true"
          />
          Kembali
        </Button>
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0B1723]">
            Buat Tiket Pesanan Baru
          </h1>
          <p className="text-xs text-[#526474]">
            Catat data cucian masuk pelanggan dan rincian layanan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Form Pelanggan & Layanan */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="rounded-lg border-[#E1E8EB] bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#E1E8EB] bg-[#F8FAFA]">
              <CardTitle className="text-sm font-semibold text-[#0B1723] flex justify-between items-center">
                <span>1. Data Pelanggan</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalPlgnOpen(true)}
                  className="h-8 text-xs gap-1.5 text-[#006EB3] font-medium"
                >
                  <UserPlus className="size-3.5" aria-hidden="true" />
                  Pelanggan Baru
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="select-pelanggan" className="text-xs font-medium text-[#0B1723]">
                  Pilih Pelanggan Terdaftar
                </Label>
                <Select value={selectedPlgnId} onValueChange={setSelectedPlgnId}>
                  <SelectTrigger
                    id="select-pelanggan"
                    className="text-xs h-10 bg-white"
                  >
                    <SelectValue placeholder="-- Pilih Pelanggan --" />
                  </SelectTrigger>
                  <SelectContent>
                    {pelangganList.map((p) => (
                      <SelectItem key={p.id_plgn} value={p.id_plgn} className="text-xs">
                        {p.nm_plgn} ({p.no_hp})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlgn && (
                <div className="p-3 bg-[#F8FAFA] rounded-md border border-[#E1E8EB] text-xs space-y-1">
                  <p className="font-semibold text-[#0B1723]">{selectedPlgn.nm_plgn}</p>
                  <p className="font-mono text-[#526474] tabular-nums">{selectedPlgn.no_hp}</p>
                  <p className="text-[#526474]">{selectedPlgn.alamat}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-[#E1E8EB] bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#E1E8EB] bg-[#F8FAFA]">
              <CardTitle className="text-sm font-semibold text-[#0B1723] flex justify-between items-center">
                <span>2. Rincian Layanan & Berat Cucian</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-8 text-xs gap-1.5 text-[#006EB3] font-medium"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Tambah Layanan
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {items.map((it, idx) => {
                const lyn = layananList.find((l) => l.id_lyn === it.id_lyn);
                const subtotal = lyn ? Math.round(it.brt_kg * lyn.hrg_kg) : 0;

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-3 bg-[#F8FAFA] rounded-md border border-[#E1E8EB]"
                  >
                    <div className="flex-1 w-full space-y-1">
                      <Label htmlFor={`lyn-${idx}`} className="text-xs text-[#526474]">
                        Jenis Layanan
                      </Label>
                      <Select
                        value={it.id_lyn}
                        onValueChange={(val) => handleItemChange(idx, 'id_lyn', val)}
                      >
                        <SelectTrigger
                          id={`lyn-${idx}`}
                          className="bg-white text-xs h-9"
                        >
                          <SelectValue placeholder="Pilih Layanan" />
                        </SelectTrigger>
                        <SelectContent>
                          {layananList.map((l) => (
                            <SelectItem key={l.id_lyn} value={l.id_lyn} className="text-xs">
                              {l.nm_lyn} | {formatRupiah(l.hrg_kg)}/kg ({l.est_hari} Hari)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-28 space-y-1">
                      <Label htmlFor={`brt-${idx}`} className="text-xs text-[#526474]">
                        Berat (kg)
                      </Label>
                      <div className="relative">
                        <Input
                          id={`brt-${idx}`}
                          type="number"
                          step="0.1"
                          min="0.1"
                          inputMode="decimal"
                          value={it.brt_kg}
                          onChange={(e) =>
                            handleItemChange(idx, 'brt_kg', parseFloat(e.target.value) || 0)
                          }
                          className="bg-white font-mono text-xs h-9 pr-7 tabular-nums"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#526474]">
                          kg
                        </span>
                      </div>
                    </div>

                    <div className="w-28 text-right space-y-1">
                      <span className="text-xs text-[#526474] block">Subtotal</span>
                      <span className="font-mono text-xs font-bold text-[#0B1723] tabular-nums block h-9 leading-9">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>

                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Hapus layanan"
                        onClick={() => handleRemoveItem(idx)}
                        className="size-9 text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEF2F2] self-end"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Sticky Summary Card */}
        <div className="space-y-4 sticky top-6">
          <Card className="rounded-lg border-[#E1E8EB] bg-white overflow-hidden">
            <CardHeader className="bg-[#F8FAFA] border-b border-[#E1E8EB] text-[#0B1723] p-4">
              <CardTitle className="font-heading text-sm font-bold flex items-center gap-2">
                <ShoppingBag className="size-4 text-[#006EB3]" aria-hidden="true" />
                Ringkasan Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-2 pb-3 border-b border-[#E1E8EB]">
                <div className="flex justify-between">
                  <span className="text-[#526474]">Pelanggan:</span>
                  <span className="font-semibold text-[#0B1723]">
                    {selectedPlgn ? selectedPlgn.nm_plgn : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#526474]">Jumlah Item:</span>
                  <span className="font-mono font-semibold text-[#0B1723] tabular-nums">
                    {items.length} Layanan
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#526474]">Estimasi Waktu:</span>
                  <span className="font-mono font-semibold text-[#006EB3] tabular-nums">
                    {maxEstHari} Hari Kerja
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="font-heading font-bold text-sm text-[#0B1723]">TOTAL BIAYA</span>
                <span className="font-heading font-bold text-xl text-[#0B1723] tabular-nums">
                  {formatRupiah(totalHarga)}
                </span>
              </div>

              <div className="p-3 bg-[#F8FAFA] border border-[#E1E8EB] rounded-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bayar-toggle" className="text-xs font-semibold text-[#0B1723] cursor-pointer">
                    Bayar Lunas Sekarang?
                  </Label>
                  <input
                    id="bayar-toggle"
                    type="checkbox"
                    checked={bayarSekarang}
                    onChange={(e) => setBayarSekarang(e.target.checked)}
                    className="size-4 rounded accent-[#006EB3] cursor-pointer"
                  />
                </div>

                {bayarSekarang && (
                  <div className="space-y-2 pt-2 border-t border-[#E1E8EB]">
                    <div className="space-y-1">
                      <Label htmlFor="met-byr" className="text-xs text-[#526474]">
                        Metode Pembayaran
                      </Label>
                      <Select value={metByr} onValueChange={(v) => setMetByr(v as MetByr)}>
                        <SelectTrigger id="met-byr" className="bg-white text-xs h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tunai" className="text-xs">
                            Tunai (Cash)
                          </SelectItem>
                          <SelectItem value="Transfer" className="text-xs">
                            Transfer Bank / QRIS
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="jml-byr" className="text-xs text-[#526474]">
                        Jumlah Uang Dibayar
                      </Label>
                      <Input
                        id="jml-byr"
                        type="number"
                        value={jmlByr}
                        onChange={(e) => setJmlByr(parseInt(e.target.value) || 0)}
                        className="bg-white font-mono text-xs h-9 tabular-nums"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="button"
                disabled={submitting || totalHarga === 0}
                onClick={handleSubmitOrder}
                className="w-full h-10 font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan & Buat Tiket'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickCustomerDialog
        open={modalPlgnOpen}
        onOpenChange={setModalPlgnOpen}
        onCreated={(newCustomer) => {
          setPelangganList([...pelangganList, newCustomer]);
          setSelectedPlgnId(newCustomer.id_plgn);
        }}
      />
    </div>
  );
};
