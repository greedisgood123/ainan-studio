// API Configuration for local backend integration
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL || 'https://ainan-studio-backend.ainanstudio.workers.dev'
  : 'http://localhost:3001';

export const api = {
  baseURL: API_BASE_URL,
  
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    me: `${API_BASE_URL}/api/auth/me`,
    logout: `${API_BASE_URL}/api/auth/logout`,
  },
  
  // Gallery endpoints - NOT IMPLEMENTED IN BACKEND
  gallery: {
    public: `${API_BASE_URL}/api/gallery/public`,
    admin: `${API_BASE_URL}/api/gallery/admin`,
    create: `${API_BASE_URL}/api/gallery`,
    update: (id: string) => `${API_BASE_URL}/api/gallery/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/gallery/${id}`,
  },
  
  // Portfolio endpoints - NOT IMPLEMENTED IN BACKEND
  portfolio: {
    public: `${API_BASE_URL}/api/portfolio/public`,
    admin: `${API_BASE_URL}/api/portfolio/admin`,
    albums: `${API_BASE_URL}/api/portfolio/albums`,
    photos: (id: string) => `${API_BASE_URL}/api/portfolio/albums/${id}/photos`,
    createAlbum: `${API_BASE_URL}/api/portfolio/albums`,
    updateAlbum: (id: string) => `${API_BASE_URL}/api/portfolio/albums/${id}`,
    deleteAlbum: (id: string) => `${API_BASE_URL}/api/portfolio/albums/${id}`,
    addPhoto: (id: string) => `${API_BASE_URL}/api/portfolio/albums/${id}/photos`,
  },
  
  // Packages endpoints - NOT IMPLEMENTED IN BACKEND
  packages: {
    public: `${API_BASE_URL}/api/packages/public`,
    admin: `${API_BASE_URL}/api/packages/admin`,
    create: `${API_BASE_URL}/api/packages`,
    update: (id: string) => `${API_BASE_URL}/api/packages/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/packages/${id}`,
  },
  
  // Bookings endpoints - PARTIALLY IMPLEMENTED
  bookings: {
    create: `${API_BASE_URL}/api/bookings`,
    admin: `${API_BASE_URL}/api/bookings/admin`,
    updateStatus: (id: string) => `${API_BASE_URL}/api/bookings/${id}/status`, // ✅ FIXED: matches backend
    delete: (id: string) => `${API_BASE_URL}/api/bookings/${id}`,
  },
  
  // Unavailable dates - FIXED to match backend
  unavailableDates: {
    list: `${API_BASE_URL}/api/bookings/unavailable-dates`,
    add: `${API_BASE_URL}/api/bookings/unavailable-dates`, // ✅ FIXED: matches backend
    remove: (dateMs: number) => `${API_BASE_URL}/api/bookings/unavailable-dates/${dateMs}`, // ✅ FIXED: matches backend
  },
  
  // Client logos endpoints - NOT IMPLEMENTED IN BACKEND
  clientLogos: {
    list: `${API_BASE_URL}/api/client-logos`,
    create: `${API_BASE_URL}/api/client-logos`,
    update: (id: string) => `${API_BASE_URL}/api/client-logos/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/client-logos/${id}`,
  },
  
  // File upload endpoints - NOT IMPLEMENTED IN BACKEND
  files: {
    upload: `${API_BASE_URL}/api/files/upload`,
    uploadMultiple: `${API_BASE_URL}/api/files/upload-multiple`,
    delete: `${API_BASE_URL}/api/files/delete`,
  },
  
  // Site settings - NOT IMPLEMENTED IN BACKEND
  siteSettings: {
    get: `${API_BASE_URL}/api/site-settings`,
    setHero: `${API_BASE_URL}/api/site-settings/hero`,
  },
  
  // Analytics - NOT IMPLEMENTED IN BACKEND
  analytics: {
    track: `${API_BASE_URL}/api/analytics/track`,
    admin: `${API_BASE_URL}/api/analytics/admin`,
  },
};

