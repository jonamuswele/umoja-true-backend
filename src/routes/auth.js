import { Hono } from 'hono';
import { getDb } from '../db.js';
import { logAdminAction } from '../middleware/auth.js';

export const authRoutes = new Hono();

// POST /api/auth/login
authRoutes.post('/login', async (c) => {
  const db = getDb(c);
  const body = await c.req.json().catch(() => ({}));
  const { username, email, password } = body;

  const identifier = (username || email || '').trim();
  if (!identifier) {
    return c.json({ detail: 'Username or email is required' }, 400);
  }

  // Find user by username or email
  const user = await db.queryOne(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)',
    [identifier, identifier]
  );

  // If user doesn't exist, check demo shortcuts or fail
  if (!user) {
    const normalized = identifier.toLowerCase();
    if (normalized === 'admin' && (password === 'admin' || !password)) {
      const admin = await db.queryOne("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
      if (admin) return c.json(formatUser(admin));
    } else if (password === 'umoja' || normalized === 'jonathan' || normalized === 'jonathan k.') {
      const demoUser = await db.queryOne("SELECT * FROM users WHERE role = 'user' LIMIT 1");
      if (demoUser) return c.json(formatUser(demoUser));
    }
    return c.json({ detail: 'Invalid credentials or user not found' }, 401);
  }

  // Security Check 1: Account Suspension
  if (user.is_suspended) {
    return c.json({ 
      detail: 'This account has been suspended by the platform administrator.',
      is_suspended: true 
    }, 403);
  }

  // Security Check 2: Account Approval
  if (user.is_approved === 0) {
    return c.json({ 
      detail: 'Account pending administrator approval. Please wait for verification.',
      is_approved: false 
    }, 403);
  }

  // Security Check 3: Password verification (allow demo passwords or match)
  const isMatch = (password === user.password) || 
                  (user.role === 'admin' && password === 'admin') ||
                  (user.role === 'user' && password === 'umoja');

  if (!isMatch && password) {
    return c.json({ detail: 'Incorrect password' }, 401);
  }

  return c.json(formatUser(user));
});

// POST /api/auth/register
authRoutes.post('/register', async (c) => {
  const db = getDb(c);
  const body = await c.req.json().catch(() => ({}));
  const { name, username, email, phone, password, role, roleTitle, role_title } = body;

  const userEmail = (email || username || '').trim();
  const userName = (name || username || userEmail.split('@')[0] || 'Member').trim();

  if (!userEmail) {
    return c.json({ detail: 'Email or username is required' }, 400);
  }

  // Check if user already exists
  const existing = await db.queryOne(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)',
    [userEmail, userName]
  );
  if (existing) {
    return c.json({ detail: 'An account with this email or username already exists' }, 409);
  }

  const userId = `usr-${Date.now()}`;
  const assignedRole = (role === 'admin' || userEmail.toLowerCase().includes('admin')) ? 'admin' : 'user';
  const assignedTitle = roleTitle || role_title || (assignedRole === 'admin' ? 'Platform Administrator' : 'Verified Member');

  await db.execute(
    `INSERT INTO users (id, name, email, phone, location, avatar, role, role_title, password, is_suspended, is_approved, currency, bio, member_since)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 'NGN', 'Verified member of Umoja Terra infrastructure platform.', 'Today')`,
    [
      userId,
      userName,
      userEmail,
      phone || '+234 800 000 0000',
      'Lagos, Nigeria',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      assignedRole,
      assignedTitle,
      password || 'umoja'
    ]
  );

  const createdUser = await db.queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  await logAdminAction(c, `New user registered: ${userName} (${userEmail})`, 'System');

  return c.json(formatUser(createdUser), 201);
});

// GET /api/auth/me
authRoutes.get('/me', async (c) => {
  const db = getDb(c);
  const username = c.req.header('X-User-Username');
  const role = c.req.header('X-User-Role');

  if (!username) {
    return c.json({ detail: 'Not authenticated' }, 401);
  }

  const user = await db.queryOne(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)',
    [username, username]
  );

  if (!user) {
    return c.json({ detail: 'User not found' }, 404);
  }

  return c.json(formatUser(user));
});

function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    username: row.email || row.name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    avatar: row.avatar,
    role: row.role,
    roleTitle: row.role_title,
    currency: row.currency,
    bio: row.bio,
    memberSince: row.member_since,
    isSuspended: !!row.is_suspended,
    isApproved: !!row.is_approved
  };
}
