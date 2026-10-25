import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local SQLite database singleton for local Node.js development
let localDbInstance = null;

export function getLocalDb() {
  if (!localDbInstance) {
    const dbPath = path.resolve(__dirname, '../umoja.sqlite');
    localDbInstance = new Database(dbPath);
    localDbInstance.pragma('journal_mode = WAL');
    localDbInstance.pragma('foreign_keys = ON');
  }
  return localDbInstance;
}

/**
 * Universal Database Adapter for Hono.
 * Seamlessly interfaces with Cloudflare D1 in production (c.env.DB)
 * and better-sqlite3 in local Node development.
 */
export function getDb(c) {
  // If running in Cloudflare Worker environment with D1 bound
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

  // Local Node.js SQLite fallback
  const localDb = getLocalDb();
  return {
    async query(sql, params = []) {
      const stmt = localDb.prepare(sql);
      return stmt.all(...params);
    },
    async queryOne(sql, params = []) {
      const stmt = localDb.prepare(sql);
      return stmt.get(...params) || null;
    },
    async execute(sql, params = []) {
      const stmt = localDb.prepare(sql);
      const res = stmt.run(...params);
      return {
        success: true,
        changes: res.changes,
        lastRowId: res.lastInsertRowid
      };
    },
    async batch(statements) {
      const runBatch = localDb.transaction((stmts) => {
        for (const s of stmts) {
          localDb.prepare(s.sql).run(...(s.params || []));
        }
      });
      runBatch(statements);
      return { success: true };
    }
  };
}

/**
 * Initialize and migrate the database using schema.sql and seed.sql
 */
export function initDb(sqliteDb = null) {
  const db = sqliteDb || getLocalDb();
  const schemaPath = path.resolve(__dirname, '../schema.sql');
  const seedPath = path.resolve(__dirname, '../seed.sql');

  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Check if users exist before seeding
  const userCount = db.prepare('SELECT count(*) as count FROM users').get();
  if (!userCount || userCount.count === 0) {
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      db.exec(seedSql);
    }
  }
}
