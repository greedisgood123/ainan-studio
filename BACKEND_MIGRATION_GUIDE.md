# 🔄 Backend Migration Guide: From Convex to Local

## 🎯 **Why Migrate?**

✅ **Zero bandwidth limits** during development  
✅ **Full control** over your data and files  
✅ **Free cloud deployment** options available  
✅ **Better performance** for your specific needs  
✅ **No more usage quotas** blocking your development  

## 📋 **Migration Steps**

### **Step 1: Set Up Local Backend**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your settings
# At minimum, change JWT_SECRET and admin password
```

### **Step 2: Start Backend Server**

```bash
# Start development server
npm run dev
```

Your backend will be running at `http://localhost:3001`

**Default Admin Login:**
- Email: `admin@ainanstudio.com`
- Password: `admin123`

⚠️ **Change these immediately!**

### **Step 3: Update Frontend Configuration**

Create a new file: `src/lib/api.ts`

```typescript
// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-deployed-backend.railway.app' 
  : 'http://localhost:3001';

export const api = {
  baseURL: API_BASE_URL,
  
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    me: `${API_BASE_URL}/api/auth/me`,
    logout: `${API_BASE_URL}/api/auth/logout`,
  },
  
  // Gallery endpoints
  gallery: {
    public: `${API_BASE_URL}/api/gallery/public`,
    admin: `${API_BASE_URL}/api/gallery/admin`,
    create: `${API_BASE_URL}/api/gallery`,
    update: (id: string) => `${API_BASE_URL}/api/gallery/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/gallery/${id}`,
  },
  
  // Portfolio endpoints
  portfolio: {
    public: `${API_BASE_URL}/api/portfolio/public`,
    admin: `${API_BASE_URL}/api/portfolio/admin`,
    albums: `${API_BASE_URL}/api/portfolio/albums`,
    photos: (id: string) => `${API_BASE_URL}/api/portfolio/albums/${id}/photos`,
  },
  
  // File upload
  files: {
    upload: `${API_BASE_URL}/api/files/upload`,
    uploadMultiple: `${API_BASE_URL}/api/files/upload-multiple`,
    delete: `${API_BASE_URL}/api/files/delete`,
  },
  
  // Other endpoints...
};
```

### **Step 4: Replace Convex Hooks**

Replace your Convex `useQuery` and `useMutation` with standard fetch:

**Before (Convex):**
```typescript
const data = useQuery(api.gallery.listPublic, {});
```

**After (REST API):**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('http://localhost:3001/api/gallery/public')
    .then(res => res.json())
    .then(data => {
      setData(data);
      setLoading(false);
    });
}, []);
```

Or create a custom hook:

```typescript
// src/hooks/useApi.ts
export function useApiQuery(endpoint: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [endpoint]);

  return { data, loading, error };
}
```

### **Step 5: Update Gallery Component**

Replace the Gallery component API calls:

```typescript
// Before
const data = useQuery(api.gallery.listPublic, {});

// After
const { data, loading } = useApiQuery('http://localhost:3001/api/gallery/public');
```

### **Step 6: Update Admin Authentication**

Replace Convex auth with JWT:

```typescript
// src/lib/auth.ts
export class AuthService {
  private token: string | null = localStorage.getItem('token');

  async login(email: string, password: string) {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  async getProfile() {
    if (!this.token) return null;
    
    const response = await fetch('http://localhost:3001/api/auth/me', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    return response.json();
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getAuthHeader() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }
}

export const authService = new AuthService();
```

### **Step 7: Update File Uploads**

Replace Convex file storage with local upload:

```typescript
// Upload function
export async function uploadFile(file: File, category = 'general') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  formData.append('optimize', 'true');

  const response = await fetch('http://localhost:3001/api/files/upload', {
    method: 'POST',
    headers: authService.getAuthHeader(),
    body: formData
  });

  return response.json();
}
```

## 🔧 **Data Migration**

### **Option A: Fresh Start (Recommended)**
1. Start with clean database
2. Re-upload optimized images
3. Recreate content through admin panel

### **Option B: Export/Import Data**
1. Export data from Convex dashboard
2. Create import script for SQLite database
3. Migrate files manually

## 🚀 **Free Cloud Deployment**

When ready for production, deploy to Railway (free tier):

### **1. Prepare for Deployment**

Update `backend/package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build needed'"
  }
}
```

### **2. Deploy to Railway**

1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Connect your GitHub repo
4. Railway will auto-deploy your backend

### **3. Add Environment Variables**

In Railway dashboard, add:
```
NODE_ENV=production
JWT_SECRET=your-production-secret
ADMIN_EMAIL=your-email@domain.com
ADMIN_PASSWORD=your-secure-password
FRONTEND_URL=https://your-frontend-domain.com
```

### **4. Update Frontend**

Change your API base URL to the Railway deployment URL.

## 📊 **Benefits After Migration**

- ✅ **Unlimited uploads** during development
- ✅ **95% smaller image files** (automatic optimization)
- ✅ **Faster development** (no quota worries)
- ✅ **Full control** over your data
- ✅ **Free deployment** options
- ✅ **Better performance** (local development)

## 🔄 **Rollback Plan**

If you need to go back to Convex:
1. Keep your Convex project as backup
2. The data structures are compatible
3. Frontend changes are minimal to revert

## ❓ **Need Help?**

Common issues and solutions:

### **CORS Errors**
Add your frontend URL to backend CORS configuration

### **Authentication Issues**
Check JWT_SECRET is set and admin credentials are correct

### **File Upload Failures**
Ensure uploads directory exists and has write permissions

### **Database Errors**
Delete database file to reset, or check file permissions

---

**Your new backend gives you complete freedom from usage limits!** 🎉

Start with local development, then deploy to free cloud services when ready. No more bandwidth anxiety! 🚀
