# 05 - Design System: Sistem Pengelolaan Laundry

- **Versi:** 1.1
- **Tanggal:** 2026-11-20
- **Status:** Approved
- **Sumber input:** `04-prd.md` v1.1 (Approved), referensi visual Dribbble Shot #27031424 (*Qwash*), dan permintaan GSAP animation user.
- **Skill digunakan:** `design-md` *(diadaptasi dari tangkapan layar referensi Dribbble karena bukan proyek Stitch MCP)*

## TL;DR

Design system ini mengadaptasi nuansa **bersih, higienis, dan terstruktur** dari referensi *Qwash*: kanvas abu-abu es (`#F5F6FA`), kartu putih bersih (`#FFFFFF`), aksen **Deep Twilight Indigo** (`#4F46E5` / `#2B285A`) untuk navigasi dan CTA utama, serta *status tracker* progres cucian bergaya pill & garis progres yang langsung terbaca sekilas.

Karena aplikasi ini adalah **web operasional internal petugas laundry** (bukan aplikasi konsumen seperti *Qwash*) dan harus tetap ringan, seluruh komponen dibangun menggunakan **`shadcn/ui` + Tailwind CSS + Lucide React**. Fitur non-PRD di referensi seperti *AI Search*, *Special Offer*, *Saved Cards*, dan gambar 3D/foto berat tidak diadopsi.

---

## Konteks Adaptasi Referensi

Referensi *Qwash* dipilih karena terasa segar, rapi untuk alur layanan laundry, dan punya pola **Active Orders progress bar** serta kartu layanan dengan badge estimasi (`ETA`) yang sangat cocok untuk tiket pesanan & daftar layanan. Agar selaras dengan `04-prd.md` v1.1 dan prinsip `profile.md` bagian 9:

- **Diadopsi:**
  - Palet dasar dingin & bersih (kanvas `#F5F6FA`, kartu `#FFFFFF`, aksen indigo-violet, teks dark charcoal `#1A1A2E`).
  - Kartu layanan ringkas berisi nama layanan (`nm_lyn`), badge estimasi hari (`est_hari`), dan harga (`hrg_kg`).
  - **Order Status Stepper / Progress Tracker** horizontal bertahap (`Antrean` → `Sedang Dicuci` → `Sedang Disetrika` → `Siap Diambil` → `Sudah Diambil`) plus badge status pembayaran (`Lunas` vs `Belum Lunas`).
  - Hierarki angka yang tegas untuk harga, berat (`brt_kg`), dan ID pesanan.
- **Ditolak (Out of Scope & Efisiensi Teknis):**
  - *QWASH AI Search*, *Quick Suggestion* chips, *Special Offer* (`Free Ironing`, `50% OFF`), *Service Bundle*, *Saved Cards* / *Delivery Address* kurir, dan *Profile Completion ring*.
  - Aset foto/3D render mesin cuci, keranjang cucian, dan setrika (diganti ikon garis seragam dari `lucide-react` agar ringan dan cepat di-load).
  - Tata letak *mobile-only bottom bar*: diganti menjadi **App Shell Sidebar + Topbar responsif** (optimal untuk layar desktop kasir sekaligus nyaman dibuka di tablet/HP petugas operasional).

---

## 1. Visual Theme & Atmosphere

Antarmuka mengusung karakter **Hygienic Clinical Modern** — bersih seperti ruang laundry yang rapi, minim dekorasi, dengan fokus pada **kecepatan baca dan akurasi input kasir**. Permukaan utama menggunakan kanvas netral sejuk (`#F5F6FA`) sehingga kartu putih (`#FFFFFF`) dan tabel data terasa terpisah jelas tanpa garis tebal atau bayangan berat.

Warna **Deep Twilight Indigo** berperan sebagai jangkar identitas (header/sidebar aktif dan tombol CTA utama seperti *"Buat Pesanan"* atau *"Catat Pembayaran"*), sementara warna semantik lembut (mint hijau, kuning amber, biru langit, ungu violet) dipakai secara terkontrol khusus pada badge status `sts_psn` dan `sts_byr` agar petugas bisa langsung membedakan cucian yang masih di antrean, siap diambil, atau belum lunas dalam satu lirikan.

