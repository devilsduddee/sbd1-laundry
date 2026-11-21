import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { PTGS } from '../db/schema.js';
import { loginSchema } from '../../shared/schemas.js';
import { authMiddleware, COOKIE_NAME, JWT_SECRET } from '../middleware/auth.js';

export const authRoute = new Hono();

// POST /api/auth/login
authRoute.post('/login', zValidator('json', loginSchema), async (c) => {
  const { usernm, passwd } = c.req.valid('json');

  const rows = await db
    .select({
      id_ptgs: PTGS.id_ptgs,
      nm_ptgs: PTGS.nm_ptgs,
      usernm: PTGS.usernm,
      passwd: PTGS.passwd,
      level: PTGS.level,
    })
    .from(PTGS)
    .where(eq(PTGS.usernm, usernm))
    .limit(1);

  if (rows.length === 0) {
    return c.json({ error: 'Username atau password salah' }, 401);
  }

  const row = rows[0];
  const isValid = bcrypt.compareSync(passwd, row.passwd);
  if (!isValid) {
    return c.json({ error: 'Username atau password salah' }, 401);
  }

  const user = {
    id_ptgs: row.id_ptgs,
    nm_ptgs: row.nm_ptgs,
    usernm: row.usernm,
    level: row.level as any,
  };

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 hari
  const token = await sign({ ...user, exp }, JWT_SECRET, 'HS256');

  const isProd = process.env.NODE_ENV === 'production';
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return c.json({ ptgs: user });
});

// POST /api/auth/logout
authRoute.post('/logout', async (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.json({ ok: true, message: 'Berhasil logout' });
});

// GET /api/auth/me
authRoute.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json(user);
});
