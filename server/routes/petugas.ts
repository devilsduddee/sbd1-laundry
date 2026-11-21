import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';
import { eq, asc, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { PTGS } from '../db/schema.js';
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
  const data = (await db
    .select({
      id_ptgs: PTGS.id_ptgs,
      nm_ptgs: PTGS.nm_ptgs,
      usernm: PTGS.usernm,
      level: PTGS.level,
    })
    .from(PTGS)
    .orderBy(asc(PTGS.nm_ptgs))) as Petugas[];

  return c.json({ data });
});

// POST /api/petugas
petugasRoute.post('/', zValidator('json', createPetugasSchema), async (c) => {
  const { nm_ptgs, usernm, passwd, level } = c.req.valid('json');

  const check = await db
    .select({ id_ptgs: PTGS.id_ptgs })
    .from(PTGS)
    .where(eq(PTGS.usernm, usernm))
    .limit(1);

  if (check.length > 0) {
    return c.json({ error: 'Username sudah digunakan' }, 409);
  }

  // Buat ID baru PTG-XXX berdasarkan ID numerik terbesar
  const lastRes = await db
    .select({ id_ptgs: PTGS.id_ptgs })
    .from(PTGS)
    .orderBy(desc(PTGS.id_ptgs))
    .limit(1);

  let nextNum = 1;
  if (lastRes.length > 0) {
    const match = String(lastRes[0].id_ptgs).match(/\d+$/);
    if (match) nextNum = parseInt(match[0], 10) + 1;
  }
  const id_ptgs = `PTG-${String(nextNum).padStart(3, '0')}`;

  const hash = bcrypt.hashSync(passwd, 10);

  await db.insert(PTGS).values({ id_ptgs, nm_ptgs, usernm, passwd: hash, level });

  const created: Petugas = { id_ptgs, nm_ptgs, usernm, level };
  return c.json({ data: created }, 201);
});

// PATCH /api/petugas/:id
petugasRoute.patch('/:id', zValidator('json', updatePetugasSchema), async (c) => {
  const id_ptgs = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db
    .select()
    .from(PTGS)
    .where(eq(PTGS.id_ptgs, id_ptgs))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: 'Petugas tidak ditemukan' }, 404);
  }

  const current = existing[0];
  const nm_ptgs = body.nm_ptgs ?? current.nm_ptgs;
  const level = body.level ?? current.level;

  if (body.passwd) {
    const hash = bcrypt.hashSync(body.passwd, 10);
    await db
      .update(PTGS)
      .set({ nm_ptgs, passwd: hash, level })
      .where(eq(PTGS.id_ptgs, id_ptgs));
  } else {
    await db
      .update(PTGS)
      .set({ nm_ptgs, level })
      .where(eq(PTGS.id_ptgs, id_ptgs));
  }

  const updated: Petugas = {
    id_ptgs,
    nm_ptgs,
    usernm: current.usernm,
    level,
  };

  return c.json({ data: updated });
});
