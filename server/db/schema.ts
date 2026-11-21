import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// 1. PLGN (Pelanggan)
export const PLGN = sqliteTable(
  'PLGN',
  {
    id_plgn: text('id_plgn').primaryKey(),
    nm_plgn: text('nm_plgn').notNull(),
    no_hp: text('no_hp').notNull().unique(),
    alamat: text('alamat').notNull(),
  },
  (table) => [
    index('IDX_PLGN_NM').on(table.nm_plgn),
  ]
);

// 2. PTGS (Petugas)
export const PTGS = sqliteTable('PTGS', {
  id_ptgs: text('id_ptgs').primaryKey(),
  nm_ptgs: text('nm_ptgs').notNull(),
  usernm: text('usernm').notNull().unique(),
  passwd: text('passwd').notNull(),
  level: text('level', { enum: ['Admin', 'Kasir', 'Operasional'] }).notNull(),
});

// 3. LYN (Layanan)
export const LYN = sqliteTable('LYN', {
  id_lyn: text('id_lyn').primaryKey(),
  nm_lyn: text('nm_lyn').notNull().unique(),
  hrg_kg: integer('hrg_kg').notNull(),
  est_hari: integer('est_hari').notNull(),
});

// 4. PSN (Pesanan)
export const PSN = sqliteTable(
  'PSN',
  {
    id_psn: text('id_psn').primaryKey(),
    id_plgn: text('id_plgn')
      .notNull()
      .references(() => PLGN.id_plgn, { onDelete: 'restrict' }),
    id_ptgs: text('id_ptgs')
      .notNull()
      .references(() => PTGS.id_ptgs, { onDelete: 'restrict' }),
    tgl_msk: text('tgl_msk').notNull(),
    est_sls: text('est_sls').notNull(),
    tot_hrg: integer('tot_hrg').notNull(),
    sts_psn: text('sts_psn', {
      enum: ['Antrean', 'Sedang Dicuci', 'Sedang Disetrika', 'Siap Diambil', 'Sudah Diambil'],
    }).notNull(),
  },
  (table) => [
    index('IDX_PSN_PLGN').on(table.id_plgn),
    index('IDX_PSN_TGL').on(table.tgl_msk),
    index('IDX_PSN_STS').on(table.sts_psn),
  ]
);

// 5. DTL_PSN (Detail_Pesanan)
export const DTL_PSN = sqliteTable(
  'DTL_PSN',
  {
    id_psn: text('id_psn')
      .notNull()
      .references(() => PSN.id_psn, { onDelete: 'cascade' }),
    id_lyn: text('id_lyn')
      .notNull()
      .references(() => LYN.id_lyn, { onDelete: 'restrict' }),
    brt_kg: real('brt_kg').notNull(),
    hrg_trans: integer('hrg_trans').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id_psn, table.id_lyn] }),
  ]
);

// 6. BYR (Bayar)
export const BYR = sqliteTable(
  'BYR',
  {
    id_byr: text('id_byr').primaryKey(),
    id_psn: text('id_psn')
      .notNull()
      .references(() => PSN.id_psn, { onDelete: 'restrict' }),
    id_ptgs: text('id_ptgs')
      .notNull()
      .references(() => PTGS.id_ptgs, { onDelete: 'restrict' }),
    tgl_byr: text('tgl_byr').notNull(),
    met_byr: text('met_byr', { enum: ['Tunai', 'Transfer'] }).notNull(),
    jml_byr: integer('jml_byr').notNull(),
    sts_byr: text('sts_byr', { enum: ['Lunas'] }).notNull(),
  },
  (table) => [
    index('IDX_BYR_PSN').on(table.id_psn),
    index('IDX_BYR_TGL').on(table.tgl_byr),
  ]
);

// Relations
export const plgnRelations = relations(PLGN, ({ many }) => ({
  pesanan: many(PSN),
}));

export const ptgsRelations = relations(PTGS, ({ many }) => ({
  pesanan: many(PSN),
  pembayaran: many(BYR),
}));

export const lynRelations = relations(LYN, ({ many }) => ({
  detailPesanan: many(DTL_PSN),
}));

export const psnRelations = relations(PSN, ({ one, many }) => ({
  pelanggan: one(PLGN, {
    fields: [PSN.id_plgn],
    references: [PLGN.id_plgn],
  }),
  petugas: one(PTGS, {
    fields: [PSN.id_ptgs],
    references: [PTGS.id_ptgs],
  }),
  detail: many(DTL_PSN),
  bayar: one(BYR, {
    fields: [PSN.id_psn],
    references: [BYR.id_psn],
  }),
}));

export const dtlPsnRelations = relations(DTL_PSN, ({ one }) => ({
  pesanan: one(PSN, {
    fields: [DTL_PSN.id_psn],
    references: [PSN.id_psn],
  }),
  layanan: one(LYN, {
    fields: [DTL_PSN.id_lyn],
    references: [LYN.id_lyn],
  }),
}));

export const byrRelations = relations(BYR, ({ one }) => ({
  pesanan: one(PSN, {
    fields: [BYR.id_psn],
    references: [PSN.id_psn],
  }),
  petugas: one(PTGS, {
    fields: [BYR.id_ptgs],
    references: [PTGS.id_ptgs],
  }),
}));
