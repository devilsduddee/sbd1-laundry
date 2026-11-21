import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, or, like, desc, asc, inArray, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { PSN, PLGN, PTGS, DTL_PSN, LYN, BYR } from '../db/schema.js';
import {
  createPesananSchema,
  updateStatusPesananSchema,
  type Pesanan,
  type PesananSummary,
  type PesananDetailResponse,
  type StsPsn,
} from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const pesananRoute = new Hono();

// GET /api/pesanan (List ringkasan pesanan + filter)
pesananRoute.get('/', authMiddleware, async (c) => {
  const sts = c.req.query('sts_psn');
  const q = c.req.query('q')?.trim();

  const conditions = [];

  if (sts) {
    conditions.push(eq(PSN.sts_psn, sts as any));
  }

  if (q) {
    const pattern = `%${q}%`;
    conditions.push(
      or(
        like(PSN.id_psn, pattern),
        like(PLGN.nm_plgn, pattern),
        like(PLGN.no_hp, pattern)
      )
    );
  }

  const query = db
    .select({
      id_psn: PSN.id_psn,
      id_plgn: PSN.id_plgn,
      id_ptgs: PSN.id_ptgs,
      tgl_msk: PSN.tgl_msk,
      est_sls: PSN.est_sls,
      tot_hrg: PSN.tot_hrg,
      sts_psn: PSN.sts_psn,
      nm_plgn: PLGN.nm_plgn,
      no_hp: PLGN.no_hp,
      nm_ptgs: PTGS.nm_ptgs,
      sts_byr: sql<string>`COALESCE(${BYR.sts_byr}, 'Belum Lunas')`,
      met_byr: BYR.met_byr,
      tgl_byr: BYR.tgl_byr,
    })
    .from(PSN)
    .innerJoin(PLGN, eq(PSN.id_plgn, PLGN.id_plgn))
    .innerJoin(PTGS, eq(PSN.id_ptgs, PTGS.id_ptgs))
    .leftJoin(BYR, and(eq(PSN.id_psn, BYR.id_psn), eq(BYR.sts_byr, 'Lunas')));

  const data = (
    conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(PSN.tgl_msk))
      : await query.orderBy(desc(PSN.tgl_msk))
  ) as unknown as PesananSummary[];

  return c.json({ data });
});

// GET /api/pesanan/lacak/:id (Pelacakan Publik Status Cucian untuk Pelanggan)
pesananRoute.get('/lacak/:id', async (c) => {
  const id_psn = c.req.param('id');
  const psnRows = await db
    .select({
      id_psn: PSN.id_psn,
      tgl_msk: PSN.tgl_msk,
      est_sls: PSN.est_sls,
      tot_hrg: PSN.tot_hrg,
      sts_psn: PSN.sts_psn,
      nm_plgn: PLGN.nm_plgn,
    })
    .from(PSN)
    .innerJoin(PLGN, eq(PSN.id_plgn, PLGN.id_plgn))
    .where(eq(PSN.id_psn, id_psn))
    .limit(1);

  if (psnRows.length === 0) {
    return c.json({ error: 'Tiket pesanan tidak ditemukan. Periksa kembali ID tiket Anda.' }, 404);
  }

  const p = psnRows[0];
  const items = await db
    .select({
      nm_lyn: LYN.nm_lyn,
      brt_kg: DTL_PSN.brt_kg,
      hrg_trans: DTL_PSN.hrg_trans,
    })
    .from(DTL_PSN)
    .innerJoin(LYN, eq(DTL_PSN.id_lyn, LYN.id_lyn))
    .where(eq(DTL_PSN.id_psn, id_psn));

  const bayar = await db
    .select({ sts_byr: BYR.sts_byr, met_byr: BYR.met_byr })
    .from(BYR)
    .where(eq(BYR.id_psn, id_psn))
    .limit(1);

  const words = p.nm_plgn.trim().split(' ');
  const maskedName = words.length > 1
    ? `${words[0]} ${words[1][0]}***`
    : `${p.nm_plgn.slice(0, 3)}***`;

  return c.json({
    id_psn: p.id_psn,
    nm_plgn: maskedName,
    tgl_msk: p.tgl_msk,
    est_sls: p.est_sls,
    tot_hrg: Number(p.tot_hrg),
    sts_psn: p.sts_psn,
    sts_byr: bayar.length > 0 ? bayar[0].sts_byr : 'Belum Lunas',
    items: items.map((it) => ({
      nm_lyn: it.nm_lyn,
      brt_kg: Number(it.brt_kg),
      hrg_trans: Number(it.hrg_trans),
    })),
  });
});

