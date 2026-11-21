import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
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

// Batas ukuran request payload (maks 1MB untuk mitigasi DoS tanpa ketergantungan c.req.raw.headers.has)
const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
app.use('*', async (c, next) => {
  const len = c.req.header('content-length');
  if (len && parseInt(len, 10) > MAX_PAYLOAD_SIZE) {
    return c.json({ error: 'Ukuran payload melebihi batas 1MB' }, 413);
  }
  await next();
});

// Logging request
app.use('*', logger());

// CORS terproteksi
app.use(
  '*',
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
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'Sistem Pengelolaan Laundry API' });
});

// Sub-router API
const api = new Hono();
api.route('/auth', authRoute);
api.route('/pelanggan', pelangganRoute);
api.route('/layanan', layananRoute);
api.route('/petugas', petugasRoute);
api.route('/pesanan', pesananRoute);
api.route('/bayar', bayarRoute);
api.route('/laporan', laporanRoute);

// Mount di /api dan fallback root (kompatibilitas penuh dengan URL rewriting Vercel)
app.route('/api', api);
app.route('/', api);

// Alias publik untuk katalog layanan
app.route('/publik', layananRoute);

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
