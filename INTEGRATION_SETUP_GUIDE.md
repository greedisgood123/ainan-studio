# 🔧 Backend Integration Setup Guide

## **Overview**

This guide will help you complete the integration from Convex to your local backend. The backend is fully set up and ready - we just need to connect the frontend.

## **Prerequisites ✅**

- ✅ Backend is already set up (`/backend/` directory)
- ✅ Database schema is ready (SQLite)
- ✅ API endpoints are implemented
- ✅ Authentication system is in place

## **Setup Steps**

### **1. Backend Environment Setup**

Copy the environment template:
```bash
cd backend
cp env.example .env
```

Edit `.env` file with your settings:
```bash
# IMPORTANT: Change these values!
JWT_SECRET=your-very-long-and-secure-secret-key-for-production
ADMIN_EMAIL=your-email@domain.com
ADMIN_PASSWORD=your-secure-password

# Default values (you can keep these)
PORT=3001
FRONTEND_URL=http://localhost:8080
```

### **2. Start the Backend Server**

```bash
cd backend
npm install
npm run dev
```

Your backend should be running at: `http://localhost:3001`

### **3. Frontend Environment Setup**

Create `.env.local` in the project root:
```bash
# Frontend API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Optional: Keep Convex as fallback during transition
VITE_CONVEX_URL=your-convex-url-if-needed
```

### **4. Update Vite Config (if needed)**

Your `vite.config.ts` should include:
```typescript
export default defineConfig({
  // ... existing config
  define: {
    global: 'globalThis',
  },
})
```

## **Integration Status**

### ✅ **Completed**
- [x] API client created (`src/lib/api.ts`)
- [x] Authentication service created (`src/lib/auth.ts`)
- [x] Custom API hooks created (`src/hooks/useApi.ts`)
- [x] Admin login updated to use local backend
- [x] Gallery component already using local backend

### 🔄 **Next Steps**
- [ ] Update admin dashboard to use local backend APIs
- [ ] Update file upload system 
- [ ] Test all functionality end-to-end

## **Backend API Overview**

Your local backend provides these endpoints:

### **Authentication**
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin profile
- `POST /api/auth/logout` - Logout

### **Gallery**
- `GET /api/gallery/public` - Public gallery items
- `GET /api/gallery/admin` - All gallery items (admin)
- `POST /api/gallery` - Create gallery item
- `PUT /api/gallery/:id` - Update gallery item
- `DELETE /api/gallery/:id` - Delete gallery item

### **Portfolio**
- `GET /api/portfolio/public` - Public portfolio albums
- `GET /api/portfolio/admin` - All portfolio albums (admin)
- `POST /api/portfolio/albums` - Create album
- `PUT /api/portfolio/albums/:id` - Update album
- `DELETE /api/portfolio/albums/:id` - Delete album
- `POST /api/portfolio/albums/:id/photos` - Add photo to album

### **File Upload**
- `POST /api/files/upload` - Single file upload
- `POST /api/files/upload-multiple` - Multiple file upload
- `DELETE /api/files/delete` - Delete file

### **Other Endpoints**
- Client Logos: `/api/client-logos`
- Packages: `/api/packages` 
- Bookings: `/api/bookings`
- Site Settings: `/api/site-settings`
- Analytics: `/api/analytics`

## **Usage Examples**

### **Using the API Client**
```typescript
import { apiHelpers } from '@/lib/api';

// Get gallery items
const galleryItems = await apiHelpers.gallery.getPublic();

// Upload a file
const result = await apiHelpers.files.upload(file, 'gallery');
```

### **Using React Hooks**
```typescript
import { useGalleryPublic, useFileUpload } from '@/hooks/useApi';

function MyComponent() {
  const { data, loading, error } = useGalleryPublic();
  const { mutate: uploadFile, loading: uploading } = useFileUpload();
  
  // Component logic...
}
```

### **Using Authentication**
```typescript
import { useAuth } from '@/lib/auth';

function AdminComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }
  
  return <AdminDashboard user={user} onLogout={logout} />;
}
```

## **Default Admin Credentials**

- **Email**: `admin@ainanstudio.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change these credentials immediately in your `.env` file!

## **File Storage**

Files are stored locally in `backend/uploads/`:
- `gallery/` - Gallery images
- `portfolio/` - Portfolio images  
- `logos/` - Client logos
- `temp/` - Temporary uploads

Files are accessible via: `http://localhost:3001/uploads/category/filename`

## **Next Phase: Admin Dashboard Migration**

The admin dashboard (`src/pages/admin/Dashboard.tsx`) needs to be updated to use the local backend instead of Convex. This involves:

1. Replacing Convex hooks with local API hooks
2. Updating file upload logic
3. Modifying data transformation logic
4. Testing all admin functionality

## **Troubleshooting**

### **Backend Won't Start**
- Check if port 3001 is available
- Verify `.env` file exists and has correct values
- Check console for error messages

### **CORS Errors**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser network tab for specific CORS error details

### **Authentication Issues**
- Verify JWT_SECRET is set in backend `.env`
- Clear localStorage and try logging in again
- Check backend logs for authentication errors

### **File Upload Failures**
- Ensure `uploads/` directory exists and has write permissions
- Check file size limits (50MB default)
- Verify UPLOAD_DIR path in backend `.env`

## **Ready to Continue?**

Your integration foundation is now complete! The next step is to migrate the admin dashboard, which is the final major piece of the integration puzzle.
