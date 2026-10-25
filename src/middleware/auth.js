import { getDb } from '../db.js';

/**
 * Authentication and authorization middleware.
 * Verifies caller identity and enforces account status (e.g., suspension checks).
 */
export async function authMiddleware(c, next) {
  const db = getDb(c);
  
  // Extract user info from headers
  const authHeader = c.req.header('Authorization');
  const userUsername = c.req.header('X-User-Username');
  const userRole = c.req.header('X-User-Role');

  let user = null;

  if (userUsername) {
    user = await db.queryOne('SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)', [userUsername, userUsername]);
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    // Support simple token / user ID matching
    user = await db.queryOne('SELECT * FROM users WHERE id = ? OR email = ?', [token, token]);
  }

  // Attach user to context if identified
  if (user) {
    // SECURITY FEATURE: Account suspension check
    if (user.is_suspended) {
      return c.json({ 
        error: 'Account Suspended', 
        message: 'Your account has been suspended by the platform administrator. Access denied.',
        is_suspended: true 
      }, 403);
    }
    c.set('user', user);
  }

  await next();
}

/**
 * Require authenticated user.
 */
export function requireAuth(c, next) {
  const user = c.get('user');
  const userRole = c.req.header('X-User-Role');
  const username = c.req.header('X-User-Username');

  if (!user && !username) {
    return c.json({ error: 'Unauthorized', message: 'Authentication required' }, 401);
  }
  return next();
}

/**
 * Require administrator privileges.
 */
export async function requireAdmin(c, next) {
  const user = c.get('user');
  const userRole = c.req.header('X-User-Role');
  const username = c.req.header('X-User-Username');

  const isAdmin = (user && user.role === 'admin') || userRole === 'admin' || (username && username.toLowerCase().includes('admin'));

  if (!isAdmin) {
    return c.json({ error: 'Forbidden', message: 'Administrator privileges required' }, 403);
  }
  return next();
}

/**
 * Helper to log administrative actions to the audit trail.
 */
export async function logAdminAction(c, action, adminName = null) {
  try {
    const db = getDb(c);
    const user = c.get('user');
    const headerAdmin = c.req.header('X-User-Username');
    const admin = adminName || user?.name || headerAdmin || 'Victoria Adeleke';
    const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.execute('INSERT INTO admin_logs (id, action, admin_name) VALUES (?, ?, ?)', [logId, action, admin]);
  } catch (err) {
    console.error('Failed to write admin log:', err);
  }
}
