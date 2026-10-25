import { Hono } from 'hono';
import { getDb } from '../db.js';

export const notificationRoutes = new Hono();

// GET /api/notifications
notificationRoutes.get('/', async (c) => {
  const db = getDb(c);
  const rows = await db.query('SELECT * FROM notifications ORDER BY created_at DESC');
  return c.json(rows.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    category: n.category || 'general',
    read: !!n.read,
    time: n.time || 'Just now'
  })));
});

// POST /api/notifications
notificationRoutes.post('/', async (c) => {
  const db = getDb(c);
  const body = await c.req.json().catch(() => ({}));
  const id = body.id || `notif-${Date.now()}`;

  await db.execute(
    'INSERT INTO notifications (id, user_id, title, message, category, read, time) VALUES (?, ?, ?, ?, ?, 0, ?)',
    [
      id,
      body.userId || 'usr-001',
      body.title || 'Platform Notification',
      body.message || '',
      body.category || 'general',
      'Just now'
    ]
  );

  const created = await db.queryOne('SELECT * FROM notifications WHERE id = ?', [id]);
  return c.json({
    id: created.id,
    title: created.title,
    message: created.message,
    category: created.category,
    read: !!created.read,
    time: created.time
  }, 201);
});

// POST /api/notifications/:id/read
notificationRoutes.post('/:id/read', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  await db.execute('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
  return c.json({ success: true, id });
});

// POST /api/notifications/read-all
notificationRoutes.post('/read-all', async (c) => {
  const db = getDb(c);
  await db.execute('UPDATE notifications SET read = 1');
  return c.json({ success: true });
});
