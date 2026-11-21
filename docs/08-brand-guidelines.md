# Qwash Hygienic — Brand & Identity Guidelines

Dokumen ini adalah panduan resmi identitas visual (*brand guidelines*) untuk **Qwash Laundry & Hygienic Care**. Panduan ini dirancang untuk memastikan konsistensi penggunaan logo, warna, tipografi, dan aset visual di seluruh media digital maupun cetak.

---

## 1. Konsep & Filosofi Logo ("The Pure Loop")

- **Nama Brand:** Qwash Laundry & Hygienic Care
- **Simbol Utama:** *The Pure Loop*
- **Filosofi Visual:** 
  Dua pita gelombang pusaran air yang saling mengunci secara kontinu melambangkan siklus pencucian sempurna tanpa henti, kelembutan perawatan serat kain (*woven textile care*), dan komitmen higienis total. Lingkaran pusat merepresentasikan inti kebersihan yang tersanitasi secara menyeluruh.
- **Varian Master:**
  - `Horizontal Lockup` (Simbol + Tipografi QWASH) untuk header web, kop surat, dan fasad toko.
  - `Symbol Only` untuk favicon, avatar profil media sosial, dan ikon aplikasi mobile/PWA.
  - `Monochrome & Reversed` untuk cetak nota thermal hitam-putih dan latar gelap.

---

## 2. Palet Warna Resmi (*Color System*)

| Peran | Nama Warna | HEX | RGB | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | Vibrant Indigo | `#4F46E5` | `rgb(79, 70, 229)` | Tombol aksi utama, aksen simbol, link aktif, highlight status |
| **Brand Dark** | Deep Navy Indigo | `#1E1B4B` | `rgb(30, 27, 75)` | Header navbar, footer, kartu ringkasan, teks judul kontras tinggi |
| **Hygienic Accent** | Cyan Water | `#06B6D4` | `rgb(6, 182, 212)` | Aksen elemen higienis, tag sanitasi, badge status pencucian |
| **Surface/Canvas** | Clean Light Gray | `#F5F6FA` | `rgb(245, 246, 250)` | Background halaman utama aplikasi, kartu netral |
| **Border Neutral** | Soft Gray Slate | `#E4E7F2` | `rgb(228, 231, 242)` | Garis pembatas kartu, separator tabel, stroke input |
| **Text Primary** | Deep Charcoal | `#1A1A2E` | `rgb(26, 26, 46)` | Teks isi utama dengan rasio kontras WCAG AAA |

### Kombinasi Latar Belakang yang Diizinkan:
1. **Logo Warna Utama (`#4F46E5` & `#1E1B4B`)** di atas latar putih (`#FFFFFF`) atau kanvas (`#F5F6FA`).
2. **Logo Putih (*Reversed White*)** di atas latar biru gelap (`#1E1B4B`) atau primary indigo (`#4F46E5`).
3. **Logo Hitam Solid (`#000000`)** khusus untuk nota struk cetak kasir thermal (Output 3 & Output 4).

---

## 3. Tipografi (*Typography*)

- **Font Utama:** `Plus Jakarta Sans` (Google Fonts, Open Font License)
  - **Headings & Judul:** SemiBold (600), Bold (700), ExtraBold (800).
  - **Body Copy:** Regular (400), Medium (500).
  - **Karakter Angka:** Selalu aktifkan utility `tabular-nums` untuk nominal harga (Rp), berat cucian (kg), tanggal transaksi, dan ID tiket pesanan.
- **Font Monospace:** `JetBrains Mono` / `ui-monospace` untuk ID tiket (`PSN-...`), ID pelanggan (`PLGN-...`), dan kredensial teknis.

---

## 4. Ruang Aman (*Clear Space*) & Ukuran Minimal

- **Clear Space:** Pertahankan jarak bebas di sekeliling logo minimal sebesar **1 × radius lingkaran tengah simbol** (tidak boleh ada teks, garis, atau elemen dekoratif yang menabrak area ini).
- **Ukuran Minimal Tampilan:**
  - *Horizontal Lockup:* Minimal lebar `120 px` pada layar digital, atau `30 mm` pada media cetak.
  - *Symbol Only:* Minimal `16 px × 16 px` (menggunakan file `qwash-symbol-favicon.svg`).

---

## 5. Direktori Berkas Master (*Asset Master Kit*)

Seluruh berkas produksi logo tersimpan di repositori pada folder:
- **Web & PWA Icons:** `public/favicon.ico`, `public/favicon.svg`, `public/apple-touch-icon.png`, `public/site.webmanifest`
- **Master Vector & Logo Kit:** `public/branding/kit/`
  - `qwash-symbol-mono-4f46e5.svg`: Simbol warna resmi Indigo
  - `qwash-symbol-black.svg`: Simbol hitam solid
  - `qwash-symbol-white.svg`: Simbol putih reversed
  - `qwash-lockup-mono-4f46e5.svg`: Lockup horizontal warna Indigo
  - `qwash-lockup-black.svg`: Lockup horizontal hitam
  - `qwash-lockup-white.svg`: Lockup horizontal putih
  - `icon-192.png`, `icon-512.png`, `maskable-512.png`: Ikon aplikasi PWA / Android

---

## 6. Larangan Penggunaan (*Don'ts*)

1. **Dilarang mendistorsi proporsi:** Jangan meregangkan (*stretch*) atau memipihkan (*squash*) logo secara tidak proporsional.
2. **Dilarang memutar sudut logo:** Simbol *The Pure Loop* memiliki orientasi vertikal 180° yang presisi, jangan dimiringkan.
3. **Dilarang menambahkan efek grafis berlebihan:** Hindari memberi *drop shadow* tebal, bevel 3D, atau outline neon yang merusak kesederhanaan geometris.
4. **Dilarang mengetik ulang wordmark secara manual:** Selalu gunakan path vektor resmi dari file lockup master.