// GET /api/pesanan/:id (Detail Tiket Pesanan Output 3 & 4)
pesananRoute.get('/:id', authMiddleware, async (c) => {
  const id_psn = c.req.param('id');

  // Ambil data PSN, PLGN, PTGS
  const psnRows = await db
    .select({
      id_psn: PSN.id_psn,
      id_plgn: PSN.id_plgn,
      id_ptgs: PSN.id_ptgs,
      tgl_msk: PSN.tgl_msk,
      est_sls: PSN.est_sls,
      tot_hrg: PSN.tot_hrg,
      sts_psn: PSN.sts_psn,
      nm_plgn: PLGN.nm_plgn,
      no_hp: PLGN.no_hp,
      alamat: PLGN.alamat,
      nm_ptgs: PTGS.nm_ptgs,
      usernm: PTGS.usernm,
      level: PTGS.level,
    })
    .from(PSN)
    .innerJoin(PLGN, eq(PSN.id_plgn, PLGN.id_plgn))
    .innerJoin(PTGS, eq(PSN.id_ptgs, PTGS.id_ptgs))
    .where(eq(PSN.id_psn, id_psn))
    .limit(1);

  if (psnRows.length === 0) {
    return c.json({ error: 'Pesanan tidak ditemukan' }, 404);
  }

  const pRow = psnRows[0];

  // Ambil detail item DTL_PSN + LYN
  const itemsRows = await db
    .select({
      id_psn: DTL_PSN.id_psn,
      id_lyn: DTL_PSN.id_lyn,
      brt_kg: DTL_PSN.brt_kg,
      hrg_trans: DTL_PSN.hrg_trans,
      nm_lyn: LYN.nm_lyn,
      est_hari: LYN.est_hari,
    })
    .from(DTL_PSN)
    .innerJoin(LYN, eq(DTL_PSN.id_lyn, LYN.id_lyn))
    .where(eq(DTL_PSN.id_psn, id_psn))
    .orderBy(asc(LYN.nm_lyn));

  // Ambil pembayaran BYR jika sudah ada
  const bayarRows = await db
    .select({
      id_byr: BYR.id_byr,
      id_psn: BYR.id_psn,
      id_ptgs: BYR.id_ptgs,
      tgl_byr: BYR.tgl_byr,
      met_byr: BYR.met_byr,
      jml_byr: BYR.jml_byr,
      sts_byr: BYR.sts_byr,
      nm_ptgs: PTGS.nm_ptgs,
    })
    .from(BYR)
    .innerJoin(PTGS, eq(BYR.id_ptgs, PTGS.id_ptgs))
    .where(eq(BYR.id_psn, id_psn))
    .limit(1);

  const response: PesananDetailResponse = {
    psn: {
      id_psn: pRow.id_psn,
      id_plgn: pRow.id_plgn,
      id_ptgs: pRow.id_ptgs,
      tgl_msk: pRow.tgl_msk,
      est_sls: pRow.est_sls,
      tot_hrg: Number(pRow.tot_hrg),
      sts_psn: pRow.sts_psn as StsPsn,
    },
    plgn: {
      id_plgn: pRow.id_plgn,
      nm_plgn: pRow.nm_plgn,
      no_hp: pRow.no_hp,
      alamat: pRow.alamat,
    },
    ptgs: {
      id_ptgs: pRow.id_ptgs,
      nm_ptgs: pRow.nm_ptgs,
      usernm: pRow.usernm,
      level: pRow.level as any,
    },
    items: itemsRows.map((r) => ({
      id_psn: r.id_psn,
      id_lyn: r.id_lyn,
      brt_kg: Number(r.brt_kg),
      hrg_trans: Number(r.hrg_trans),
      nm_lyn: r.nm_lyn,
      est_hari: Number(r.est_hari),
    })),
    bayar:
      bayarRows.length > 0
        ? {
            id_byr: bayarRows[0].id_byr,
            id_psn: bayarRows[0].id_psn,
            id_ptgs: bayarRows[0].id_ptgs,
            tgl_byr: bayarRows[0].tgl_byr,
            met_byr: bayarRows[0].met_byr as any,
            jml_byr: Number(bayarRows[0].jml_byr),
            sts_byr: bayarRows[0].sts_byr as any,
            nm_ptgs: bayarRows[0].nm_ptgs,
          }
        : null,
  };

  return c.json(response);
});

