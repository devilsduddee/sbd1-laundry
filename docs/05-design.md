# 05 - Design System: Sistem Pengelolaan Laundry

- **Versi:** 2.1
- **Tanggal:** 2026-11-27
- **Status:** Approved
- **Sumber input:** `04-prd.md` v1.1 (Approved), riset `ui-ux-pro-max`, dan keputusan Lead PM menerapkan **Minimalism & Swiss Style + Ambient `@firecms/neat` (Opsi A)**.
- **Skill digunakan:** `ui-ux-pro-max`, `design-taste-frontend`

## TL;DR

Design system v2.1 mempertahankan **Minimalism & Swiss Style** (v2.0) untuk seluruh area kerja operasional kasir, serta mengintegrasikan **`@firecms/neat` (`NeatGradient`) melalui pendekatan Hybrid (Opsi A)** pada **Hero `LandingPage`** dan latar **`LoginPage`**.

Palet gradient WebGL menggunakan warna air bersih & kain linen (`#FFFFFF`, `#EFE2CE`, `#D5ECEB`, `#E4E4E4`, `#F6FFFF` di atas `#00A2FF` dengan *grain* halus `0.05` dan `speed: 2`), sementara dashboard data internal (`/pesanan`, `/pelanggan`, `/layanan`, `/laporan`, `/petugas`) serta layout cetak struk tetap menggunakan latar Swiss solid (`#F8FAFC` + `#FFFFFF`), jangkar **Deep Slate Navy (`#0F172A`)**, CTA **Ocean Blue (`#0369A1`)**, serta pasangan tipografi **`Fira Code`** + **`Fira Sans`**.

---

## Konteks Perubahan Arah Desain (v2.0 -> v2.1)

Pada pembaruan v2.1, dipilih **Opsi A (Hybrid Swiss + Neat Ambient WebGL)** (dengan opsi evaluasi ke Opsi B bila diperlukan):

- **Area Publik & Gerbang (`LandingPage` Hero & `LoginPage`):**
  - Menggunakan kanvas WebGL `<NeatBackground />` berbasis `@firecms/neat` dengan `yOffset` reaktif terhadap `window.scrollY`.
  - Kartu/teks di atas kanvas dibungkus permukaan putih semi-transparan (`bg-white/90 backdrop-blur-sm border border-[#E2E8F0]`) atau teks `#0F172A` agar kontras tetap >= 4.5:1 di mana pun gelombang `#00A2FF` muncul.
- **Area Operasional Kasir & Produksi (`/pesanan`, tabel data, form tiket, cetak nota):**
  - Tetap **Swiss Style solid** (`#F8FAFC` canvas, `#FFFFFF` card, `1px solid #E2E8F0`) demi kecepatan baca tabel padat, efisiensi baterai HP/laptop kasir, dan zero GPU distraction.
- **Ditolak (Out of Scope):**
  - Animasi *overshoot* (`back.out`) pada tabel data padat atau menampilkan kanvas WebGL saat mencetak struk (`@media print`).

---

## 1. Visual Theme & Atmosphere

Antarmuka mengusung karakter **Swiss Utilitarian Precision** — bersih, terstruktur berbasis grid, tanpa noise visual, dengan kontras tinggi agar petugas kasir bisa bekerja cepat berjam-jam tanpa kelelahan mata.

Permukaan latar menggunakan **Cool Off-White (`#F8FAFC`)** dengan kartu putih murni (`#FFFFFF`) dan garis batas tipis (`1px solid #E2E8F0`) alih-alih bayangan tebal. Fokus pengguna diarahkan secara tegas melalui kontras antara struktur navigasi gelap/netral (`#0F172A`), tombol aksi utama biru laut (`#0369A1`), dan badge status semantik yang selalu memasangkan warna dengan label teks & ikon (*never color alone*).

---

## 2. Color Palette & Design Tokens (`ui-ux-pro-max`)

Token di bawah diekspor langsung dari `ui-ux-pro-max` (`--tokens css`) dan dipetakan ke variabel `shadcn/ui`:

