import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import type { Pelanggan } from '@shared/schemas';

interface QuickCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: Pelanggan) => void;
}

export const QuickCustomerDialog: React.FC<QuickCustomerDialogProps> = ({
  open,
  onOpenChange,
  onCreated,
}) => {
  const [nmPlgn, setNmPlgn] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post<{ data: Pelanggan }>('/api/pelanggan', {
        nm_plgn: nmPlgn,
        no_hp: noHp,
        alamat,
      });
      toast.success('Pelanggan baru berhasil ditambahkan');
      onCreated(res.data);
      onOpenChange(false);
      setNmPlgn('');
      setNoHp('');
      setAlamat('');
    } catch (err: any) {
      // Preserve form inputs on failed submit
      toast.error(err.message || 'Gagal menambah pelanggan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-lg max-w-sm border-[#D5E4E4]">
        <DialogHeader>
          <DialogTitle className="font-heading text-base font-bold text-[#0B253B]">
            Tambah Pelanggan Baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <Label htmlFor="quick-cust-nama">Nama Lengkap</Label>
            <Input
              id="quick-cust-nama"
              value={nmPlgn}
              onChange={(e) => setNmPlgn(e.target.value)}
              placeholder="Contoh: Siti Aisyah"
              autoComplete="name"
              required
              className="rounded-md border-[#D5E4E4]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="quick-cust-hp">Nomor HP</Label>
            <Input
              id="quick-cust-hp"
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
            <Label htmlFor="quick-cust-alamat">Alamat</Label>
            <Input
              id="quick-cust-alamat"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Jl. Margonda No. 10"
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
              {saving ? 'Menyimpan...' : 'Simpan Pelanggan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
