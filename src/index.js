import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth.js';
import { authRoutes } from './routes/auth.js';
import { listingRoutes } from './routes/listings.js';
import { serviceRoutes } from './routes/services.js';
import { messageRoutes } from './routes/messages.js';
import { notificationRoutes } from './routes/notifications.js';
import { adminRoutes } from './routes/admin.js';
import { countryRoutes } from './routes/countries.js';

const app = new Hono();

// Security Feature: CORS & Headers
app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-User-Username', 'X-User-Role', 'X-User-Id'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
    credentials: true
  })
);

// Global Security & Authentication Middleware
app.use('*', authMiddleware);

// Health Check Endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    platform: 'Umoja Terra Infrastructure Platform API',
    engine: 'Hono on Cloudflare / Node',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.route('/api/auth', authRoutes);
app.route('/api/listings', listingRoutes);
app.route('/api/services', serviceRoutes);
app.route('/api/messages', messageRoutes);
app.route('/api/notifications', notificationRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api', countryRoutes); // Handles /api/countries, /api/plots, /api/inquiries, /api/stats

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled API Error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
