# 🌐 Cloudflare Deployment Guide: Ainan Studio

This is a detailed, step-by-step guide for deploying your photography studio website to Cloudflare Pages and Workers.

## 🎯 Why Cloudflare?

- **Free Tier**: Generous limits for small to medium projects
- **Global CDN**: Lightning-fast loading worldwide
- **Built-in Security**: DDoS protection, SSL certificates
- **Developer-Friendly**: Easy deployment from Git
- **Cost-Effective**: Pay only for what you use

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repo
2. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
3. **Domain (Optional)**: You can use Cloudflare's free subdomain

## 🚀 Step 1: Frontend Deployment (Cloudflare Pages)

### **1.1 Prepare Your Project**

First, ensure your project builds correctly:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test the build locally
npm run preview
```

### **1.2 Deploy to Cloudflare Pages**

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Pages" in the sidebar

2. **Create New Project**
   - Click "Create a project"
   - Select "Connect to Git"
   - Choose your GitHub repository

3. **Configure Build Settings**
   ```
   Project name: ainan-studio-frontend
   Production branch: main
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
   Root directory: / (leave empty)
   ```

4. **Add Environment Variables**
   - Click "Environment variables"
   - Add the following:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.workers.dev
   VITE_APP_NAME=Ainan Studio
   VITE_APP_DESCRIPTION=Professional Photography Services
   ```

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete
   - Your site will be available at: `https://your-project-name.pages.dev`

### **1.3 Custom Domain (Optional)**

1. **Add Domain to Cloudflare**
   - Go to "Domains" in Cloudflare dashboard
   - Add your domain (e.g., `ainanstudio.com`)
   - Update DNS records as instructed

2. **Configure Pages Domain**
   - Go back to Pages project
   - Click "Custom domains"
   - Add your domain
   - Cloudflare will automatically configure SSL

## ⚙️ Step 2: Backend Deployment (Cloudflare Workers)

### **2.1 Install Wrangler CLI**

```bash
npm install -g wrangler
wrangler login
```

### **2.2 Create Worker Configuration**

Create `wrangler.toml` in your backend directory:

```toml
name = "ainan-studio-backend"
main = "server-workers.js"
compatibility_date = "2024-01-01"

[env.production]
name = "ainan-studio-backend-prod"

# Database configuration
[[d1_databases]]
binding = "DB"
database_name = "ainan-studio-db"
database_id = "your-database-id-here"

# KV for sessions (optional)
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-id"

# R2 for file storage
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "ainan-studio-files"
```

### **2.3 Create D1 Database**

```bash
# Create database
wrangler d1 create ainan-studio-db

# Copy the database_id from output to wrangler.toml
```

### **2.4 Create R2 Bucket for File Storage**

```bash
# Create R2 bucket
wrangler r2 bucket create ainan-studio-files
```

### **2.5 Adapt Backend for Workers**

Create `server-workers.js` in your backend directory:

```javascript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: [
    'https://your-frontend-domain.pages.dev',
    'https://your-custom-domain.com',
    'http://localhost:8080' // for development
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
  
  // Your login logic here
  // Use D1 database for user verification
  
  return c.json({ token: 'jwt-token-here' })
})

// Gallery routes
app.get('/api/gallery', async (c) => {
  // Fetch from D1 database
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM gallery WHERE is_published = 1 ORDER BY order_index'
  ).all()
  
  return c.json(results)
})

// Portfolio routes
app.get('/api/portfolio', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM portfolio WHERE is_published = 1 ORDER BY order_index'
  ).all()
  
  return c.json(results)
})

// File upload route
app.post('/api/files/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file')
  const category = formData.get('category')
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }
  
  // Upload to R2
  const fileName = `${category}/${Date.now()}-${file.name}`
  await c.env.STORAGE.put(fileName, file.stream())
  
  const fileUrl = `https://your-r2-domain.com/${fileName}`
  
  return c.json({ 
    url: fileUrl,
    fileName: file.name,
    size: file.size
  })
})

// Serve static files from R2
app.get('/uploads/*', async (c) => {
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
})

export default app
```

### **2.6 Initialize Database Schema**

Create `schema.sql`:

```sql
-- Users table
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
  features TEXT, -- JSON array
  add_ons TEXT, -- JSON array
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

-- Insert default admin user
INSERT OR IGNORE INTO users (email, password_hash) 
VALUES ('admin@ainanstudio.com', '$2b$10$your-hashed-password-here');

-- Insert default site settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES
('hero_mp4_url', '/hero-optimized.mp4'),
('hero_webm_url', ''),
('hero_poster_url', ''),
('site_title', 'Ainan Studio'),
('site_description', 'Professional Photography Services');
```

Apply the schema:

```bash
# Apply schema to D1 database
wrangler d1 execute ainan-studio-db --file=./schema.sql
```

### **2.7 Deploy Backend**

```bash
cd backend
wrangler deploy
```

Your backend will be available at: `https://your-worker-name.your-subdomain.workers.dev`

## 🔧 Step 3: Environment Configuration

### **3.1 Update Frontend Environment**

In Cloudflare Pages dashboard, update environment variables:

```
VITE_API_BASE_URL=https://your-worker-name.your-subdomain.workers.dev
VITE_APP_NAME=Ainan Studio
VITE_APP_DESCRIPTION=Professional Photography Services
```

### **3.2 Backend Environment Variables**

In `wrangler.toml`, add:

```toml
[vars]
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_EMAIL=admin@ainanstudio.com
ADMIN_PASSWORD=your-secure-password
NODE_ENV=production
```

