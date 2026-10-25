import { Hono } from 'hono';
import { getDb } from '../db.js';
import { logAdminAction } from '../middleware/auth.js';

export const serviceRoutes = new Hono();

function parseJsonSafe(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

function formatService(s, subscriptions = []) {
  return {
    id: s.id,
    title: s.title,
    shortDesc: s.short_desc,
    description: s.short_desc,
    category: s.category,
    tag: s.tag,
    heroImage: s.hero_image,
    image: s.hero_image,
    kind: s.kind || 'service',
    accentColor: s.accent_color || '#1A3E26',
    textColor: s.text_color || '#FFFFFF',
    subtitleColor: s.subtitle_color || 'rgba(255, 255, 255, 0.85)',
    badgeColor: s.badge_color || '#D4AF37',
    layoutStyle: s.layout_style || 'card-modern',
    heroHeadline: s.hero_headline || s.title,
    heroSubtitle: s.hero_subtitle || s.short_desc,
    badgeText: s.badge_text || 'Verified Platform Service',
    badge: s.badge_text,
    ctaLabel: s.cta_label || (s.kind === 'service' ? 'Reserve Consultation' : 'Inquire Now'),
    highlights: parseJsonSafe(s.highlights_json, []),
    status: s.status || 'active',
    subscriptions: subscriptions.map(p => ({
      id: p.id,
      name: p.name,
      badge: p.badge,
      priceNgn: Number(p.price_ngn) || 0,
      priceUsd: Number(p.price_usd) || 0,
      billingPeriod: p.billing_period,
      shortDesc: p.short_desc,
      offerings: parseJsonSafe(p.offerings_json, []),
      active: !!p.active,
      highlighted: !!p.highlighted
    }))
  };
}

// GET /api/services
serviceRoutes.get('/', async (c) => {
  const db = getDb(c);
  const services = await db.query('SELECT * FROM services ORDER BY created_at ASC');
  const subscriptions = await db.query('SELECT * FROM subscriptions ORDER BY sort_order ASC, created_at ASC');

  const subsByService = {};
  for (const sub of subscriptions) {
    if (!subsByService[sub.service_id]) subsByService[sub.service_id] = [];
    subsByService[sub.service_id].push(sub);
  }

  const result = services.map(s => formatService(s, subsByService[s.id] || []));
  return c.json(result);
});

// GET /api/services/:id
serviceRoutes.get('/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const service = await db.queryOne('SELECT * FROM services WHERE id = ?', [id]);
  if (!service) return c.json({ error: 'Service not found' }, 404);

  const subscriptions = await db.query('SELECT * FROM subscriptions WHERE service_id = ? ORDER BY sort_order ASC', [id]);
  return c.json(formatService(service, subscriptions));
});

