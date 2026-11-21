# Sistem Pengelolaan Laundry (Qwash Laundry)

Aplikasi web sistem informasi pengelolaan operasional laundry berbasis relasional database (Turso / libSQL), dirancang untuk memenuhi spesifikasi tugas besar Sistem Basis Data (Kelas 3IA01).

Aplikasi ini mengintegrasikan pencatatan pelanggan, pembuatan tiket pesanan, pembaruan progres pengerjaan bertahap, pencatatan pembayaran lunas, validasi pengambilan cucian, serta laporan rekapitulasi transaksi periode.

---

## 🛠️ Tech Stack

- **Frontend:** [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) (TypeScript) + [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + [Lucide React](https://lucide.dev/)
- **Micro-Interactions & Animation:** [GSAP](https://gsap.com/) (`@gsap/react`)
- **Backend API:** [Hono](https://hono.dev/) on Node.js (Local) & Vercel Serverless Functions (`hono/vercel`)
- **Database:** [Turso](https://turso.tech/) (libSQL / SQLite engine) dengan `PRAGMA foreign_keys = ON;`
- **Autentikasi:** Stateless JWT (`hono/jwt`) disimpan di `HttpOnly Cookie` + password hash `bcryptjs`
- **Deployment Target:** [Vercel](https://vercel.com/) (Single-repo: SPA Frontend + Serverless `/api/*`)

---

## 📋 5 Output & 6 Prosedur Operasional

1. **Output 1:** Data Pelanggan (`PLGN`) — Daftar pelanggan, no HP, alamat, & fitur pencarian.
2. **Output 2:** Data Layanan (`LYN`) — Katalog tarif per kg/satuan & estimasi hari pengerjaan.
3. **Output 3:** Tiket Pesanan (`PSN` + `DTL_PSN`) — Rincian cucian, bobot kg, total harga otomatis, dan tampilan cetak (*print-friendly*).
4. **Output 4:** Bukti Pembayaran (`BYR`) — Struk pembayaran lunas (`Tunai` / `Transfer`).
5. **Output 5:** Laporan Transaksi — Filter rentang tanggal, ringkasan pendapatan, dan ekspor CSV.
6. **Prosedur 1 s.d. 6:**
   - Prosedur 1: Pendaftaran / verifikasi pelanggan baru & lama.
   - Prosedur 2 & 3: Pembuatan tiket pesanan & penimbangan multi-layanan (harga dihitung di server).
   - Prosedur 4: Pembaruan status bertahap (`Antrean` → `Sedang Dicuci` → `Sedang Disetrika` → `Siap Diambil`).
   - Prosedur 5: Pencatatan pembayaran lunas (di awal atau di akhir).
   - Prosedur 6: **Blokir mutlak pengambilan cucian sebelum lunas** (`409 Conflict`); jika lunas, status ditutup menjadi `Sudah Diambil`.

---

## 🚀 Menjalankan di Lokal (Local Development)

### 1. Prasyarat
- Node.js versi 18 ke atas (direkomendasikan Node.js 20+).
- npm / pnpm / yarn.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
File `.env.local` sudah disiapkan untuk pengembangan lokal (default menggunakan SQLite lokal `file:local.db`):
```env
TURSO_DATABASE_URL="file:local.db"
TURSO_AUTH_TOKEN=""
JWT_SECRET="sbd-laundry-secret-key-super-secure-min-32-chars-long"
PORT=3001
```

### 4. Seeding Data Awal
Untuk mengisi akun default dan master layanan awal ke database:
```bash
npm run db:seed
```

### 5. Menjalankan Aplikasi
```bash
npm run dev
```
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api

---

## 👥 Akun Default Demo (Hasil Seed)

Aplikasi menyediakan tombol *Quick Fill* pada halaman login untuk kemudahan demo:

| Username | Password | Peran (`level`) | Hak Akses |
|---|---|---|---|
| `admin` | `admin123` | **Admin** | Akses penuh seluruh menu & kelola data petugas |
| `kasir` | `kasir123` | **Kasir** | Pelanggan, tiket pesanan, catat bayar, serah terima cucian |
| `operasional` | `opera123` | **Operasional** | Pantau antrean & perbarui status cucian (`sts_psn`) |

---

## 🗄️ Menghubungkan ke Turso Cloud Database

Lihat bagian panduan lengkap di chat atau ikuti ringkasan:
1. Buat database di [Turso Web Dashboard](https://turso.tech/) atau via Turso CLI (`turso db create sistem-laundry`).
2. Terapkan skema: `turso db shell sistem-laundry < server/db/schema.sql`.
3. Ambil URL database (`libsql://...`) dan Auth Token.
4. Perbarui `.env.local` dan Environment Variables di dashboard Vercel.
5. Jalankan `npm run db:seed` untuk memasukkan akun awal ke Turso Cloud.

---

## 📁 Struktur Direktori

```text
├── api/index.ts              # Entrypoint Vercel Serverless Function
├── server/
│   ├── app.ts                # Inisialisasi Hono & rute /api/*
│   ├── dev.ts                # Server lokal Hono @hono/node-server
│   ├── db/                   # Koneksi @libsql/client, schema.sql, seed.ts
│   ├── middleware/           # authMiddleware (JWT Cookie) & roleGuard
│   └── routes/               # auth, pelanggan, layanan, petugas, pesanan, bayar, laporan
├── shared/schemas.ts         # Zod schemas & TypeScript types (shared FE + BE)
├── src/
│   ├── components/ui/        # Komponen resmi shadcn/ui
│   ├── components/layout/    # AppShell & sidebar navigasi (print:hidden)
│   ├── components/laundry/   # OrderStepper (GSAP), StatusBadge, PrintTicketView
│   ├── hooks/useAuth.tsx     # Context sesi autentikasi
│   ├── lib/                  # api.ts, format.ts, utils.ts
│   └── pages/                # Halaman aplikasi React
├── vercel.json               # Konfigurasi rewrite routing Vercel
└── tailwind.config.ts        # Konfigurasi token visual Qwash Hygienic
```
