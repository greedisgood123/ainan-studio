# 🚀 Deployment Guide: Ainan Studio Photography Website

This guide covers deploying your photography studio website to various cloud providers. Your project is now fully migrated from Convex to a local Express.js backend, making it perfect for deployment to any cloud platform.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ **Backend migration completed** (Express.js + SQLite)
- ✅ **Frontend updated** (no Convex dependencies)
- ✅ **Environment variables configured**
- ✅ **Database initialized**
- ✅ **File uploads working locally**

## 🌐 Deployment Options

### **1. Cloudflare Pages + Workers (Recommended)**

Cloudflare offers excellent performance, global CDN, and generous free tier.

#### **Frontend Deployment (Cloudflare Pages)**

1. **Prepare your project:**
   ```bash
   # Build the frontend
   npm run build
   ```

2. **Create Cloudflare account:**
   - Go to [cloudflare.com](https://cloudflare.com)
   - Sign up for free account
   - Navigate to "Pages"

3. **Deploy frontend:**
   - Click "Create a project"
   - Connect your GitHub repository
   - Set build settings:
     ```
     Build command: npm run build
     Build output directory: dist
     Root directory: / (leave empty)
     ```
   - Add environment variables:
     ```
     VITE_API_BASE_URL=https://your-backend-domain.com
     ```

4. **Custom domain (optional):**
   - Add your domain in Cloudflare DNS
   - Configure Pages to use your domain

#### **Backend Deployment (Cloudflare Workers)**

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Create worker configuration:**
   Create `wrangler.toml` in your backend directory:
   ```toml
   name = "ainan-studio-backend"
   main = "server.js"
   compatibility_date = "2024-01-01"

   [env.production]
   name = "ainan-studio-backend-prod"

   [[kv_namespaces]]
   binding = "DB"
   id = "your-kv-namespace-id"
   preview_id = "your-preview-kv-id"
   ```

4. **Adapt backend for Workers:**
   ```javascript
   // server-workers.js
   import { Hono } from 'hono'
   import { cors } from 'hono/cors'
   import { jwt } from 'hono/jwt'
   
   const app = new Hono()
   
   app.use('*', cors({
     origin: ['https://your-frontend-domain.pages.dev'],
     credentials: true
   }))
   
   // Add your routes here
   app.get('/api/health', (c) => c.json({ status: 'ok' }))
   
   export default app
   ```

5. **Deploy backend:**
   ```bash
   cd backend
   wrangler deploy
   ```

#### **Database Options for Cloudflare:**

**Option A: Cloudflare D1 (SQLite)**
```bash
# Create D1 database
wrangler d1 create ainan-studio-db

# Add to wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "ainan-studio-db"
database_id = "your-database-id"
```

**Option B: Cloudflare KV (Key-Value)**
```bash
# Create KV namespace
wrangler kv:namespace create "AINAN_STUDIO_DATA"
```

### **2. Railway (Easy & Reliable)**

Railway is excellent for full-stack deployments with automatic scaling.

#### **Deployment Steps:**

1. **Sign up at [railway.app](https://railway.app)**

2. **Deploy backend:**
   - Create new project
   - Connect GitHub repository
   - Set root directory to `backend/`
   - Add environment variables:
     ```
     PORT=3001
     JWT_SECRET=your-super-secret-jwt-key
     ADMIN_EMAIL=admin@yourdomain.com
     ADMIN_PASSWORD=your-secure-password
     ```
   - Railway will auto-detect Node.js and deploy

3. **Deploy frontend:**
   - Create another project
   - Set root directory to `/` (root)
   - Add build command: `npm run build`
   - Add environment variables:
     ```
     VITE_API_BASE_URL=https://your-backend-railway-url.railway.app
     ```

4. **Database setup:**
   - Railway provides PostgreSQL
   - Update backend to use PostgreSQL instead of SQLite
   - Add `DATABASE_URL` environment variable

### **3. Vercel (Frontend) + Railway (Backend)**

#### **Frontend on Vercel:**

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Deploy:**
   - Import your GitHub repository
   - Vercel auto-detects Vite/React
   - Add environment variables:
     ```
     VITE_API_BASE_URL=https://your-backend-url.railway.app
     ```

3. **Custom domain:**
   - Add domain in Vercel dashboard
   - Update DNS records

#### **Backend on Railway:**
Follow the Railway backend deployment steps above.

### **4. Render (Full-Stack)**

Render offers easy deployment for both frontend and backend.

#### **Backend Deployment:**

1. **Sign up at [render.com](https://render.com)**

2. **Create Web Service:**
   - Connect GitHub repository
   - Set root directory to `backend/`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables:
     ```
     PORT=3001
     JWT_SECRET=your-secret
     ADMIN_EMAIL=admin@domain.com
     ADMIN_PASSWORD=password
     ```

#### **Frontend Deployment:**

1. **Create Static Site:**
   - Connect same repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables:
     ```
     VITE_API_BASE_URL=https://your-backend-url.onrender.com
     ```

### **5. Heroku (Classic Choice)**

#### **Backend Deployment:**

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku app:**
   ```bash
   heroku create ainan-studio-backend
   ```

3. **Add PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Set environment variables:**
   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set ADMIN_EMAIL=admin@domain.com
   heroku config:set ADMIN_PASSWORD=password
   ```

#### **Frontend Deployment:**

1. **Create another Heroku app:**
   ```bash
   heroku create ainan-studio-frontend
   ```

2. **Add buildpack:**
   ```bash
   heroku buildpacks:set mars/create-react-app
   ```

3. **Deploy frontend:**
   ```bash
   git push heroku main
   ```

## 🔧 Environment Configuration

### **Frontend Environment Variables:**

Create `.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_APP_NAME=Ainan Studio
VITE_APP_DESCRIPTION=Professional Photography Services
```

### **Backend Environment Variables:**

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📁 File Upload Configuration

### **For Cloudflare:**
- Use Cloudflare R2 (S3-compatible storage)
- Update backend to use R2 instead of local storage

### **For Other Providers:**
- Use AWS S3, Google Cloud Storage, or similar
- Update backend upload routes accordingly

## 🔒 Security Considerations

1. **HTTPS Only:**
   - All modern cloud providers provide HTTPS
   - Ensure CORS is properly configured

2. **Environment Variables:**
   - Never commit secrets to Git
   - Use provider-specific secret management

3. **Rate Limiting:**
   - Implement rate limiting on your backend
   - Consider using provider-specific solutions

4. **Database Security:**
   - Use connection pooling
   - Implement proper backup strategies

## 🚀 Performance Optimization

### **Frontend:**
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize images (already done in your project)

### **Backend:**
- Enable caching headers
- Use database indexing
- Implement connection pooling
- Monitor performance metrics

## 📊 Monitoring & Analytics

### **Free Options:**
- **Cloudflare Analytics** (built-in)
- **Vercel Analytics** (built-in)
- **Railway Metrics** (built-in)

### **Advanced Options:**
- **Sentry** for error tracking
- **Google Analytics** for user behavior
- **Uptime Robot** for uptime monitoring

## 💰 Cost Comparison

| Provider | Frontend | Backend | Database | Monthly Cost |
|----------|----------|---------|----------|--------------|
| Cloudflare | Free | Free (100k requests) | Free (D1) | $0-20 |
| Railway | Free | $5-20 | $5-20 | $10-40 |
| Vercel + Railway | Free | $5-20 | $5-20 | $10-40 |
| Render | Free | $7-25 | $7-25 | $14-50 |
| Heroku | Free | $7-25 | $5-20 | $12-45 |

## 🎯 Recommended Deployment Strategy

### **For Small to Medium Projects:**
1. **Frontend:** Cloudflare Pages (Free, fast, global CDN)
2. **Backend:** Railway ($5/month, reliable, easy scaling)
3. **Database:** Railway PostgreSQL (included)
4. **File Storage:** Cloudflare R2 ($0.015/GB)

### **For Production/Enterprise:**
1. **Frontend:** Vercel (excellent React support)
2. **Backend:** Railway or Render (better for scaling)
3. **Database:** Managed PostgreSQL service
4. **File Storage:** AWS S3 or Google Cloud Storage

## 🔄 Deployment Workflow

### **1. Development Setup:**
```bash
# Local development
npm run dev          # Frontend
cd backend && npm run dev  # Backend
```

### **2. Production Build:**
```bash
# Build frontend
npm run build

# Test production build locally
npm run preview
```

### **3. Deploy Backend First:**
- Deploy backend to your chosen provider
- Test API endpoints
- Configure environment variables

### **4. Deploy Frontend:**
- Update `VITE_API_BASE_URL` to point to your backend
- Deploy frontend
- Test full application

### **5. Post-Deployment:**
- Set up custom domain
- Configure SSL certificates
- Set up monitoring
- Test all functionality

## 🆘 Troubleshooting

### **Common Issues:**

1. **CORS Errors:**
   - Ensure backend CORS configuration includes frontend domain
   - Check environment variables

2. **Database Connection:**
   - Verify database URL format
   - Check connection pooling settings

3. **File Uploads:**
   - Ensure storage service is properly configured
   - Check file size limits

4. **Environment Variables:**
   - Verify all required variables are set
   - Check variable naming (case-sensitive)

### **Getting Help:**
- Check provider documentation
- Review deployment logs
- Test locally with production environment variables

## 🎉 Success Checklist

After deployment, verify:

- ✅ Website loads without errors
- ✅ Admin login works
- ✅ File uploads function
- ✅ Database operations work
- ✅ All API endpoints respond
- ✅ Custom domain resolves
- ✅ SSL certificate is active
- ✅ Performance is acceptable
- ✅ Monitoring is set up

---

**Your photography studio website is now ready for production deployment!** 🚀

Choose the deployment option that best fits your needs and budget. Cloudflare Pages + Workers is recommended for its excellent performance and generous free tier.
