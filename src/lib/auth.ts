import { apiHelpers } from './api';

export interface AdminUser {
  id: string;
  email: string;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  };

  constructor() {
    this.initialize();
  }

  private initialize() {
    const token = localStorage.getItem('admin_token');
    if (token) {
      this.state.token = token;
      this.validateToken();
    } else {
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  private async validateToken() {
    try {
      const user = await apiHelpers.auth.getProfile();
      this.state = {
        user,
        token: this.state.token,
        isAuthenticated: true,
        isLoading: false,
      };
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('admin_token');
      this.state = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.state.isLoading = true;
      this.notifyListeners();

      const response = await apiHelpers.auth.login(email, password);
      
      if (response.token && response.admin) {
        localStorage.setItem('admin_token', response.token);
        this.state = {
          user: {
            id: response.admin.id,
            email: response.admin.email,
          },
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        };
        this.notifyListeners();
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      this.state.isLoading = false;
      this.notifyListeners();
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiHelpers.auth.logout();
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local state regardless of API call success
      localStorage.removeItem('admin_token');
      this.state = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
      this.notifyListeners();
    }
  }

  getState(): AuthState {
    return { ...this.state };
  }

  getAuthHeaders(): Record<string, string> {
    return this.state.token ? { 'Authorization': `Bearer ${this.state.token}` } : {};
  }
}

export const authService = new AuthService();

// React hook for using auth in components
import { useState, useEffect } from 'react';

export function useAuth(): AuthState & { 
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
} {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
  };
}
