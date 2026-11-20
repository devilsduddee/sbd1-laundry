# AGENTS.md — Sistem Pengelolaan Laundry (Coding Agent Rules)

Dokumen ini adalah aturan wajib bagi coding agent (Antigravity atau coding agent lainnya) yang bekerja di repositori aplikasi **Sistem Pengelolaan Laundry**. Seluruh instruksi di bawah bersifat mutlak dan wajib dipatuhi.

---

## 1. Golden Rules (Wajib Dipatuhi)

### Aturan 1: Patuh Mutlak pada Dokumen Spesifikasi & Skema Proposal
- Baca dan jadikan dokumen berikut sebagai sumber kebenaran tunggal:
  1. `docs/04-prd.md`: Functional requirements (`FR-01` s.d. `FR-08`) & batasan scope.
  2. `docs/05-design.md`: Visual theme *Qwash Hygienic*, palet warna, tipografi, dan pemetaan `shadcn/ui`.
  3. `docs/06-spec.md`: Use case, alur proses, kontrak API Hono, edge cases, dan arsitektur Vercel.
  4. `docs/07-vibe-rules.md` & `schema.sql`: Guardrails & skema database Turso.
- **ATURAN KERAS DATABASE PROPOSAL:** Nama tabel (`PLGN`, `PTGS`, `LYN`, `PSN`, `DTL_PSN`, `BYR`) dan nama seluruh kolom **TIDAK BOLEH diubah, diganti bahasa Inggris, atau ditambah kolom baru** di luar `schema.sql`:
  - `PLGN`: `id_plgn`, `nm_plgn`, `no_hp`, `alamat`
  - `PTGS`: `id_ptgs`, `nm_ptgs`, `usernm`, `passwd`, `level`
  - `LYN`: `id_lyn`, `nm_lyn`, `hrg_kg`, `est_hari`
  - `PSN`: `id_psn`, `id_plgn`, `id_ptgs`, `tgl_msk`, `est_sls`, `tot_hrg`, `sts_psn`
  - `DTL_PSN`: `id_psn`, `id_lyn`, `brt_kg`, `hrg_trans` (Composite PK `(id_psn, id_lyn)`)
  - `BYR`: `id_byr`, `id_psn`, `id_ptgs`, `tgl_byr`, `met_byr`, `jml_byr`, `sts_byr`
- **Dilarang menambah fitur di luar MVP** (tanpa login pelanggan, payment gateway otomatis, notif WA, atau cicilan/DP).

### Aturan 2: Batas Maksimal 500 Baris per File (Anti-Spaghetti)
- **Setiap file (`.tsx`, `.ts`, `.sql`, `.css`) TIDAK BOLEH melebihi 500 baris.**
- Jika sebuah halaman atau file route mendekati 350–400 baris, segera pecah ke subkomponen (`src/components/laundry/`), hooks (`src/hooks/`), atau modul route terpisah (`server/routes/`).
- Satu file = satu tanggung jawab jelas.

### Aturan 3: Strict Git Safety (Dilarang `git push` Otomatis)
- **DILARANG KERAS menjalankan `git push` secara otomatis/mandiri.**
- Commit lokal (`git add` & `git commit`) diizinkan per milestone yang sudah lolos uji lokal.
- `git push` ke remote hanya boleh dijalankan setelah user memberi instruksi eksplisit.

### Aturan 4: Zero Custom Component Reinvention
- Seluruh komponen UI wajib menggunakan **`shadcn/ui`** (`Button`, `Card`, `Table`, `Badge`, `Tabs`, `Dialog`, `AlertDialog`, `Select`, `Input`, `Label`, `Popover`, `Command`, `Sheet`, `Sonner`) dan ikon **`lucide-react`**.
- **Jangan membuat komponen modal, tabel, dropdown, atau toast custom dari nol.**
- Stepper status pesanan disusun ringan dari `Badge` + utility classes Tailwind CSS.
- **Animasi GSAP:** Gunakan `gsap` + `@gsap/react` (`useGSAP()` dengan `scope` ref) untuk stagger kartu, transisi stepper `sts_psn`, dan micro-interaction halus. Durasi wajib singkat (`0.2s–0.35s`), wajib menghormati `prefers-reduced-motion: reduce`, dan tidak boleh menyembunyikan elemen pada `@media print`.