// POST /api/pesanan (Buat Tiket Pesanan + Multi Detail Cucian)
pesananRoute.post(
  '/',
  authMiddleware,
  requireRole('Admin', 'Kasir'),
  zValidator('json', createPesananSchema),
  async (c) => {
    const user = c.get('user');
    const { id_plgn, items, bayar_langsung } = c.req.valid('json');

    // 1. Cek validitas pelanggan
    const plgnCheck = await db
      .select({ id_plgn: PLGN.id_plgn })
      .from(PLGN)
      .where(eq(PLGN.id_plgn, id_plgn))
      .limit(1);

    if (plgnCheck.length === 0) {
      return c.json({ error: 'Pelanggan tidak valid' }, 404);
    }

    // 2. Gabungkan (merge) layanan duplikat agar cocok dengan Composite PK (id_psn, id_lyn)
    const mergedMap = new Map<string, number>();
    for (const it of items) {
      const cur = mergedMap.get(it.id_lyn) || 0;
      mergedMap.set(it.id_lyn, cur + it.brt_kg);
    }

    const uniqueLynIds = Array.from(mergedMap.keys());
    const lynRows = await db
      .select({
        id_lyn: LYN.id_lyn,
        hrg_kg: LYN.hrg_kg,
        est_hari: LYN.est_hari,
      })
      .from(LYN)
      .where(inArray(LYN.id_lyn, uniqueLynIds));

    if (lynRows.length !== uniqueLynIds.length) {
      return c.json({ error: 'Satu atau lebih layanan tidak ditemukan di master data' }, 400);
    }

    const lynMap = new Map<string, { hrg_kg: number; est_hari: number }>();
    for (const r of lynRows) {
      lynMap.set(r.id_lyn, {
        hrg_kg: Number(r.hrg_kg),
        est_hari: Number(r.est_hari),
      });
    }

    // 3. Kalkulasi Server-Side: tot_hrg & est_sls
    let tot_hrg = 0;
    let max_est_hari = 1;
    const finalItems: { id_lyn: string; brt_kg: number; hrg_trans: number }[] = [];

    for (const [id_lyn, brt_kg] of mergedMap.entries()) {
      const l = lynMap.get(id_lyn)!;
      const subtotal = Math.round(brt_kg * l.hrg_kg);
      tot_hrg += subtotal;
      if (l.est_hari > max_est_hari) max_est_hari = l.est_hari;
      finalItems.push({ id_lyn, brt_kg, hrg_trans: l.hrg_kg });
    }

    const now = new Date();
    const tgl_msk = now.toISOString();
    const estDate = new Date(now.getTime() + max_est_hari * 24 * 60 * 60 * 1000);
    const est_sls = estDate.toISOString();

    // Generate ID Pesanan: PSN-YYYYMMDD-XXXX
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const id_psn = `PSN-${dateStr}-${rand}`;

    // 4. Batch Atomic Transaction via Drizzle
    const batchStmts: any[] = [
      db.insert(PSN).values({
        id_psn,
        id_plgn,
        id_ptgs: user.id_ptgs,
        tgl_msk,
        est_sls,
        tot_hrg,
        sts_psn: 'Antrean',
      }),
    ];

    for (const it of finalItems) {
      batchStmts.push(
        db.insert(DTL_PSN).values({
          id_psn,
          id_lyn: it.id_lyn,
          brt_kg: it.brt_kg,
          hrg_trans: it.hrg_trans,
        })
      );
    }

    // Jika bayar di awal sekaligus
    if (bayar_langsung) {
      if (bayar_langsung.jml_byr < tot_hrg) {
        return c.json(
          { error: `Nominal bayar (${bayar_langsung.jml_byr}) kurang dari total tagihan (${tot_hrg})` },
          400
        );
      }
      const id_byr = `BYR-${dateStr}-${rand}`;
      batchStmts.push(
        db.insert(BYR).values({
          id_byr,
          id_psn,
          id_ptgs: user.id_ptgs,
          tgl_byr: tgl_msk,
          met_byr: bayar_langsung.met_byr,
          jml_byr: bayar_langsung.jml_byr,
          sts_byr: 'Lunas',
        })
      );
    }

    await db.batch(batchStmts as [any, ...any[]]);

    const createdPsn: Pesanan = {
      id_psn,
      id_plgn,
      id_ptgs: user.id_ptgs,
      tgl_msk,
      est_sls,
      tot_hrg,
      sts_psn: 'Antrean',
    };

    return c.json({ data: createdPsn, items: finalItems }, 201);
  }
);