---

## 2. Color Palette & Roles

Nilai warna diekstraksi dari referensi *Qwash* dan dipetakan langsung ke token tema **`shadcn/ui`** agar mudah dikonfigurasi di `index.css` tanpa custom CSS rumit:

| Nama Deskriptif | Hex Code | Token `shadcn/ui` | Peran Fungsional |
|---|---|---|---|
| **Ice Mist Canvas** | `#F5F6FA` | `--background` | Latar belakang utama halaman agar kartu dan tabel putih terlihat kontras secara halus. |
| **Pure Laundry White** | `#FFFFFF` | `--card` / `--popover` | Permukaan kartu ringkasan, tabel transaksi, form input pesanan, dan dialog modal. |
| **Deep Charcoal Ink** | `#1A1A2E` | `--foreground` | Teks judul utama, angka total harga (`tot_hrg`), dan label utama. |
| **Cool Slate Muted** | `#6B7280` | `--muted-foreground` | Teks pendukung (no HP, alamat, tanggal masuk/estimasi, label kolom sekunder). |
| **Soft Periwinkle Surface** | `#EEF0F8` | `--muted` / `--secondary` | Permukaan elemen sekunder, baris hover tabel, latar badge netral, dan tombol sekunder. |
| **Royal Indigo Primary** | `#4F46E5` | `--primary` | Tombol aksi utama (*Simpan Pesanan*, *Bayar Lunas*, *Serahkan Cucian*), menu sidebar aktif, dan fokus ring. |
| **Midnight Indigo Anchor** | `#1E1B4B` | *Brand Accent (Header/Struk)* | Aksen gelap untuk header ringkasan kasir atau aksen identitas di kartu ringkas/login (adaptasi header gelap *Qwash*). |
| **Hairline Cloud Border** | `#E4E7F2` | `--border` / `--input` | Garis tepi tipis (`1px`) pada kartu, kolom input form, dan pemisah baris tabel. |
| **Coral Danger Red** | `#EF4444` | `--destructive` | Badge `Belum Lunas`, peringatan blokir pengambilan cucian (Prosedur 6), error validasi, dan aksi hapus. |

### Token Semantik Status (`sts_psn` & `sts_byr`)

Khusus untuk badge status di daftar pesanan & tracker, gunakan kombinasi warna lembut dengan kontras teks tinggi (tidak boleh teks putih di atas pastel):

| Status | Latar Badge | Teks & Dot Indikator | Keterangan |
|---|---|---|---|
| `Antrean` | `#F3F4F6` (Soft Gray) | `#374151` | Pesanan baru masuk, menunggu dicuci. |
| `Sedang Dicuci` | `#DBEAFE` (Sky Blue Tint) | `#1D4ED8` | Sedang dalam proses cuci. |
| `Sedang Disetrika` | `#FEF3C7` (Warm Amber Tint) | `#B45309` | Sedang disetrika / finishing. |
| `Siap Diambil` | `#EDE9FE` (Lavender Tint) | `#6D28D9` | Selesai produksi, siap diambil pelanggan. |
| `Sudah Diambil` | `#DCFCE7` (Mint Green Tint) | `#15803D` | Siklus pesanan ditutup (Prosedur 6). |
| `Lunas` (`sts_byr`) | `#DCFCE7` (Mint Green Tint) | `#15803D` | Pembayaran terverifikasi lunas. |
| `Belum Lunas` | `#FEE2E2` (Soft Coral Tint) | `#B91C1C` | Belum ada pembayaran lunas (blokir ambil). |

---

## 3. Typography Rules

