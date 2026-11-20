import { serve } from '@hono/node-server';
import app from './app.js';
import { initDb } from './db/client.js';

const port = Number(process.env.PORT) || 3001;

async function start() {
  await initDb();
  console.log(`🚀 Server Hono Backend berjalan di http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}

start().catch((err) => {
  console.error('Gagal menjalankan server dev:', err);
  process.exit(1);
});