---

## 2. Tech Stack & Arsitektur (Vite + React + Hono + Turso + Vercel)

- **Frontend:** Vite + React (TypeScript) + Tailwind CSS + `shadcn/ui` + `gsap` (`@gsap/react`) + `react-router-dom` + `react-hook-form` + `zod`.
- **Backend API:** Hono (TypeScript) di `server/`, diekspor sebagai Vercel Serverless Function via `api/index.ts` (`hono/vercel`).
- **Database:** Turso / libSQL (`@libsql/client`).
- **Auth:** Stateless JWT (`hono/jwt`) di *HttpOnly Cookie* (`auth_token`) + password hashing dengan `bcryptjs` (pure JS agar aman di Vercel Serverless).

### Struktur Direktori Wajib
```text
├── api/index.ts              # Entrypoint Vercel Serverless Function (handle(app))
├── server/
│   ├── app.ts                # Hono app utama (/api/*)
│   ├── dev.ts                # Local dev server (@hono/node-server)
│   ├── db/client.ts          # Koneksi @libsql/client
│   ├── middleware/auth.ts    # Guard JWT cookie & role PTGS.level
│   └── routes/*.ts           # auth, pelanggan, layanan, petugas, pesanan, bayar, laporan
├── shared/schemas.ts         # Zod schemas & types bersama (FE + BE)
└── src/
    ├── components/ui/        # Komponen shadcn/ui
    ├── components/layout/    # AppShell (pakai print:hidden!)
    ├── components/laundry/   # OrderStepper, StatusBadge, PrintTicketView
    ├── hooks/useAuth.tsx
    ├── lib/{api,format,utils}.ts
    └── pages/*.tsx
```

---

## 3. Aturan Bisnis & Keamanan Kritis

1. **Server-Side Calculation:** `DTL_PSN.hrg_trans`, `PSN.tot_hrg`, dan `PSN.est_sls` **wajib dihitung di backend Hono** dari tabel `LYN`. Jangan pernah percaya nominal harga yang dikirim client.
2. **Transaksi Atomik:** Penyimpanan `PSN` + `DTL_PSN` wajib memakai `db.batch([...], 'write')` dengan `PRAGMA foreign_keys = ON`.
3. **Merge Layanan Duplikat:** Jika satu pesanan memilih `id_lyn` yang sama lebih dari sekali di UI, gabungkan (`sum`) `brt_kg`-nya menjadi satu baris agar cocok dengan Composite PK `(id_psn, id_lyn)`.
4. **Blokir Pengambilan Sebelum Lunas (Prosedur 6):** Endpoint `PATCH /api/pesanan/:id/ambil` wajib menolak (`409 Conflict`) jika `sts_psn !== 'Siap Diambil'` atau belum ada record `BYR` dengan `sts_byr = 'Lunas'`. Jika lolos, update `PSN.sts_psn = 'Sudah Diambil'`.
5. **Privasi Password:** Kolom `PTGS.passwd` tidak boleh pernah dikembalikan di response API mana pun.
6. **Print-Friendly:** Sidebar dan tombol non-struk wajib memakai class `print:hidden` agar Output 3 (Tiket Pesanan) dan Output 4 (Bukti Pembayaran) tercetak bersih lewat `window.print()`.

---

## 4. Token Desain (`05-design.md`)

- **Canvas:** `#F5F6FA` | **Card:** `#FFFFFF` | **Teks Utama:** `#1A1A2E` | **Muted:** `#6B7280`
- **Primary Indigo:** `#4F46E5` | **Brand Accent Gelap:** `#1E1B4B` | **Border:** `#E4E7F2` | **Danger:** `#EF4444`
- **Font:** `Plus Jakarta Sans` (aktifkan `tabular-nums` pada angka harga, berat, tanggal, dan ID tiket).
- **Aturan Kontras:** Badge status memakai latar pastel lembut (`#F3F4F6`, `#DBEAFE`, `#FEF3C7`, `#EDE9FE`, `#DCFCE7`, `#FEE2E2`) dengan **teks gelap** berkontras tinggi (bukan teks putih di atas pastel).
