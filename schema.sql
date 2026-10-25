-- Umoja Terra Cloudflare D1 & SQLite Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  role_title TEXT DEFAULT 'Verified Member',
  password TEXT NOT NULL,
  is_suspended INTEGER NOT NULL DEFAULT 0,
  is_approved INTEGER NOT NULL DEFAULT 1,
  currency TEXT DEFAULT 'NGN',
  bio TEXT,
  member_since TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  category_type TEXT NOT NULL DEFAULT 'apartment', -- 'apartment' | 'plot'
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'For Sale',
  location TEXT NOT NULL,
  price REAL NOT NULL,
  price_period TEXT DEFAULT 'total',
  plot_size TEXT,
  topography TEXT,
  title_type TEXT,
  zoning TEXT,
  beacon_number TEXT,
  bedrooms REAL,
  bathrooms REAL,
  furnishing TEXT,
  amenities_json TEXT DEFAULT '[]',
  images_json TEXT DEFAULT '[]',
  image TEXT,
  video_url TEXT,
  description TEXT,
  contact_phone TEXT,
  posted_by TEXT,
  posted_by_role TEXT,
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending' | 'Active' | 'Suspended'
  suspension_reason TEXT,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  date_posted TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  short_desc TEXT,
  category TEXT,
  tag TEXT,
  hero_image TEXT,
  kind TEXT NOT NULL DEFAULT 'service', -- 'service' | 'product'
  accent_color TEXT DEFAULT '#1A3E26',
  text_color TEXT DEFAULT '#FFFFFF',
  subtitle_color TEXT DEFAULT 'rgba(255, 255, 255, 0.85)',
  badge_color TEXT DEFAULT '#D4AF37',
  layout_style TEXT DEFAULT 'card-modern',
  hero_headline TEXT,
  hero_subtitle TEXT,
  badge_text TEXT,
  cta_label TEXT,
  highlights_json TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'disabled'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  name TEXT NOT NULL,
  badge TEXT,
  price_ngn REAL NOT NULL DEFAULT 0,
  price_usd REAL NOT NULL DEFAULT 0,
  billing_period TEXT DEFAULT 'monthly',
  short_desc TEXT,
  offerings_json TEXT DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  highlighted INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message_threads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_avatar TEXT,
  contact_role TEXT,
  property_title TEXT,
  unread_count INTEGER DEFAULT 0,
  time TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'me' | 'other'
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  read INTEGER NOT NULL DEFAULT 0,
  time TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interested (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  service_id TEXT,
  title TEXT NOT NULL,
  location TEXT,
  price_ngn REAL,
  price_usd REAL,
  type TEXT,
  size TEXT,
  image TEXT,
  images_json TEXT DEFAULT '[]',
  video_url TEXT,
  title_type TEXT,
  owner_name TEXT,
  owner_avatar TEXT,
  owner_role TEXT,
  owner_thread_id TEXT,
  date_added TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  plot_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  current_city TEXT,
  message TEXT,
  type TEXT,
  timestamp TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  flag TEXT,
  motto TEXT,
  desc TEXT,
  video_url TEXT,
  accent TEXT,
  highlights_json TEXT DEFAULT '[]',
  potential_neighborhoods_json TEXT DEFAULT '[]',
  culture_info_json TEXT DEFAULT '{}',
  is_hidden INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plots (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL,
  title TEXT NOT NULL,
  size TEXT,
  price TEXT,
  neighborhood TEXT,
  owner_username TEXT,
  photos_json TEXT DEFAULT '[]',
  is_hidden INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  admin_name TEXT NOT NULL DEFAULT 'Victoria Adeleke',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
