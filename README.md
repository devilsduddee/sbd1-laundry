# Sistem Pengelolaan Laundry (Qwash Laundry)

Aplikasi web sistem informasi pengelolaan operasional dan basis data laundry berbasis relasional database (**Turso / libSQL**), dirancang untuk memenuhi spesifikasi tugas besar **Sistem Basis Data (Kelas 3IA01)**.

Aplikasi ini mengintegrasikan pencatatan data pelanggan, manajemen paket layanan, pembuatan tiket pesanan dengan kalkulasi tarif di server, pelacakan progres cuci-setrika secara *real-time*, pencatatan pembayaran lunas, blokir pengambilan sebelum lunas, cetak nota fisik, serta laporan rekapitulasi transaksi periode.

**Live Production:** [https://sbd1-laundry.vercel.app](https://sbd1-laundry.vercel.app)

---

## Arsitektur & Tech Stack

- **Frontend & PWA:** [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) (TypeScript) + [Tailwind CSS](https://tailwindcss.com/) + Service Worker (`public/sw.js`) & Web App Manifest (`public/site.webmanifest`)
- **Design System:** Minimalism & Swiss Style (`Fira Code` + `Fira Sans`), dibangun dengan [shadcn/ui](https://ui.shadcn.com/) dan [Lucide React](https://lucide.dev/)
- **Animasi Terkontrol:** [GSAP](https://gsap.com/) (`@gsap/react`) dengan guard `prefers-reduced-motion` dan proteksi `@media print`
- **Backend API:** [Hono](https://hono.dev/) on Node.js (`@hono/node-server`) untuk pengembangan lokal dan Vercel Serverless Functions (`@hono/node-server/vercel`)
- **Database & ORM:** [Turso](https://turso.tech/) (libSQL / SQLite) + [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-orm` & `drizzle-kit`) dengan `PRAGMA foreign_keys = ON;`
- **Keamanan & Autentikasi:** Stateless JWT (`hono/jwt`) pada `HttpOnly` cookie, password hashing `bcryptjs`, *rate limiting* brute-force login, dan validasi input skema bersama via [Zod](https://zod.dev/)
- **Deployment Target:** [Vercel](https://vercel.com/) (Single-repo: SPA Frontend di `dist/` + Serverless API di `/api/*`)

---

## Ruang Lingkup Fungsional (5 Output & 6 Prosedur)

### 5 Output Utama
1. **Output 1 — Data Pelanggan (`PLGN`):** Manajemen daftar pelanggan, nomor HP, alamat, dan pencarian cepat.
2. **Output 2 — Data Layanan (`LYN`):** Katalog layanan cuci, tarif per kilogram/satuan, dan estimasi hari pengerjaan.
3. **Output 3 — Tiket Pesanan (`PSN` + `DTL_PSN`):** Rincian item cucian, bobot kg, kalkulasi total tagihan otomatis, pelacakan publik mandiri, dan tampilan cetak nota (*print-friendly*).
4. **Output 4 — Bukti Pembayaran (`BYR`):** Pencatatan dan struk pelunasan transaksi (`Tunai` / `Transfer`).
5. **Output 5 — Laporan Transaksi:** Filter rentang tanggal, ringkasan metrik pendapatan, rincian pesanan, dan ekspor CSV.

### 6 Prosedur Operasional
- **Prosedur 1:** Pendaftaran dan verifikasi pelanggan baru atau pelanggan terdaftar.
- **Prosedur 2 & 3:** Pembuatan tiket pesanan multi-layanan dan penggabungan otomatis layanan duplikat. Seluruh `hrg_trans`, `tot_hrg`, dan `est_sls` dihitung di server dari tabel `LYN`.
- **Prosedur 4:** Pembaruan status pengerjaan bertahap (`Antrean` -> `Sedang Dicuci` -> `Sedang Disetrika` -> `Siap Diambil`).
- **Prosedur 5:** Pencatatan pembayaran lunas (saat penerimaan awal ataupun saat pengambilan).
- **Prosedur 6:** Validasi dan **blokir mutlak pengambilan cucian sebelum lunas** (`409 Conflict`). Jika sudah lunas, status pesanan ditutup menjadi `Sudah Diambil`.

---

## Keamanan & Integritas Data

- **Kepatuhan Skema Relasional 100%:** Tabel dan kolom (`PLGN`, `PTGS`, `LYN`, `PSN`, `DTL_PSN`, `BYR`) menggunakan *foreign key constraints* dan transaksi atomik `db.batch([...], 'write')`.
- **Server-Side Pricing:** Nilai `tot_hrg` dan `est_sls` selalu dihitung ulang di backend Hono untuk mencegah manipulasi nominal dari sisi klien.
- **Role-Based Access Control (RBAC):** Pembatasan akses terpisah untuk peran **Admin**, **Kasir**, dan **Operasional** via middleware JWT cookie.
- **Privasi Kredensial:** Kolom `PTGS.passwd` tidak pernah dikembalikan dalam respons API mana pun.

---

## Panduan Menjalankan di Lokal (Local Development)

### 1. Prasyarat
- **Node.js** versi 18 ke atas (direkomendasikan Node.js 20+).
- **npm** (atau package manager kompatibel).

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin berkas `.env.example` menjadi `.env.local` dan sesuaikan nilainya (default lokal dapat menggunakan SQLite file `file:local.db` atau URL Turso Cloud):

```env
TURSO_DATABASE_URL="file:local.db"
TURSO_AUTH_TOKEN=""
JWT_SECRET="ganti-dengan-random-secret-minimal-32-karakter"
PORT=3001
```

### 4. Inisialisasi Skema & Seeding Data Awal
Untuk membuat tabel awal (jika memakai database kosong) dan mengisi akun demo serta layanan default:
```bash
# Terapkan skema Drizzle ke database (opsional jika menggunakan Turso CLI)
npm run db:push

# Isi akun staf default & contoh data layanan/pelanggan
npm run db:seed
```

Perintah bantu basis data lainnya:
```bash
# Buka antarmuka web Drizzle Studio
npm run db:studio
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
- **Frontend (Vite):** [http://localhost:3000](http://localhost:3000)
- **Backend API (Hono):** [http://localhost:3001/api](http://localhost:3001/api)

### 6. Build Produksi & Typecheck
```bash
npm run build
```

---

## Akun Demo Default (Hasil Seed)

Halaman login menyediakan tombol *Quick Fill* untuk pengujian masing-masing tingkat peran:

| Username | Password | Peran (`level`) | Hak Akses |
|---|---|---|---|
| `admin` | `admin123` | **Admin** | Akses penuh seluruh menu, tarif layanan, laporan, dan kelola staf |
| `kasir` | `kasir123` | **Kasir** | Data pelanggan, buat pesanan, catat pembayaran, dan serah terima cucian |
| `operasional` | `opera123` | **Operasional** | Pantau antrean dan perbarui tahap pengerjaan cucian (`sts_psn`) |

---

## Panduan Deployment (Turso Cloud + Vercel)

1. **Siapkan Database Turso:**
   - Buat database baru melalui [Turso Dashboard](https://turso.tech/) atau CLI:
     ```bash
     turso db create sistem-laundry
     turso db shell sistem-laundry < server/db/schema.sql
     ```
   - Dapatkan `TURSO_DATABASE_URL` (`libsql://...`) dan `TURSO_AUTH_TOKEN`.
2. **Konfigurasi Environment Variables di Vercel:**
   Tambahkan variabel berikut pada **Project Settings > Environment Variables** (untuk *Production* dan *Preview*):
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET` (gunakan string hex acak minimal 32 byte, contoh: `openssl rand -hex 32`)
3. **Deploy:**
   Push ke branch utama atau deploy melalui Vercel CLI. Berkas `vercel.json` secara otomatis merutekan `/api/*` ke serverless function `api/index.ts` dan mengarahkan rute SPA lainnya ke `index.html`.

---

## Struktur Direktori

```text
├── api/
│   └── index.ts                  # Entrypoint Vercel Serverless Function (@hono/node-server/vercel)
├── docs/                         # Dokumen spesifikasi PRD, Design System v2.0, Spec & Guardrails
├── public/
│   ├── branding/kit/             # Master aset vektor & ikon PWA Qwash
│   ├── site.webmanifest          # Konfigurasi manifest Progressive Web App (PWA)
│   └── sw.js                     # Service Worker (Network-Only untuk /api/*, App Shell cache)
├── server/
│   ├── app.ts                    # Konfigurasi Hono app, security headers, CORS & router utama
│   ├── dev.ts                    # Local development server (@hono/node-server)
│   ├── db/
│   │   ├── client.ts             # Koneksi @libsql/client + customFetch serverless & Drizzle ORM
│   │   ├── schema.sql            # Skema DDL SQLite/Turso asli proposal
│   │   ├── schema.ts             # Definisi tabel relasional Drizzle ORM
│   │   └── seed.ts               # Skrip pengisian data awal (PTGS, LYN, PLGN)
│   ├── middleware/
│   │   ├── auth.ts               # Verifikasi JWT HttpOnly cookie & role guard
│   │   └── rateLimit.ts          # Rate limiter anti brute-force login & pelacakan publik
│   └── routes/                   # auth, bayar, laporan, layanan, pelanggan, pesanan, petugas
├── shared/
│   └── schemas.ts                # Skema validasi Zod & TypeScript types bersama (FE + BE)
├── src/
│   ├── components/
│   │   ├── laundry/              # OrderStepper, PrintTicketView, StatusBadge, PwaInstallPrompt, dll.
│   │   ├── layout/               # AppShell (navigasi responsif print:hidden) & ErrorBoundary
│   │   └── ui/                   # Komponen primitif shadcn/ui
│   ├── hooks/
│   │   └── useAuth.tsx           # Context & hook manajemen sesi autentikasi staf
│   ├── lib/                      # api.ts, format.ts, utils.ts
│   ├── pages/                    # LandingPage, LoginPage, OrdersPage, CreateOrderPage, OrderDetailPage, dll.
│   ├── App.tsx                   # Konfigurasi routing & proteksi peran
│   ├── index.css                 # Base styles, focus ring a11y, mobile-native & print CSS
│   └── main.tsx                  # Entrypoint React & registrasi Service Worker PWA
├── drizzle.config.ts             # Konfigurasi Drizzle Kit
├── tailwind.config.ts            # Token tema Minimalism & Swiss Style (v2.0)
└── vercel.json                   # Konfigurasi header Service Worker & rewrite routing Vercel
```
