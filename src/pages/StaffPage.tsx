import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Edit2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { LEVEL_PTGS, type Petugas, type LevelPtgs } from '@shared/schemas';

export const StaffPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.level === 'Admin';

  const [staffList, setStaffList] = useState<Petugas[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nmPtgs, setNmPtgs] = useState('');
  const [usernm, setUsernm] = useState('');
  const [passwd, setPasswd] = useState('');
  const [level, setLevel] = useState<LevelPtgs>('Kasir');
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Petugas[] }>('/api/petugas');
      setStaffList(res.data);
    } catch (err: any) {
      toast.error('Gagal memuat data petugas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchStaff();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
        <ShieldAlert className="size-5" />
        <span>Menu Kelola Petugas hanya dapat diakses oleh peran <strong>Admin</strong>.</span>
      </div>
    );
  }

  const openCreateDialog = () => {
    setIsEdit(false);
    setEditId(null);
    setNmPtgs('');
    setUsernm('');
    setPasswd('');
    setLevel('Kasir');
    setDialogOpen(true);
  };

  const openEditDialog = (p: Petugas) => {
    setIsEdit(true);
    setEditId(p.id_ptgs);
    setNmPtgs(p.nm_ptgs);
    setUsernm(p.usernm);
    setPasswd(''); // kosongkan jika tidak ingin ganti password
    setLevel(p.level);
    setDialogOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEdit && editId) {
        const payload: any = { nm_ptgs: nmPtgs, level };
        if (passwd) payload.passwd = passwd;
        await api.patch(`/api/petugas/${editId}`, payload);
        toast.success('Data petugas berhasil diperbarui');
      } else {
        if (!passwd || passwd.length < 6) {
          toast.error('Password minimal 6 karakter');
          setSaving(false);
          return;
        }
        await api.post('/api/petugas', {
          nm_ptgs: nmPtgs,
          usernm,
          passwd,
          level,
        });
        toast.success('Petugas baru berhasil didaftarkan');
      }
      setDialogOpen(false);
      await fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
            Kelola Akun Petugas (PTGS)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manajemen hak akses petugas kasir, operasional, dan administrator
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 text-xs h-9 shadow-xs font-semibold"
        >
          <UserPlus className="size-4" />
          + Tambah Petugas
        </Button>
      </div>

      {/* Tabel Petugas */}
      <div className="bg-white border border-[#E4E7F2] rounded-2xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow className="border-b border-[#E4E7F2] text-xs">
              <th className="py-3 px-4 font-semibold text-[#6B7280]">ID Petugas</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280]">Nama Lengkap</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280]">Username</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-center">Tingkat Peran</th>
              <th className="py-3 px-4 font-semibold text-[#6B7280] text-right">Aksi</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                  Memuat data petugas...
                </TableCell>
              </TableRow>
            ) : staffList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                  Belum ada data petugas.
                </TableCell>
              </TableRow>
            ) : (
              staffList.map((s) => (
                <TableRow key={s.id_ptgs} className="hover:bg-[#F5F6FA] border-b border-[#E4E7F2]/60">
                  <TableCell className="font-mono text-xs font-semibold text-indigo-600 py-3 px-4">
                    {s.id_ptgs}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-[#1A1A2E] py-3 px-4">
                    {s.nm_ptgs}
                  </TableCell>
                  <TableCell className="text-xs text-[#4B5563] py-3 px-4">
                    @{s.usernm}
                  </TableCell>
                  <TableCell className="text-center py-3 px-4">
                    <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {s.level}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(s)}
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

      {/* Dialog Tambah / Ubah Petugas */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {isEdit ? 'Ubah Data Petugas' : 'Tambah Petugas Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveStaff} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="stf-nama">Nama Lengkap</Label>
              <Input
                id="stf-nama"
                value={nmPtgs}
                onChange={(e) => setNmPtgs(e.target.value)}
                placeholder="Contoh: Rina Wahyuni"
                autoComplete="name"
                required
                className="rounded-xl border-[#E4E7F2]"
              />
            </div>

            {!isEdit && (
              <div className="space-y-1">
                <Label htmlFor="stf-usernm">Username</Label>
                <Input
                  id="stf-usernm"
                  value={usernm}
                  onChange={(e) => setUsernm(e.target.value)}
                  placeholder="rina_kasir"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  spellCheck={false}
                  required
                  className="rounded-xl border-[#E4E7F2]"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="stf-passwd">
                {isEdit ? 'Password Baru (Kosongkan jika tetap)' : 'Password'}
              </Label>
              <Input
                id="stf-passwd"
                type="password"
                value={passwd}
                onChange={(e) => setPasswd(e.target.value)}
                placeholder={isEdit ? '******' : 'Minimal 6 karakter'}
                autoComplete={isEdit ? 'new-password' : 'new-password'}
                required={!isEdit}
                className="rounded-xl border-[#E4E7F2]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="stf-level">Peran Akses</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as LevelPtgs)}>
                <SelectTrigger id="stf-level" className="rounded-xl border-[#E4E7F2] text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_PTGS.map((l) => (
                    <SelectItem key={l} value={l} className="text-xs">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Petugas'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
