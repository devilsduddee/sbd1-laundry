-- ============================================================================
-- Schema Database: Sistem Pengelolaan Laundry
-- Target DBMS: Turso (libSQL / SQLite)
-- Kepatuhan: 100% mempertahankan nama tabel dan field asli proposal ERD
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. PLGN (Pelanggan)
CREATE TABLE IF NOT EXISTS PLGN (
    id_plgn TEXT PRIMARY KEY,
    nm_plgn TEXT NOT NULL,
    no_hp   TEXT NOT NULL UNIQUE,
    alamat  TEXT NOT NULL
);

-- 2. PTGS (Petugas)
CREATE TABLE IF NOT EXISTS PTGS (
    id_ptgs TEXT PRIMARY KEY,
    nm_ptgs TEXT NOT NULL,
    usernm  TEXT NOT NULL UNIQUE,
    passwd  TEXT NOT NULL, -- Wajib disimpan dalam bentuk hash (bcryptjs), bukan plaintext
    level   TEXT NOT NULL CHECK (level IN ('Admin', 'Kasir', 'Operasional'))
);

-- 3. LYN (Layanan)
CREATE TABLE IF NOT EXISTS LYN (
    id_lyn   TEXT PRIMARY KEY,
    nm_lyn   TEXT NOT NULL UNIQUE,
    hrg_kg   INTEGER NOT NULL CHECK (hrg_kg > 0),
    est_hari INTEGER NOT NULL CHECK (est_hari >= 1)
);

-- 4. PSN (Pesanan)
CREATE TABLE IF NOT EXISTS PSN (
    id_psn  TEXT PRIMARY KEY,
    id_plgn TEXT NOT NULL,
    id_ptgs TEXT NOT NULL,
    tgl_msk TEXT NOT NULL, -- ISO 8601 (contoh: 2026-11-20T10:30:00+07:00)
    est_sls TEXT NOT NULL, -- ISO 8601
    tot_hrg INTEGER NOT NULL CHECK (tot_hrg >= 0),
    sts_psn TEXT NOT NULL CHECK (
        sts_psn IN ('Antrean', 'Sedang Dicuci', 'Sedang Disetrika', 'Siap Diambil', 'Sudah Diambil')
    ),
    FOREIGN KEY (id_plgn) REFERENCES PLGN(id_plgn) ON DELETE RESTRICT,
    FOREIGN KEY (id_ptgs) REFERENCES PTGS(id_ptgs) ON DELETE RESTRICT
);

-- 5. DTL_PSN (Detail_Pesanan)
CREATE TABLE IF NOT EXISTS DTL_PSN (
    id_psn    TEXT NOT NULL,
    id_lyn    TEXT NOT NULL,
    brt_kg    REAL NOT NULL CHECK (brt_kg > 0),
    hrg_trans INTEGER NOT NULL CHECK (hrg_trans > 0),
    PRIMARY KEY (id_psn, id_lyn),
    FOREIGN KEY (id_psn) REFERENCES PSN(id_psn) ON DELETE CASCADE,
    FOREIGN KEY (id_lyn) REFERENCES LYN(id_lyn) ON DELETE RESTRICT
);

-- 6. BYR (Bayar)
CREATE TABLE IF NOT EXISTS BYR (
    id_byr  TEXT PRIMARY KEY,
    id_psn  TEXT NOT NULL,
    id_ptgs TEXT NOT NULL,
    tgl_byr TEXT NOT NULL, -- ISO 8601
    met_byr TEXT NOT NULL CHECK (met_byr IN ('Tunai', 'Transfer')),
    jml_byr INTEGER NOT NULL CHECK (jml_byr > 0),
    sts_byr TEXT NOT NULL CHECK (sts_byr IN ('Lunas')),
    FOREIGN KEY (id_psn) REFERENCES PSN(id_psn) ON DELETE RESTRICT,
    FOREIGN KEY (id_ptgs) REFERENCES PTGS(id_ptgs) ON DELETE RESTRICT
);

-- ============================================================================
-- Indexes untuk performa pencarian & laporan
-- ============================================================================
CREATE INDEX IF NOT EXISTS IDX_PLGN_NM  ON PLGN(nm_plgn);
CREATE INDEX IF NOT EXISTS IDX_PSN_PLGN ON PSN(id_plgn);
CREATE INDEX IF NOT EXISTS IDX_PSN_TGL  ON PSN(tgl_msk);
CREATE INDEX IF NOT EXISTS IDX_PSN_STS  ON PSN(sts_psn);
CREATE INDEX IF NOT EXISTS IDX_BYR_PSN  ON BYR(id_psn);
CREATE INDEX IF NOT EXISTS IDX_BYR_TGL  ON BYR(tgl_byr);

-- ============================================================================
-- Seed Data Awal Layanan (LYN)
-- ============================================================================
INSERT OR IGNORE INTO LYN (id_lyn, nm_lyn, hrg_kg, est_hari) VALUES
    ('LYN-001', 'Cuci Kering Kiloan', 7000, 2),
    ('LYN-002', 'Cuci Setrika Kiloan', 10000, 3),
    ('LYN-003', 'Cuci Express 1 Hari', 15000, 1),
    ('LYN-004', 'Cuci Selimut', 20000, 3);

-- ============================================================================
-- Catatan Seed Akun Petugas (PTGS):
-- Jangan simpan password plaintext di SQL! Jalankan script seed Node.js
-- (lihat SETUP.md) menggunakan bcryptjs untuk memasukkan akun Admin awal.
-- ============================================================================