```css
:root {
  --color-primary: #0F172A;
  --color-on-primary: #FFFFFF;
  --color-secondary: #334155;
  --color-on-secondary: #FFFFFF;
  --color-accent: #0369A1;
  --color-on-accent: #FFFFFF;
  --color-background: #F8FAFC;
  --color-foreground: #020617;
  --color-card: #FFFFFF;
  --color-card-foreground: #020617;
  --color-muted: #E8ECF1;
  --color-muted-foreground: #475569;
  --color-border: #E2E8F0;
  --color-destructive: #DC2626;
  --color-on-destructive: #FFFFFF;
  --color-ring: #0F172A;
  --font-heading: "Fira Code", monospace;
  --font-body: "Fira Sans", sans-serif;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}
```

| Nama Peran | Hex Code | Token `shadcn/ui` | Peran Fungsional |
|---|---|---|---|
| **Swiss Slate Navy** | `#0F172A` | `--primary` | Header tabel/navbar aktif, tombol utama struktural, dan focus ring (`--ring`). |
| **Ocean Action Blue** | `#0369A1` | `--accent` / CTA | Tombol CTA konversi tinggi (*+ Buat Pesanan*, *Catat Pembayaran Lunas*, *Serahkan Cucian*), link aktif. |
| **Deep Slate Secondary** | `#334155` | `--secondary` | Elemen pendukung struktural, sub-header, tombol sekunder gelap. |
| **Cool Alabaster Canvas** | `#F8FAFC` | `--background` | Latar belakang utama halaman agar kartu putih terpisah tajam. |
| **Pure White Surface** | `#FFFFFF` | `--card` / `--popover` | Kartu KPI, tabel transaksi, form tiket, modal `Dialog`, dan layout cetak struk. |
| **Obsidian Ink** | `#020617` | `--foreground` | Teks judul utama, angka tagihan (`tot_hrg`), dan sel tabel utama (kontras > 15:1 di atas putih). |
| **Slate Gray Muted** | `#475569` | `--muted-foreground` | Metadata sekunder (`no_hp`, `alamat`, tanggal, label kolom; kontras >= 4.5:1 di atas `#FFFFFF` & `#F8FAFC`). |
| **Soft Slate Tint** | `#E8ECF1` | `--muted` | Latar tombol sekunder netral, badge netral, dan hover row ringan. |
| **Hairline Slate Border** | `#E2E8F0` | `--border` / `--input` | Garis tepi `1px` presisi khas Swiss Style pada kartu, tabel, dan input form. |
| **Crimson Alert Red** | `#DC2626` | `--destructive` | Alert blokir pengambilan sebelum lunas (Prosedur 6), error validasi form, dan aksi hapus. |

### Token Semantik Status (`sts_psn` & `sts_byr`)

Seluruh badge status wajib memenuhi rasio kontras teks >= 4.5:1 dan selalu menyertakan **teks + ikon/dot** (`color-not-only`):

| Status | Latar Badge | Teks | Border | Ikon Lucide |
|---|---|---|---|---|
| `Antrean` | `#F1F5F9` | `#334155` | `#CBD5E1` | `Clock` |
| `Sedang Dicuci` | `#E0F2FE` | `#0369A1` | `#BAE6FD` | `Waves` / `Droplets` |
| `Sedang Disetrika` | `#FEF3C7` | `#B45309` | `#FDE68A` | `Flame` / `Sparkles` |
| `Siap Diambil` | `#EDE9FE` | `#6D28D9` | `#DDD6FE` | `PackageCheck` |
| `Sudah Diambil` | `#DCFCE7` | `#15803D` | `#BBF7D0` | `CheckCircle2` |
| `Lunas` (`sts_byr`) | `#DCFCE7` | `#15803D` | `#BBF7D0` | `BadgeCheck` |
| `Belum Lunas` | `#FEE2E2` | `#B91C1C` | `#FECACA` | `AlertCircle` |

---

## 3. Typography Rules (`Fira Code` + `Fira Sans`)

