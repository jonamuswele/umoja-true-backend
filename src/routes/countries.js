import { Hono } from 'hono';
import { getDb } from '../db.js';
import { logAdminAction } from '../middleware/auth.js';

export const countryRoutes = new Hono();

function parseJsonSafe(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

// GET /api/countries & /api
const handleGetCountries = async (c) => {
  const db = getDb(c);
  const countries = await db.query('SELECT * FROM countries ORDER BY name ASC');
  const plots = await db.query('SELECT * FROM plots ORDER BY created_at DESC');

  const plotsByCountry = {};
  for (const plot of plots) {
    if (!plotsByCountry[plot.country_id]) plotsByCountry[plot.country_id] = [];
    plotsByCountry[plot.country_id].push({
      id: plot.id,
      title: plot.title,
      size: plot.size,
      price: plot.price,
      neighborhood: plot.neighborhood,
      owner: plot.owner_username,
      owner_username: plot.owner_username,
      photos: parseJsonSafe(plot.photos_json, []),
      isHidden: !!plot.is_hidden,
      views: Number(plot.views_count) || 0
    });
  }

  const result = countries.map(country => ({
    id: country.id,
    name: country.name,
    flag: country.flag,
    motto: country.motto,
    desc: country.desc,
    videoUrl: country.video_url,
    accent: country.accent,
    highlights: parseJsonSafe(country.highlights_json, []),
    potentialNeighborhoods: parseJsonSafe(country.potential_neighborhoods_json, []),
    cultureInfo: parseJsonSafe(country.culture_info_json, {}),
    isHidden: !!country.is_hidden,
    plots: plotsByCountry[country.id] || []
  }));

  return c.json(result);
};

countryRoutes.get('/', handleGetCountries);
countryRoutes.get('/countries', handleGetCountries);

// POST /api/countries (Admin Adds New Country)
const handlePostCountry = async (c) => {
  const db = getDb(c);
  const body = await c.req.json().catch(() => ({}));
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  const id = body.id || (body.name || 'country').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 10);
  const name = body.name || 'New Country';
  const flag = body.flag || '🌍';

  await db.execute(
    `INSERT INTO countries (id, name, flag, motto, desc, video_url, accent, highlights_json, potential_neighborhoods_json, culture_info_json, is_hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, '[]', '[]', '{}', 0)`,
    [
      id,
      name,
      flag,
      body.motto || `Explore Prime Land & Real Estate in ${name}`,
      body.desc || `Verified land plots, residential apartments, and commercial parcels across ${name}.`,
      body.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-and-buildings-4672-large.mp4',
      body.accent || '#1A3E26'
    ]
  );

  await logAdminAction(c, `Added new country "${name}" (${id})`, adminName);

  const created = await db.queryOne('SELECT * FROM countries WHERE id = ?', [id]);
  return c.json({
    id: created.id,
    name: created.name,
    flag: created.flag,
    motto: created.motto,
    desc: created.desc,
    videoUrl: created.video_url,
    accent: created.accent,
    highlights: [],
    potentialNeighborhoods: [],
    cultureInfo: {},
    plots: []
  }, 201);
};

countryRoutes.post('/', handlePostCountry);
countryRoutes.post('/countries', handlePostCountry);

// PUT /api/countries/:countryId
countryRoutes.put('/:countryId', async (c) => {
  const db = getDb(c);
  const countryId = c.req.param('countryId');
  const body = await c.req.json().catch(() => ({}));
  const adminName = c.req.header('X-User-Username') || 'Victoria Adeleke';

  await db.execute(
    `UPDATE countries SET
      motto = COALESCE(?, motto),
      desc = COALESCE(?, desc),
      video_url = COALESCE(?, video_url),
      accent = COALESCE(?, accent),
      highlights_json = COALESCE(?, highlights_json),
      potential_neighborhoods_json = COALESCE(?, potential_neighborhoods_json),
      culture_info_json = COALESCE(?, culture_info_json)
    WHERE id = ?`,
    [
      body.motto,
      body.desc,
      body.videoUrl,
      body.accent,
      body.highlights ? JSON.stringify(body.highlights) : null,
      body.potentialNeighborhoods ? JSON.stringify(body.potentialNeighborhoods) : null,
      body.cultureInfo ? JSON.stringify(body.cultureInfo) : null,
      countryId
    ]
  );

  await logAdminAction(c, `Updated specifications for country ${countryId}`, adminName);

  const updated = await db.queryOne('SELECT * FROM countries WHERE id = ?', [countryId]);
  return c.json(updated);
});

