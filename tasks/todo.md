# Task List: Implementasi Minimalism & Swiss Style (v2.0)

Tracking: Implementation tasks for `docs/05-design.md` v2.0, `docs/06-spec.md` v1.2, `AGENTS.md`.

---

## Phase 1: Foundation (Typography & Global Design Tokens)

### Task 1: Update Google Fonts dan Global CSS Base
**Description:** Memperbarui impor Google Fonts di `index.html` dari `Plus Jakarta Sans` ke `Fira Code` (400, 500, 600, 700) + `Fira Sans` (300, 400, 500, 600, 700). Mengupdate meta theme-color dan token CSS di `src/index.css` (focus ring `2px #0F172A`, font-feature settings, serta utility print safety).

**Acceptance criteria:**
- [x] `index.html` mengimpor `Fira Code` dan `Fira Sans` dari Google Fonts CDN.
- [x] Meta `theme-color` disesuaikan dengan kanvas Swiss Style (`#F8FAFC`).
- [x] Focus ring di `src/index.css` menggunakan `2px solid #0F172A` dengan `outline-offset: 2px`.
- [x] CSS reset mendukung perataan teks `tabular-nums` dan mobile input font-size >= 16px.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Inspeksi elemen di browser menunjukkan font `Fira Sans` untuk body dan `Fira Code` untuk code/mono/heading.

**Dependencies:** None
**Files likely touched:**
- `index.html`
- `src/index.css`
**Estimated scope:** Small (2 files)

---

### Task 2: Selaraskan Komponen Shared Laundry
**Description:** Menyelaraskan komponen pembantu laundry (`StatusBadge.tsx`, `OrderStepper.tsx`, dan `PrintTicketView.tsx`) dengan token status semantik Swiss Style v2.0, font monospace `Fira Code`, dan ikon Lucide yang presisi.

**Acceptance criteria:**
- [x] `StatusBadge.tsx` mengimplementasikan token warna semantik (`Antrean` `#F1F5F9`/`#334155`, `Dicuci` `#E0F2FE`/`#0369A1`, `Disetrika` `#FEF3C7`/`#B45309`, `Siap` `#EDE9FE`/`#6D28D9`, `Lunas/Selesai` `#DCFCE7`/`#15803D`, `Belum Lunas` `#FEE2E2`/`#B91C1C`).
- [x] Seluruh badge memasangkan warna dengan teks + ikon Lucide (*never color alone*).
- [x] `OrderStepper.tsx` menggunakan aksen garis progres `#0369A1` dan GSAP `power2.out` (durasi 0.35s).
- [x] `PrintTicketView.tsx` menggunakan `Fira Code` untuk ID tiket dan nominal angka, bersih dengan kelas `print:shadow-none print:border-slate-300 print:bg-white`.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Render badge status dan stepper konsisten dengan tabel token di `05-design.md` Bagian 2.

**Dependencies:** Task 1
**Files likely touched:**
- `src/components/laundry/StatusBadge.tsx`
- `src/components/laundry/OrderStepper.tsx`
- `src/components/laundry/PrintTicketView.tsx`
- `src/components/laundry/PublicTrackingCard.tsx`
**Estimated scope:** Medium (4 files)

---

## Checkpoint: Foundation
- [x] Build lokal (`tsc -b && vite build`) lolos tanpa error
- [x] Font `Fira Code` dan `Fira Sans` ter-load dengan benar
- [x] Badge status menampilkan token warna semantik dan ikon Lucide yang tepat

---

## Phase 2: Shell, Auth & Order Tracking (Core Flow)

### Task 3: Redesain Layout Navigasi AppShell.tsx
**Description:** Memperbarui struktur `AppShell.tsx` (Sidebar Desktop + Navigasi Mobile) ke estetika Swiss Minimalist: latar kanvas `#F8FAFC`, sidebar putih bersih `#FFFFFF` dengan border `#E2E8F0`, nav link aktif berlatar `#0F172A` dengan teks putih, dan hover row `#E8ECF1`.

**Acceptance criteria:**
- [x] Sidebar desktop menggunakan background `#FFFFFF`, border `#E2E8F0`, teks `#020617`.
- [x] Status navigasi aktif menggunakan `#0F172A` (Swiss Slate Navy) dengan teks kontras `#FFFFFF`.
- [x] Drawer/Sheet mobile dan profil petugas rapi dan responsif.
- [x] Kelas `print:hidden` terpasang pada seluruh kontainer navigasi.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Navigasi berpindah halaman lancar pada desktop dan mobile viewport.

