import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/client.js';
import {
  laporanQuerySchema,
  type LaporanResponse,
  type PesananSummary,
} from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const laporanRoute = new Hono();

// GET /api/laporan (Output 5 — Khusus Admin)
laporanRoute.get(
  '/',
  authMiddleware,
  requireRole('Admin'),
  zValidator('query', laporanQuerySchema),
  async (c) => {
    const { start_date, end_date } = c.req.valid('query');

    let sql = `
      SELECT 
        p.id_psn, p.id_plgn, p.id_ptgs, p.tgl_msk, p.est_sls, p.tot_hrg, p.sts_psn,
        c.nm_plgn, c.no_hp,
        pt.nm_ptgs,
        COALESCE(b.sts_byr, 'Belum Lunas') as sts_byr,
        b.met_byr, b.tgl_byr, b.jml_byr
      FROM PSN p
      JOIN PLGN c ON p.id_plgn = c.id_plgn
      JOIN PTGS pt ON p.id_ptgs = pt.id_ptgs
      LEFT JOIN BYR b ON p.id_psn = b.id_psn AND b.sts_byr = 'Lunas'
      WHERE 1=1
    `;
    const args: any[] = [];

    if (start_date) {
      sql += ' AND substr(p.tgl_msk, 1, 10) >= ?';
      args.push(start_date);
    }

    if (end_date) {
      sql += ' AND substr(p.tgl_msk, 1, 10) <= ?';
      args.push(end_date);
    }

    sql += ' ORDER BY p.tgl_msk DESC';

    const res = await db.execute({ sql, args });
    const rows = res.rows as unknown as (PesananSummary & { jml_byr?: number })[];

    let total_pesanan = rows.length;
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
