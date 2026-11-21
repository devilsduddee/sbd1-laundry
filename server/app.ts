import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { bodyLimit } from 'hono/body-limit';
import { initDb } from './db/client.js';
import { authRoute } from './routes/auth.js';
import { pelangganRoute } from './routes/pelanggan.js';
import { layananRoute } from './routes/layanan.js';
import { petugasRoute } from './routes/petugas.js';
import { pesananRoute } from './routes/pesanan.js';
import { bayarRoute } from './routes/bayar.js';
import { laporanRoute } from './routes/laporan.js';

const app = new Hono();

// OWASP Security Headers (HSTS, X-Frame-Options, X-Content-Type-Options, dll.)
app.use('*', secureHeaders());

// Batas ukuran request payload (maks 1MB untuk mitigasi DoS)
app.use(
  '*',
  bodyLimit({
    maxSize: 1024 * 1024,
    onError: (c) => c.json({ error: 'Ukuran payload melebihi batas 1MB' }, 413),
  })
);

// Logging request
app.use('*', logger());

// CORS terproteksi
app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.endsWith('.vercel.app')
      ) {
        return origin;
      }
      return null;
    },
    credentials: true,
  })
);

// Pastikan DB siap
app.use('*', async (c, next) => {
  await initDb();
  await next();
});

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', service: 'Sistem Pengelolaan Laundry API' });
});

// Mount Routes
app.route('/api/auth', authRoute);
app.route('/api/pelanggan', pelangganRoute);
app.route('/api/layanan', layananRoute);
app.route('/api/petugas', petugasRoute);
app.route('/api/pesanan', pesananRoute);
app.route('/api/bayar', bayarRoute);
app.route('/api/laporan', laporanRoute);

// 404 Handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint tidak ditemukan' }, 404);
});

// Error Handler dengan masking error di production (mencegah information disclosure)
app.onError((err, c) => {
  console.error('Server Error:', err);
  const isProd = process.env.NODE_ENV === 'production';
  return c.json(
    {
      error: isProd
        ? 'Terjadi kesalahan internal pada server'
        : err.message || 'Terjadi kesalahan internal pada server',
    },
    500
  );
});

export default app;
