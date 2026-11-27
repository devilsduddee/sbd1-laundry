import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
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
      <div className="flex justify-center items-center h-64 text-xs text-[#425869]">
        <Loader2 className="mr-2 size-5 animate-spin text-[#006EB3]" aria-hidden="true" />
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
      // Preserve form inputs on error
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
          onClick={() => navigate('/pesanan')}
          className="rounded-md border-[#D5E4E4] hover:bg-[#E8F2F2] text-[#0B253B] h-9 gap-1.5 text-xs font-medium"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Kembali ke Daftar
        </Button>
      </div>

      {/* Stepper Progress & Aksi Cepat Operasional (print:hidden) */}
      <Card className="print:hidden rounded-lg border-[#D5E4E4] shadow-none bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#D5ECEB] to-[#EFE2CE] border-b border-[#C7DBDB] text-[#0B253B] p-4">
          <CardTitle className="font-heading text-sm font-bold flex justify-between items-center gap-2">
            <span>Pelacakan Progres Pengerjaan Cucian</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-white/85 text-[#005A94] border border-[#B0D4D3] tabular-nums">
              {psn.id_psn}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-5">
          <OrderStepper currentStatus={psn.sts_psn} />

          {/* Action Bar Berdasarkan Status & Role */}
          <div className="pt-3 border-t border-[#D5E4E4] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#425869] font-medium">
              Aksi operasional selanjutnya:
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Operasional: Antrean -> Dicuci */}
              {psn.sts_psn === 'Antrean' && (user?.level === 'Admin' || user?.level === 'Operasional') && (
                <Button
                  size="sm"
                  disabled={updatingStatus}
                  onClick={() => handleAdvanceStatus('Sedang Dicuci')}
                  className="bg-[#006EB3] hover:bg-[#00588F] text-white rounded-md gap-1.5 text-xs h-9"
                >
                  <Play className="size-3.5" aria-hidden="true" />
                  Mulai Proses Cuci
                </Button>
              )}

              {/* Operasional: Dicuci -> Disetrika */}
              {psn.sts_psn === 'Sedang Dicuci' && (user?.level === 'Admin' || user?.level === 'Operasional') && (
                <Button
                  size="sm"
                  disabled={updatingStatus}
                  onClick={() => handleAdvanceStatus('Sedang Disetrika')}
                  className="bg-[#7C4D12] hover:bg-[#633D0E] text-white rounded-md gap-1.5 text-xs h-9"
                >
                  <Play className="size-3.5" aria-hidden="true" />
                  Lanjut ke Penyetrikaan
                </Button>
              )}

              {/* Operasional: Disetrika -> Siap Diambil */}
              {psn.sts_psn === 'Sedang Disetrika' && (user?.level === 'Admin' || user?.level === 'Operasional') && (
                <Button
                  size="sm"
                  disabled={updatingStatus}
                  onClick={() => handleAdvanceStatus('Siap Diambil')}
                  className="bg-[#005A94] hover:bg-[#004470] text-white rounded-md gap-1.5 text-xs h-9"
                >
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Tandai Siap Diambil
                </Button>
              )}

              {/* Kasir / Admin: Tombol Catat Bayar */}
              {!isLunas && (user?.level === 'Admin' || user?.level === 'Kasir') && (
                <Button
                  size="sm"
                  onClick={() => setModalBayarOpen(true)}
                  className="bg-[#15803D] hover:bg-[#166534] text-white rounded-md gap-1.5 text-xs h-9"
                >
                  <CreditCard className="size-3.5" aria-hidden="true" />
                  Catat Pembayaran Lunas
                </Button>
              )}

              {/* Kasir / Admin: Tombol Serahkan Cucian (Prosedur 6) */}
              {isSiap && (user?.level === 'Admin' || user?.level === 'Kasir') && (
                <Button
                  size="sm"
                  disabled={!isLunas || updatingStatus}
                  onClick={handleSerahkanCucian}
                  className="bg-[#0B253B] hover:bg-[#1E293B] text-white rounded-md gap-1.5 text-xs h-9"
                >
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Serahkan Cucian ke Pelanggan
                </Button>
              )}
            </div>
          </div>

          {/* Banner Peringatan jika Siap Diambil tapi Belum Lunas (Prosedur 6 / FR-07) */}
          {isSiap && !isLunas && (
            <div
              role="alert"
              className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-md flex items-center gap-2.5 text-xs text-[#B91C1C]"
            >
              <AlertTriangle className="size-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
              <span>
                <strong>Perhatian Kasir:</strong> Cucian sudah siap diambil tetapi pembayaran belum lunas.
                Wajib mencatat pembayaran terlebih dahulu sebelum menyerahkan cucian.
              </span>
            </div>
          )}

          {isSelesai && (
            <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-md flex items-center gap-2.5 text-xs text-[#15803D]">
              <CheckCircle2 className="size-4 shrink-0 text-[#15803D]" aria-hidden="true" />
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
        <DialogContent className="rounded-lg max-w-sm border-[#D5E4E4]">
          <DialogHeader>
            <DialogTitle className="font-heading text-base font-bold text-[#0B253B]">
              Catat Pembayaran Lunas
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePayment} className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-[#F6FFFF] rounded-md border border-[#D5E4E4] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#425869]">ID Tiket:</span>
                <span className="font-mono font-semibold text-[#0B253B] tabular-nums">{psn.id_psn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#425869]">Total Tagihan:</span>
                <span className="font-mono font-bold text-[#006EB3] tabular-nums">
                  {formatRupiah(psn.tot_hrg)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-method">Metode Pembayaran</Label>
              <Select value={metByr} onValueChange={(v) => setMetByr(v as MetByr)}>
                <SelectTrigger id="pay-method" className="rounded-md border-[#D5E4E4] text-xs h-9 bg-white">
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
                inputMode="numeric"
                value={jmlByr}
                onChange={(e) => setJmlByr(parseInt(e.target.value) || 0)}
                required
                min={psn.tot_hrg}
                className="rounded-md border-[#D5E4E4] font-mono tabular-nums"
              />
              {jmlByr > psn.tot_hrg && (
                <p className="text-xs font-mono text-[#425869] tabular-nums">
                  Kembalian: {formatRupiah(jmlByr - psn.tot_hrg)}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={paying}
                className="w-full bg-[#006EB3] hover:bg-[#00588F] text-white rounded-md"
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
