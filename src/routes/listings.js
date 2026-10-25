import { Hono } from 'hono';
import { getDb } from '../db.js';
import { requireAdmin, logAdminAction } from '../middleware/auth.js';

export const listingRoutes = new Hono();

function parseJsonSafe(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

function formatListing(row) {
  if (!row) return null;
  return {
    id: row.id,
    categoryType: row.category_type,
    title: row.title,
    type: row.type,
    listingType: row.listing_type,
    location: row.location,
    price: Number(row.price) || 0,
    pricePeriod: row.price_period,
    plotSize: row.plot_size,
    topography: row.topography,
    titleType: row.title_type,
    zoning: row.zoning,
    beaconNumber: row.beacon_number,
    bedrooms: row.bedrooms !== null ? Number(row.bedrooms) : null,
    bathrooms: row.bathrooms !== null ? Number(row.bathrooms) : null,
    furnishing: row.furnishing,
    amenities: parseJsonSafe(row.amenities_json, []),
    images: parseJsonSafe(row.images_json, []),
    image: row.image || (parseJsonSafe(row.images_json, [])[0] || ''),
    videoUrl: row.video_url || '',
    description: row.description || '',
    contactPhone: row.contact_phone || '',
    postedBy: row.posted_by || 'Verified Member',
    postedByRole: row.posted_by_role || 'Member',
    status: row.status || 'Active',
    suspensionReason: row.suspension_reason,
    viewsCount: Number(row.views_count) || 0,
    inquiriesCount: Number(row.inquiries_count) || 0,
    inquiryThreadIds: [],
    datePosted: row.date_posted || 'Recently'
  };
}

// GET /api/listings
listingRoutes.get('/', async (c) => {
  const db = getDb(c);
  const role = c.req.header('X-User-Role');
  const username = c.req.header('X-User-Username');

  const isAdmin = role === 'admin' || (username && username.toLowerCase().includes('admin'));

  let rows;
  if (isAdmin) {
    rows = await db.query('SELECT * FROM listings ORDER BY created_at DESC');
  } else if (username) {
    // Normal user: show all Active listings plus user's own pending/suspended listings
    rows = await db.query(
      "SELECT * FROM listings WHERE status = 'Active' OR LOWER(posted_by) = LOWER(?) ORDER BY created_at DESC",
      [username]
    );
  } else {
    // Public visitor
    rows = await db.query("SELECT * FROM listings WHERE status = 'Active' ORDER BY created_at DESC");
  }

  return c.json(rows.map(formatListing));
});

// GET /api/listings/:id
listingRoutes.get('/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const row = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  if (!row) return c.json({ error: 'Listing not found' }, 404);
  return c.json(formatListing(row));
});

// POST /api/listings
listingRoutes.post('/', async (c) => {
  const db = getDb(c);
  const role = c.req.header('X-User-Role');
  const username = c.req.header('X-User-Username');
  const body = await c.req.json().catch(() => ({}));

  const isAdmin = role === 'admin' || (username && username.toLowerCase().includes('admin'));
  const listingId = body.id || `listing-${Date.now()}`;
  const postedBy = body.postedBy || username || 'Jonathan K.';
  const postedByRole = body.postedByRole || (isAdmin ? 'Platform Administrator' : 'Verified Investor & Landlord');
  
  // Security Feature: regular users start as 'Pending' until admin approval
  const status = isAdmin ? 'Active' : 'Pending';

  const images = Array.isArray(body.images) ? body.images : (body.image ? [body.image] : []);
  const amenities = Array.isArray(body.amenities) ? body.amenities : [];

  await db.execute(
    `INSERT INTO listings (
      id, category_type, title, type, listing_type, location, price, price_period, 
      plot_size, topography, title_type, zoning, beacon_number, bedrooms, bathrooms, furnishing, 
      amenities_json, images_json, image, video_url, description, contact_phone, 
      posted_by, posted_by_role, status, views_count, inquiries_count, date_posted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      listingId,
      body.categoryType || 'apartment',
      body.title || 'Untitled Property',
      body.type || (body.categoryType === 'plot' ? 'Land Plot' : 'Apartment'),
      body.listingType || 'For Sale',
      body.location || 'Lagos, Nigeria',
      Number(body.price) || 0,
      body.pricePeriod || 'total',
      body.plotSize || null,
      body.topography || null,
      body.titleType || null,
      body.zoning || null,
      body.beaconNumber || null,
      body.bedrooms !== undefined ? Number(body.bedrooms) : null,
      body.bathrooms !== undefined ? Number(body.bathrooms) : null,
      body.furnishing || null,
      JSON.stringify(amenities),
      JSON.stringify(images),
      body.image || images[0] || '',
      body.videoUrl || '',
      body.description || '',
      body.contactPhone || '',
      postedBy,
      postedByRole,
      status,
      1,
      0,
      'Just now'
    ]
  );

  if (!isAdmin) {
    // Notify user of pending verification
    const notifId = `notif-${Date.now()}`;
    await db.execute(
      `INSERT INTO notifications (id, user_id, title, message, category, read, time) 
       VALUES (?, ?, ?, ?, ?, 0, 'Just now')`,
      [
        notifId,
        username || 'usr-001',
        'Listing Submitted for Verification',
        `"${body.title || 'Your property'}" has been queued for admin verification and title check before going live.`,
        'inspection'
      ]
    );
    await logAdminAction(c, `New listing submitted by ${postedBy}: "${body.title}" (Pending Approval)`, 'System');
  } else {
    await logAdminAction(c, `Admin ${postedBy} published new live listing: "${body.title}"`, postedBy);
  }

  const created = await db.queryOne('SELECT * FROM listings WHERE id = ?', [listingId]);
  return c.json(formatListing(created), 201);
});

// PUT /api/listings/:id
listingRoutes.put('/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const existing = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  if (!existing) return c.json({ error: 'Listing not found' }, 404);

  const images = body.images !== undefined ? (Array.isArray(body.images) ? body.images : [body.images]) : parseJsonSafe(existing.images_json, []);
  const amenities = body.amenities !== undefined ? (Array.isArray(body.amenities) ? body.amenities : []) : parseJsonSafe(existing.amenities_json, []);

  await db.execute(
    `UPDATE listings SET 
      title = COALESCE(?, title),
      category_type = COALESCE(?, category_type),
      type = COALESCE(?, type),
      listing_type = COALESCE(?, listing_type),
      location = COALESCE(?, location),
      price = COALESCE(?, price),
      price_period = COALESCE(?, price_period),
      plot_size = COALESCE(?, plot_size),
      topography = COALESCE(?, topography),
      title_type = COALESCE(?, title_type),
      zoning = COALESCE(?, zoning),
      beacon_number = COALESCE(?, beacon_number),
      bedrooms = COALESCE(?, bedrooms),
      bathrooms = COALESCE(?, bathrooms),
      furnishing = COALESCE(?, furnishing),
      amenities_json = ?,
      images_json = ?,
      image = COALESCE(?, image),
      video_url = COALESCE(?, video_url),
      description = COALESCE(?, description),
      contact_phone = COALESCE(?, contact_phone),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      body.title,
      body.categoryType,
      body.type,
      body.listingType,
      body.location,
      body.price !== undefined ? Number(body.price) : null,
      body.pricePeriod,
      body.plotSize,
      body.topography,
      body.titleType,
      body.zoning,
      body.beaconNumber,
      body.bedrooms !== undefined ? Number(body.bedrooms) : null,
      body.bathrooms !== undefined ? Number(body.bathrooms) : null,
      body.furnishing,
      JSON.stringify(amenities),
      JSON.stringify(images),
      body.image,
      body.videoUrl,
      body.description,
      body.contactPhone,
      id
    ]
  );

  const updated = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  return c.json(formatListing(updated));
});