**Dependencies:** Task 1, Task 2
**Files likely touched:**
- `src/components/layout/AppShell.tsx`
- `src/components/laundry/QwashLogo.tsx`
**Estimated scope:** Small (2 files)

---

### Task 4: Redesain Halaman Login LoginPage.tsx
**Description:** Memperbarui tampilan `LoginPage.tsx` menjadi Swiss Minimalist split-view: kolom kiri berlatar Deep Slate Navy `#0F172A` dengan preview statistik teknis bergaya `Fira Code`, dan kolom kanan kartu login putih bersih dengan tombol primary Ocean Blue `#0369A1` serta form label eksplisit.

**Acceptance criteria:**
- [x] Menghilangkan glow/gradient ungu konsumen, menggantinya dengan navy solid `#0F172A` dan kanvas `#F8FAFC`.
- [x] Input username dan password memiliki `<Label htmlFor>` yang terlihat jelas.
- [x] Tombol CTA utama menggunakan Ocean Blue `#0369A1` (`hover:bg-[#0284C7]`).
- [x] Tombol cepat akun demo memiliki outline tegas `#E2E8F0` dengan typography `Fira Code` pada `@username`.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Login staf (Admin, Kasir, Operasional) berhasil dan me-redirect ke `/pesanan`.

**Dependencies:** Task 1, Task 3
**Files likely touched:**
- `src/pages/LoginPage.tsx`
**Estimated scope:** Small (1 file)

---

### Task 5: Redesain Halaman Dashboard & Daftar Pesanan OrdersPage.tsx
**Description:** Memperbarui `OrdersPage.tsx` agar menyajikan 4 kartu ringkasan KPI bernuansa Swiss Style, filter status Tabs yang tajam, tombol CTA utama *"+ Buat Pesanan"* (`#0369A1`), serta semantic `<Table>` dengan pembungkus `overflow-x-auto`.

**Acceptance criteria:**
- [x] 4 Kartu KPI berlatar `#FFFFFF`, border `#E2E8F0`, dengan angka metrik besar dalam font `Fira Code` `tabular-nums`.
- [x] Animasi stagger kartu KPI memakai GSAP `power2.out` durasi 0.3s (tanpa `back.out`).
- [x] Tabel transaksi menggunakan `<TableHeader><TableBody><TableRow>` di dalam `<div className="overflow-x-auto">`.
- [x] Header tabel menggunakan teks `#020617` / `#475569`, border `#E2E8F0`, dan hover row `#F8FAFC`.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Filter tab status pesanan berfungsi cepat dan tabel dapat di-scroll horizontal di mobile tanpa merusak layout.

**Dependencies:** Task 2, Task 3
**Files likely touched:**
- `src/pages/OrdersPage.tsx`
**Estimated scope:** Small (1 file)

---

## Checkpoint: Core Features
- [x] Login kasir/admin/operasional berjalan mulus dengan UI Swiss Style
- [x] Sidebar desktop dan navigasi mobile responsif
- [x] Tabel pesanan dan kartu KPI tampil presisi dengan `Fira Code` `tabular-nums`

---

## Phase 3: Order Lifecycle & Payments (Prosedur 1 s.d. 6)

### Task 6: Redesain Halaman Buat Pesanan Baru CreateOrderPage.tsx
**Description:** Memperbarui `CreateOrderPage.tsx` dengan layout grid 2 kolom desktop: kolom kiri formulir pemilihan pelanggan (`PLGN`), dialog tambah pelanggan cepat, dan grid layanan (`LYN`); kolom kanan ringkasan nota sticky dengan estimasi selesai dan total biaya dalam font `Fira Code` `tabular-nums`.

**Acceptance criteria:**
- [x] Grid layanan (`LYN`) berlatar `#FFFFFF`, border `#E2E8F0`, radius `rounded-lg` (12px).
- [x] Nilai `tot_hrg` dan `est_sls` di-format sejajar sempurna (`Fira Code` `tabular-nums`).
- [x] Form tidak me-reset input jika terjadi error koneksi/validasi (*Preserve Input After Failed Submit*).
- [x] Tombol simpan menggunakan CTA Ocean Blue `#0369A1` dengan state loading spinner + disabled.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Buat pesanan baru dengan 2 layanan berhasil tersimpan dan me-redirect ke halaman detail tiket.

**Dependencies:** Task 2, Task 3
**Files likely touched:**
- `src/pages/CreateOrderPage.tsx`
**Estimated scope:** Small (1 file)

---

