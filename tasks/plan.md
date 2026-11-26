# Implementation Plan: Sistem Pengelolaan Laundry — Minimalism & Swiss Style (v2.0)

Source spec: `docs/05-design.md` v2.0, `docs/06-spec.md` v1.2, `docs/07-vibe-rules.md` v1.2, `AGENTS.md`

## Overview

Mengubah tema visual dan UX seluruh antarmuka aplikasi **Sistem Pengelolaan Laundry** dari gaya awal consumer app (*Qwash* v1.0) menjadi **Minimalism & Swiss Style** hasil riset `ui-ux-pro-max` (v2.0). Sistem baru mengedepankan presisi operasional kasir (*data-dense dashboard*): kanvas dingin `#F8FAFC`, struktur kartu `#FFFFFF` dengan hairline border `1px` `#E2E8F0`, jangkar Deep Slate Navy `#0F172A`, tombol aksi utama Ocean Blue `#0369A1`, serta pasangan tipografi presisi **`Fira Code`** (heading, ID tiket, angka keuangan `tabular-nums`) + **`Fira Sans`** (teks UI & form).

## Architecture Decisions

- **Token Konsisten via Tailwind CSS:** Memanfaatkan `tailwind.config.ts` v2.0 (`background: #F8FAFC`, `primary: #0F172A`, `accent: #0369A1`, `foreground: #020617`, `muted: #E8ECF1/#475569`, `destructive: #DC2626`, `border: #E2E8F0`).
- **Typography Pairing Teknis:** Menggantikan `Plus Jakarta Sans` dengan `Fira Code` (heading, ID, nominal angka) dan `Fira Sans` (body, form, tabel) via Google Fonts.
- **Geometri Tegas:** Radius dipertegas menjadi `rounded-lg` (12px untuk card), `rounded-md` (8px untuk input & button), dan `rounded-sm` (6px untuk badge).
- **Semantic HTML Table:** Seluruh data tabular wajib menggunakan semantic `<Table><TableHeader><TableBody><TableRow>` di dalam wrapper `<div className="overflow-x-auto">`.
- **Form Error Preservation:** Form tidak boleh me-reset nilai input saat submit gagal atau server me-return error (*Preserve Input After Failed Submit*).
- **GSAP Motion Guardrails:** Hook `useGSAP()` dengan `scope` ref, durasi singkat `0.2s–0.35s`, `ease: 'power2.out'` (larangan `back.out` pada tabel padat), serta perlindungan `prefers-reduced-motion` dan `@media print`.
- **Zero Emoji Icons:** 100% ikon memakai `lucide-react`.

## Task List

### Phase 1: Foundation (Typography & Global Design Tokens)
- [x] Task 1: Update Google Fonts dan Global CSS Base (`index.html` & `src/index.css`)
- [x] Task 2: Selaraskan Komponen Shared Laundry (`StatusBadge.tsx`, `OrderStepper.tsx`, `PrintTicketView.tsx`)

### Checkpoint: Foundation
- [x] Build lokal (`tsc -b && vite build`) lolos tanpa error
- [x] Font `Fira Code` dan `Fira Sans` ter-load dengan benar
- [x] Badge status menampilkan token warna semantik dan ikon Lucide yang tepat

### Phase 2: Shell, Auth & Order Tracking (Core Flow)
- [x] Task 3: Redesain Layout Navigasi `AppShell.tsx` (Desktop Sidebar + Mobile Sheet)
- [x] Task 4: Redesain Halaman Login `LoginPage.tsx` (Swiss Minimalist Split Layout)
- [x] Task 5: Redesain Halaman Dashboard & Daftar Pesanan `OrdersPage.tsx`

### Checkpoint: Core Features
- [x] Login kasir/admin/operasional berjalan mulus dengan UI Swiss Style
- [x] Sidebar desktop dan navigasi mobile responsif
- [x] Tabel pesanan dan kartu KPI tampil presisi dengan `Fira Code` `tabular-nums`

### Phase 3: Order Lifecycle & Payments (Prosedur 1 s.d. 6)
- [x] Task 6: Redesain Halaman Buat Pesanan Baru `CreateOrderPage.tsx` (2-Kolom & Input Preservation)
- [x] Task 7: Redesain Halaman Detail Pesanan, Pembayaran & Cetak `OrderDetailPage.tsx`

### Checkpoint: Order Lifecycle
- [x] Alur pembuatan pesanan baru, kalkulasi harga server-side, dan merge layanan duplikat berfungsi
- [x] Stepper status berjalan mulus dengan GSAP `power2.out`
- [x] Prosedur 6 (blokir ambil sebelum lunas dengan banner `#DC2626`) terverifikasi
- [x] Tampilan cetak nota struk bersih via `@media print`

### Phase 4: Master Data, Reports & Public Portal
- [x] Task 8: Redesain Halaman Master Data (`CustomersPage.tsx`, `ServicesPage.tsx`, `StaffPage.tsx`)
- [x] Task 9: Redesain Halaman Laporan `ReportPage.tsx` dan Landing Page `LandingPage.tsx`

### Checkpoint: Complete Verification
- [x] Seluruh halaman lolos audit 5-axis code quality
- [x] Build produksi lulus tanpa warning
- [x] Tidak ada file yang melebihi batas 500 baris

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Monospace font `Fira Code` sedikit lebih lebar dari font proporsional | Sedang (potensi wrap pada judul kartu di layar kecil) | Batasi ukuran heading di layar mobile maksimal `20px` (`text-xl`) dan gunakan `truncate`/`tracking-tight`. |
| Perubahan warna default tombol mempengaruhi kontras teks | Tinggi (potensi gagal WCAG AA) | Pastikan seluruh background gelap (`#0F172A`, `#0369A1`, `#DC2626`) selalu dipasangkan dengan teks putih `#FFFFFF`, dan badge status selalu menyertakan border pemisah + ikon. |
| Form reset tidak sengaja saat server error | Sedang (frustrasi kasir saat koneksi lambat) | Pertahankan state `react-hook-form` atau state lokal saat API me-return error. |
| Animasi GSAP menghalangi hasil cetak fisik | Tinggi (struk kosong saat print) | Pastikan `@media print` memiliki override `opacity: 1 !important` dan kelas `print:hidden` terpasang di semua elemen navigasi. |

## Open Questions
- Tidak ada pertanyaan terbuka yang memblokir. Seluruh token warna, font, aturan komponen, dan layout layar telah disetujui di `docs/05-design.md` v2.0.
