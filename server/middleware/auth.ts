import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import type { LevelPtgs, Petugas } from '../../shared/schemas.js';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'sbd-laundry-secret-key-super-secure-min-32-chars-long';
export const COOKIE_NAME = 'auth_token';

export type AuthUser = {
  id_ptgs: string;
  nm_ptgs: string;
  usernm: string;
  level: LevelPtgs;
};

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Middleware untuk memvalidasi cookie JWT auth_token.
 */
export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) {
    return c.json({ error: 'Sesi tidak ditemukan. Silakan login kembali.' }, 401);
  }

  try {
    const payload = await verify(token, JWT_SECRET, 'HS256');
    if (!payload || !payload.id_ptgs || !payload.level) {
      return c.json({ error: 'Token tidak valid' }, 401);
    }

    c.set('user', {
      id_ptgs: payload.id_ptgs as string,
      nm_ptgs: payload.nm_ptgs as string,
      usernm: payload.usernm as string,
      level: payload.level as LevelPtgs,
    });

    await next();
  } catch (err) {
    return c.json({ error: 'Sesi berakhir atau tidak valid. Silakan login kembali.' }, 401);
  }
}

/**
 * Middleware guard role/level (Admin, Kasir, Operasional).
 */
export function requireRole(...allowedLevels: LevelPtgs[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Belum terautentikasi' }, 401);
    }

    if (!allowedLevels.includes(user.level)) {
      return c.json(
        { error: `Akses ditolak. Menu ini hanya dapat diakses oleh peran: ${allowedLevels.join(', ')}.` },
        403
      );
    }

    await next();
  };
}