- **Font Pairing (dari `ui-ux-pro-max`):**
  - **Heading, ID Tiket, & Angka Keuangan:** `Fira Code` (`400, 500, 600, 700`) — memberi kesan teknis, presisi basis data, dan angka yang langsung sejajar (`tabular-nums`).
  - **Body, Label Form, & Sel Teks:** `Fira Sans` (`300, 400, 500, 600, 700`) — sangat jernih dan nyaman dibaca di tabel operasional maupun layar ponsel.
- **Google Fonts Import:**
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
  ```
- **Hierarki & Skala (`--density 7` Dashboard Ops):**
  - **Judul Halaman (`24px`, `Fira Code`, Bold 700, tracking `-0.02em`):** Contoh: *"Daftar Pesanan"*, *"Laporan Transaksi"*.
  - **Angka KPI & Total Tagihan (`24px–28px`, `Fira Code`, Bold 700, `tabular-nums`):** Untuk `tot_hrg`, `jml_byr`, dan ringkasan pendapatan.
  - **Judul Kartu / Section (`16px`, `Fira Sans` / `Fira Code`, SemiBold 600).**
  - **Body & Sel Tabel (`14px–16px`, `Fira Sans`, Regular 400 / Medium 500, line-height `1.5`):** Di mobile, input form minimal `16px` untuk mencegah *auto-zoom* iOS.
  - **Label & Metadata (`12px`, `Fira Sans`, Medium 500):** Tidak boleh di bawah `12px` untuk teks isi.

---

## 4. Pemetaan Komponen ke `shadcn/ui` & Aturan Stack

Seluruh komponen menggunakan library standar **`shadcn/ui`** + **`lucide-react`** + **`gsap`** tanpa merancang komponen custom dari nol:

| Kebutuhan UI | Komponen `shadcn/ui` / Library | Aturan Implementasi (`ui-ux-pro-max`) |
|---|---|---|
| **App Shell / Navigasi** | `Sidebar` / `Sheet` + `Button` | Sidebar kiri bersih (`#0F172A` active state atau `#FFFFFF` dengan border `#E2E8F0`), kolaps jadi `Sheet` di mobile, wajib `print:hidden`. |
| **Tombol & CTA** | `Button` | Radius tegas `rounded-md` (`8px`). Maksimal **1 Primary CTA** (`#0369A1` atau `#0F172A`) per layar/bagian; tampilkan loading spinner + `disabled` saat submit async; wajib `cursor-pointer`. |
| **Kartu KPI & Layanan** | `Card` (`CardHeader`, `CardContent`, `CardFooter`) | Radius `rounded-lg` (`12px`), latar `#FFFFFF`, border `1px solid #E2E8F0`, tanpa shadow berat. |
| **Tabel Data** | `Table` (`TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) | **Wajib** pakai struktur semantic HTML `<thead>`/`<tbody>` dari `shadcn/ui` `<Table>` (dilarang mengganti tabel dengan `div grid`), dibungkus `<div className="overflow-x-auto">` agar tidak overflow di mobile. |
| **Status & ETA Badge** | `Badge` | Radius `rounded-md` atau `rounded-full` ringkas, wajib menyertakan ikon Lucide + teks status. |
| **Form Input & Combobox** | `Form`, `Input`, `Label`, `Select`, `Command`, `Popover` | Setiap input wajib punya `<Label htmlFor="...">` yang terlihat (dilarang *placeholder-only*); pesan error tampil tepat di bawah field terkait. |
| **Modal Bayar & Konfirmasi** | `Dialog`, `AlertDialog` | Menyediakan rute keluar jelas (`Escape` / tombol Batal). |
| **Filter Status** | `Tabs` | Filter status `sts_psn` (`Semua`, `Antrean`, `Sedang Dicuci`, `Sedang Disetrika`, `Siap Diambil`, `Sudah Diambil`). |
| **Notifikasi** | `Sonner` (toast) | Feedback non-blocking setelah aksi sukses/gagal. |
| **Order Progress Stepper** | Komposisi `Badge` + Tailwind flex tracker | Stepper presisi horizontal 5 tahap (`Antrean` → `Dicuci` → `Disetrika` → `Siap` → `Diambil`) dengan garis `#0369A1` pada progres selesai/aktif. |
| **Animasi** | `gsap` + `@gsap/react` (`useGSAP`) | Lihat Bagian 4b di bawah. |
| **Ikon** | `lucide-react` | Ketebalan garis seragam (`1.75px`–`2px`). Ikon dekoratif di samping teks diberi `aria-hidden="true"`; tombol ikon-only wajib `aria-label`. **Dilarang memakai emoji sebagai ikon.** |

---

## 4b. Motion & Animation Guidelines (GSAP — Standard Tier `4/10`)

Mengacu hasil riset `--domain gsap` dan `--motion 4` dari `ui-ux-pro-max`:

- **Library:** `gsap` + `@gsap/react` (`useGSAP()` dengan `scope` ref agar tween otomatis ter-cleanup pada unmount / React StrictMode).
- **Pola Animasi yang Dipakai:**
  1. **Stagger Grid Kartu (`LYN` & KPI Cards):**
     ```ts
     gsap.from('.swiss-card-item', {
       opacity: 0,
       y: 12,
       duration: 0.3,
       stagger: { each: 0.05, from: 'start', grid: 'auto' },
       ease: 'power2.out',
     });
     ```
     *Catatan `ui-ux-pro-max`:* Gunakan `power2.out` — **dilarang** memakai `ease: 'back.out'` pada tabel data padat karena *overshoot* terlihat tidak rapi di UI informasional.
  2. **Hover Micro-interaction Kartu Layanan (`LYN`):** Gunakan `gsap.quickTo` (durasi `200–250ms`, `power2.out`) dengan reverse tween di `mouseleave` agar hover tidak nyangkut.
  3. **Order Progress Stepper (`sts_psn`):** Animasi halus `scaleX` / lebar garis progres (`duration: 0.3`, `power2.out`) saat status pesanan berubah (hindari animasi properti yang memicu layout thrashing berlebih).
- **Guardrails Wajib:**
  - Bungkus animasi dengan `gsap.matchMedia()` untuk `(prefers-reduced-motion: reduce)` agar langsung menampilkan state akhir statis bila user mengaktifkan *reduced motion*.
  - Durasi wajib singkat (`0.2s–0.35s`) agar tidak menghambat kecepatan input kasir.
  - **Print Safety (`@media print`):** Elemen struk/tiket yang dicetak wajib tampil penuh (`opacity: 1`) tanpa menunggu animasi GSAP.

---

## 4c. Ambient WebGL Background (`@firecms/neat` — Opsi A)

Untuk halaman publik dan login (`LandingPage` Hero & `LoginPage`), antarmuka menggunakan `<NeatBackground />` berbasis `@firecms/neat`:

- **Konfigurasi Preset Resmi:**
  - **Colors:** `#FFFFFF`, `#EFE2CE`, `#D5ECEB`, `#E4E4E4`, `#F6FFFF` (background `#00A2FF`, `backgroundAlpha: 1`, `colorBlending: 7`, `highlights: 7`, `shadows: 5`).
  - **Motion & Flow:** `speed: 2`, `horizontalPressure: 4`, `verticalPressure: 5`, `waveFrequencyX: 4`, `waveFrequencyY: 3`, `waveAmplitude: 2`, `flowEnabled: true`, `flowScale: 3.3`, `flowEase: 0.53`, `domainWarpEnabled: true`, `domainWarpIntensity: 0.05`.
  - **Rendering Ringan:** `resolution: 0.35`, `antialias: false`, `bloomIntensity: 0`, `grainIntensity: 0.05`, `grainScale: 100`, `flatShading: true`, `shapeType: 'plane'`.
  - **Scroll Reactivity:** `yOffset` dasar `600`, bereaksi ke `window.scrollY` melalui listener `{ passive: true }`.
- **Guardrails Implementasi Wajib:**
  1. **Lazy Load:** Muat komponen `<NeatBackground />` via `React.lazy()` + `Suspense` dengan fallback CSS gradient ringan agar rute kasir (`/pesanan`) tidak terbebani bundle WebGL.
  2. **Lifecycle Cleanup:** Wajib memanggil `gradient.destroy()` pada cleanup `useEffect` untuk mencegah kebocoran WebGL context saat StrictMode atau pindah halaman.
  3. **WebGL Safe Fallback:** Bungkus inisialisasi `new NeatGradient(...)` dalam `try/catch`; jika browser/device tidak mendukung WebGL, tampilkan fallback CSS gradient statis `#D5ECEB` -> `#FFFFFF` -> `#EFE2CE`.
  4. **Reduced Motion:** Jika `prefers-reduced-motion: reduce` aktif, set `speed: 0` atau tampilkan fallback CSS statis tanpa listener scroll.
  5. **Print Safety & Contrast:** `<canvas>` wajib memiliki `print:hidden` dan `pointer-events-none`. Seluruh teks/formulir di atasnya tetap memakai surface kontras tinggi (`bg-white/90 backdrop-blur-sm` atau teks `#0F172A`).

---

## 5. Layout Principles & Pemetaan Layar

- **Breakpoint & Container (`375px`, `768px`, `1024px`, `1440px`):**
  - Desktop (`>= 1024px`): Sidebar tetap di kiri (`240px–260px`) + area konten maksimal `max-w-7xl` dengan `gap-4` (`16px`) / `space-y-6` (`24px`), sejalan dengan `--space-md` dan `--space-lg`.
  - Tablet & Mobile (`< 768px`): Sidebar kolaps ke `Sheet` drawer; tombol aksi minimal tinggi `44px` (`min-h-11`) untuk kenyamanan sentuh petugas operasional di area cuci, dan tidak ada *horizontal scroll* pada halaman utama (hanya wrapper `overflow-x-auto` khusus di dalam kontainer tabel).
- **Pemetaan 6 Layar Utama (Sesuai `04-prd.md` v1.1):**
  1. **Layar Login (`PTGS`):** Layout split atau kartu terpusat presisi di atas `#F8FAFC` dengan aksen **Swiss Slate Navy (`#0F172A`)**, label eksplisit `usernm` & `passwd`, dukungan *password manager* (`autocomplete`), dan tombol penuh `#0369A1`.
  2. **Dashboard & Daftar Pesanan (`PSN`):** 4 kartu KPI (`Antrean`, `Dalam Proses`, `Siap Diambil`, `Belum Lunas`), `Tabs` filter status, pencarian teks, dan `<Table>` pesanan dalam wrapper `overflow-x-auto` + tombol CTA utama *"+ Buat Pesanan"*.
  3. **Halaman Buat Pesanan Baru (Prosedur 1, 2, 3):** Grid 2 kolom di desktop — kiri: Combobox cari pelanggan (`PLGN`) + dialog cepat tambah pelanggan + grid kartu layanan (`LYN`) + input `brt_kg`; kanan (sticky): Preview Tiket Pesanan, `est_sls`, `tot_hrg` (`Fira Code` `tabular-nums`), dan opsi *"Simpan Pesanan"* / *"Simpan & Bayar Sekarang"*.
  4. **Halaman Detail Tiket, Pembayaran & Cetak (Output 3 & 4, Prosedur 4, 5, 6):** Atas: **Order Progress Stepper** horizontal 5 langkah; Tengah: `<Table>` rincian `DTL_PSN` + kartu **Bukti Pembayaran** (`BYR`); Bawah: Tombol *"Serahkan Cucian"* (terkunci dengan banner `#DC2626` jika belum `Lunas`) dan tombol *"Cetak Tiket / Struk"* (`window.print()`).
  5. **Halaman Master Data (`PLGN`, `LYN`, `PTGS` — Output 1 & 2):** Tabel/grid terstruktur dengan modal `Dialog` tambah/edit yang **mempertahankan seluruh input saat validasi/server error** (*Preserve Input After Failed Submit*).
  6. **Halaman Laporan Transaksi (Output 5):** Filter `start_date` – `end_date`, 3 kartu metrik (`Fira Code` `tabular-nums`), `<Table>` rincian transaksi periode, dan tombol ekspor CSV opsional.

---

## 6. Aturan UX & Pre-Delivery Checklist (`ui-ux-pro-max`)

Checklist wajib sebelum UI dinyatakan selesai di repo implementasi:

- [ ] **No Emoji Icons:** Seluruh ikon memakai `lucide-react` (SVG), tidak ada emoji sebagai ikon.
- [ ] **Contrast >= 4.5:1:** Teks normal di atas `#FFFFFF` dan `#F8FAFC` memenuhi rasio kontras minimal `4.5:1`; status badge tidak mengandalkan warna saja (*color-not-only*).
- [ ] **Visible Focus & Keyboard Nav:** Seluruh elemen interaktif memiliki focus ring terlihat (`2px` `#0F172A`, `outline-offset: 2px`), urutan Tab logis, dan tombol ikon memiliki `aria-label`.
- [ ] **Form Labels & Error Preservation:** Semua input memiliki `<Label htmlFor>`, error tampil di dekat field, dan form **tidak boleh di-reset** bila submit gagal/error dari server.
- [ ] **Loading & Pointer Feedback:** Semua elemen klik memakai `cursor-pointer`; tombol submit async masuk state `disabled` + spinner untuk cegah double submit.
- [ ] **Semantic Table & Responsive:** Tabel memakai `<TableHeader><TableBody><TableRow>` di dalam `overflow-x-auto`; dicek bersih pada lebar `375px`, `768px`, `1024px`, dan `1440px`.
- [ ] **Reduced Motion & Print Safe:** `prefers-reduced-motion` ditangani lewat `gsap.matchMedia()`, dan `@media print` menyembunyikan sidebar/tombol non-struk (`print:hidden`).

---

## Asumsi & Risiko

- `[ASUMSI]` Petugas menggunakan desktop/laptop di meja kasir dan tablet/HP saat memperbarui status di area produksi, sehingga kombinasi `Sidebar` desktop + `Sheet` mobile + `overflow-x-auto` pada tabel menjadi pola paling stabil.
- `[RISIKO]` Font `Fira Code` untuk heading dan angka memiliki lebar karakter monospace tetap (*fixed-width*) yang sedikit lebih lebar dari font proporsional; pada layar `375px`, ukuran heading halaman sebaiknya dibatasi `20px–22px` (`text-xl`) agar tidak memakan terlalu banyak baris.
- `[RISIKO]` Jika halaman cetak struk tidak menonaktifkan style background/border tertentu, hasil print bisa boros tinta; gunakan `print:shadow-none print:border-slate-300 print:bg-white`.

## Out of scope

- Pembuatan komponen UI custom dari nol di luar `shadcn/ui`.
- Ilustrasi 3D/foto produk, *dark mode toggle*, dan fitur consumer app (*AI Search*, *Special Offer*, *Saved Cards*).
- Pembuatan file prototipe Figma/FigCraft terpisah.

## Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 2026-11-20 | Penyusunan awal `05-design.md` mengadaptasi referensi Dribbble *Qwash* (#27031424) dengan `shadcn/ui` dan `lucide-react`. |
| 1.1 | 2026-11-20 | Menambahkan panduan **Motion & Animation (GSAP + `@gsap/react`)** beserta guardrail kecepatan input kasir, `prefers-reduced-motion`, dan print safety. |
| 2.0 | 2026-11-26 | **Major Design Update (`ui-ux-pro-max`):** Mengganti tema visual ke **Minimalism & Swiss Style** (`#0F172A` navy, `#0369A1` accent, `#F8FAFC` canvas, `Fira Code` + `Fira Sans`), mengekspor CSS Design Tokens, serta menambahkan aturan prioritas UX, semantic `<Table>`, *Preserve Input After Failed Submit*, GSAP anti-overshoot rule, dan *Pre-Delivery Checklist* `ui-ux-pro-max`. |
| 2.1 | 2026-11-27 | **Ambient WebGL Integration (Opsi A):** Mengintegrasikan `@firecms/neat` (`NeatGradient`) pada Hero `LandingPage` & `LoginPage` dengan palet fresh-water/linen, lifecycle `destroy()`, lazy loading, `prefers-reduced-motion` guard, dan `{ passive: true }` scroll reactivity, sambil mempertahankan Swiss solid untuk area operasional kasir. |
