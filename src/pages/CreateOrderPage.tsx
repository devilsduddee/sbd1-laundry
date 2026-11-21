import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, UserPlus, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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

  // Bayar langsung toggle
  const [bayarSekarang, setBayarSekarang] = useState(false);
  const [metByr, setMetByr] = useState<MetByr>('Tunai');
  const [jmlByr, setJmlByr] = useState<number>(0);

  // Modal Tambah Pelanggan Baru Cepat
  const [modalPlgnOpen, setModalPlgnOpen] = useState(false);
  const [newNmPlgn, setNewNmPlgn] = useState('');
  const [newNoHp, setNewNoHp] = useState('');
  const [newAlamat, setNewAlamat] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);

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
      } catch (err) {
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

  // Kalkulasi total & estimasi selesai
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

  const handleSaveNewPelanggan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingModal(true);
      const res = await api.post<{ data: Pelanggan }>('/api/pelanggan', {
        nm_plgn: newNmPlgn,
        no_hp: newNoHp,
        alamat: newAlamat,
      });
      setPelangganList([...pelangganList, res.data]);
      setSelectedPlgnId(res.data.id_plgn);
      setModalPlgnOpen(false);
      setNewNmPlgn('');
      setNewNoHp('');
      setNewAlamat('');
      toast.success('Pelanggan baru berhasil ditambahkan');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambah pelanggan');
    } finally {
      setLoadingModal(false);
    }
  };

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
          onClick={() => navigate('/')}
          className="rounded-xl border-[#E4E7F2] h-9 gap-1 text-xs"
        >
          <ArrowLeft className="size-3.5" />
          Kembali
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1A1A2E]">
            Buat Tiket Pesanan Baru
          </h1>
          <p className="text-xs text-muted-foreground">
            Catat data cucian masuk pelanggan dan rincian layanan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Form Pelanggan & Layanan */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Pilih Pelanggan */}
          <Card className="rounded-2xl border-[#E4E7F2] shadow-2xs">
            <CardHeader className="pb-3 border-b border-[#E4E7F2]">
              <CardTitle className="text-sm font-semibold text-[#1A1A2E] flex justify-between items-center">
                <span>1. Data Pelanggan</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalPlgnOpen(true)}
                  className="h-8 text-xs gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <UserPlus className="size-3.5" />
                  + Pelanggan Baru
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Pilih Pelanggan Terdaftar</Label>
                <Select value={selectedPlgnId} onValueChange={setSelectedPlgnId}>
                  <SelectTrigger className="rounded-xl border-[#E4E7F2] text-xs">
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
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E4E7F2] text-xs space-y-1">
                  <p className="font-semibold text-[#1A1A2E]">{selectedPlgn.nm_plgn}</p>
                  <p className="text-muted-foreground">{selectedPlgn.no_hp}</p>
                  <p className="text-muted-foreground">{selectedPlgn.alamat}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Rincian Layanan Cucian (DTL_PSN) */}
          <Card className="rounded-2xl border-[#E4E7F2] shadow-2xs">
            <CardHeader className="pb-3 border-b border-[#E4E7F2]">
              <CardTitle className="text-sm font-semibold text-[#1A1A2E] flex justify-between items-center">
                <span>2. Rincian Layanan & Berat Cucian</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-8 text-xs gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <Plus className="size-3.5" />
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
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E4E7F2]"
                  >
                    <div className="flex-1 w-full space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Jenis Layanan</Label>
                      <Select
                        value={it.id_lyn}
                        onValueChange={(val) => handleItemChange(idx, 'id_lyn', val)}
                      >
                        <SelectTrigger className="bg-white rounded-lg border-[#E4E7F2] text-xs h-9">
                          <SelectValue placeholder="Pilih Layanan" />
                        </SelectTrigger>
                        <SelectContent>
                          {layananList.map((l) => (
                            <SelectItem key={l.id_lyn} value={l.id_lyn} className="text-xs">
                              {l.nm_lyn} • {formatRupiah(l.hrg_kg)}/kg ({l.est_hari} Hari)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-28 space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Berat / Pcs</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          inputMode="decimal"
                          value={it.brt_kg}
                          onChange={(e) =>
                            handleItemChange(idx, 'brt_kg', parseFloat(e.target.value) || 0)
                          }
                          className="bg-white rounded-lg border-[#E4E7F2] text-xs h-9 pr-7 tabular-nums"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                          kg
                        </span>
                      </div>
                    </div>

                    <div className="w-28 text-right space-y-1">
                      <span className="text-[11px] text-muted-foreground block">Subtotal</span>
                      <span className="text-xs font-bold text-[#1A1A2E] tabular-nums block h-9 leading-9">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>

                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50 self-end sm:self-center"
                      >
                        <Trash2 className="size-4" />
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
          <Card className="rounded-2xl border-[#E4E7F2] shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-[#1E1B4B] text-white p-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShoppingBag className="size-4" />
                Ringkasan Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-2 pb-3 border-b border-[#E4E7F2]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pelanggan:</span>
                  <span className="font-semibold text-[#1A1A2E]">
                    {selectedPlgn ? selectedPlgn.nm_plgn : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah Item:</span>
                  <span className="font-semibold tabular-nums">{items.length} Layanan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimasi Waktu:</span>
                  <span className="font-semibold text-indigo-600 tabular-nums">
                    {maxEstHari} Hari Kerja
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-sm text-[#1A1A2E]">TOTAL BIAYA</span>
                <span className="font-extrabold text-lg text-indigo-600 tabular-nums">
                  {formatRupiah(totalHarga)}
                </span>
              </div>

              {/* Opsi Bayar Sekarang */}
              <div className="p-3 bg-[#EEF0F8] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bayar-toggle" className="text-xs font-semibold cursor-pointer">
                    Bayar Lunas Sekarang?
                  </Label>
                  <input
                    id="bayar-toggle"
                    type="checkbox"
                    checked={bayarSekarang}
                    onChange={(e) => setBayarSekarang(e.target.checked)}
                    className="size-4 rounded accent-indigo-600 cursor-pointer"
                  />
                </div>

                {bayarSekarang && (
                  <div className="space-y-2 pt-2 border-t border-white/60">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Metode Pembayaran</Label>
                      <Select value={metByr} onValueChange={(v) => setMetByr(v as MetByr)}>
                        <SelectTrigger className="bg-white rounded-lg border-[#E4E7F2] text-xs h-8">
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
                      <Label className="text-[11px]">Jumlah Uang Dibayar</Label>
                      <Input
                        type="number"
                        value={jmlByr}
                        onChange={(e) => setJmlByr(parseInt(e.target.value) || 0)}
                        className="bg-white rounded-lg border-[#E4E7F2] text-xs h-8 tabular-nums"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="button"
                disabled={submitting || totalHarga === 0}
                onClick={handleSubmitOrder}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-semibold shadow-md shadow-indigo-100"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
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

      {/* Dialog Cepat Tambah Pelanggan Baru */}
      <Dialog open={modalPlgnOpen} onOpenChange={setModalPlgnOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Tambah Pelanggan Baru
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNewPelanggan} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="new-nama">Nama Lengkap</Label>
              <Input
                id="new-nama"
                value={newNmPlgn}
                onChange={(e) => setNewNmPlgn(e.target.value)}
                placeholder="Contoh: Siti Aisyah"
                autoComplete="name"
                required
                className="rounded-xl border-[#E4E7F2]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-hp">Nomor HP</Label>
              <Input
                id="new-hp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={newNoHp}
                onChange={(e) => setNewNoHp(e.target.value)}
                placeholder="081234567890"
                required
                className="rounded-xl border-[#E4E7F2]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-alamat">Alamat</Label>
              <Input
                id="new-alamat"
                value={newAlamat}
                onChange={(e) => setNewAlamat(e.target.value)}
                placeholder="Jl. Margonda No. 10"
                autoComplete="street-address"
                required
                className="rounded-xl border-[#E4E7F2]"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={loadingModal}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {loadingModal ? 'Menyimpan...' : 'Simpan Pelanggan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