// PUT /api/services/:id (Admin Service Studio Update)
serviceRoutes.put('/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  let existing = await db.queryOne('SELECT * FROM services WHERE id = ?', [id]);
  if (!existing) {
    // If not existing yet, insert baseline service record so it can be updated
    await db.execute(
      `INSERT INTO services (
        id, title, short_desc, category, tag, hero_image, kind, accent_color, 
        text_color, subtitle_color, badge_color, layout_style, hero_headline, 
        hero_subtitle, badge_text, cta_label, highlights_json, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.title || id,
        body.shortDesc || body.description || '',
        body.category || 'Platform Service',
        body.tag || '',
        body.heroImage || body.image || '',
        body.kind || 'service',
        body.accentColor || '#1A3E26',
        body.textColor || '#FFFFFF',
        body.subtitleColor || 'rgba(255, 255, 255, 0.85)',
        body.badgeColor || '#D4AF37',
        body.layoutStyle || 'card-modern',
        body.heroHeadline || body.title || '',
        body.heroSubtitle || body.shortDesc || '',
        body.badgeText || 'Verified Platform Service',
        body.ctaLabel || 'Explore Service',
        JSON.stringify(Array.isArray(body.highlights) ? body.highlights : []),
        body.status || 'active'
      ]
    );
    existing = await db.queryOne('SELECT * FROM services WHERE id = ?', [id]);
  }

  const highlights = Array.isArray(body.highlights) ? body.highlights : parseJsonSafe(existing.highlights_json, []);

  await db.execute(
    `UPDATE services SET
      title = COALESCE(?, title),
      short_desc = COALESCE(?, short_desc),
      category = COALESCE(?, category),
      tag = COALESCE(?, tag),
      hero_image = COALESCE(?, hero_image),
      kind = COALESCE(?, kind),
      accent_color = COALESCE(?, accent_color),
      text_color = COALESCE(?, text_color),
      subtitle_color = COALESCE(?, subtitle_color),
      badge_color = COALESCE(?, badge_color),
      layout_style = COALESCE(?, layout_style),
      hero_headline = COALESCE(?, hero_headline),
      hero_subtitle = COALESCE(?, hero_subtitle),
      badge_text = COALESCE(?, badge_text),
      cta_label = COALESCE(?, cta_label),
      highlights_json = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      body.title,
      body.shortDesc,
      body.category,
      body.tag,
      body.heroImage || body.image,
      body.kind,
      body.accentColor,
      body.textColor,
      body.subtitleColor,
      body.badgeColor,
      body.layoutStyle,
      body.heroHeadline,
      body.heroSubtitle,
      body.badgeText,
      body.ctaLabel,
      JSON.stringify(highlights),
      id
    ]
  );

  // If subscriptions were sent in body, sync them
  if (Array.isArray(body.subscriptions)) {
    // Delete old subscriptions for this service and re-insert updated list
    await db.execute('DELETE FROM subscriptions WHERE service_id = ?', [id]);
    for (let i = 0; i < body.subscriptions.length; i++) {
      const plan = body.subscriptions[i];
      const planId = plan.id || `plan-${id}-${i + 1}-${Date.now()}`;
      await db.execute(
        `INSERT INTO subscriptions (id, service_id, name, badge, price_ngn, price_usd, billing_period, short_desc, offerings_json, active, highlighted, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          planId,
          id,
          plan.name || 'Tier',
          plan.badge || 'Standard',
          Number(plan.priceNgn) || 0,
          Number(plan.priceUsd) || Math.round((Number(plan.priceNgn) || 0) / 1600),
          plan.billingPeriod || 'monthly',
          plan.shortDesc || '',
          JSON.stringify(Array.isArray(plan.offerings) ? plan.offerings : []),
          plan.active !== false ? 1 : 0,
          plan.highlighted ? 1 : 0,
          i + 1
        ]
      );
    }
  }

  await logAdminAction(c, `Updated service/product "${body.title || existing.title}" (${id})`, adminName);

  const updatedService = await db.queryOne('SELECT * FROM services WHERE id = ?', [id]);
  const updatedSubs = await db.query('SELECT * FROM subscriptions WHERE service_id = ? ORDER BY sort_order ASC', [id]);
  return c.json(formatService(updatedService, updatedSubs));
});

// POST /api/services/:id/toggle (Admin Enable/Disable Service)
serviceRoutes.post('/:id/toggle', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  const existing = await db.queryOne('SELECT * FROM services WHERE id = ?', [id]);
  if (!existing) return c.json({ error: 'Service not found' }, 404);

  const nextStatus = existing.status === 'disabled' ? 'active' : 'disabled';
  await db.execute('UPDATE services SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nextStatus, id]);

  await logAdminAction(c, `${nextStatus === 'disabled' ? 'Disabled' : 'Enabled'} service "${existing.title}" (${id})`, adminName);

  const updatedService = await db.queryOne('SELECT * FROM services WHERE id = ?', [id]);
  const subs = await db.query('SELECT * FROM subscriptions WHERE service_id = ? ORDER BY sort_order ASC', [id]);
  return c.json(formatService(updatedService, subs));
});

// POST /api/services/:id/subscriptions (Add subscription plan)
serviceRoutes.post('/:id/subscriptions', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  const planId = body.id || `plan-${Date.now()}`;
  const priceNgn = Number(body.priceNgn) || 0;
  const priceUsd = Number(body.priceUsd) || Math.round(priceNgn / 1600);

  await db.execute(
    `INSERT INTO subscriptions (id, service_id, name, badge, price_ngn, price_usd, billing_period, short_desc, offerings_json, active, highlighted, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      planId,
      id,
      body.name || 'New Subscription Tier',
      body.badge || 'Standard Tier',
      priceNgn,
      priceUsd,
      body.billingPeriod || 'monthly',
      body.shortDesc || '',
      JSON.stringify(Array.isArray(body.offerings) ? body.offerings : []),
      body.active !== false ? 1 : 0,
      body.highlighted ? 1 : 0,
      99
    ]
  );

  await logAdminAction(c, `Added new subscription tier "${body.name || planId}" to service ${id}`, adminName);

  const service = await db.queryOne('SELECT * FROM services WHERE id = ?', [id]);
  const subs = await db.query('SELECT * FROM subscriptions WHERE service_id = ? ORDER BY sort_order ASC', [id]);
  return c.json(formatService(service, subs), 201);
});

// PUT /api/services/:id/subscriptions/:planId
serviceRoutes.put('/:id/subscriptions/:planId', async (c) => {
  const db = getDb(c);
  const { id, planId } = c.req.param();
  const body = await c.req.json().catch(() => ({}));

  const priceNgn = body.priceNgn !== undefined ? Number(body.priceNgn) : null;
  const priceUsd = priceNgn !== null ? Math.round(priceNgn / 1600) : null;

  await db.execute(
    `UPDATE subscriptions SET
      name = COALESCE(?, name),
      badge = COALESCE(?, badge),
      price_ngn = COALESCE(?, price_ngn),
      price_usd = COALESCE(?, price_usd),
      billing_period = COALESCE(?, billing_period),
      short_desc = COALESCE(?, short_desc),
      offerings_json = COALESCE(?, offerings_json),
      active = COALESCE(?, active),
      highlighted = COALESCE(?, highlighted)
    WHERE id = ? AND service_id = ?`,
    [
      body.name,
      body.badge,
      priceNgn,
      priceUsd,
      body.billingPeriod,
      body.shortDesc,
      body.offerings ? JSON.stringify(body.offerings) : null,
      body.active !== undefined ? (body.active ? 1 : 0) : null,
      body.highlighted !== undefined ? (body.highlighted ? 1 : 0) : null,
      planId,
      id
    ]
  );

  const service = await db.queryOne('SELECT * FROM services WHERE id = ?', [id]);
  const subs = await db.query('SELECT * FROM subscriptions WHERE service_id = ? ORDER BY sort_order ASC', [id]);
  return c.json(formatService(service, subs));
});

// DELETE /api/services/:id/subscriptions/:planId
serviceRoutes.delete('/:id/subscriptions/:planId', async (c) => {
  const db = getDb(c);
  const { id, planId } = c.req.param();
  await db.execute('DELETE FROM subscriptions WHERE id = ? AND service_id = ?', [planId, id]);

  const service = await db.queryOne('SELECT * FROM services WHERE id = ?', [id]);
  const subs = await db.query('SELECT * FROM subscriptions WHERE service_id = ? ORDER BY sort_order ASC', [id]);
  return c.json(formatService(service, subs));
});