// POST /api/plots
countryRoutes.post('/plots', async (c) => {
  const db = getDb(c);
  const body = await c.req.json().catch(() => ({}));
  const username = c.req.header('X-User-Username') || 'usr-001';

  const id = body.id || `plot-${Date.now()}`;
  const rawCountryId = (body.country_id || 'ng').trim();
  const countryId = rawCountryId.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 10) || 'ng';

  // Ensure country exists to prevent foreign key violation!
  const countryCheck = await db.queryOne('SELECT id FROM countries WHERE id = ?', [countryId]);
  if (!countryCheck) {
    const countryName = rawCountryId.length > 2 ? rawCountryId : (countryId === 'ng' ? 'Nigeria' : countryId.toUpperCase());
    await db.execute(
      `INSERT INTO countries (id, name, flag, motto, desc, video_url, accent, highlights_json, potential_neighborhoods_json, culture_info_json, is_hidden)
       VALUES (?, ?, '🌍', 'Prime Real Estate & Plots', 'Verified prime land and residential parcels.', 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-and-buildings-4672-large.mp4', '#1A3E26', '[]', '[]', '{}', 0)`,
      [countryId, countryName]
    );
  }

  await db.execute(
    `INSERT INTO plots (id, country_id, title, size, price, neighborhood, owner_username, photos_json, is_hidden, views_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [
      id,
      countryId,
      body.title || 'Untitled Plot',
      body.size || '600 SQM',
      body.price || '₦25,000,000',
      body.neighborhood || 'Prime Corridor',
      username,
      JSON.stringify(Array.isArray(body.photos) ? body.photos : [])
    ]
  );

  const created = await db.queryOne('SELECT * FROM plots WHERE id = ?', [id]);
  return c.json({
    id: created.id,
    country_id: created.country_id,
    title: created.title,
    size: created.size,
    price: created.price,
    neighborhood: created.neighborhood,
    owner: created.owner_username,
    photos: parseJsonSafe(created.photos_json, [])
  }, 201);
});

// PUT /api/plots/:plotId
countryRoutes.put('/plots/:plotId', async (c) => {
  const db = getDb(c);
  const plotId = c.req.param('plotId');
  const body = await c.req.json().catch(() => ({}));

  await db.execute(
    `UPDATE plots SET
      title = COALESCE(?, title),
      size = COALESCE(?, size),
      price = COALESCE(?, price),
      neighborhood = COALESCE(?, neighborhood),
      photos_json = COALESCE(?, photos_json)
    WHERE id = ?`,
    [
      body.title,
      body.size,
      body.price,
      body.neighborhood,
      body.photos ? JSON.stringify(body.photos) : null,
      plotId
    ]
  );

  const updated = await db.queryOne('SELECT * FROM plots WHERE id = ?', [plotId]);
  return c.json({
    id: updated.id,
    title: updated.title,
    size: updated.size,
    price: updated.price,
    neighborhood: updated.neighborhood,
    photos: parseJsonSafe(updated.photos_json, [])
  });
});

// DELETE /api/plots/:plotId
countryRoutes.delete('/plots/:plotId', async (c) => {
  const db = getDb(c);
  const plotId = c.req.param('plotId');
  await db.execute('DELETE FROM plots WHERE id = ?', [plotId]);
  return c.json({ status: 'success', plotId });
});

// POST /api/plots/:plotId/view
countryRoutes.post('/plots/:plotId/view', async (c) => {
  const db = getDb(c);
  const plotId = c.req.param('plotId');
  await db.execute('UPDATE plots SET views_count = views_count + 1 WHERE id = ?', [plotId]);
  return c.json({ success: true, plotId });
});

// POST /api/inquiries
countryRoutes.post('/inquiries', async (c) => {
  const db = getDb(c);
  const body = await c.req.json().catch(() => ({}));

  const inqId = `inq-${Math.floor(100000 + Math.random() * 900000)}`;
  await db.execute(
    `INSERT INTO inquiries (id, plot_id, full_name, email, phone, current_city, message, type, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      inqId,
      body.plot_id || body.plotId || '',
      body.fullName || body.name || 'Anonymous',
      body.email || '',
      body.phone || '',
      body.currentCity || '',
      body.message || '',
      body.type || 'direct',
      new Date().toISOString()
    ]
  );

  // If associated with a listing/plot, increment inquiry count
  if (body.plot_id) {
    await db.execute('UPDATE listings SET inquiries_count = inquiries_count + 1 WHERE id = ?', [body.plot_id]);
  }

  return c.json({
    id: inqId,
    plotId: body.plot_id,
    fullName: body.fullName,
    email: body.email,
    phone: body.phone,
    currentCity: body.currentCity,
    message: body.message,
    type: body.type,
    timestamp: new Date().toISOString()
  }, 201);
});

// GET /api/stats/dashboard
countryRoutes.get('/stats/dashboard', async (c) => {
  const db = getDb(c);
  const role = c.req.header('X-User-Role');
  const username = c.req.header('X-User-Username');

  const listings = await db.query('SELECT * FROM listings');
  const plots = await db.query('SELECT * FROM plots');
  const inquiries = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');

  let totalViews = 0;
  for (const l of listings) totalViews += Number(l.views_count) || 0;
  for (const p of plots) totalViews += Number(p.views_count) || 0;

  const totalInquiries = inquiries.length;
  const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : '0.0';

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const viewsChart = days.map((day, idx) => ({
    day,
    count: idx === 5 ? Math.round(totalViews * 0.35) : Math.round(totalViews * 0.1),
    active: idx === 6
  }));

  const leads = inquiries.slice(0, 10).map(inq => ({
    id: inq.id,
    fullName: inq.full_name,
    email: inq.email,
    phone: inq.phone,
    currentCity: inq.current_city,
    message: inq.message,
    type: inq.type,
    timestamp: inq.timestamp || inq.created_at,
    plotTitle: 'Verified Listing Parcel',
    plotId: inq.plot_id
  }));

  return c.json({
    totalViews,
    totalInquiries,
    conversionRate,
    leads,
    viewsChart
  });
});

