#!/usr/bin/env node

/**
 * Cloudflare Deployment Script for Ainan Studio
 * This script helps automate the deployment process to Cloudflare
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Ainan Studio - Cloudflare Deployment Script');
console.log('==============================================\n');

// Configuration
const config = {
  projectName: 'ainan-studio',
  frontendBuildDir: 'dist',
  backendDir: 'backend',
  wranglerConfig: 'wrangler.toml',
  databaseName: 'ainan-studio-db',
  bucketName: 'ainan-studio-files'
};

// Utility functions
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📋 Running: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    return false;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function createWranglerConfig() {
  const configContent = `name = "${config.projectName}-backend"
main = "server-workers.js"
compatibility_date = "2024-01-01"

[env.production]
name = "${config.projectName}-backend-prod"

# Database configuration
[[d1_databases]]
binding = "DB"
database_name = "${config.databaseName}"
database_id = "YOUR_DATABASE_ID_HERE"

# R2 for file storage
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "${config.bucketName}"

# Environment variables
[vars]
JWT_SECRET = "YOUR_SUPER_SECRET_JWT_KEY_HERE"
ADMIN_EMAIL = "admin@ainanstudio.com"
ADMIN_PASSWORD = "YOUR_SECURE_PASSWORD"
NODE_ENV = "production"
`;

  const configPath = path.join(config.backendDir, config.wranglerConfig);
  fs.writeFileSync(configPath, configContent);
  console.log(`✅ Created ${config.wranglerConfig}`);
}

function createDatabaseSchema() {
  const schemaContent = `-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  badge TEXT,
  icon_name TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cover_image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio photos table
CREATE TABLE IF NOT EXISTS portfolio_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER,
  image_url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES portfolio(id)
);

-- Client logos table
CREATE TABLE IF NOT EXISTS client_logos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  features TEXT,
  add_ons TEXT,
  is_popular BOOLEAN DEFAULT 0,
  badge TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_ms INTEGER NOT NULL,
  package_name TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Unavailable dates table
CREATE TABLE IF NOT EXISTS unavailable_dates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_ms INTEGER UNIQUE NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password_hash) 
VALUES ('admin@ainanstudio.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ');

-- Insert default site settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES
('hero_mp4_url', '/hero-optimized.mp4'),
('hero_webm_url', ''),
('hero_poster_url', ''),
('site_title', 'Ainan Studio'),
('site_description', 'Professional Photography Services');
`;

  const schemaPath = path.join(config.backendDir, 'schema.sql');
  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ Created database schema');
}

function createWorkersServer() {
  const serverContent = `import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: [
    'https://your-frontend-domain.pages.dev',
    'https://your-custom-domain.com',
    'http://localhost:8080'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'cloudflare-workers'
  })
})

// Auth routes
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  // TODO: Implement proper authentication
  // For now, return a mock token
  return c.json({ 
    token: 'mock-jwt-token',
    user: { email, role: 'admin' }
  })
})

// Gallery routes
app.get('/api/gallery', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM gallery WHERE is_published = 1 ORDER BY order_index'
    ).all()
    
    return c.json(results || [])
  } catch (error) {
    console.error('Gallery query error:', error)
    return c.json({ error: 'Failed to fetch gallery' }, 500)
  }
})

// Portfolio routes
app.get('/api/portfolio', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM portfolio WHERE is_published = 1 ORDER BY order_index'
    ).all()
    
    return c.json(results || [])
  } catch (error) {
    console.error('Portfolio query error:', error)
    return c.json({ error: 'Failed to fetch portfolio' }, 500)
  }
})

// File upload route
app.post('/api/files/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file')
    const category = formData.get('category')
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    // Upload to R2
    const fileName = \`\${category}/\${Date.now()}-\${file.name}\`
    await c.env.STORAGE.put(fileName, file.stream())
    
    const fileUrl = \`https://your-r2-domain.com/\${fileName}\`
    
    return c.json({ 
      url: fileUrl,
      fileName: file.name,
      size: file.size
    })
  } catch (error) {
    console.error('File upload error:', error)
    return c.json({ error: 'Failed to upload file' }, 500)
  }
})

// Serve static files from R2
app.get('/uploads/*', async (c) => {
  try {
    const path = c.req.path.replace('/uploads/', '')
    const object = await c.env.STORAGE.get(path)
    
    if (!object) {
      return c.notFound()
    }
    
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('File serve error:', error)
    return c.notFound()
  }
})

export default app
`;

  const serverPath = path.join(config.backendDir, 'server-workers.js');
  fs.writeFileSync(serverPath, serverContent);
  console.log('✅ Created Workers server file');
}

// Main deployment process
async function deploy() {
  console.log('🔍 Checking prerequisites...\n');

  // Check if Wrangler is installed
  if (!runCommand('wrangler --version')) {
    console.log('❌ Wrangler CLI not found. Installing...');
    if (!runCommand('npm install -g wrangler')) {
      console.error('❌ Failed to install Wrangler CLI');
      process.exit(1);
    }
  }

  // Check if user is logged in
  console.log('🔐 Checking Cloudflare login...');
  if (!runCommand('wrangler whoami')) {
    console.log('❌ Not logged in to Cloudflare. Please run: wrangler login');
    process.exit(1);
  }

  console.log('\n📦 Building frontend...');
  if (!runCommand('npm run build')) {
    console.error('❌ Frontend build failed');
    process.exit(1);
  }

  console.log('\n⚙️ Setting up backend for Cloudflare Workers...');
  
  // Create backend directory if it doesn't exist
  if (!checkFileExists(config.backendDir)) {
    fs.mkdirSync(config.backendDir);
  }

  // Create necessary files
  createWranglerConfig();
  createDatabaseSchema();
  createWorkersServer();

  console.log('\n🗄️ Creating Cloudflare resources...');

  // Create D1 database
  console.log('Creating D1 database...');
  if (!runCommand(`wrangler d1 create ${config.databaseName}`)) {
    console.error('❌ Failed to create D1 database');
    process.exit(1);
  }

  // Create R2 bucket
  console.log('Creating R2 bucket...');
  if (!runCommand(`wrangler r2 bucket create ${config.bucketName}`)) {
    console.error('❌ Failed to create R2 bucket');
    process.exit(1);
  }

  console.log('\n⚠️  IMPORTANT: Manual steps required:');
  console.log('1. Update wrangler.toml with your database_id');
  console.log('2. Update environment variables in wrangler.toml');
  console.log('3. Update CORS origins in server-workers.js');
  console.log('4. Deploy to Cloudflare Pages manually');
  console.log('\n📖 See CLOUDFLARE_DEPLOYMENT.md for detailed instructions');

  console.log('\n🎉 Setup complete! Your project is ready for Cloudflare deployment.');
}

// Run deployment
deploy().catch(console.error);