## 📁 Step 4: File Storage Configuration

### **4.1 R2 Bucket Setup**

1. **Create R2 Bucket** (if not done already):
   ```bash
   wrangler r2 bucket create ainan-studio-files
   ```

2. **Configure Public Access**:
   - Go to R2 dashboard in Cloudflare
   - Select your bucket
   - Enable public access
   - Note the public URL

3. **Update Upload Route**:
   In your `server-workers.js`, update the file upload URL:
   ```javascript
   const fileUrl = `https://your-bucket-name.your-subdomain.r2.cloudflarestorage.com/${fileName}`
   ```

## 🔒 Step 5: Security Configuration

### **5.1 CORS Configuration**

Ensure your CORS settings include your frontend domain:

```javascript
app.use('*', cors({
  origin: [
    'https://your-frontend-domain.pages.dev',
    'https://your-custom-domain.com',
    'http://localhost:8080' // development only
  ],
  credentials: true
}))
```

### **5.2 Rate Limiting**

Add rate limiting to your Workers:

```javascript
import { rateLimit } from 'hono/rate-limit'

app.use('/api/*', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}))
```

## 📊 Step 6: Monitoring & Analytics

### **6.1 Cloudflare Analytics**

1. **Enable Analytics**:
   - Go to Pages dashboard
   - Click on your project
   - Go to "Analytics" tab
   - Enable "Web Analytics"

2. **View Metrics**:
   - Page views
   - Unique visitors
   - Performance metrics
   - Error rates

### **6.2 Workers Analytics**

1. **Monitor Workers**:
   - Go to Workers dashboard
   - Click on your worker
   - View "Metrics" tab
   - Monitor request count, errors, duration

## 🚀 Step 7: Performance Optimization

### **7.1 Frontend Optimization**

1. **Enable Compression**:
   - Cloudflare Pages automatically enables gzip
   - No additional configuration needed

2. **Cache Headers**:
   - Static assets are automatically cached
   - Images are served from global CDN

### **7.2 Backend Optimization**

1. **Database Indexing**:
   ```sql
   CREATE INDEX idx_gallery_published ON gallery(is_published, order_index);
   CREATE INDEX idx_portfolio_published ON portfolio(is_published, order_index);
   CREATE INDEX idx_bookings_date ON bookings(date_ms);
   ```

2. **Response Caching**:
   ```javascript
   // Add cache headers
   app.get('/api/gallery', async (c) => {
     const results = await c.env.DB.prepare('SELECT * FROM gallery WHERE is_published = 1').all()
     
     return c.json(results, 200, {
       'Cache-Control': 'public, max-age=300' // 5 minutes
     })
   })
   ```

## 🎯 Step 8: Testing & Verification

### **8.1 Test Checklist**

- ✅ **Frontend loads**: `https://your-domain.pages.dev`
- ✅ **Backend responds**: `https://your-worker.workers.dev/api/health`
- ✅ **Admin login works**: Test with your admin credentials
- ✅ **File uploads work**: Upload an image through admin panel
- ✅ **Gallery displays**: Check if images load correctly
- ✅ **Portfolio works**: Verify albums and photos display
- ✅ **Booking form**: Test booking submission
- ✅ **Mobile responsive**: Test on different screen sizes

### **8.2 Performance Testing**

1. **Page Speed**:
   - Use Google PageSpeed Insights
   - Target 90+ score for mobile and desktop

2. **Load Testing**:
   - Test with multiple concurrent users
   - Monitor Workers performance

## 💰 Step 9: Cost Management

### **9.1 Free Tier Limits**

- **Pages**: 100,000 requests/month
- **Workers**: 100,000 requests/day
- **D1**: 1,000,000 reads/day, 100,000 writes/day
- **R2**: 1,000,000 Class A operations/day, 10,000 Class B operations/day

### **9.2 Monitoring Usage**

1. **Check Usage**:
   - Go to Cloudflare dashboard
   - Monitor usage in "Billing" section
   - Set up alerts for approaching limits

2. **Optimize Costs**:
   - Implement caching to reduce database calls
   - Compress images before upload
   - Use CDN for static assets

## 🆘 Troubleshooting

### **Common Issues:**

1. **CORS Errors**:
   ```javascript
   // Ensure CORS includes your frontend domain
   origin: ['https://your-exact-domain.pages.dev']
   ```

2. **Database Connection**:
   ```bash
   # Test database connection
   wrangler d1 execute ainan-studio-db --command="SELECT 1"
   ```

3. **File Upload Issues**:
   - Check R2 bucket permissions
   - Verify bucket name in configuration
   - Test with smaller files first

4. **Build Failures**:
   - Check build logs in Pages dashboard
   - Verify all dependencies are installed
   - Test build locally first

### **Getting Help:**

- **Cloudflare Documentation**: [developers.cloudflare.com](https://developers.cloudflare.com)
- **Community Forum**: [community.cloudflare.com](https://community.cloudflare.com)
- **Support**: Available for paid plans

## 🎉 Success!

Your photography studio website is now deployed on Cloudflare with:

- ✅ **Global CDN** for lightning-fast loading
- ✅ **Automatic SSL** certificates
- ✅ **DDoS protection**
- ✅ **Scalable backend** with Workers
- ✅ **Reliable database** with D1
- ✅ **Cost-effective** file storage with R2
- ✅ **Built-in analytics** and monitoring

**Your website is ready for production!** 🚀

---

**Next Steps:**
1. Set up custom domain
2. Configure email notifications
3. Set up backup strategies
4. Monitor performance
5. Scale as needed
