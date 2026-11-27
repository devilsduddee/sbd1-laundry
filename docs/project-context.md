# Project Context: Sistem Pengelolaan Laundry

> Dibaca agent di awal setiap sesi. Jaga tetap singkat dan terkini.

## 1. Ringkasan
- **Nama produk:** Sistem Pengelolaan Laundry
- **Satu kalimat:** Aplikasi web berbasis basis data relasional untuk mengelola pendataan pelanggan, layanan, tiket pesanan cucian, pembaruan status pengerjaan, pembayaran, pengambilan cucian, dan laporan transaksi laundry.
- **Status tahap:** Selesai — Tahap 6 (`07-vibe-rules.md` + paket `handoff/`) selesai dan siap disalin ke repo eksekusi terpisah.
- **Mode alur:** Fast-track (Tahap 0–2 dilewati atas permintaan user karena domain & ERD sudah dikunci tugas kuliah)
- **Jenis project:** Tugas kuliah (Mata Kuliah Sistem Basis Data — Kelas 3IA01)
- **Deadline:** `[PERTANYAAN]` Belum diinformasikan

## 1b. Khusus tugas kuliah
- **Brief dari dosen:** Realisasi perancangan sistem basis data pengelolaan laundry berbasis web (PDF: *Perancangan Sistem Basis Data Pengelolaan Laundry Berbasis Web Menggunakan PostgreSQL*), mencakup 6 entitas ERD (`PSN`, `PLGN`, `PTGS`, `LYN`, `DTL_PSN`/`DTK_PSN`, `BYR`), 5 Output wajib, dan 6 Prosedur operasional.
- **Rubrik penilaian:** `[PERTANYAAN]` Belum diinformasikan
- **Ukuran tim dan pembagian peran:** 4 mahasiswa (Kelas 3IA01): Ahmad Ridho Syafaat (50424069), Bimo Priyono Pusoko (50424245), Saska Aulisecha (51424273), Stevanky (51424425).
- **Output yang wajib dikumpulkan:** Web app yang merealisasikan ERD, 5 output sistem (Data Pelanggan, Data Layanan, Tiket Pesanan, Bukti Pembayaran, Laporan Transaksi periode tertentu). `[PERTANYAAN]` Apakah ada laporan akhir/video demo/SQL dump yang wajib dikumpulkan?

## 2. Masalah dan target pengguna
- **Problem statement (versi terkini):** Pengelolaan operasional laundry (pencatatan pelanggan, penimbangan detail cucian per layanan, tracking status pengerjaan, pencatatan pembayaran, validasi pengambilan cucian lunas, dan rekap laporan periode) membutuhkan sistem basis data terstruktur agar transaksi tercatat akurat dan tidak terjadi cucian diambil sebelum lunas atau salah hitung harga.
- **Pengguna utama:** Petugas Kasir dan Petugas Operasional Laundry (`PTGS`).
- **Stakeholder:** Dosen pengampu mata kuliah Sistem Basis Data (penilai kesesuaian implementasi terhadap ERD, prosedur, dan output), tim mahasiswa kelompok (pengembang), serta Pemilik/Admin Laundry sebagai pengguna bisnis di skenario tugas.
- **Orang tech yang terdampak:** Tim pengembang (4 mahasiswa) & coding agent Antigravity saat implementasi di repo terpisah.

## 3. Konteks bisnis
- **Tujuan dan metrik sukses:** Merealisasikan seluruh 6 entitas ERD, 6 prosedur operasional, dan 5 output sistem ke dalam aplikasi web fungsional sebelum deadline tugas.
- **Batasan:** Scope mengikuti kebutuhan realisasi ERD tugas kuliah; fitur tambahan di luar ERD dibatasi agar realistis diselesaikan tim.
- **Alternatif yang ada hari ini:** `[ASUMSI]` Pencatatan manual berbasis kertas/nota atau spreadsheet sebelum adanya sistem web terintegrasi database.