- **Font Family:** **Plus Jakarta Sans** (Google Fonts — selaras dengan karakter geometris ramah pada referensi *Qwash*) dengan fallback `Inter, system-ui, sans-serif`.
- **Angka Tabular:** Wajib mengaktifkan `tabular-nums` pada seluruh nominal Rupiah (`tot_hrg`, `hrg_kg`, `jml_byr`), berat (`brt_kg`), tanggal, dan `id_psn` agar kolom tabel dan struk sejajar rapi.
- **Hierarki & Skala:**
  - **Judul Halaman (`22px–24px`, Bold 700, tracking `-0.02em`):** Contoh: *"Daftar Pesanan"*, *"Buat Tiket Baru"*, *"Laporan Transaksi"*.
  - **Angka KPI / Total Bayar (`24px–28px`, ExtraBold 800, `tabular-nums`):** Untuk angka ringkasan dashboard, total pendapatan periode, dan total tagihan pesanan.
  - **Judul Kartu / Section (`16px`, SemiBold 600):** Contoh: *"Rincian Cucian"*, *"Informasi Pelanggan"*.
  - **Body & Sel Tabel (`14px`, Regular/Medium 400–500):** Nyaman dibaca berjam-jam oleh petugas kasir.
  - **Metadata & Badge (`12px`, Medium 500–600):** Untuk status pill, `est_hari`, dan timestamp.

---

## 4. Pemetaan Komponen ke `shadcn/ui` (Component Stylings)

Sesuai arahan user dan `profile.md` bagian 9, seluruh UI dibangun menggunakan komponen standar **`shadcn/ui`** dengan kustomisasi ringan via token Tailwind (tanpa membuat library komponen custom dari nol):

| Kebutuhan UI | Komponen `shadcn/ui` / Library | Styling & Aturan Adaptasi *Qwash* |
|---|---|---|
| **App Shell / Navigasi** | `Sidebar` (atau layout flex + `Sheet` di mobile) | Sidebar kiri bersih dengan ikon `lucide-react`; kolaps otomatis jadi `Sheet` drawer di layar tablet/HP. |
| **Tombol & CTA** | `Button` | `rounded-xl` (atau `rounded-full` khusus CTA utama seperti *"Catat Pembayaran"* / *"+ Pesanan Baru"*). Variant `default` (`#4F46E5`), `secondary` (`#EEF0F8`), `destructive` (`#EF4444`). |
| **Kartu Ringkasan & Layanan** | `Card` (`CardHeader`, `CardContent`, `CardFooter`) | Sudut membulat `rounded-2xl` (`16px`), latar `#FFFFFF`, border tipis `1px solid #E4E7F2`, bayangan sangat halus (`shadow-xs`). |
| **Tabel Data (Pesanan, Pelanggan, Laporan)** | `Table` (`@tanstack/react-table` opsional jika butuh sort/filter) | Header tabel `#F8FAFC`, padding nyaman (`py-3`), hover lembut `#F5F6FA`. |
| **Status & ETA Pill** | `Badge` | `rounded-full`, padding ringkas, memakai skema warna semantik tabel di Bagian 2. |
| **Form Input & Cari Pelanggan** | `Input`, `Label`, `Textarea`, `Select` (atau `Command` + `Popover` untuk Combobox cari `PLGN`/`LYN`) | `rounded-xl`, border `#E4E7F2`, focus ring `#4F46E5`. |
| **Modal Bayar, Konfirmasi Ambil, Tambah Data** | `Dialog` (atau `AlertDialog` untuk aksi kritis/hapus) | Dipakai untuk modal pencatatan pembayaran (`BYR`) dan dialog konfirmasi serah terima / blokir belum lunas. |
| **Filter Status & Tab Detail** | `Tabs` | Filter cepat status pesanan (`Semua`, `Antrean`, `Sedang Dicuci`, `Sedang Disetrika`, `Siap Diambil`, `Sudah Diambil`). |
| **Notifikasi Feedback** | `Sonner` (toast) | Feedback instan setelah simpan pesanan, update status, atau pembayaran lunas. |
| **Order Progress Tracker (Adaptasi Qwash)** | Komposisi `Badge` + utilitas Tailwind flex stepper (tanpa library chart berat) | 5 titik/step horizontal (`Antrean` → `Dicuci` → `Disetrika` → `Siap` → `Diambil`) dengan garis gradien indigo-ke-ungu pada step aktif/selesai. |
| **Animasi & Micro-interaction** | `gsap` + `@gsap/react` (`useGSAP`) | Transisi halus kartu, stepper progres, dan perpindahan halaman yang cepat tanpa menghambat input kasir. |
| **Ikon** | `lucide-react` | Ketebalan garis seragam (`1.75px`–`2px`). |

