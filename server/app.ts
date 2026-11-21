import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { initDb, client } from './db/client.js';
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

// Health check endpoint
app.get('/api/health', async (c) => {
  let dbStatus = 'untested';
  let dbError: string | null = null;

  try {
    const res = await client.execute('SELECT 1 as test');
    dbStatus = res.rows.length > 0 ? 'connected' : 'empty';
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err.message || String(err);
  }

  const isHealthy = dbStatus === 'connected';
  return c.json(
    {
      status: isHealthy ? 'ok' : 'degraded',
      service: 'Sistem Pengelolaan Laundry API',
      database: {
        status: dbStatus,
        ...(dbError ? { error: dbError } : {}),
      },
    },
    isHealthy ? 200 : 503
  );
});
app.get('/health', (c) => c.redirect('/api/health'));

// Pastikan DB siap untuk rute data
app.use('*', async (c, next) => {
  if (c.req.path.includes('health')) {
    return next();
  }
  await initDb();
  await next();
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

// Error Handler
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json(
    {
      error: err.message || 'Terjadi kesalahan internal pada server',
    },
    500
  );
});

export default app;
