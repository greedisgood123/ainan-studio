# 🚀 Ainan Studio Backend

A local Node.js/Express backend to replace Convex with zero bandwidth limits during development.

## 🏗 Features

- ✅ **SQLite Database** - Lightweight, file-based database
- ✅ **File Upload & Optimization** - Automatic image compression 
- ✅ **JWT Authentication** - Secure admin authentication
- ✅ **Rate Limiting** - Prevent abuse
- ✅ **Image Processing** - Sharp-based optimization
- ✅ **RESTful API** - Clean, predictable endpoints
- ✅ **Error Handling** - Comprehensive error management
- ✅ **CORS Support** - Frontend integration ready

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your settings
# At minimum, change JWT_SECRET and admin credentials
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3001`

### 4. Database Initialization
The database and default admin user are created automatically on first run.

**Default Admin Credentials:**
- Email: `admin@ainanstudio.com`
- Password: `admin123`

⚠️ **Change these immediately after setup!**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Verify token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password

### Gallery
- `GET /api/gallery/public` - Get published gallery items
- `GET /api/gallery/admin` - Get all gallery items (admin)
- `POST /api/gallery` - Create gallery item (admin)
- `PUT /api/gallery/:id` - Update gallery item (admin)
- `DELETE /api/gallery/:id` - Delete gallery item (admin)

### Portfolio
- `GET /api/portfolio/public` - Get published albums
- `GET /api/portfolio/admin` - Get all albums (admin)
- `POST /api/portfolio/albums` - Create album (admin)
- `GET /api/portfolio/albums/:id/photos` - Get album photos
- `POST /api/portfolio/albums/:id/photos` - Add photo to album (admin)

### Packages
- `GET /api/packages/public` - Get published packages
- `GET /api/packages/admin` - Get all packages (admin)
- `POST /api/packages` - Create package (admin)

### Bookings
- `POST /api/bookings` - Create booking (public)
- `GET /api/bookings/admin` - Get all bookings (admin)
- `PATCH /api/bookings/:id/status` - Update booking status (admin)

### File Upload
- `POST /api/files/upload` - Upload single file (admin)
- `POST /api/files/upload-multiple` - Upload multiple files (admin)
- `DELETE /api/files/delete` - Delete file (admin)
- `GET /api/files/info` - Get file info (admin)

### Client Logos
- `GET /api/client-logos/public` - Get all logos
- `GET /api/client-logos/admin` - Get all logos (admin)
- `POST /api/client-logos` - Create logo (admin)

### Site Settings
- `GET /api/site-settings/hero` - Get hero video settings
- `POST /api/site-settings/hero` - Update hero video settings (admin)

### Analytics
- `POST /api/analytics/track` - Track analytics event

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./database/ainan_studio.db

# Security
JWT_SECRET=your-super-secret-jwt-key

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB

# Admin Credentials
ADMIN_EMAIL=admin@ainanstudio.com
ADMIN_PASSWORD=your-secure-password

# CORS
FRONTEND_URL=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📁 File Storage

Files are stored locally in the `./uploads/` directory:

```
uploads/
├── portfolio/     # Portfolio images
├── gallery/       # Gallery images  
├── logos/         # Client logos
├── general/       # Other files
└── temp/          # Temporary uploads
```

### Image Optimization

All uploaded images are automatically optimized:
- **Format**: Converted to WebP for smaller sizes
- **Compression**: 85% quality (adjustable)
- **Resizing**: Max 1920x1080 (logos: 400x400)
- **Performance**: 90%+ size reduction typical

## 🛡 Security Features

- **JWT Authentication** - Stateless token-based auth
- **Rate Limiting** - Prevent abuse and spam
- **File Validation** - Only allow safe file types
- **Path Security** - Prevent directory traversal
- **Helmet.js** - Security headers
- **CORS Protection** - Controlled cross-origin access

## 📊 Database Schema

The SQLite database includes all your existing Convex tables:
- `admins` & `admin_sessions`
- `portfolio_albums` & `portfolio_photos`
- `gallery_items`
- `packages`
- `bookings`
- `unavailable_dates`
- `client_logos`
- `analytics_events`
- `signups`
- `site_settings`

## 🚀 Production Deployment

### Free Cloud Options

1. **Railway** (Recommended)
   - Free tier: 500 hours/month
   - Easy deployment from GitHub
   - Built-in database

2. **Render**
   - Free tier: 750 hours/month
   - Auto-deploy from GitHub
   - Free PostgreSQL database

3. **Heroku**
   - Free tier discontinued, but still affordable
   - Mature platform

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add backend"
   git push origin main
   ```

2. **Deploy to Railway**
   - Connect GitHub repo
   - Set environment variables
   - Deploy automatically

3. **Update Frontend**
   - Change API base URL to your deployed backend
   - Update CORS settings

## 🔄 Migration from Convex

Your new backend is designed to be a drop-in replacement:

1. **Same Data Structure** - All your existing data fields
2. **Compatible API** - Similar response formats
3. **File Storage** - Local files instead of Convex storage
4. **Authentication** - JWT tokens instead of Convex sessions

## 📈 Performance Benefits

- **No Bandwidth Limits** - Upload unlimited files during development
- **Faster Uploads** - Local file storage
- **Better Control** - Full control over optimization
- **Cost Effective** - Free development, cheap production

## 🔧 Development Scripts

```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm run migrate  # Run database migrations (future use)
npm run seed     # Seed database with sample data (future use)
```

## ❓ Troubleshooting

### Database Issues
- Delete `./database/ainan_studio.db` to reset database
- Check file permissions on database directory

### File Upload Issues
- Ensure `./uploads/` directory exists and is writable
- Check MAX_FILE_SIZE environment variable
- Verify file types are allowed

### Authentication Issues
- Check JWT_SECRET is set in environment
- Verify admin credentials in database
- Check token expiration (7 days default)

Your backend is now ready to replace Convex with unlimited development freedom! 🎉
