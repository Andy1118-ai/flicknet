// FlickNet Moderation Service
// API service for moderation operations

import axios from 'axios';

class ModerationService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Moderation API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Get moderation dashboard stats
  async getDashboardStats() {
    try {
      const response = await this.api.get('/moderation/stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch dashboard stats'
      };
    }
  }

  // Get content reports
  async getContentReports(params = {}) {
    try {
      const response = await this.api.get('/moderation/reports', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        total: response.data.total
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch content reports'
      };
    }
  }

  // Handle content report
  async handleContentReport(reportId, action, moderatorNotes) {
    try {
      const response = await this.api.put(`/moderation/reports/${reportId}`, {
        action,
        moderatorNotes
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to handle content report'
      };
    }
  }

  // Get support tickets
  async getSupportTickets(params = {}) {
    try {
      const response = await this.api.get('/moderation/tickets', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        total: response.data.total
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch support tickets'
      };
    }
  }

  // Assign ticket to current moderator
  async assignTicket(ticketId) {
    try {
      const response = await this.api.put(`/moderation/tickets/${ticketId}/assign`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign ticket'
      };
    }
  }

  // Get users for moderation
  async getUsers(params = {}) {
    try {
      const response = await this.api.get('/moderation/users', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        total: response.data.total
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch users'
      };
    }
  }

  // Suspend user temporarily
  async suspendUser(userId, duration, reason) {
    try {
      const response = await this.api.post(`/moderation/users/${userId}/suspend`, {
        duration,
        reason
      });
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to suspend user'
      };
    }
  }

  // Mock data for development/testing
  getMockDashboardStats() {
    return {
      success: true,
      data: {
        pendingReports: 12,
        openTickets: 8,
        totalUsers: 1247,
        suspendedUsers: 3,
        recentActions: 15
      }
    };
  }

  getMockContentReports() {
    return {
      success: true,
      data: [
        {
          _id: '1',
          reportedBy: { username: 'user123', firstName: 'John', lastName: 'Doe' },
          targetUserId: { username: 'baduser', firstName: 'Bad', lastName: 'User' },
          contentType: 'review',
          reason: 'inappropriate_content',
          description: 'Contains offensive language',
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          reportedBy: { username: 'user456', firstName: 'Jane', lastName: 'Smith' },
          targetUserId: { username: 'spammer', firstName: 'Spam', lastName: 'Bot' },
          contentType: 'comment',
          reason: 'spam',
          description: 'Repeated promotional content',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      ],
      pagination: { page: 1, pages: 1 },
      total: 2
    };
  }

  getMockSupportTickets() {
    return {
      success: true,
      data: [
        {
          _id: '1',
          userId: { username: 'helpuser', firstName: 'Help', lastName: 'User', email: 'help@example.com' },
          subject: 'Cannot access premium content',
          category: 'technical_issue',
          status: 'open',
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          userId: { username: 'billing', firstName: 'Bill', lastName: 'User', email: 'bill@example.com' },
          subject: 'Billing question about subscription',
          category: 'billing',
          status: 'in_progress',
          priority: 'medium',
          assignedTo: { username: 'mod1', firstName: 'Mod', lastName: 'One' },
          createdAt: new Date().toISOString()
        }
      ],
      pagination: { page: 1, pages: 1 },
      total: 2
    };
  }

  getMockUsers() {
    return {
      success: true,
      data: [
        {
          _id: '1',
          username: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'user',
          subscription: 'premium',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          username: 'user456',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: 'user',
          subscription: 'basic',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      pagination: { page: 1, pages: 1 },
      total: 2
    };
  }
}

export const moderationService = new ModerationService();
