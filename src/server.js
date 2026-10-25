import { serve } from '@hono/node-server';
import app from './index.js';
import { getLocalDb, getLocalDbAdapter, initDb } from './db.local.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8787;

// Auto-initialize SQLite schema and seed on local start
try {
  const db = getLocalDb();
  initDb(db);
} catch (err) {
  console.warn('DB initialization check:', err.message);
}

// Inject the local SQLite adapter into every Hono request context.
// Route handlers call getDb(c) which reads '__localDb' from context.
const localDbAdapter = getLocalDbAdapter();
app.use('*', async (c, next) => {
  c.set('__localDb', localDbAdapter);
  await next();
});

console.log(`\n🌍 --------------------------------------------------`);
console.log(`🚀 UMOJA TERRA HONO BACKEND RUNNING`);
console.log(`📡 Local Server URL: http://localhost:${PORT}`);
console.log(`🛡️  Security: CORS, RBAC, Account Suspension Protection`);
console.log(`⚡ Ready for Cloudflare Workers & Cloudflare D1`);
console.log(`----------------------------------------------------\n`);

serve({
  fetch: app.fetch,
  port: PORT
});
