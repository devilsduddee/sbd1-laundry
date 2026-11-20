import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { initDb } from './db/client.js';
import { authRoute } from './routes/auth.js';
import { pelangganRoute } from './routes/pelanggan.js';
import { layananRoute } from './routes/layanan.js';
import { petugasRoute } from './routes/petugas.js';
import { pesananRoute } from './routes/pesanan.js';
import { bayarRoute } from './routes/bayar.js';
import { laporanRoute } from './routes/laporan.js';

const app = new Hono();

app.use('*', logger());

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

// Error Handler
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json(
    { error: err.message || 'Terjadi kesalahan internal pada server' },
    500
  );
});

export default app;