---

## 4b. Motion & Animation Guidelines (GSAP)

Agar antarmuka terasa *smooth* seperti referensi *Qwash* namun tetap cepat untuk operasional kasir harian:

- **Library:** Gunakan **`gsap`** + **`@gsap/react`** (`useGSAP` hook dengan `scope` ref agar *cleanup* otomatis berjalan aman di React StrictMode).
- **Titik Animasi yang Disarankan:**
  1. **Stagger Entrance Kartu KPI & Layanan:** Saat halaman Dashboard/Layanan dimuat, kartu masuk halus (`opacity: 0 → 1`, `y: 12 → 0`, `duration: 0.35`, `stagger: 0.05`, `ease: "power2.out"`).
  2. **Order Progress Stepper (`sts_psn`):** Animasi halus pada lebar garis progres (`scaleX` / `width`) dan *pulse/scale* ringan pada titik step aktif saat status berubah.
  3. **Transisi Item Ringkasan Pesanan:** Baris item yang baru ditambahkan di `CreateOrderPage` masuk halus (`duration: 0.22`).
- **Guardrails Operasional & Aksesibilitas:**
  - Durasi wajib singkat (**`0.2s–0.35s`**) — **dilarang** memasang animasi panjang/delay yang memperlambat ketikan atau klik kasir.
  - Wajib hormati preferensi OS `prefers-reduced-motion: reduce` (lewat `gsap.matchMedia()`).
  - **Print View (`@media print`):** Elemen cetak Tiket Pesanan dan Bukti Pembayaran tidak boleh bergantung pada animasi masuk (`opacity: 0`) agar saat `window.print()` seluruh teks langsung terlihat penuh.

---

## 5. Layout Principles & Pemetaan Layar

