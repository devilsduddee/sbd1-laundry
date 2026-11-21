import type { Context, MiddlewareHandler } from 'hono';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const loginFailures = new Map<string, RateLimitRecord>();
const trackingRequests = new Map<string, RateLimitRecord>();

// Bersihkan data kedaluwarsa secara berkala setiap 10 menit
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginFailures.entries()) {
    if (record.resetAt <= now) {
      loginFailures.delete(key);
    }
  }
  for (const [key, record] of trackingRequests.entries()) {
    if (record.resetAt <= now) {
      trackingRequests.delete(key);
    }
  }
}, 10 * 60 * 1000);

if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Mendapatkan alamat IP klien dengan aman dari header proxy/reverse proxy Vercel.
 */
export function getClientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return c.req.header('x-real-ip') || '127.0.0.1';
}

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 menit

/**
 * Memeriksa apakah percobaan login sedang diblokir karena terlalu banyak kegagalan.
 */
export function isLoginRateLimited(c: Context, usernm: string): boolean {
  const ip = getClientIp(c);
  const key = `${ip}:${usernm.trim().toLowerCase()}`;
  const record = loginFailures.get(key);

  if (!record) return false;

  if (Date.now() > record.resetAt) {
    loginFailures.delete(key);
    return false;
  }

  return record.count >= LOGIN_MAX_ATTEMPTS;
}

/**
 * Mencatat kegagalan login untuk IP dan username tertentu.
 */
export function recordFailedLogin(c: Context, usernm: string): void {
  const ip = getClientIp(c);
  const key = `${ip}:${usernm.trim().toLowerCase()}`;
  const now = Date.now();
  const record = loginFailures.get(key);

  if (!record || now > record.resetAt) {
    loginFailures.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    record.count += 1;
  }
}

/**
 * Menghapus catatan kegagalan saat login berhasil.
 */
export function clearFailedLogin(c: Context, usernm: string): void {
  const ip = getClientIp(c);
  const key = `${ip}:${usernm.trim().toLowerCase()}`;
  loginFailures.delete(key);
}

const TRACKING_MAX_REQUESTS = 30;
const TRACKING_WINDOW_MS = 60 * 1000; // 1 menit

/**
 * Middleware pembatasan laju (rate limit) untuk endpoint publik pelacakan tiket.
 */
export const trackingRateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = getClientIp(c);
  const now = Date.now();
  const record = trackingRequests.get(ip);

  if (!record || now > record.resetAt) {
    trackingRequests.set(ip, { count: 1, resetAt: now + TRACKING_WINDOW_MS });
  } else {
    record.count += 1;
    if (record.count > TRACKING_MAX_REQUESTS) {
      return c.json(
        { error: 'Terlalu banyak permintaan pelacakan tiket. Silakan coba kembali dalam 1 menit.' },
        429
      );
    }
  }

  await next();
};
