import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcryptjs from 'bcryptjs';
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
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )`,

    // Unavailable dates table
    `CREATE TABLE IF NOT EXISTS unavailable_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_ms INTEGER NOT NULL UNIQUE,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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


  ];

  for (const tableSQL of tables) {
    await db.exec(tableSQL);
  }

  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token)',
    'CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(desired_date)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)',
    'CREATE INDEX IF NOT EXISTS idx_unavailable_dates_date ON unavailable_dates(date_ms)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(type)'
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
    const passwordHash = await bcryptjs.hash(adminPassword, 12);
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
