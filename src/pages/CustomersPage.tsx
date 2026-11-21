import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import type { Pelanggan } from '@shared/schemas';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog State (Create / Edit)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nmPlgn, setNmPlgn] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Pelanggan[] }>(
        `/api/pelanggan?q=${encodeURIComponent(search)}`
      );
      setCustomers(res.data);
    } catch (err: any) {
      toast.error('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const openCreateDialog = () => {
    setIsEdit(false);
    setEditId(null);
    setNmPlgn('');
    setNoHp('');
    setAlamat('');
    setDialogOpen(true);
  };

  const openEditDialog = (c: Pelanggan) => {
    setIsEdit(true);
    setEditId(c.id_plgn);
    setNmPlgn(c.nm_plgn);
    setNoHp(c.no_hp);
    setAlamat(c.alamat);
    setDialogOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEdit && editId) {
        await api.patch(`/api/pelanggan/${editId}`, {
          nm_plgn: nmPlgn,
          no_hp: noHp,
          alamat,
        });
        toast.success('Data pelanggan berhasil diperbarui');
      } else {
        await api.post('/api/pelanggan', {
          nm_plgn: nmPlgn,
          no_hp: noHp,
          alamat,
        });
        toast.success('Pelanggan baru berhasil ditambahkan');
      }
      setDialogOpen(false);
      await fetchCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman (Output 1) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
            Data Pelanggan (Output 1)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar seluruh pelanggan terdaftar dalam basis data laundry
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 text-xs h-9 shadow-xs font-semibold"
        >
          <UserPlus className="size-4" />
          + Pelanggan Baru
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
          <Input
            type="text"
            placeholder="Cari nama atau nomor HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-[#E4E7F2] text-xs h-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" className="rounded-xl border-[#E4E7F2] h-9">
          Cari
        </Button>
      </form>

      {/* Tabel Pelanggan */}
      <div className="bg-white border border-[#E4E7F2] rounded-2xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow className="border-b border-[#E4E7F2] text-xs">
              <th className="py-3 px-4 font-semibold text-[#6B7280]">ID Pelanggan</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280]">Nama Lengkap</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280]">Nomor HP</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280]">Alamat</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-right">Aksi</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                  Memuat data pelanggan...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                  Belum ada data pelanggan.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id_plgn} className="hover:bg-[#F5F6FA] border-b border-[#E4E7F2]/60">
                  <TableCell className="font-mono text-xs font-semibold text-indigo-600 py-3 px-4">
                    {c.id_plgn}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-[#1A1A2E] py-3 px-4">
                    {c.nm_plgn}
                  </TableCell>
                  <TableCell className="text-xs text-[#4B5563] tabular-nums py-3 px-4">
                    {c.no_hp}
                  </TableCell>
                  <TableCell className="text-xs text-[#4B5563] py-3 px-4">
                    {c.alamat}
                  </TableCell>
                  <TableCell className="text-right py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(c)}
                      className="rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 px-2.5 text-xs gap-1.5"
                    >
                      <Edit2 className="size-3.5" />
                      Ubah
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Tambah / Ubah Pelanggan */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {isEdit ? 'Ubah Data Pelanggan' : 'Tambah Pelanggan Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCustomer} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="cust-nama">Nama Lengkap</Label>
              <Input
                id="cust-nama"
                value={nmPlgn}
                onChange={(e) => setNmPlgn(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                autoComplete="name"
                required
                className="rounded-xl border-[#E4E7F2]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cust-hp">Nomor HP</Label>
              <Input
                id="cust-hp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                required
                className="rounded-xl border-[#E4E7F2]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cust-alamat">Alamat</Label>
              <Input
                id="cust-alamat"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jl. Margonda Raya No. 12"
                autoComplete="street-address"
                required
                className="rounded-xl border-[#E4E7F2]"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
