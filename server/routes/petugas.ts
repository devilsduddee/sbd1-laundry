import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';
import { db } from '../db/client.js';
import {
  createPetugasSchema,
  updatePetugasSchema,
  type Petugas,
} from '../../shared/schemas.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export const petugasRoute = new Hono();

// Seluruh endpoint kelola petugas wajib peran Admin
petugasRoute.use('*', authMiddleware, requireRole('Admin'));

// GET /api/petugas
petugasRoute.get('/', async (c) => {
  const res = await db.execute(
    'SELECT id_ptgs, nm_ptgs, usernm, level FROM PTGS ORDER BY nm_ptgs ASC'
  );
  const data = res.rows as unknown as Petugas[];
  return c.json({ data });
});

// POST /api/petugas
petugasRoute.post('/', zValidator('json', createPetugasSchema), async (c) => {
  const { nm_ptgs, usernm, passwd, level } = c.req.valid('json');

  const check = await db.execute({
    sql: 'SELECT id_ptgs FROM PTGS WHERE usernm = ?',
    args: [usernm],
  });

  if (check.rows.length > 0) {
    return c.json({ error: 'Username sudah digunakan' }, 409);
  }

  // Buat ID baru PTG-XXX berdasarkan ID numerik terbesar
  const lastRes = await db.execute('SELECT id_ptgs FROM PTGS ORDER BY id_ptgs DESC LIMIT 1');
  let nextNum = 1;
  if (lastRes.rows.length > 0) {
    const match = String(lastRes.rows[0].id_ptgs).match(/\d+$/);
    if (match) nextNum = parseInt(match[0], 10) + 1;
  }
  const id_ptgs = `PTG-${String(nextNum).padStart(3, '0')}`;

  const hash = bcrypt.hashSync(passwd, 10);

  await db.execute({
    sql: 'INSERT INTO PTGS (id_ptgs, nm_ptgs, usernm, passwd, level) VALUES (?, ?, ?, ?, ?)',
    args: [id_ptgs, nm_ptgs, usernm, hash, level],
  });

  const created: Petugas = { id_ptgs, nm_ptgs, usernm, level };
  return c.json({ data: created }, 201);
});

// PATCH /api/petugas/:id
petugasRoute.patch('/:id', zValidator('json', updatePetugasSchema), async (c) => {
  const id_ptgs = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db.execute({
    sql: 'SELECT id_ptgs, nm_ptgs, usernm, level FROM PTGS WHERE id_ptgs = ?',
    args: [id_ptgs],
  });

  if (existing.rows.length === 0) {
    return c.json({ error: 'Petugas tidak ditemukan' }, 404);
  }

  const current = existing.rows[0];
  const nm_ptgs = body.nm_ptgs ?? (current.nm_ptgs as string);
  const level = body.level ?? (current.level as any);

  if (body.passwd) {
    const hash = bcrypt.hashSync(body.passwd, 10);
    await db.execute({
      sql: 'UPDATE PTGS SET nm_ptgs = ?, passwd = ?, level = ? WHERE id_ptgs = ?',
      args: [nm_ptgs, hash, level, id_ptgs],
    });
  } else {
    await db.execute({
      sql: 'UPDATE PTGS SET nm_ptgs = ?, level = ? WHERE id_ptgs = ?',
      args: [nm_ptgs, level, id_ptgs],
    });
  }

  const updated: Petugas = {
    id_ptgs,
    nm_ptgs,
    usernm: current.usernm as string,
    level,
  };

  return c.json({ data: updated });
});
