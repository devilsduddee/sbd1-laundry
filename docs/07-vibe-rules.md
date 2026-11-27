# 07 - Vibe Rules: Sistem Pengelolaan Laundry

- **Versi:** 1.3
- **Tanggal:** 2026-11-27
- **Status:** Approved
- **Sumber input:** `04-prd.md` v1.1, `05-design.md` v2.3, `06-spec.md` v1.4 (Gate 3 Approved), dan `profile.md` bagian 9.
- **Skill digunakan:** `vibe-rules`

---

## TL;DR

Dokumen ini menjadi pagar teknis (*guardrails*) bagi coding agent (Antigravity) saat membangun aplikasi web **Sistem Pengelolaan Laundry** di repositori terpisah dengan stack **Vite + React + `shadcn/ui` + Hono + Turso (libSQL)** untuk deployment **Vercel**.

Empat prinsip utamanya: patuh mutlak pada dokumen spesifikasi dan **larangan keras mengubah/menambah nama tabel maupun kolom ERD proposal**, batas ukuran maksimal 500 baris per file, wajib memakai komponen standar `shadcn/ui` tanpa bikin komponen custom dari nol, dan larangan keras menjalankan `git push` otomatis tanpa perintah eksplisit user.

---

## 1. Golden Rules untuk Coding Agent

### Aturan 1: Patuh Mutlak pada Dokumen & Skema Proposal
- Coding agent **wajib** membaca `04-prd.md`, `05-design.md`, `06-spec.md`, dan `schema.sql` sebelum menulis kode.
- **Aturan Keras Basis Data (Tugas Kuliah):** Nama tabel (`PLGN`, `PTGS`, `LYN`, `PSN`, `DTL_PSN`, `BYR`) dan seluruh nama kolom (`id_psn`, `tgl_msk`, `est_sls`, `tot_hrg`, `sts_psn`, `id_plgn`, `nm_plgn`, `no_hp`, `alamat`, `id_ptgs`, `nm_ptgs`, `usernm`, `passwd`, `level`, `id_lyn`, `nm_lyn`, `hrg_kg`, `est_hari`, `brt_kg`, `hrg_trans`, `id_byr`, `tgl_byr`, `met_byr`, `jml_byr`, `sts_byr`) **TIDAK BOLEH diubah, diterjemahkan ke bahasa Inggris, atau ditambah kolom baru**.
- **Dilarang berimprovisasi** menambah fitur di luar MVP (misal portal login pelanggan, QRIS payment gateway, notif WA otomatis, atau skema cicilan).

### Aturan 2: Batas Ukuran File (Maksimal 500 Baris)
- Setiap file kode sumber (`.tsx`, `.ts`, `.sql`, `.css`) **wajib di bawah 500 baris**.
- Begitu sebuah file mendekati 350–400 baris, wajib langsung dipecah menjadi subkomponen (`src/components/laundry/`), custom hooks (`src/hooks/`), atau route handler per domain (`server/routes/*.ts`).
- Satu file memegang satu tanggung jawab yang jelas.

### Aturan 3: Git Safety (Dilarang Asal Push)
- Coding agent **dilarang keras** menjalankan `git push` ke GitHub/remote secara otomatis.
- Commit lokal (`git add` & `git commit`) boleh dilakukan per milestone yang sudah dites.
- `git push` hanya boleh dijalankan jika user meminta secara eksplisit di chat.

