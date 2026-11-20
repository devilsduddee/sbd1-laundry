import { z } from 'zod';

// ============================================================================
// Enums & Constants (Sesuai Proposal ERD 100%)
// ============================================================================
export const LEVEL_PTGS = ['Admin', 'Kasir', 'Operasional'] as const;
export type LevelPtgs = (typeof LEVEL_PTGS)[number];

export const STS_PSN = [
  'Antrean',
  'Sedang Dicuci',
  'Sedang Disetrika',
  'Siap Diambil',
  'Sudah Diambil',
] as const;
export type StsPsn = (typeof STS_PSN)[number];

export const MET_BYR = ['Tunai', 'Transfer'] as const;
export type MetByr = (typeof MET_BYR)[number];

export const STS_BYR = ['Lunas'] as const;
export type StsByr = (typeof STS_BYR)[number];

// ============================================================================
// Base Entity Types
// ============================================================================
export interface Pelanggan {
  id_plgn: string;
  nm_plgn: string;
  no_hp: string;
  alamat: string;
}

export interface Petugas {
  id_ptgs: string;
  nm_ptgs: string;
  usernm: string;
  passwd?: string;
  level: LevelPtgs;
}

export interface Layanan {
  id_lyn: string;
  nm_lyn: string;
  hrg_kg: number;
  est_hari: number;
}

export interface Pesanan {
  id_psn: string;
  id_plgn: string;
  id_ptgs: string;
  tgl_msk: string;
  est_sls: string;
  tot_hrg: number;
  sts_psn: StsPsn;
}

export interface DetailPesanan {
  id_psn: string;
  id_lyn: string;
  brt_kg: number;
  hrg_trans: number;
  // Join fields for UI
  nm_lyn?: string;
}

export interface Bayar {
  id_byr: string;
  id_psn: string;
  id_ptgs: string;
  tgl_byr: string;
  met_byr: MetByr;
  jml_byr: number;
  sts_byr: StsByr;
  // Join fields for UI
  nm_ptgs?: string;
}

// Composite / Extended types for Views
export interface PesananSummary extends Pesanan {
  nm_plgn: string;
  no_hp: string;
  nm_ptgs: string;
  sts_byr: StsByr | 'Belum Lunas';
  met_byr?: MetByr;
  tgl_byr?: string;
}

export interface PesananDetailResponse {
  psn: Pesanan;
  plgn: Pelanggan;
  ptgs: Petugas;
  items: (DetailPesanan & { nm_lyn: string; est_hari: number })[];
  bayar: (Bayar & { nm_ptgs: string }) | null;
}

// ============================================================================
// Validation Schemas (Zod)
// ============================================================================

// Auth
export const loginSchema = z.object({
  usernm: z.string().min(1, 'Username wajib diisi'),
  passwd: z.string().min(1, 'Password wajib diisi'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Pelanggan (FR-02)
export const createPelangganSchema = z.object({
  nm_plgn: z.string().min(2, 'Nama pelanggan minimal 2 karakter'),
  no_hp: z
    .string()
    .min(8, 'Nomor HP minimal 8 digit')
    .max(16, 'Nomor HP maksimal 16 digit')
    .regex(/^[0-9+\s-]+$/, 'Format nomor HP tidak valid'),
  alamat: z.string().min(3, 'Alamat minimal 3 karakter'),
});
export type CreatePelangganInput = z.infer<typeof createPelangganSchema>;

export const updatePelangganSchema = createPelangganSchema.partial();
export type UpdatePelangganInput = z.infer<typeof updatePelangganSchema>;

// Layanan (FR-03)
export const createLayananSchema = z.object({
  nm_lyn: z.string().min(2, 'Nama layanan minimal 2 karakter'),
  hrg_kg: z.coerce.number().int().positive('Harga per kg harus lebih dari 0'),
  est_hari: z.coerce.number().int().min(1, 'Estimasi pengerjaan minimal 1 hari'),
});
export type CreateLayananInput = z.infer<typeof createLayananSchema>;

export const updateLayananSchema = createLayananSchema.partial();
export type UpdateLayananInput = z.infer<typeof updateLayananSchema>;

// Petugas (FR-01)
export const createPetugasSchema = z.object({
  nm_ptgs: z.string().min(2, 'Nama petugas minimal 2 karakter'),
  usernm: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  passwd: z.string().min(6, 'Password minimal 6 karakter'),
  level: z.enum(LEVEL_PTGS),
});
export type CreatePetugasInput = z.infer<typeof createPetugasSchema>;

export const updatePetugasSchema = z.object({
  nm_ptgs: z.string().min(2, 'Nama petugas minimal 2 karakter').optional(),
  passwd: z.string().min(6, 'Password minimal 6 karakter').optional(),
  level: z.enum(LEVEL_PTGS).optional(),
});
export type UpdatePetugasInput = z.infer<typeof updatePetugasSchema>;

// Pesanan & Detail Pesanan (FR-04)
export const orderItemSchema = z.object({
  id_lyn: z.string().min(1, 'Pilih jenis layanan'),
  brt_kg: z.coerce.number().positive('Berat / kuantitas harus lebih dari 0'),
});
export type OrderItemInput = z.infer<typeof orderItemSchema>;

export const createPesananSchema = z.object({
  id_plgn: z.string().min(1, 'Pelanggan wajib dipilih'),
  items: z.array(orderItemSchema).min(1, 'Minimal pilih satu layanan'),
  bayar_langsung: z
    .object({
      met_byr: z.enum(MET_BYR),
      jml_byr: z.coerce.number().positive(),
    })
    .optional(),
});
export type CreatePesananInput = z.infer<typeof createPesananSchema>;

export const updateStatusPesananSchema = z.object({
  sts_psn: z.enum(STS_PSN),
});
export type UpdateStatusPesananInput = z.infer<typeof updateStatusPesananSchema>;

// Pembayaran (FR-06)
export const createBayarSchema = z.object({
  id_psn: z.string().min(1, 'ID Pesanan wajib diisi'),
  met_byr: z.enum(MET_BYR),
  jml_byr: z.coerce.number().int().positive('Jumlah bayar harus lebih dari 0'),
});
export type CreateBayarInput = z.infer<typeof createBayarSchema>;

// Laporan (FR-08)
export const laporanQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD').optional(),
});
export type LaporanQueryInput = z.infer<typeof laporanQuerySchema>;

export interface LaporanSummary {
  total_pesanan: number;
  total_lunas: number;
  total_pendapatan: number;
}

export interface LaporanResponse {
  summary: LaporanSummary;
  rows: PesananSummary[];
}