### Task 7: Redesain Halaman Detail Pesanan, Pembayaran & Cetak OrderDetailPage.tsx
**Description:** Memperbarui `OrderDetailPage.tsx` dengan header tiket presisi Swiss Style, horizontal Order Status Stepper, tabel rincian `DTL_PSN`, kartu bukti bayar `BYR`, modal pelunasan, banner alert blokir ambil sebelum lunas `#DC2626` (Prosedur 6), serta tombol cetak tiket.

**Acceptance criteria:**
- [x] Stepper status menampilkan progres tahapan dengan garis `#0369A1` dan GSAP `power2.out`.
- [x] Banner peringatan `#DC2626` / `#FEE2E2` tampil jelas jika pesanan belum lunas saat siap diambil.
- [x] Modal pembayaran `BYR` memiliki input nominal dan dropdown metode bayar (`Tunai`, `Transfer`, `QRIS`) dengan label eksplisit.
- [x] Tombol cetak memicu `window.print()` dan format cetak struk bersih dari tombol non-cetak (`print:hidden`).

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Siklus pembaruan status, pembayaran lunas, serah terima cucian, dan print tiket terverifikasi.

**Dependencies:** Task 2, Task 6
**Files likely touched:**
- `src/pages/OrderDetailPage.tsx`
**Estimated scope:** Small (1 file)

---

## Checkpoint: Order Lifecycle
- [x] Alur pembuatan pesanan baru, kalkulasi harga server-side, dan merge layanan duplikat berfungsi
- [x] Stepper status berjalan mulus dengan GSAP `power2.out`
- [x] Prosedur 6 (blokir ambil sebelum lunas dengan banner `#DC2626`) terverifikasi
- [x] Tampilan cetak nota struk bersih via `@media print`

---

## Phase 4: Master Data, Reports & Public Portal

### Task 8: Redesain Halaman Master Data (Pelanggan, Layanan, Petugas)
**Description:** Memperbarui halaman Master Data (`CustomersPage.tsx`, `ServicesPage.tsx`, `StaffPage.tsx`) dengan kartu ringkas, semantic `<Table>` bergaris `#E2E8F0`, modal `Dialog` dengan `<Label htmlFor>` terlihat, serta *Preserve Input After Failed Submit*.

**Acceptance criteria:**
- [x] Seluruh tabel data dibungkus `<div className="overflow-x-auto">` dengan semantic `<TableHeader><TableBody><TableRow>`.
- [x] ID master data (`PLG-...`, `LYN-...`, `PTG-...`) diformat dengan font `Fira Code`.
- [x] Dialog tambah & edit mempertahankan isi form jika ada error duplikasi atau gagal simpan.
- [x] Batas maksimal 500 baris per file tetap dipatuhi di setiap halaman.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: CRUD pelanggan, tarif layanan, dan akun petugas berjalan lancar.

**Dependencies:** Task 1, Task 3
**Files likely touched:**
- `src/pages/CustomersPage.tsx`
- `src/pages/ServicesPage.tsx`
- `src/pages/StaffPage.tsx`
**Estimated scope:** Medium (3 files)

---

### Task 9: Redesain Halaman Laporan dan Landing Page Publik
**Description:** Memperbarui `ReportPage.tsx` (kartu pendapatan & volume cucian `Fira Code`, filter rentang tanggal, tabel transaksi, tombol CSV) dan `LandingPage.tsx` (hero pencarian nomor tiket presisi Swiss Style, katalog tarif resmi, kartu pelacakan status).

**Acceptance criteria:**
- [x] `ReportPage.tsx`: Ringkasan omzet dan jumlah cucian tampil tegas dengan `Fira Code` `tabular-nums`.
- [x] `LandingPage.tsx`: Hero pelacakan publik bersih di atas kanvas `#F8FAFC`, input pencarian tiket `PSN-...` dengan tombol CTA `#0369A1`.
- [x] Seluruh kartu layanan publik menampilkan tarif per kg dan estimasi hari yang presisi.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Laporan tanggal dan pelacakan tiket publik berfungsi normal.

**Dependencies:** Task 2, Task 5, Task 8
**Files likely touched:**
- `src/pages/ReportPage.tsx`
- `src/pages/LandingPage.tsx`
- `src/components/laundry/PublicFooter.tsx`
**Estimated scope:** Medium (3 files)

---

## Checkpoint: Complete Verification
- [x] Seluruh halaman lolos audit 5-axis code quality
- [x] Build produksi lulus tanpa warning (`tsc -b && vite build`)
- [x] Tidak ada file yang melebihi batas 500 baris
