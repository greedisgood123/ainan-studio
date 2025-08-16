// API Configuration for local backend integration
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL || 'https://your-deployed-backend.com'
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
    createAlbum: `${API_BASE_URL}/api/portfolio/albums`,
    updateAlbum: (id: string) => `${API_BASE_URL}/api/portfolio/albums/${id}`,
    deleteAlbum: (id: string) => `${API_BASE_URL}/api/portfolio/albums/${id}`,
    addPhoto: (id: string) => `${API_BASE_URL}/api/portfolio/albums/${id}/photos`,
  },
  
  // Packages endpoints
  packages: {
    public: `${API_BASE_URL}/api/packages/public`,
    admin: `${API_BASE_URL}/api/packages/admin`,
    create: `${API_BASE_URL}/api/packages`,
    update: (id: string) => `${API_BASE_URL}/api/packages/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/packages/${id}`,
  },
  
  // Bookings endpoints
  bookings: {
    create: `${API_BASE_URL}/api/bookings`,
    admin: `${API_BASE_URL}/api/bookings/admin`,
    update: (id: string) => `${API_BASE_URL}/api/bookings/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/bookings/${id}`,
  },
  
  // Unavailable dates
  unavailableDates: {
    list: `${API_BASE_URL}/api/bookings/unavailable-dates`,
    block: `${API_BASE_URL}/api/bookings/block-date`,
    unblock: (dateMs: number) => `${API_BASE_URL}/api/bookings/unblock-date/${dateMs}`,
  },
  
  // Client logos endpoints
  clientLogos: {
    list: `${API_BASE_URL}/api/client-logos`,
    create: `${API_BASE_URL}/api/client-logos`,
    update: (id: string) => `${API_BASE_URL}/api/client-logos/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/client-logos/${id}`,
  },
  
  // File upload endpoints
  files: {
    upload: `${API_BASE_URL}/api/files/upload`,
    uploadMultiple: `${API_BASE_URL}/api/files/upload-multiple`,
    delete: `${API_BASE_URL}/api/files/delete`,
  },
  
  // Site settings
  siteSettings: {
    get: `${API_BASE_URL}/api/site-settings`,
    setHero: `${API_BASE_URL}/api/site-settings/hero`,
  },
  
  // Analytics
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
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });
  }

  async post(url: string, data?: any, options: RequestInit = {}) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put(url: string, data?: any, options: RequestInit = {}) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete(url: string, options: RequestInit = {}) {
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });
  }

  // Upload file with progress tracking
  async uploadFile(
    url: string, 
    file: File, 
    additionalData?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Create a Response-like object
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(),
          });
          resolve(response);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
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
  }
}

export const apiClient = new ApiClient();

// Helper functions for common API operations
export const apiHelpers = {
  // Handle API response with error checking
  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Gallery operations
  gallery: {
    async getPublic() {
      const response = await apiClient.get(api.gallery.public);
      return apiHelpers.handleResponse(response);
    },
    async getAdmin() {
      const response = await apiClient.get(api.gallery.admin);
      return apiHelpers.handleResponse(response);
    },
    async create(data: any) {
      const response = await apiClient.post(api.gallery.create, data);
      return apiHelpers.handleResponse(response);
    },
    async update(id: string, data: any) {
      const response = await apiClient.put(api.gallery.update(id), data);
      return apiHelpers.handleResponse(response);
    },
    async delete(id: string) {
      const response = await apiClient.delete(api.gallery.delete(id));
      return apiHelpers.handleResponse(response);
    },
  },

  // Portfolio operations
  portfolio: {
    async getPublic() {
      const response = await apiClient.get(api.portfolio.public);
      return apiHelpers.handleResponse(response);
    },
    async getAdmin() {
      const response = await apiClient.get(api.portfolio.admin);
      return apiHelpers.handleResponse(response);
    },
    async createAlbum(data: any) {
      const response = await apiClient.post(api.portfolio.createAlbum, data);
      return apiHelpers.handleResponse(response);
    },
    async updateAlbum(id: string, data: any) {
      const response = await apiClient.put(api.portfolio.updateAlbum(id), data);
      return apiHelpers.handleResponse(response);
    },
    async deleteAlbum(id: string) {
      const response = await apiClient.delete(api.portfolio.deleteAlbum(id));
      return apiHelpers.handleResponse(response);
    },
    async addPhoto(albumId: string, data: any) {
      const response = await apiClient.post(api.portfolio.addPhoto(albumId), data);
      return apiHelpers.handleResponse(response);
    },
  },

  // File upload operations
  files: {
    async upload(file: File, category?: string, onProgress?: (progress: number) => void) {
      const additionalData = category ? { category } : undefined;
      const response = await apiClient.uploadFile(api.files.upload, file, additionalData, onProgress);
      return apiHelpers.handleResponse(response);
    },
    async uploadMultiple(files: File[], category?: string) {
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
    },
  },

  // Auth operations
  auth: {
    async login(email: string, password: string) {
      const response = await apiClient.post(api.auth.login, { email, password });
      return apiHelpers.handleResponse(response);
    },
    async getProfile() {
      const response = await apiClient.get(api.auth.me);
      return apiHelpers.handleResponse(response);
    },
    async logout() {
      const response = await apiClient.post(api.auth.logout);
      localStorage.removeItem('admin_token');
      return apiHelpers.handleResponse(response);
    },
  },
};