- **Desktop-First Kasir + Responsif Operasional:** Di layar desktop (`>= 1024px`), konten memakai layout 2 kolom di halaman transaksi kompleks (misal kiri: form input pelanggan + tambah layanan `DTL_PSN`; kanan: ringkasan tiket & kalkulasi `tot_hrg` sticky ala checkout). Di layar tablet/mobile (`< 768px`), kolom bertumpuk vertikal dengan padding `16px` agar petugas operasional tetap nyaman menekan tombol update status cucian.
- **Whitespace & Kepadatan:** Jarak antar-kartu `16px` (`gap-4`), jarak antar-bagian `24px` (`space-y-6`). Hindari menumpuk lebih dari 4–5 kolom penting di kartu mobile.
- **Pemetaan Layar Inti (Sesuai `04-prd.md` v1.1):**
  1. **Layar Login (`PTGS`):** Kartu terpusat (`max-w-sm`) di atas latar `#F5F6FA` dengan aksen header gelap *Qwash* (`#1E1B4B`), input `usernm` dan `passwd`, serta tombol penuh *"Masuk"*.
  2. **Dashboard & Daftar Pesanan (`PSN`):**
     - Baris atas: 4 kartu KPI ringkas (`Antrean`, `Dalam Proses`, `Siap Diambil`, `Belum Lunas`).
     - Tab filter status (`Tabs`) + kolom cari nama/ID pesanan + tombol utama *"+ Buat Pesanan"*.
     - Tabel/daftar pesanan dengan badge `sts_psn`, badge `sts_byr`, serta tombol aksi cepat sesuai status (update ke tahap berikutnya, bayar, atau serahkan cucian).
  3. **Halaman Buat Pesanan Baru (Prosedur 1, 2, 3):**
     - Kiri: Pilih/cari pelanggan `PLGN` (dengan tombol cepat *"+ Pelanggan Baru"* via `Dialog` tanpa keluar halaman) + pilih layanan `LYN` dalam bentuk grid kartu ringkas/baris item + input `brt_kg`.
     - Kanan (Sticky Summary Card): Preview **Tiket Pesanan**, estimasi tanggal selesai (`est_sls`), rincian subtotal item, dan total harga (`tot_hrg`), plus opsi *"Simpan Pesanan (Bayar Nanti)"* atau *"Simpan & Bayar Sekarang"*.
  4. **Halaman Detail Tiket, Pembayaran & Cetak (Output 3 & 4, Prosedur 4, 5, 6):**
     - Atas: **Order Progress Stepper** ala *Qwash* (menunjukkan progres `sts_psn` saat ini dan tombol transisi status berikutnya).
     - Tengah: Rincian `DTL_PSN` + kartu **Bukti Pembayaran** (`BYR`: `met_byr`, `jml_byr`, `tgl_byr`, `sts_byr`, petugas penerima).
     - Aksi penutupan: Tombol *"Serahkan Cucian"* aktif hanya jika `sts_byr === 'Lunas'` (jika belum, tampilkan badge peringatan merah dan tombol *"Catat Pembayaran"*).
     - Tombol *"Cetak Tiket / Struk"* (`window.print()` dengan CSS `@media print` bersih menyembunyikan sidebar).
  5. **Halaman Master Data (`PLGN`, `LYN`, & `PTGS` — Output 1 & 2):**
     - Halaman terpisah di sidebar untuk **Data Pelanggan** (`PLGN`), **Data Layanan** (`LYN` — ditampilkan sebagai grid kartu rapi ala *Our Services* atau tabel), dan **Kelola Petugas** (`PTGS` — khusus `level = Admin`).
  6. **Halaman Laporan Transaksi (Output 5):**
     - Filter rentang tanggal (`tgl_msk` / `tgl_byr` start–end), 3 kartu ringkasan (`Total Pesanan`, `Transaksi Lunas`, `Total Pendapatan`), tabel rincian transaksi periode tersebut, dan tombol opsional *Export CSV*.

---

## Asumsi & Risiko

- `[ASUMSI]` Di halaman Buat Pesanan, daftar layanan tidak terlalu banyak (sekitar 5–15 jenis layanan laundry), sehingga pemilihan layanan bisa ditampilkan sebagai kartu/list cepat yang nyaman diklik kasir tanpa harus mencari di dropdown panjang.
- `[RISIKO]` Tampilan cetak struk (`@media print`) di browser sering berantakan kalau komponen sidebar dan shadow ikut tercetak. Solusinya wajib menyertakan class `print:hidden` pada App Shell & tombol aksi di CSS Tailwind.
- `[RISIKO]` Aksen gradien ungu/indigo jangan dipakai berlebihan di seluruh latar tombol tabel; batasi hanya pada CTA utama, link aktif, dan *progress tracker* agar mata petugas tidak cepat lelah saat bekerja seharian.

## Out of scope

- Pembuatan komponen UI custom dari nol (wajib memakai `shadcn/ui` + Tailwind CSS).
- Implementasi desain fitur promosi (*Special Offer*), *AI Search*, *Saved Cards*, atau pelacakan kurir GPS seperti pada referensi *Qwash*.
- Pembuatan file prototipe Figma/FigCraft terpisah (langsung diterjemahkan ke `06-spec.md` dan implementasi `shadcn/ui`).
- Dark mode toggle di tahap MVP (fokus satu tema terang higienis yang konsisten).

## Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 2026-11-20 | Penyusunan `05-design.md` mengadaptasi referensi visual Dribbble *Qwash* (#27031424) ke aplikasi web operasional laundry berbasis `shadcn/ui`, Tailwind CSS, dan `lucide-react` sesuai `04-prd.md` v1.1. |
| 1.1 | 2026-11-20 | Menambahkan panduan **Motion & Animation (GSAP + `@gsap/react`)** beserta guardrail kecepatan input kasir, `prefers-reduced-motion`, dan print safety. |