## 4. Konteks teknis
- **Stack:** **Dikunci (Gate 2 & Spec):** Vite + React + Tailwind CSS + `shadcn/ui` + GSAP (`@gsap/react`) (Frontend) + Hono (Backend API) + Turso / libSQL (`@libsql/client`) + **Vercel** (Deployment).
- **Coding agent:** Antigravity
- **Folder project (repo):** Belum dibuat (terpisah dari workspace PM ini).
- **Integrasi eksternal:** Belum ada (standalone web app + Turso cloud/local SQLite).
- **Catatan khusus:** Judul PDF tugas tertulis *"MENGGUNAKAN PostgreSQL"*, namun user mengunci **Turso** sebagai DBMS pilihan tim. **Aturan ketat skema:** nama tabel (`PLGN`, `PTGS`, `LYN`, `PSN`, `DTL_PSN`, `BYR`) dan seluruh nama field wajib mengikuti proposal 100% tanpa diubah atau ditambah kolom baru.

## 5. Status dan keputusan
| Tanggal | Keputusan | Alasan | Opsi yang ditolak |
|---|---|---|---|
| 2026-11-20 | Membuat folder project `docs/sistem-laundry/` dan menggunakan mode **Fast-track** (skip Tahap 0–2 langsung ke `04-prd.md`). | Domain, entitas data, 5 output, dan 6 prosedur sudah dikunci di dokumen ERD tugas kuliah. Risiko skip (`01`–`03`): potensi *scope creep* & inkonsistensi kecil ERD vs prosedur perlu dijaga lewat Scope di PRD dan divalidasi di Gate 2. | Menjalankan Discovery penuh (`01-discovery.md` s.d. `03-scope.md`). |
| 2026-11-20 | Mencatat preferensi tech stack user: Vite + React + Hono + Turso. | Permintaan langsung user untuk eksplorasi stack tersebut. | Mengunci stack lain tanpa persetujuan user. |
| 2026-11-20 | Menyusun `04-prd.md` v1.0 (Draft) untuk review Gate 2. | Menerjemahkan ERD, 5 Output, dan 6 Prosedur PDF menjadi requirement fungsional dan batasan MVP yang bisa diuji. | Langsung lompat ke `06-spec.md` tanpa persetujuan PRD. |
| 2026-11-20 | **Gate 2 Approved (`04-prd.md` v1.1):** Mengunci tech stack `Vite + React + Hono + Turso` dan kepatuhan 100% nama tabel & field sesuai proposal tanpa perubahan. | Keputusan Lead PM untuk menjaga kesesuaian penuh terhadap dokumen rancangan proposal ERD tugas kuliah sekaligus eksplorasi stack baru. | Mengubah nama kolom ke bahasa Inggris atau menambah kolom baru di luar ERD. |
| 2026-11-20 | Menyusun `05-design.md` v1.0 mengadaptasi Dribbble *Qwash* (#27031424) dengan komponen `shadcn/ui` + Tailwind CSS + `lucide-react`. | Permintaan user memakai referensi visual *Qwash* dengan komponen ringan berbasis `shadcn/ui`. | Membuat komponen UI custom dari nol atau mengadopsi fitur *AI Search*/*Offers* dari referensi. |
| 2026-11-20 | Mengunci deployment **Vercel** dan menyusun `06-spec.md` v1.0 (Draft — Menunggu Gate 3) untuk stack Vite + React + `shadcn/ui` + Hono + Turso. | Permintaan user untuk deployment Vercel dengan stack terkunci dan 100% nama tabel/field asli proposal. | Memisah jadi 2 repo terpisah (menghindari masalah CORS) atau menambah tabel `SESSIONS` di luar ERD. |
| 2026-11-20 | **Gate 3 Approved (`06-spec.md` v1.0)** & Tahap 6 selesai: menyusun `07-vibe-rules.md` dan paket `handoff/` (`AGENTS.md`, `schema.sql`, `tailwind.config.ts`, `SETUP.md`). | Menegakkan guardrails coding agent (kepatuhan 100% skema ERD, batas 500 baris/file, wajib `shadcn/ui`, larangan `git push` otomatis) untuk stack Vite + React + Hono + Turso on Vercel. | Eksekusi langsung tanpa skema SQL Turso dan aturan batas file. |
| 2026-11-20 | Menambahkan **GSAP (`gsap` + `@gsap/react`)** ke `05-design.md` v1.1, `06-spec.md` v1.1, `07-vibe-rules.md` v1.1, dan `handoff/` (`AGENTS.md`, `SETUP.md`). | Permintaan user untuk animasi UI yang lebih *smooth* dengan tetap menjaga kecepatan input kasir (`0.2s–0.35s`), `prefers-reduced-motion`, dan keamanan `@media print`. | Memasang animasi berat/panjang atau library animasi besar lain. |
| 2026-11-26 | **Design Upgrade (`05-design.md` v2.0):** Mengganti tema visual dari *Qwash* ke **Minimalism & Swiss Style** hasil riset `ui-ux-pro-max` (`#0F172A`, `#0369A1`, `#F8FAFC`, `Fira Code` + `Fira Sans`), serta menyelaraskan `06-spec.md` v1.2, `07-vibe-rules.md` v1.2, dan paket `handoff/`. | Keputusan Lead PM memilih Opsi B karena desain *Qwash* dirasa kurang kuat untuk web operasional kasir & sistem basis data. | Tetap memakai palet *Qwash* v1.1. |
| 2026-11-27 | **Design Upgrade (`05-design.md` v2.1 — Opsi A):** Menambahkan latar WebGL `@firecms/neat` pada `LandingPage` Hero & `LoginPage` sambil menjaga area operasional kasir tetap Swiss solid (`#F8FAFC` + `#FFFFFF`), menyelaraskan `06-spec.md` v1.3, `07-vibe-rules.md` v1.3, dan `AGENTS.md`. | Memberi *first impression* modern bertema air/kain bersih tanpa mengorbankan keterbacaan tabel dan baterai di area kerja kasir. | Memasang WebGL backdrop di seluruh halaman tabel kasir (Opsi B — disimpan sebagai opsi cadangan). |
| 2026-11-27 | **Glassy UI Fusion (`05-design.md` v2.3):** Memadukan gradien `@firecms/neat` & *ambient mesh* kasir dengan komponen kaca frosted **Glassy UI (`glassyui.com`)** pada `Card`, `Dialog`, dan `Button` (*specular rim* + *pointer bloom*), serta mengunci netralitas agar tidak belang. | Gradien lembut `@firecms/neat` tampil jauh lebih menyatu dengan kartu dan tombol bergaya kaca optik (*Liquid Glass*) sekaligus tetap cepat dibaca dan aman saat cetak struk. | Memakai kartu solid dengan banyak kotak pastel berwarna berbeda (*belang*). |

## 6. Pertanyaan terbuka dan asumsi
- `[PERTANYAAN]` Apa deadline pengumpulan tugas dan detail rubrik penilaian dari dosen?
- `[PERTANYAAN]` Apakah untuk update status (`FR-05`) perlu tombol koreksi/undo mundur khusus `Admin` kalau petugas operasional salah klik status?
- `[ASUMSI]` Autentikasi memakai JWT di *HttpOnly cookie* agar tetap stateless di Vercel Serverless tanpa menambah tabel baru di luar 6 tabel ERD proposal.
- `[ASUMSI]` Pembagian `PTGS.level` menggunakan `Admin`, `Kasir`, dan `Operasional` sesuai narasi Prosedur 1 & 4; `Admin` punya akses penuh untuk kelancaran demo.
- `[ASUMSI]` Penutupan transaksi Prosedur 6 dicatat dengan mengubah `PSN.sts_psn` menjadi `Sudah Diambil` (karena `tgl_kembali` tidak ada di ERD proposal).
- `[ASUMSI]` Pembayaran pada MVP adalah bayar penuh sekali (`Lunas`) di awal atau di akhir sesuai Prosedur 5 (belum mendukung cicilan/DP parsial meski relasi ERD `PSN`–`BYR` adalah `1:N`).

## 7. Dokumen
| File | Status | Versi |
|---|---|---|
| 01-discovery.md | dilewati (fast-track) | - |
| 02-opportunity.md | dilewati (fast-track) | - |
| 03-scope.md | dilewati (fast-track) | - |
| 04-prd.md | Approved (Gate 2) | 1.1 |
| 05-design.md | Approved | 2.3 |
| 06-spec.md | Approved (Gate 3) | 1.4 |
| 07-vibe-rules.md | Approved (+ `handoff/`) | 1.4 |
