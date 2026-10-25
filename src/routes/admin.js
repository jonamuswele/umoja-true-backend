import { Hono } from 'hono';
import { getDb } from '../db.js';
import { logAdminAction } from '../middleware/auth.js';

export const adminRoutes = new Hono();

// GET /api/admin/users
adminRoutes.get('/users', async (c) => {
  const db = getDb(c);
  const rows = await db.query('SELECT * FROM users ORDER BY created_at DESC');
  return c.json(rows.map(u => ({
    id: u.id,
    name: u.name,
    username: u.email || u.name,
    email: u.email,
    phone: u.phone,
    location: u.location,
    avatar: u.avatar,
    role: u.role,
    roleTitle: u.role_title,
    isSuspended: !!u.is_suspended,
    isApproved: !!u.is_approved,
    memberSince: u.member_since
  })));
});

// POST /api/admin/users/:username/suspend
adminRoutes.post('/users/:username/suspend', async (c) => {
  const db = getDb(c);
  const username = c.req.param('username');
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  const user = await db.queryOne(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?) OR id = ?',
    [username, username, username]
  );
  if (!user) return c.json({ error: 'User not found' }, 404);

  const nextSuspended = user.is_suspended ? 0 : 1;
  await db.execute('UPDATE users SET is_suspended = ? WHERE id = ?', [nextSuspended, user.id]);

  const actionText = `${nextSuspended ? 'Suspended' : 'Unsuspended'} user account: ${user.name} (${user.email})`;
  await logAdminAction(c, actionText, adminName);

  return c.json({
    success: true,
    userId: user.id,
    isSuspended: !!nextSuspended,
    message: actionText
  });
});

// DELETE /api/admin/users/:username
adminRoutes.delete('/users/:username', async (c) => {
  const db = getDb(c);
  const username = c.req.param('username');
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  const user = await db.queryOne(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?) OR id = ?',
    [username, username, username]
  );
  if (!user) return c.json({ error: 'User not found' }, 404);

  await db.execute('DELETE FROM users WHERE id = ?', [user.id]);
  await logAdminAction(c, `Deleted user account: ${user.name} (${user.email})`, adminName);

  return c.json({ success: true, deletedUser: user.name });
});

// GET /api/admin/pending-users
adminRoutes.get('/pending-users', async (c) => {
  const db = getDb(c);
  const rows = await db.query('SELECT * FROM users WHERE is_approved = 0 ORDER BY created_at DESC');
  return c.json(rows.map(u => ({
    id: u.id,
    name: u.name,
    username: u.email || u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    roleTitle: u.role_title
  })));
});

// POST /api/admin/approve-user/:username
adminRoutes.post('/approve-user/:username', async (c) => {
  const db = getDb(c);
  const username = c.req.param('username');
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  const user = await db.queryOne(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?) OR id = ?',
    [username, username, username]
  );
  if (!user) return c.json({ error: 'User not found' }, 404);

  await db.execute('UPDATE users SET is_approved = 1 WHERE id = ?', [user.id]);
  await logAdminAction(c, `Approved user account: ${user.name} (${user.email})`, adminName);

  return c.json({ success: true, approvedUser: user.name });
});

// GET /api/admin/logs
adminRoutes.get('/logs', async (c) => {
  const db = getDb(c);
  const rows = await db.query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 50');
  return c.json(rows.map(l => ({
    id: l.id,
    action: l.action,
    admin: l.admin_name,
    time: l.created_at || 'Just now'
  })));
});

// GET /api/admin/notifications
adminRoutes.get('/notifications', async (c) => {
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

// POST /api/admin/notifications/:id/read
adminRoutes.post('/notifications/:id/read', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  await db.execute('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
  return c.json({ success: true, id });
});

// POST /api/admin/countries/:countryId/visibility
adminRoutes.post('/countries/:countryId/visibility', async (c) => {
  const db = getDb(c);
  const countryId = c.req.param('countryId');
  const country = await db.queryOne('SELECT * FROM countries WHERE id = ?', [countryId]);
  if (!country) return c.json({ error: 'Country not found' }, 404);

  const nextHidden = country.is_hidden ? 0 : 1;
  await db.execute('UPDATE countries SET is_hidden = ? WHERE id = ?', [nextHidden, countryId]);
  await logAdminAction(c, `Toggled visibility for country ${country.name}`);

  return c.json({ success: true, countryId, isHidden: !!nextHidden });
});

// POST /api/admin/plots/:plotId/visibility
adminRoutes.post('/plots/:plotId/visibility', async (c) => {
  const db = getDb(c);
  const plotId = c.req.param('plotId');
  const plot = await db.queryOne('SELECT * FROM plots WHERE id = ?', [plotId]);
  if (!plot) return c.json({ error: 'Plot not found' }, 404);

  const nextHidden = plot.is_hidden ? 0 : 1;
  await db.execute('UPDATE plots SET is_hidden = ? WHERE id = ?', [nextHidden, plotId]);
  await logAdminAction(c, `Toggled visibility for plot ${plot.title}`);

  return c.json({ success: true, plotId, isHidden: !!nextHidden });
});
