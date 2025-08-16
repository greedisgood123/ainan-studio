import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let db;

export const initializeDatabase = async () => {
  try {
    const dbPath = process.env.DATABASE_PATH || './database/ainan_studio.db';
    
    console.log(`📦 Initializing database at: ${path.resolve(dbPath)}`);
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create all tables
    await createTables();
    
    // Create default admin user
    await createDefaultAdmin();
    
    console.log('✅ Database initialized successfully');
    
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const createTables = async () => {
  const tables = [
    // Admins table
    `CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,

    // Admin sessions table
    `CREATE TABLE IF NOT EXISTS admin_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
    )`,

    // Portfolio albums table
    `CREATE TABLE IF NOT EXISTS portfolio_albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      cover_image_url TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT false,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,

    // Portfolio photos table
    `CREATE TABLE IF NOT EXISTS portfolio_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      caption TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (album_id) REFERENCES portfolio_albums (id) ON DELETE CASCADE
    )`,

    // Gallery items table
    `CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      badge TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      image_url TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT false,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,

    // Packages table
    `CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT NOT NULL,
      features TEXT NOT NULL, -- JSON array
      add_ons TEXT NOT NULL,  -- JSON array
      is_popular BOOLEAN NOT NULL DEFAULT false,
      badge TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT false,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,

    // Bookings table
    `CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      desired_date INTEGER NOT NULL, -- Unix timestamp
      package_name TEXT,
      user_agent TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,

    // Unavailable dates table
    `CREATE TABLE IF NOT EXISTS unavailable_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_ms INTEGER NOT NULL UNIQUE,
      reason TEXT,
      created_at INTEGER NOT NULL
    )`,

    // Client logos table
    `CREATE TABLE IF NOT EXISTS client_logos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )`,

    // Analytics events table
    `CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      path TEXT NOT NULL,
      user_agent TEXT,
      referrer TEXT,
      created_at INTEGER NOT NULL
    )`,

    // Signups table
    `CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      package_name TEXT NOT NULL,
      user_agent TEXT,
      created_at INTEGER NOT NULL
    )`,

    // Site settings table
    `CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      mp4_url TEXT,
      webm_url TEXT,
      poster_url TEXT,
      updated_at INTEGER NOT NULL
    )`
  ];

  for (const tableSQL of tables) {
    await db.exec(tableSQL);
  }

  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token)',
    'CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at)',
    'CREATE INDEX IF NOT EXISTS idx_portfolio_albums_published ON portfolio_albums(is_published, order_index)',
    'CREATE INDEX IF NOT EXISTS idx_portfolio_albums_category ON portfolio_albums(category, order_index)',
    'CREATE INDEX IF NOT EXISTS idx_portfolio_photos_album ON portfolio_photos(album_id, order_index)',
    'CREATE INDEX IF NOT EXISTS idx_gallery_published ON gallery_items(is_published, order_index)',
    'CREATE INDEX IF NOT EXISTS idx_packages_published ON packages(is_published, order_index)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(desired_date)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)',
    'CREATE INDEX IF NOT EXISTS idx_unavailable_dates_date ON unavailable_dates(date_ms)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(type)',
    'CREATE INDEX IF NOT EXISTS idx_client_logos_order ON client_logos(order_index)',
    'CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key)'
  ];

  for (const indexSQL of indexes) {
    await db.exec(indexSQL);
  }

  console.log('✅ Database tables and indexes created');
};

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ainanstudio.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    const existingAdmin = await db.get('SELECT id FROM admins WHERE email = ?', adminEmail);
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const now = Date.now();

    await db.run(
      'INSERT INTO admins (email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [adminEmail, passwordHash, now, now]
    );

    console.log(`👤 Default admin created: ${adminEmail}`);
    console.log(`🔑 Default password: ${adminPassword}`);
    console.log('⚠️  Please change the default password after first login!');
  } catch (error) {
    console.error('❌ Failed to create default admin:', error);
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export { db };
