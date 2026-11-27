import React, { useEffect, useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
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
  const containerRef = useRef<HTMLDivElement>(null);

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
    } catch {
      toast.error('Gagal memuat data layanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useGSAP(
    () => {
      if (loading || services.length === 0) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.swiss-card-item',
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            stagger: { each: 0.05, from: 'start', grid: 'auto' },
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          }
        );
      });
    },
    { scope: containerRef, dependencies: [loading, services.length] }
  );

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
      // Preserve form inputs on error
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
    <div ref={containerRef} className="space-y-6">
      {/* Header Halaman (Output 2) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0B253B]">
            Data Layanan Laundry (Output 2)
          </h1>
          <p className="text-xs text-[#425869] mt-0.5">
            Daftar paket layanan cuci, tarif per kg/satuan, dan estimasi pengerjaan
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={openCreateDialog}
            size="sm"
            className="gap-2 text-xs h-9 font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Tambah Layanan
          </Button>
        )}
      </div>

      {/* Grid Layanan Swiss Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full h-32 flex items-center justify-center text-xs text-[#425869]">
            Memuat daftar layanan...
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full h-32 flex items-center justify-center text-xs text-[#425869]">
            Belum ada data layanan.
          </div>
        ) : (
          services.map((l) => (
            <Card
              key={l.id_lyn}
              className="swiss-card-item hover-lift rounded-lg border-[#D5E4E4] bg-white shadow-none overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#0B253B] bg-[#E8F2F2] border border-[#C7DBDB] px-2 py-0.5 rounded-sm tabular-nums">
                    {l.id_lyn}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#425869] bg-[#F6FFFF] border border-[#D5E4E4] px-2 py-0.5 rounded-sm font-mono font-medium tabular-nums">
                    <Clock className="size-3 text-[#006EB3]" aria-hidden="true" />
                    <span>{l.est_hari} Hari</span>
                  </div>
                </div>
                <CardTitle className="text-sm font-bold text-[#071422] mt-3">
                  {l.nm_lyn}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-2">
                <div className="pt-2 border-t border-[#D5E4E4] flex items-baseline justify-between">
                  <span className="text-xs text-[#425869]">Tarif:</span>
                  <span className="font-mono text-base font-bold text-[#006EB3] tabular-nums">
                    {formatRupiah(l.hrg_kg)}
                    <span className="text-xs text-[#425869] font-sans font-normal"> /kg</span>
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-[#D5E4E4]">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Ubah ${l.nm_lyn}`}
                      onClick={() => openEditDialog(l)}
                      className="size-8 p-0 text-[#006EB3] hover:text-[#0B253B] hover:bg-[#E8F2F2] rounded-md"
                    >
                      <Edit2 className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Hapus ${l.nm_lyn}`}
                      onClick={() => handleDeleteService(l.id_lyn)}
                      className="size-8 p-0 text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-md"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
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
        <DialogContent className="rounded-lg max-w-sm border-[#D5E4E4]">
          <DialogHeader>
            <DialogTitle className="font-heading text-base font-bold text-[#0B253B]">
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
                className="rounded-md border-[#D5E4E4]"
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
                className="rounded-md border-[#D5E4E4] font-mono tabular-nums"
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
                className="rounded-md border-[#D5E4E4] font-mono tabular-nums"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#006EB3] hover:bg-[#00588F] text-white rounded-md"
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
