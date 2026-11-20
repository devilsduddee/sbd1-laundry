# Panduan Setup & Deployment: Sistem Pengelolaan Laundry

Panduan langkah demi langkah untuk menyiapkan repositori baru aplikasi **Sistem Pengelolaan Laundry** (Vite + React + Tailwind + `shadcn/ui` + Hono + Turso + Vercel) dari paket handoff PM Workspace.

---

## 1. Salin Dokumen & Paket Handoff ke Repo Baru

1. Buat folder repositori baru di luar workspace PM (contoh: `d:\sistem-laundry-app`).
2. Salin dokumen referensi berikut ke folder `docs/` di repo baru agar coding agent bisa membacanya:
   - `04-prd.md`
   - `05-design.md`
   - `06-spec.md`
   - `07-vibe-rules.md`
3. Salin isi folder `handoff/` ke repo baru:
   - `handoff/AGENTS.md` → root repo (`AGENTS.md`)
   - `handoff/schema.sql` → `server/db/schema.sql`
   - `handoff/tailwind.config.ts` → root repo (`tailwind.config.ts`, jika memakai Tailwind v3; atau sesuaikan `@theme` jika memakai Tailwind v4)
   - `handoff/SETUP.md` → `SETUP.md` (atau rujuk sebagai README setup)

---

## 2. Inisialisasi Project Vite + React + Hono + shadcn/ui

```bash
# 1. Buat project Vite React TypeScript
npm create vite@latest . -- --template react-ts
npm install

# 2. Pasang frontend dependencies & shadcn/ui prerequisites
npm install react-router-dom react-hook-form @hookform/resolvers zod lucide-react sonner gsap @gsap/react

# 3. Pasang Tailwind CSS & inisialisasi shadcn/ui
# (Ikuti docs resmi shadcn/ui untuk Vite: https://ui.shadcn.com/docs/installation/vite)
npx shadcn@latest init

# 4. Pasang komponen shadcn/ui yang dibutuhkan sesuai 05-design.md & 06-spec.md
npx shadcn@latest add button card table badge tabs dialog alert-dialog select input label popover command sheet separator form sonner

# 5. Pasang backend Hono + Turso + Auth dependencies
npm install hono @hono/zod-validator @libsql/client bcryptjs
npm install -D @hono/node-server @types/bcryptjs tsx concurrently
```

---

## 3. Setup Database Turso (libSQL)

1. Install Turso CLI (atau gunakan Turso Web Dashboard):
   - Dokumentasi resmi: https://docs.turso.tech/cli/installation
2. Login dan buat database baru:
   ```bash
   turso auth login
   turso db create sistem-laundry
   ```
3. Terapkan `server/db/schema.sql` ke database Turso:
   ```bash
   turso db shell sistem-laundry < server/db/schema.sql
   ```
4. Ambil URL dan Auth Token database:
   ```bash
   turso db show sistem-laundry --url
   turso db tokens create sistem-laundry
   ```

---

## 4. Konfigurasi Environment Variables

Buat file `.env.local` di root repo (pastikan `.env.local` ada di `.gitignore`!):

```env
TURSO_DATABASE_URL="libsql://<nama-db>-<org>.turso.io"
TURSO_AUTH_TOKEN="<token-turso-anda>"
JWT_SECRET="<random-secret-minimal-32-karakter>"
```

---

## 5. Konfigurasi Vite Proxy & Vercel Routing

### `vite.config.ts` (untuk local development)
Arahkan request `/api` ke server Hono lokal (misal port `3001`) agar frontend dan backend berjalan mulus tanpa masalah CORS:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### `vercel.json` (untuk production Vercel)
Pastikan seluruh request `/api/*` diarahkan ke Serverless Function Hono (`api/index.ts`), sedangkan rute frontend SPA diarahkan ke `/index.html`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### `api/index.ts` (Entrypoint Vercel)
```ts
import { handle } from 'hono/vercel';
import app from '../server/app';

export default handle(app);
```

---

## 6. Seed Akun Admin Awal (`PTGS`)

Buat script singkat `server/db/seed.ts` untuk memasukkan 1 akun `Admin` pertama dengan password ter-hash `bcryptjs` (jangan pernah memasukkan password plaintext ke `schema.sql`), lalu jalankan sekali:

```bash
npx tsx server/db/seed.ts
```

---

## 7. Menjalankan di Lokal & Deploy ke Vercel

### Menjalankan Lokal
Tambahkan script di `package.json`:
```json
{
  "scripts": {
    "dev:api": "tsx watch --env-file=.env.local server/dev.ts",
    "dev:web": "vite",
    "dev": "concurrently \"npm:dev:api\" \"npm:dev:web\"",
    "build": "vite build"
  }
}
```
Lalu jalankan:
```bash
npm run dev
```

### Deploy ke Vercel
1. Pastikan `npm run build` berjalan sukses tanpa error TypeScript.
2. Push repo ke GitHub (hanya setelah Anda setuju / melakukannya sendiri) atau gunakan Vercel CLI (`npx vercel`).
3. Di **Vercel Dashboard → Project Settings → Environment Variables**, masukkan:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET`
4. Deploy dan uji login, pembuatan pesanan, update status, pembayaran lunas, blokir pengambilan sebelum lunas, cetak tiket/bukti bayar, serta laporan transaksi periode.
