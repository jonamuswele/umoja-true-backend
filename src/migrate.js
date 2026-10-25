import { getLocalDb, initDb } from './db.js';

console.log('🔄 Initializing and migrating Umoja Terra database...');
try {
  const db = getLocalDb();
  initDb(db);
  console.log('✅ Database schema and seed data successfully initialized in umoja.sqlite!');
} catch (error) {
  console.error('❌ Database migration failed:', error);
  process.exit(1);
}
