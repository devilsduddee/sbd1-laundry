import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { PSN, PLGN, PTGS, BYR } from '../db/schema.js';
import {
  laporanQuerySchema,
  type LaporanResponse,
  type PesananSummary,
} from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const laporanRoute = new Hono();

// GET /api/laporan (Output 5 - Khusus Admin)
laporanRoute.get(
  '/',
  authMiddleware,
  requireRole('Admin'),
  zValidator('query', laporanQuerySchema),
  async (c) => {
    const { start_date, end_date } = c.req.valid('query');

    const conditions = [];

    if (start_date) {
      conditions.push(gte(sql`substr(${PSN.tgl_msk}, 1, 10)`, start_date));
    }

    if (end_date) {
      conditions.push(lte(sql`substr(${PSN.tgl_msk}, 1, 10)`, end_date));
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
        jml_byr: BYR.jml_byr,
      })
      .from(PSN)
      .innerJoin(PLGN, eq(PSN.id_plgn, PLGN.id_plgn))
      .innerJoin(PTGS, eq(PSN.id_ptgs, PTGS.id_ptgs))
      .leftJoin(BYR, and(eq(PSN.id_psn, BYR.id_psn), eq(BYR.sts_byr, 'Lunas')));

    const rows = (
      conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(PSN.tgl_msk))
        : await query.orderBy(desc(PSN.tgl_msk))
    ) as unknown as PesananSummary[];

    const total_pesanan = rows.length;
    let total_lunas = 0;
    let total_pendapatan = 0;

    for (const r of rows) {
      if (r.sts_byr === 'Lunas') {
        total_lunas += 1;
        total_pendapatan += Number(r.jml_byr || r.tot_hrg || 0);
      }
    }

    const response: LaporanResponse = {
      summary: {
        total_pesanan,
        total_lunas,
        total_pendapatan,
      },
      rows,
    };

    return c.json(response);
  }
);
