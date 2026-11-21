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
import {
  isLoginRateLimited,
  recordFailedLogin,
  clearFailedLogin,
} from '../middleware/rateLimit.js';

export const authRoute = new Hono();

// Hash dummy untuk menjamin durasi eksekusi verifikasi password konstan (mitigasi timing attack)
const DUMMY_HASH = '$2a$10$wK1Dq2a7e7r3t6y8u9i0o.eN5F4v3c2x1z0l9k8j7h6g5f4d3s2a1';

// POST /api/auth/login
authRoute.post('/login', zValidator('json', loginSchema), async (c) => {
  const { usernm, passwd } = c.req.valid('json');

  // Proteksi Brute-Force Rate Limiting (Maks 5 percobaan gagal per 15 menit)
  if (isLoginRateLimited(c, usernm)) {
    return c.json(
      { error: 'Terlalu banyak percobaan login gagal. Silakan coba lagi dalam 15 menit.' },
      429
    );
  }

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
    // Constant-time execution agar durasi respon identik dan mencegah enumerasi user
    bcrypt.compareSync(passwd, DUMMY_HASH);
    recordFailedLogin(c, usernm);
    return c.json({ error: 'Username atau password salah' }, 401);
  }

  const row = rows[0];
  const isValid = bcrypt.compareSync(passwd, row.passwd);
  if (!isValid) {
    recordFailedLogin(c, usernm);
    return c.json({ error: 'Username atau password salah' }, 401);
  }

  // Bersihkan catatan kegagalan jika login berhasil
  clearFailedLogin(c, usernm);

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
