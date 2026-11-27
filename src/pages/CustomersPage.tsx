import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    } catch {
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
      // Preserve form inputs on error
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
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0B253B]">
            Data Pelanggan (Output 1)
          </h1>
          <p className="text-xs text-[#425869] mt-0.5">
            Daftar seluruh pelanggan terdaftar dalam basis data laundry
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-[#006EB3] hover:bg-[#00588F] text-white rounded-md gap-2 text-xs h-9 font-semibold"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          Pelanggan Baru
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
        <div className="relative w-full">
          <Label htmlFor="search-customers" className="sr-only">
            Cari nama pelanggan atau nomor HP
          </Label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#425869]"
            aria-hidden="true"
          />
          <Input
            id="search-customers"
            type="text"
            placeholder="Cari nama atau nomor HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-md border-[#D5E4E4] focus-visible:ring-[#0B253B] text-xs h-9 bg-white"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="rounded-md border-[#D5E4E4] hover:bg-[#E8F2F2] text-[#0B253B] h-9"
        >
          Cari
        </Button>
      </form>

      {/* Semantic Tabel Pelanggan */}
      <div className="bg-white border border-[#D5E4E4] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-[#D5ECEB]/55 to-[#EFE2CE]/45">
              <TableRow className="border-b border-[#D5E4E4] text-xs hover:bg-transparent">
                <TableHead className="py-3 px-4 font-semibold text-[#425869]">ID Pelanggan</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#425869]">Nama Lengkap</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#425869]">Nomor HP</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#425869]">Alamat</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-[#425869] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-[#425869]">
                    Memuat data pelanggan...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-[#425869]">
                    Belum ada data pelanggan.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow
                    key={c.id_plgn}
                    className="hover:bg-[#F6FFFF] border-b border-[#D5E4E4] last:border-b-0"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-[#006EB3] py-3 px-4 tabular-nums whitespace-nowrap">
                      {c.id_plgn}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-[#071422] py-3 px-4">
                      {c.nm_plgn}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#2D4659] tabular-nums py-3 px-4 whitespace-nowrap">
                      {c.no_hp}
                    </TableCell>
                    <TableCell className="text-xs text-[#425869] py-3 px-4">
                      {c.alamat}
                    </TableCell>
                    <TableCell className="text-right py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(c)}
                        className="rounded-md text-[#006EB3] hover:text-[#0B253B] hover:bg-[#E8F2F2] h-8 px-2.5 text-xs gap-1.5 font-medium"
                      >
                        <Edit2 className="size-3.5" aria-hidden="true" />
                        Ubah
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog Tambah / Ubah Pelanggan */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-lg max-w-sm border-[#D5E4E4]">
          <DialogHeader>
            <DialogTitle className="font-heading text-base font-bold text-[#0B253B]">
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
                className="rounded-md border-[#D5E4E4]"
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
                className="rounded-md border-[#D5E4E4] font-mono"
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
                className="rounded-md border-[#D5E4E4]"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#006EB3] hover:bg-[#00588F] text-white rounded-md"
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
