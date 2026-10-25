/**
 * Local Node.js SQLite adapter using better-sqlite3.
 *
 * ⚠️  This file is ONLY used by server.js (local dev) and migrate.js.
 *     It is NEVER imported by index.js (the Cloudflare Worker entry point).
 *     Wrangler will therefore never bundle this file or better-sqlite3.
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Singleton SQLite connection
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
 * Returns an async-compatible DB adapter wrapping better-sqlite3.
 * The interface matches the D1 adapter in db.js so all route handlers
 * work identically in both environments.
 */
export function getLocalDbAdapter() {
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
 * Initialize local SQLite with schema.sql and seed.sql.
 * Called once on local server startup.
 */
export function initDb(sqliteDb = null) {
  const db = sqliteDb || getLocalDb();
  const schemaPath = path.resolve(__dirname, '../schema.sql');
  const seedPath = path.resolve(__dirname, '../seed.sql');

  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Only seed if the DB is empty
  const userCount = db.prepare('SELECT count(*) as count FROM users').get();
  if (!userCount || userCount.count === 0) {
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      db.exec(seedSql);
    }
  }
}
