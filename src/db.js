/**
 * Worker-safe Database Adapter for Hono.
 *
 * - In Cloudflare Workers (production): uses the D1 binding (c.env.DB)
 * - In local Node.js dev (server.js): uses a SQLite adapter injected via
 *   middleware as '__localDb' on the Hono context.
 *
 * ⚠️  This file has NO Node.js imports (no fs, path, better-sqlite3, url).
 *     It is safe to bundle with Wrangler for Cloudflare Workers.
 *     All local-only SQLite code lives in db.local.js.
 */

/**
 * Returns a unified async DB adapter for any route handler.
 * Works in both Cloudflare Workers (D1) and local Node.js (better-sqlite3).
 */
export function getDb(c) {
  // --- Cloudflare Workers: D1 binding ---
  const d1 = c?.env?.DB;
  if (d1) {
    return {
      async query(sql, params = []) {
        const stmt = d1.prepare(sql).bind(...params);
        const { results } = await stmt.all();
        return results || [];
      },
      async queryOne(sql, params = []) {
        const stmt = d1.prepare(sql).bind(...params);
        return await stmt.first();
      },
      async execute(sql, params = []) {
        const stmt = d1.prepare(sql).bind(...params);
        const res = await stmt.run();
        return {
          success: res.success,
          changes: res.meta?.changes ?? 0,
          lastRowId: res.meta?.last_row_id
        };
      },
      async batch(statements) {
        const d1Stmts = statements.map(s => d1.prepare(s.sql).bind(...(s.params || [])));
        return await d1.batch(d1Stmts);
      }
    };
  }

  // --- Local Node.js dev: adapter injected by server.js middleware ---
  const localDb = c?.get?.('__localDb');
  if (localDb) return localDb;

  throw new Error(
    'No database available. In Workers: check D1 binding in wrangler.toml. ' +
    'In local dev: ensure server.js injects the __localDb context variable.'
  );
}