// HTTP client with authentication headers
class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('admin_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async get(url: string, options: RequestInit = {}) {
    try {
      console.log(`🔍 GET request to: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });
      console.log(`✅ GET response status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`❌ GET request failed for ${url}:`, error);
      throw error;
    }
  }

  async post(url: string, data?: any, options: RequestInit = {}) {
    try {
      console.log(`📤 POST request to: ${url}`, data ? { data: typeof data === 'object' ? Object.keys(data) : 'data' } : '');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      console.log(`✅ POST response status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`❌ POST request failed for ${url}:`, error);
      throw error;
    }
  }

  async put(url: string, data?: any, options: RequestInit = {}) {
    try {
      console.log(`🔄 PUT request to: ${url}`, data ? { data: typeof data === 'object' ? Object.keys(data) : 'data' } : '');
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      console.log(`✅ PUT response status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`❌ PUT request failed for ${url}:`, error);
      throw error;
    }
  }

  async delete(url: string, options: RequestInit = {}) {
    try {
      console.log(`🗑️ DELETE request to: ${url}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });
      console.log(`✅ DELETE response status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`❌ DELETE request failed for ${url}:`, error);
      throw error;
    }
  }

  // Upload file with progress tracking
  async uploadFile(
    url: string, 
    file: File, 
    additionalData?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<Response> {
    try {
      console.log(`📁 Uploading file: ${file.name} (${file.size} bytes) to: ${url}`);
      
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        
        if (additionalData) {
          Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
          });
          console.log(`📋 Additional data:`, additionalData);
        }

        const xhr = new XMLHttpRequest();

        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              console.log(`📊 Upload progress: ${progress}%`);
              onProgress(progress);
            }
          });
        }

        xhr.addEventListener('load', () => {
          console.log(`✅ Upload completed with status: ${xhr.status}`);
          if (xhr.status >= 200 && xhr.status < 300) {
            // Create a Response-like object
            const response = new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers(),
            });
            resolve(response);
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`);
            console.error(`❌ Upload failed:`, error);
            reject(error);
          }
        });

        xhr.addEventListener('error', (error) => {
          console.error(`❌ Upload error:`, error);
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', url);
        
        // Add auth header
        const token = localStorage.getItem('admin_token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);
      });
    } catch (error) {
      console.error(`❌ Upload file failed for ${url}:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

// Helper functions for common API operations
export const apiHelpers = {
  // Handle API response with error checking
  async handleResponse<T>(response: Response): Promise<T> {
    try {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const error = new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        console.error(`❌ API response error:`, error);
        throw error;
      }
      const data = await response.json();
      console.log(`✅ API response data:`, data);
      return data;
    } catch (error) {
      console.error(`❌ handleResponse failed:`, error);
      throw error;
    }
  },

  // Gallery operations
  gallery: {
    async getPublic() {
      try {
        console.log('🖼️ Getting public gallery items...');
        const response = await apiClient.get(api.gallery.public);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ getPublic failed:', error);
        throw error;
      }
    },
    async getAdmin() {
      try {
        console.log('🖼️ Getting admin gallery items...');
        const response = await apiClient.get(api.gallery.admin);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ getAdmin failed:', error);
        throw error;
      }
    },
    async create(data: any) {
      try {
        console.log('🖼️ Creating gallery item...', data);
        const response = await apiClient.post(api.gallery.create, data);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ create gallery item failed:', error);
        throw error;
      }
    },
    async update(id: string, data: any) {
      try {
        console.log(`🖼️ Updating gallery item ${id}...`, data);
        const response = await apiClient.put(api.gallery.update(id), data);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error(`❌ update gallery item ${id} failed:`, error);
        throw error;
      }
    },
    async delete(id: string) {
      try {
        console.log(`🖼️ Deleting gallery item ${id}...`);
        const response = await apiClient.delete(api.gallery.delete(id));
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error(`❌ delete gallery item ${id} failed:`, error);
        throw error;
      }
    },
  },

  // Portfolio operations
  portfolio: {
    async getPublic() {
      try {
        console.log('📸 Getting public portfolio albums...');
        const response = await apiClient.get(api.portfolio.public);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ getPublic portfolio failed:', error);
        throw error;
      }
    },
    async getAdmin() {
      try {
        console.log('📸 Getting admin portfolio albums...');
        const response = await apiClient.get(api.portfolio.admin);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ getAdmin portfolio failed:', error);
        throw error;
      }
    },
    async createAlbum(data: any) {
      try {
        console.log('📸 Creating portfolio album...', data);
        const response = await apiClient.post(api.portfolio.createAlbum, data);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ create album failed:', error);
        throw error;
      }
    },
    async updateAlbum(id: string, data: any) {
      try {
        console.log(`📸 Updating portfolio album ${id}...`, data);
        const response = await apiClient.put(api.portfolio.updateAlbum(id), data);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error(`❌ update album ${id} failed:`, error);
        throw error;
      }
    },
    async deleteAlbum(id: string) {
      try {
        console.log(`📸 Deleting portfolio album ${id}...`);
        const response = await apiClient.delete(api.portfolio.deleteAlbum(id));
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error(`❌ delete album ${id} failed:`, error);
        throw error;
      }
    },
    async addPhoto(albumId: string, data: any) {
      try {
        console.log(`📸 Adding photo to album ${albumId}...`, data);
        const response = await apiClient.post(api.portfolio.addPhoto(albumId), data);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error(`❌ add photo to album ${albumId} failed:`, error);
        throw error;
      }
    },
  },

  // Booking operations - ACTUALLY IMPLEMENTED IN BACKEND
  bookings: {
    async create(data: any) {
      try {
        console.log('📅 Creating booking...', data);
        const response = await apiClient.post(api.bookings.create, data);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ create booking failed:', error);
        throw error;
      }
    },
    async getAdmin() {
      try {
        console.log('📅 Getting admin bookings...');
        const response = await apiClient.get(api.bookings.admin);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ getAdmin bookings failed:', error);
        throw error;
      }
    },
    async updateStatus(id: string, status: string) {
      try {
        console.log(`📅 Updating booking ${id} status to ${status}...`);
        const response = await apiClient.put(api.bookings.updateStatus(id), { status });
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error(`❌ update booking status ${id} failed:`, error);
        throw error;
      }
    },
  },

  // Unavailable dates operations - ACTUALLY IMPLEMENTED IN BACKEND
  unavailableDates: {
    async getList() {
      try {
        console.log('📅 Getting unavailable dates...');
        const response = await apiClient.get(api.unavailableDates.list);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ get unavailable dates failed:', error);
        throw error;
      }
    },
    async add(dateMs: number, reason?: string) {
      try {
        console.log('📅 Adding unavailable date...', { dateMs, reason });
        const response = await apiClient.post(api.unavailableDates.add, { date_ms: dateMs, reason });
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ add unavailable date failed:', error);
        throw error;
      }
    },
    async remove(dateMs: number) {
      try {
        console.log('📅 Removing unavailable date...', { dateMs });
        const response = await apiClient.delete(api.unavailableDates.remove(dateMs));
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ remove unavailable date failed:', error);
        throw error;
      }
    },
  },

  // File upload operations
  files: {
    async upload(file: File, category?: string, onProgress?: (progress: number) => void) {
      try {
        console.log(`📁 Uploading single file: ${file.name}`, { category });
        const additionalData = category ? { category } : undefined;
        const response = await apiClient.uploadFile(api.files.upload, file, additionalData, onProgress);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ Single file upload failed:', error);
        throw error;
      }
    },
    async uploadMultiple(files: File[], category?: string) {
      try {
        console.log(`📁 Uploading multiple files: ${files.length} files`, { category });
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append(`files`, file);
        });
        if (category) {
          formData.append('category', category);
        }

        const response = await fetch(api.files.uploadMultiple, {
          method: 'POST',
          headers: {
            ...apiClient['getAuthHeaders'](),
          },
          body: formData,
        });
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ Multiple file upload failed:', error);
        throw error;
      }
    },
  },

  // Auth operations
  auth: {
    async login(email: string, password: string) {
      try {
        console.log('🔐 Attempting login...', { email });
        const response = await apiClient.post(api.auth.login, { email, password });
        const result = await apiHelpers.handleResponse(response);
        console.log('✅ Login successful');
        return result;
      } catch (error) {
        console.error('❌ Login failed:', error);
        throw error;
      }
    },
    async getProfile() {
      try {
        console.log('👤 Getting user profile...');
        const response = await apiClient.get(api.auth.me);
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ Get profile failed:', error);
        throw error;
      }
    },
    async logout() {
      try {
        console.log('🚪 Logging out...');
        const response = await apiClient.post(api.auth.logout);
        localStorage.removeItem('admin_token');
        console.log('✅ Logout successful');
        return apiHelpers.handleResponse(response);
      } catch (error) {
        console.error('❌ Logout failed:', error);
        // Still remove token even if logout request fails
        localStorage.removeItem('admin_token');
        throw error;
      }
    },
  },
};
