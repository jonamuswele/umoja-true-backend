import { Hono } from 'hono';
import { getDb } from '../db.js';

export const messageRoutes = new Hono();

// GET /api/messages/threads
messageRoutes.get('/threads', async (c) => {
  const db = getDb(c);
  const username = c.req.header('X-User-Username');
  const role = c.req.header('X-User-Role');

  const threads = await db.query('SELECT * FROM message_threads ORDER BY updated_at DESC');
  const allMessages = await db.query('SELECT * FROM messages ORDER BY created_at ASC');

  const msgsByThread = {};
  for (const msg of allMessages) {
    if (!msgsByThread[msg.thread_id]) msgsByThread[msg.thread_id] = [];
    msgsByThread[msg.thread_id].push({
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      time: formatTime(msg.created_at)
    });
  }

  const result = threads.map(t => ({
    id: t.id,
    contactName: t.contact_name,
    contactAvatar: t.contact_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    contactRole: t.contact_role || 'Property Owner Representative',
    propertyTitle: t.property_title || 'Verified Property',
    unreadCount: Number(t.unread_count) || 0,
    time: t.time || 'Just now',
    messages: msgsByThread[t.id] || []
  }));

  return c.json(result);
});

// GET /api/messages/threads/:id
messageRoutes.get('/threads/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const thread = await db.queryOne('SELECT * FROM message_threads WHERE id = ?', [id]);
  if (!thread) return c.json({ error: 'Thread not found' }, 404);

  const messages = await db.query('SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC', [id]);

  return c.json({
    id: thread.id,
    contactName: thread.contact_name,
    contactAvatar: thread.contact_avatar,
    contactRole: thread.contact_role,
    propertyTitle: thread.property_title,
    unreadCount: Number(thread.unread_count) || 0,
    time: thread.time,
    messages: messages.map(m => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      time: formatTime(m.created_at)
    }))
  });
});

// POST /api/messages/threads (Ensure or create thread for owner)
messageRoutes.post('/threads', async (c) => {
  const db = getDb(c);
  const body = await c.req.json().catch(() => ({}));
  const username = c.req.header('X-User-Username') || 'usr-001';

  const ownerName = body.ownerName || body.contactName || 'Property Owner';
  const propertyTitle = body.propertyTitle || body.title || 'Verified Property';
  const threadId = body.ownerThreadId || body.id || `thread-owner-${Date.now()}`;

  // Check if thread exists
  let existing = await db.queryOne(
    'SELECT * FROM message_threads WHERE id = ? OR (contact_name = ? AND property_title = ?)',
    [threadId, ownerName, propertyTitle]
  );

  if (!existing) {
    await db.execute(
      `INSERT INTO message_threads (id, user_id, contact_name, contact_avatar, contact_role, property_title, unread_count, time)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'Just now')`,
      [
        threadId,
        username,
        ownerName,
        body.ownerAvatar || body.contactAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        body.ownerRole || body.contactRole || 'Verified Property Owner',
        propertyTitle
      ]
    );

    // Initial welcome message from owner
    const welcomeId = `msg-welcome-${Date.now()}`;
    await db.execute(
      `INSERT INTO messages (id, thread_id, sender, text) VALUES (?, ?, 'other', ?)`,
      [
        welcomeId,
        threadId,
        `Hello! I am the verified owner of "${propertyTitle}". Thank you for showing interest! Feel free to ask about inspections, title documentation, or offers.`
      ]
    );

    existing = await db.queryOne('SELECT * FROM message_threads WHERE id = ?', [threadId]);
  }

  return c.json({ threadId: existing.id, thread: existing });
});

// POST /api/messages/threads/:id/messages (Send message to thread)
messageRoutes.post('/threads/:id/messages', async (c) => {
  const db = getDb(c);
  const threadId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const text = (body.text || '').trim();

  if (!text) return c.json({ error: 'Message text cannot be empty' }, 400);

  let thread = await db.queryOne('SELECT * FROM message_threads WHERE id = ?', [threadId]);
  if (!thread) {
    const username = c.req.header('X-User-Username') || 'usr-001';
    await db.execute(
      `INSERT INTO message_threads (id, user_id, contact_name, contact_avatar, contact_role, property_title, unread_count, time)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'Just now')`,
      [
        threadId,
        username,
        body.contactName || 'Property Representative',
        body.contactAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        body.contactRole || 'Verified Specialist',
        body.propertyTitle || 'Verified Property'
      ]
    );
    thread = await db.queryOne('SELECT * FROM message_threads WHERE id = ?', [threadId]);
  }

  const sender = body.sender || 'me';
  const msgId = body.id || `msg-${Date.now()}`;

  await db.execute(
    'INSERT INTO messages (id, thread_id, sender, text) VALUES (?, ?, ?, ?)',
    [msgId, threadId, sender, text]
  );

  await db.execute(
    'UPDATE message_threads SET time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['Just now', threadId]
  );

  // If user sent the message, simulate quick realistic response if requested or thread is automated
  let autoReply = null;
  if (sender === 'me' && body.simulateReply !== false) {
    const autoResponses = [
      "Noted with thanks! Our verification officer is on it.",
      "Received! We are coordinating the site inspection team right away.",
      "Perfect. I will update the official Umoja documentation and keep you posted.",
      "Great, thank you for the confirmation. Look forward to assisting you."
    ];
    const replyText = autoResponses[Math.floor(Math.random() * autoResponses.length)];
    const replyId = `msg-auto-${Date.now() + 1}`;
    
    await db.execute(
      "INSERT INTO messages (id, thread_id, sender, text) VALUES (?, ?, 'other', ?)",
      [replyId, threadId, replyText]
    );
    autoReply = {
      id: replyId,
      sender: 'other',
      text: replyText,
      time: 'Just now'
    };
  }

  const allMessages = await db.query('SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC', [threadId]);

  return c.json({
    status: 'sent',
    message: { id: msgId, sender, text, time: 'Just now' },
    autoReply,
    threadMessages: allMessages.map(m => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      time: formatTime(m.created_at)
    }))
  });
});

// POST /api/messages/threads/:id/read (Mark thread read)
messageRoutes.post('/threads/:id/read', async (c) => {
  const db = getDb(c);
  const threadId = c.req.param('id');
  await db.execute('UPDATE message_threads SET unread_count = 0 WHERE id = ?', [threadId]);
  return c.json({ success: true, threadId });
});

function formatTime(timestamp) {
  if (!timestamp) return 'Just now';
  return 'Just now';
}