// PATCH /api/pesanan/:id/status (Prosedur 4 — Update status bertahap)
pesananRoute.patch(
  '/:id/status',
  authMiddleware,
  requireRole('Admin', 'Operasional'),
  zValidator('json', updateStatusPesananSchema),
  async (c) => {
    const id_psn = c.req.param('id');
    const { sts_psn } = c.req.valid('json');

    const existing = await db
      .select({ id_psn: PSN.id_psn, sts_psn: PSN.sts_psn })
      .from(PSN)
      .where(eq(PSN.id_psn, id_psn))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: 'Pesanan tidak ditemukan' }, 404);
    }

    // Transisi 'Sudah Diambil' wajib via /ambil
    if (sts_psn === 'Sudah Diambil') {
      return c.json(
        { error: 'Pengambilan cucian harus diproses melalui prosedur serah terima cucian.' },
        400
      );
    }

    await db.update(PSN).set({ sts_psn }).where(eq(PSN.id_psn, id_psn));

    return c.json({ ok: true, id_psn, sts_psn });
  }
);

// PATCH /api/pesanan/:id/ambil (Prosedur 6 — Ambil Cucian & Tutup Transaksi)
pesananRoute.patch(
  '/:id/ambil',
  authMiddleware,
  requireRole('Admin', 'Kasir'),
  async (c) => {
    const id_psn = c.req.param('id');

    const psnRes = await db
      .select({ id_psn: PSN.id_psn, sts_psn: PSN.sts_psn })
      .from(PSN)
      .where(eq(PSN.id_psn, id_psn))
      .limit(1);

    if (psnRes.length === 0) {
      return c.json({ error: 'Pesanan tidak ditemukan' }, 404);
    }

    const curSts = psnRes[0].sts_psn;

    if (curSts !== 'Siap Diambil') {
      return c.json(
        { error: `Cucian belum siap diambil (status saat ini: ${curSts}). Harap tunggu hingga Siap Diambil.` },
        409
      );
    }

    // Validasi Pembayaran Lunas
    const byrRes = await db
      .select({ id_byr: BYR.id_byr })
      .from(BYR)
      .where(and(eq(BYR.id_psn, id_psn), eq(BYR.sts_byr, 'Lunas')))
      .limit(1);

    if (byrRes.length === 0) {
      return c.json(
        { error: 'Pesanan belum lunas! Wajib mencatat pembayaran lunas terlebih dahulu sebelum menyerahkan cucian.' },
        409
      );
    }

    await db.update(PSN).set({ sts_psn: 'Sudah Diambil' }).where(eq(PSN.id_psn, id_psn));

    return c.json({ ok: true, id_psn, sts_psn: 'Sudah Diambil' });
  }
);