### Aturan 4: Zero Custom Component Reinvention
- Sesuai `profile.md` bagian 9 dan `05-design.md`, **dilarang membuat komponen UI dasar dari nol** (modal custom, dropdown custom, tabel HTML mentah tanpa styling `shadcn/ui`, atau toast manual).
- Gunakan komponen resmi **`shadcn/ui`** (`Button`, `Card`, `Table`, `Badge`, `Tabs`, `Dialog`, `AlertDialog`, `Select`, `Input`, `Label`, `Command`, `Popover`, `Sheet`, `Sonner`) dan ikon **`lucide-react`** (dilarang memakai emoji sebagai ikon).
- Tabel data **wajib** memakai semantic `<Table><TableHeader><TableBody><TableRow>` dalam wrapper `overflow-x-auto` (jangan diganti `div grid`).
- **Forms UX:** Setiap input wajib punya `<Label htmlFor>`, dan **dilarang me-reset form** saat validasi/request gagal (*Preserve Input After Failed Submit*).
- **Animasi GSAP (`gsap` + `@gsap/react`):** Seluruh animasi transisi halus (stagger kartu KPI/layanan, progress bar stepper `sts_psn`, hover `quickTo`) wajib menggunakan hook `useGSAP()` dengan `scope` ref, `ease: 'power2.out'` (dilarang `back.out` di tabel data padat), durasi singkat (`0.2s–0.35s`), menghormati `prefers-reduced-motion: reduce`, dan tidak boleh memblokir tampilan cetak (`@media print`).
- **Ambient WebGL (`@firecms/neat`) & Glassy UI (`glassyui.com`):** Halaman Hero `LandingPage` dan `LoginPage` memakai `<NeatBackground />` via `React.lazy()` (`destroy()` saat unmount, `{ passive: true }` scroll, fallback WebGL). Seluruh `Card`, `Dialog`, dan `Button` memakai material Liquid Glass (`backdrop-filter: blur(14px–20px) saturate(160%)`, specular top-edge rim highlight, serta efek *pointer bloom* saat klik sesuai `glassyui.com`) di atas *ambient mesh* ringan pada `AppShell`, dengan fallback solid otomatis saat `@media print` atau `prefers-reduced-transparency: reduce`.

---

## 2. Standar Arsitektur Vite + React + Hono + Turso (Vercel)

### 2.1 Single-Repo Serverless Pattern (Bebas Masalah CORS)
1. **Frontend (`src/`):** Vite + React (SPA) di-build ke `dist/`. Seluruh request API memanggil path relatif `/api/...` dengan `credentials: 'include'`.
2. **Backend (`server/` + `api/index.ts`):** Hono dijalankan di `/api/*`. File `api/index.ts` mengekspor `handle(app)` dari `hono/vercel` untuk production Vercel; di lokal, `server/dev.ts` menjalankan Hono via `@hono/node-server` dan Vite me-proxy `/api` ke port lokal Hono.
3. **Shared Validation (`shared/schemas.ts`):** Skema Zod dan tipe TypeScript didefinisikan satu kali di `shared/` agar validasi payload frontend (`react-hook-form`) dan backend (`@hono/zod-validator`) selalu sinkron.

### 2.2 Aturan Ketat Backend Hono & Turso
1. **Foreign Keys Aktif:** Pastikan setiap operasi tulis atau inisialisasi di Turso/SQLite menghormati `PRAGMA foreign_keys = ON;`.
2. **Transaksi Atomik:** Pembuatan pesanan (`INSERT PSN` + multi-row `INSERT DTL_PSN`) wajib menggunakan `db.batch([...], 'write')` atau transaksi eksplisit agar tidak pernah tersimpan setengah.
3. **Server-Side Pricing & Guardrails:**
   - `hrg_trans` wajib diambil dari `LYN.hrg_kg` di database saat transaksi dibuat (abaikan harga dari frontend).
   - `tot_hrg` dan `est_sls` wajib dihitung di backend.
   - `PATCH /api/pesanan/:id/ambil` wajib mengecek `PSN.sts_psn === 'Siap Diambil'` **dan** keberadaan record `BYR` dengan `sts_byr = 'Lunas'` sebelum mengubah `sts_psn` menjadi `'Sudah Diambil'`.
   - `PTGS.passwd` wajib di-hash dengan `bcryptjs` dan **tidak boleh pernah ikut terkirim** di JSON response endpoint mana pun.
4. **Stateless Auth:** Gunakan JWT bertanda tangan (`hono/jwt`) di cookie `HttpOnly` (`auth_token`) agar berjalan mulus di Vercel Serverless tanpa menambah tabel `SESSIONS` baru di luar ERD.

---

## 3. Roadmap Implementasi Bertahap (Untuk Coding Agent)

