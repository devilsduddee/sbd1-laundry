import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Play,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { OrderStepper } from '@/components/laundry/OrderStepper';
import { PrintTicketView } from '@/components/laundry/PrintTicketView';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/format';
import type { PesananDetailResponse, StsPsn, MetByr } from '@shared/schemas';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState<PesananDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Bayar
  const [modalBayarOpen, setModalBayarOpen] = useState(false);
  const [metByr, setMetByr] = useState<MetByr>('Tunai');
  const [jmlByr, setJmlByr] = useState<number>(0);
  const [paying, setPaying] = useState(false);

  // Status update loading
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get<PesananDetailResponse>(`/api/pesanan/${id}`);
      setData(res);
      setJmlByr(res.psn.tot_hrg);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-64 text-xs text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin text-indigo-600" />
        Memuat detail pesanan...
      </div>
    );
  }

  const { psn, bayar } = data;
  const isLunas = bayar && bayar.sts_byr === 'Lunas';
  const isSiap = psn.sts_psn === 'Siap Diambil';
  const isSelesai = psn.sts_psn === 'Sudah Diambil';

  // Handler advance status bertahap (Prosedur 4)
  const handleAdvanceStatus = async (nextStatus: StsPsn) => {
    try {
      setUpdatingStatus(true);
      await api.patch(`/api/pesanan/${psn.id_psn}/status`, { sts_psn: nextStatus });
      toast.success(`Status pesanan diperbarui menjadi: ${nextStatus}`);
      await fetchDetail();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handler serah terima cucian (Prosedur 6)
  const handleSerahkanCucian = async () => {
    if (!isLunas) {
      toast.error('Pesanan belum lunas! Catat pembayaran terlebih dahulu.');
      return;
    }
    if (!isSiap) {
      toast.error('Cucian belum siap diambil.');
      return;
    }

    try {
      setUpdatingStatus(true);
      await api.patch(`/api/pesanan/${psn.id_psn}/ambil`);
      toast.success('Cucian berhasil diserahkan kepada pelanggan. Siklus pesanan selesai!');
      await fetchDetail();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyelesaikan serah terima');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handler simpan pembayaran (Prosedur 5)
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jmlByr < psn.tot_hrg) {
      toast.error(`Jumlah bayar minimal ${formatRupiah(psn.tot_hrg)}`);
      return;
    }

    try {
      setPaying(true);
      await api.post('/api/bayar', {
        id_psn: psn.id_psn,
        met_byr: metByr,
        jml_byr: Number(jmlByr),
      });
      toast.success('Pembayaran lunas berhasil dicatat!');
      setModalBayarOpen(false);
      await fetchDetail();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mencatat pembayaran');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Back Button (print:hidden) */}
      <div className="print:hidden flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="rounded-xl border-[#E4E7F2] h-9 gap-1 text-xs"
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke Daftar
        </Button>
      </div>

      {/* Stepper Progress & Aksi Cepat Operasional (print:hidden) */}
      <Card className="print:hidden rounded-2xl border-[#E4E7F2] shadow-2xs overflow-hidden">
        <CardHeader className="bg-[#1E1B4B] text-white p-4">
          <CardTitle className="text-sm font-semibold flex justify-between items-center">
            <span>Pelacakan Progres Pengerjaan Cucian</span>
            <span className="font-mono text-xs text-indigo-200">{psn.id_psn}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-5">
          <OrderStepper currentStatus={psn.sts_psn} />

          {/* Action Bar Berdasarkan Status & Role */}
          <div className="pt-3 border-t border-[#E4E7F2] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Aksi operasional selanjutnya:
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Operasional: Antrean -> Dicuci */}
              {psn.sts_psn === 'Antrean' && (user?.level === 'Admin' || user?.level === 'Operasional') && (
                <Button
                  size="sm"
                  disabled={updatingStatus}
                  onClick={() => handleAdvanceStatus('Sedang Dicuci')}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 text-xs h-9"
                >
                  <Play className="size-3.5" />
                  Mulai Proses Cuci
                </Button>
              )}

              {/* Operasional: Dicuci -> Disetrika */}
              {psn.sts_psn === 'Sedang Dicuci' && (user?.level === 'Admin' || user?.level === 'Operasional') && (
                <Button
                  size="sm"
                  disabled={updatingStatus}
                  onClick={() => handleAdvanceStatus('Sedang Disetrika')}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-1.5 text-xs h-9"
                >
                  <Play className="size-3.5" />
                  Lanjut ke Penyetrikaan
                </Button>
              )}

              {/* Operasional: Disetrika -> Siap Diambil */}
              {psn.sts_psn === 'Sedang Disetrika' && (user?.level === 'Admin' || user?.level === 'Operasional') && (
                <Button
                  size="sm"
                  disabled={updatingStatus}
                  onClick={() => handleAdvanceStatus('Siap Diambil')}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-1.5 text-xs h-9"
                >
                  <CheckCircle className="size-3.5" />
                  Tandai Siap Diambil
                </Button>
              )}

              {/* Kasir / Admin: Tombol Catat Bayar */}
              {!isLunas && (user?.level === 'Admin' || user?.level === 'Kasir') && (
                <Button
                  size="sm"
                  onClick={() => setModalBayarOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 text-xs h-9"
                >
                  <CreditCard className="size-3.5" />
                  Catat Pembayaran Lunas
                </Button>
              )}

              {/* Kasir / Admin: Tombol Serahkan Cucian (Prosedur 6) */}
              {isSiap && (user?.level === 'Admin' || user?.level === 'Kasir') && (
                <Button
                  size="sm"
                  disabled={!isLunas || updatingStatus}
                  onClick={handleSerahkanCucian}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1.5 text-xs h-9 shadow-xs"
                >
                  <CheckCircle className="size-3.5" />
                  Serahkan Cucian ke Pelanggan
                </Button>
              )}
            </div>
          </div>

          {/* Banner Peringatan jika Siap Diambil tapi Belum Lunas (FR-07) */}
          {isSiap && !isLunas && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertTriangle className="size-4 shrink-0 text-red-600" />
              <span>
                <strong>Perhatian Kasir:</strong> Cucian sudah siap diambil tetapi pembayaran belum lunas.
                Wajib mencatat pembayaran terlebih dahulu sebelum menyerahkan cucian.
              </span>
            </div>
          )}

          {isSelesai && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle className="size-4 shrink-0 text-emerald-600" />
              <span>
                Pesanan ini telah selesai dan diserahkan kepada pelanggan. Seluruh transaksi tertutup dengan aman.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tampilan Tiket Pesanan & Bukti Pembayaran Bersih (Output 3 & 4) */}
      <PrintTicketView data={data} />

      {/* Modal Pencatatan Pembayaran (Prosedur 5) */}
      <Dialog open={modalBayarOpen} onOpenChange={setModalBayarOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Catat Pembayaran Lunas
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePayment} className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E4E7F2] space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Tiket:</span>
                <span className="font-mono font-semibold">{psn.id_psn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tagihan:</span>
                <span className="font-bold text-indigo-600 tabular-nums">
                  {formatRupiah(psn.tot_hrg)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-method">Metode Pembayaran</Label>
              <Select value={metByr} onValueChange={(v) => setMetByr(v as MetByr)}>
                <SelectTrigger id="pay-method" className="rounded-xl border-[#E4E7F2] text-xs h-9">
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
              <Label htmlFor="pay-amount">Jumlah Uang Diterima</Label>
              <Input
                id="pay-amount"
                type="number"
                value={jmlByr}
                onChange={(e) => setJmlByr(parseInt(e.target.value) || 0)}
                required
                min={psn.tot_hrg}
                className="rounded-xl border-[#E4E7F2] tabular-nums"
              />
              {jmlByr > psn.tot_hrg && (
                <p className="text-[11px] text-muted-foreground">
                  Kembalian: {formatRupiah(jmlByr - psn.tot_hrg)}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={paying}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                {paying ? 'Menyimpan...' : 'Konfirmasi Pembayaran Lunas'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
