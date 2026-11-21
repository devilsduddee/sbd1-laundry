import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/format';
import type { Layanan } from '@shared/schemas';

export const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.level === 'Admin';

  const [services, setServices] = useState<Layanan[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nmLyn, setNmLyn] = useState('');
  const [hrgKg, setHrgKg] = useState<number>(0);
  const [estHari, setEstHari] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Layanan[] }>('/api/layanan');
      setServices(res.data);
    } catch (err) {
      toast.error('Gagal memuat data layanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateDialog = () => {
    setIsEdit(false);
    setEditId(null);
    setNmLyn('');
    setHrgKg(10000);
    setEstHari(2);
    setDialogOpen(true);
  };

  const openEditDialog = (l: Layanan) => {
    setIsEdit(true);
    setEditId(l.id_lyn);
    setNmLyn(l.nm_lyn);
    setHrgKg(l.hrg_kg);
    setEstHari(l.est_hari);
    setDialogOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEdit && editId) {
        await api.patch(`/api/layanan/${editId}`, {
          nm_lyn: nmLyn,
          hrg_kg: Number(hrgKg),
          est_hari: Number(estHari),
        });
        toast.success('Data layanan berhasil diperbarui');
      } else {
        await api.post('/api/layanan', {
          nm_lyn: nmLyn,
          hrg_kg: Number(hrgKg),
          est_hari: Number(estHari),
        });
        toast.success('Layanan baru berhasil ditambahkan');
      }
      setDialogOpen(false);
      await fetchServices();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan layanan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id_lyn: string) => {
    if (!confirm('Yakin ingin menghapus layanan ini?')) return;
    try {
      await api.delete(`/api/layanan/${id_lyn}`);
      toast.success('Layanan berhasil dihapus');
      await fetchServices();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus layanan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman (Output 2) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
            Data Layanan Laundry (Output 2)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar paket layanan cuci, tarif per kg/satuan, dan estimasi pengerjaan
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 text-xs h-9 shadow-xs font-semibold"
          >
            <Plus className="size-4" />
            + Tambah Layanan
          </Button>
        )}
      </div>

      {/* Grid Layanan ala Qwash Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full h-32 flex items-center justify-center text-xs text-muted-foreground">
            Memuat daftar layanan...
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full h-32 flex items-center justify-center text-xs text-muted-foreground">
            Belum ada data layanan.
          </div>
        ) : (
          services.map((l) => (
            <Card
              key={l.id_lyn}
              className="hover-lift rounded-2xl border-[#E4E7F2] bg-white shadow-2xs overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {l.id_lyn}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    <Clock className="size-3 text-indigo-600" />
                    <span>{l.est_hari} Hari</span>
                  </div>
                </div>
                <CardTitle className="text-sm font-bold text-[#1A1A2E] mt-3">
                  {l.nm_lyn}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-2">
                <div className="pt-2 border-t border-[#E4E7F2] flex items-baseline justify-between">
                  <span className="text-[11px] text-muted-foreground">Tarif:</span>
                  <span className="text-base font-extrabold text-indigo-600 tabular-nums">
                    {formatRupiah(l.hrg_kg)}
                    <span className="text-[10px] text-muted-foreground font-normal"> /kg</span>
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-[#E4E7F2]/60">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(l)}
                      className="size-7 p-0 text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(l.id_lyn)}
                      className="size-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Tambah / Ubah Layanan */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {isEdit ? 'Ubah Data Layanan' : 'Tambah Layanan Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveService} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="srv-nama">Nama Layanan</Label>
              <Input
                id="srv-nama"
                value={nmLyn}
                onChange={(e) => setNmLyn(e.target.value)}
                placeholder="Contoh: Cuci Karpet"
                required
                className="rounded-xl border-[#E4E7F2]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="srv-harga">Tarif per Kg / Satuan (Rp)</Label>
              <Input
                id="srv-harga"
                type="number"
                value={hrgKg}
                onChange={(e) => setHrgKg(parseInt(e.target.value) || 0)}
                required
                min={100}
                className="rounded-xl border-[#E4E7F2] tabular-nums"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="srv-hari">Estimasi Pengerjaan (Hari)</Label>
              <Input
                id="srv-hari"
                type="number"
                value={estHari}
                onChange={(e) => setEstHari(parseInt(e.target.value) || 1)}
                required
                min={1}
                className="rounded-xl border-[#E4E7F2] tabular-nums"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Layanan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