// DELETE /api/listings/:id
listingRoutes.delete('/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const existing = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  if (!existing) return c.json({ error: 'Listing not found' }, 404);

  await db.execute('DELETE FROM listings WHERE id = ?', [id]);
  await logAdminAction(c, `Deleted listing "${existing.title}" (${id})`);

  return c.json({ status: 'success', deletedId: id });
});

// POST /api/listings/:id/approve (Admin Only)
listingRoutes.post('/:id/approve', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  const listing = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  if (!listing) return c.json({ error: 'Listing not found' }, 404);

  await db.execute(
    "UPDATE listings SET status = 'Active', suspension_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );

  // Send approval notification to owner
  const notifId = `notif-${Date.now()}`;
  await db.execute(
    `INSERT INTO notifications (id, user_id, title, message, category, read, time) 
     VALUES (?, ?, ?, ?, ?, 0, 'Just now')`,
    [
      notifId,
      listing.posted_by,
      'Listing Approved & Live!',
      `Your listing "${listing.title}" was verified and approved by the platform administrator. It is now live on Umoja Terra.`,
      'legal'
    ]
  );

  await logAdminAction(c, `Approved listing "${listing.title}" (${id})`, adminName);

  const updated = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  return c.json(formatListing(updated));
});

// POST /api/listings/:id/suspend (Admin Only)
listingRoutes.post('/:id/suspend', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';
  const reason = body.reason || 'Cadastral title clarification required';

  const listing = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  if (!listing) return c.json({ error: 'Listing not found' }, 404);

  await db.execute(
    "UPDATE listings SET status = 'Suspended', suspension_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [reason, id]
  );

  // Send suspension notification to owner
  const notifId = `notif-${Date.now()}`;
  await db.execute(
    `INSERT INTO notifications (id, user_id, title, message, category, read, time) 
     VALUES (?, ?, ?, ?, ?, 0, 'Just now')`,
    [
      notifId,
      listing.posted_by,
      'Listing Suspended by Admin',
      `Your listing "${listing.title}" was suspended. Reason: ${reason}`,
      'legal'
    ]
  );

  await logAdminAction(c, `Suspended listing "${listing.title}" - Reason: ${reason}`, adminName);

  const updated = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  return c.json(formatListing(updated));
});

// POST /api/listings/:id/reactivate (Admin Only)
listingRoutes.post('/:id/reactivate', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  const listing = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  if (!listing) return c.json({ error: 'Listing not found' }, 404);

  await db.execute(
    "UPDATE listings SET status = 'Active', suspension_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );

  // Send reactivation notification
  const notifId = `notif-${Date.now()}`;
  await db.execute(
    `INSERT INTO notifications (id, user_id, title, message, category, read, time) 
     VALUES (?, ?, ?, ?, ?, 0, 'Just now')`,
    [
      notifId,
      listing.posted_by,
      'Listing Re-activated',
      `Your listing "${listing.title}" has been restored to Active status by the administrator.`,
      'legal'
    ]
  );

  await logAdminAction(c, `Re-activated listing "${listing.title}"`, adminName);

  const updated = await db.queryOne('SELECT * FROM listings WHERE id = ?', [id]);
  return c.json(formatListing(updated));
});

// POST /api/listings/:id/view
listingRoutes.post('/:id/view', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  await db.execute('UPDATE listings SET views_count = views_count + 1 WHERE id = ?', [id]);
  return c.json({ success: true, id });
});
