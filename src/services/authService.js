// FlickNet Authentication Service
// Real API implementation for authentication

import axios from 'axios';

class AuthService {
  constructor() {
    // Use environment variable or default to port 3001
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    // Debug: Log the API URL being used
    console.log('🔧 AuthService initialized with baseURL:', this.baseURL);
    console.log('🔧 Environment variables:', {
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      NODE_ENV: process.env.NODE_ENV
    });

    // Configure axios defaults
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug: Log all requests
        console.log('🔧 Making API request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: config.baseURL + config.url
        });

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials) {
    try {
      const { username, password, recaptchaToken } = credentials;

      // For now, we'll skip reCAPTCHA validation in development
      // In production, this would be validated server-side

      console.log('🔧 AuthService.login called with:', { username, hasPassword: !!password });
      console.log('🔧 Making request to:', this.baseURL + '/auth/login');

      const response = await this.api.post('/auth/login', {
        email: username, // Backend expects email field
        password
      });

      console.log('🔧 Login response:', {
        status: response.status,
        success: response.data.success,
        hasUser: !!response.data.user,
        hasToken: !!response.data.token
      });

      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('🔧 Login error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please try again.'
      };
    }
  }

  async signup(userData) {
    try {
      const { username, email, password, firstName, lastName, recaptchaToken } = userData;

      // For now, we'll skip reCAPTCHA validation in development
      // In production, this would be validated server-side

      console.log('🔧 Making signup request to:', this.baseURL + '/auth/signup');
      console.log('🔧 Signup data:', { username, email, firstName, lastName });

      const response = await this.api.post('/auth/signup', {
        username,
        email,
        password,
        firstName,
        lastName
      });

      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Signup failed'
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed. Please try again.'
      };
    }
  }

  async validateToken(token) {
    try {
      const response = await this.api.get('/auth/me');

      if (response.data.success) {
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
      return Promise.resolve();
    } catch (error) {
      // Even if logout fails on server, we still clear local storage
      console.error('Logout error:', error);
      return Promise.resolve();
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const response = await this.api.put('/auth/profile', updateData);

      if (response.data.success) {
        return {
          success: true,
          user: response.data.user
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Profile update failed'
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Profile update failed. Please try again.'
      };
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Note: This endpoint would need to be implemented in the backend
      const response = await this.api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Password updated successfully'
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Password change failed'
        };
      }
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Password change failed. Please try again.'
      };
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const response = await this.api.get('/auth/users');

      if (response.data.success) {
        return response.data.users;
      }

      return [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      const response = await this.api.delete(`/auth/users/${userId}`);

      if (response.data.success) {
        return { success: true };
      } else {
        return { success: false, error: response.data.error || 'User deletion failed' };
      }
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, error: 'User deletion failed. Please try again.' };
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId, role) {
    try {
      const response = await this.api.put(`/auth/users/${userId}/role`, { role });

      if (response.data.success) {
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.data.error || 'Role update failed' };
      }
    } catch (error) {
      console.error('Update user role error:', error);
      return { success: false, error: 'Role update failed. Please try again.' };
    }
  }

  // Get database statistics (admin only)
  async getDatabaseStats() {
    try {
      const response = await this.api.get('/auth/database/stats');

      if (response.data.success) {
        return { success: true, stats: response.data.stats };
      } else {
        return { success: false, error: response.data.error || 'Failed to fetch database stats' };
      }
    } catch (error) {
      console.error('Get database stats error:', error);
      return { success: false, error: 'Failed to fetch database stats. Please try again.' };
    }
  }


}

export const authService = new AuthService();