1. **Fase 1 — Inisialisasi & Turso Schema:** Setup project Vite + React + Tailwind + `shadcn/ui`, pasang Hono & `@libsql/client`, eksekusi `schema.sql` ke Turso, dan buat script seed 1 akun `Admin` + contoh `LYN`.
2. **Fase 2 — Hono API & Auth:** Implementasi `server/app.ts`, middleware JWT + role guard (`Admin`, `Kasir`, `Operasional`), serta seluruh endpoint di `06-spec.md` Bagian 9.
3. **Fase 3 — UI Shell, Login, & Master Data:** Implementasi tema warna **Minimalism & Swiss Style** (`tailwind.config.ts` & `index.css` + font `Fira Code` & `Fira Sans`), App Shell responsif (`Sidebar` + `Sheet` + `print:hidden`), `LoginPage`, `CustomersPage` (`PLGN`), `ServicesPage` (`LYN`), dan `StaffPage` (`PTGS`).
4. **Fase 4 — Alur Inti Pesanan, Status, Bayar & Ambil:** Implementasi `OrdersPage`, `CreateOrderPage` (auto-merge item `id_lyn` duplikat, *preserve input* saat error), `OrderDetailPage` (Stepper status presisi Swiss + GSAP, modal bayar `BYR`, blokir ambil sebelum `Lunas`).
5. **Fase 5 — Cetak Struk, Laporan, & Deploy Vercel:** Tambahkan CSS `@media print` untuk Output 3 (Tiket Pesanan) & Output 4 (Bukti Pembayaran), buat `ReportPage` (Output 5 + CSV opsional), verifikasi `npm run build`, lalu siap deploy ke Vercel.
6. **Fase 6 — Ambient WebGL `@firecms/neat` (Opsi A) & PWA:** Implementasi `<NeatBackground />` (Opsi A pada `LandingPage` Hero & `LoginPage` dengan lazy load, cleanup `destroy()`, fallback WebGL/reduced-motion) serta dukungan penuh PWA (`sw.js`, `site.webmanifest`, dan prompt install mobile).

---

## 4. Checklist Verifikasi Sebelum Selesai

- [ ] Seluruh 6 tabel & nama field di Turso identik 100% dengan `schema.sql` dan proposal ERD.
- [ ] Output 1–5 (Data Pelanggan, Data Layanan, Tiket Pesanan, Bukti Pembayaran, Laporan Transaksi periode) berfungsi end-to-end.
- [ ] Prosedur 1–6 berjalan sesuai aturan, termasuk blokir pengambilan cucian jika belum `Lunas`.
- [ ] Tidak ada file yang melebihi 500 baris.
- [ ] Aplikasi ter-build bersih (`npm run build`) dan siap di-deploy ke Vercel lewat `vercel.json`.

---

## Out of Scope

- Menulis atau mengedit kode aplikasi di workspace PM ini (eksekusi hanya di repo project terpisah).
- Mengubah desain skema database di luar 6 tabel proposal.

## Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 2026-11-20 | Penyusunan `07-vibe-rules.md` dan paket `handoff/` untuk stack Vite + React + `shadcn/ui` + Hono + Turso (Vercel). |
| 1.1 | 2026-11-20 | Menambahkan aturan GSAP (`gsap` + `@gsap/react`) untuk animasi halus dengan `useGSAP`, durasi singkat, dan print safety. |
| 1.2 | 2026-11-26 | Menyelaraskan dengan `05-design.md` v2.0 (Minimalism & Swiss Style dari `ui-ux-pro-max`, semantic `<Table>`, *Preserve Input After Failed Submit*, larangan emoji icon, dan anti-overshoot GSAP di tabel). |
| 1.3 | 2026-11-27 | Menambahkan aturan `@firecms/neat` Opsi A (`<NeatBackground />` di `LandingPage` & `LoginPage` + guardrails WebGL/reduced-motion/cleanup) sesuai `05-design.md` v2.1. |
| 1.4 | 2026-11-27 | Memadukan gradien `@firecms/neat` & *ambient mesh* dengan **Glassy UI (`glassyui.com`)** pada `Card`, `Dialog`, dan `Button` (`05-design.md` v2.3), lengkap dengan fallback `prefers-reduced-transparency` & `@media print`. |
