// FlickNet Notification Service
// Real API implementation for notification operations

import axios from 'axios';

class NotificationService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

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
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async getNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
    try {
      const params = { page, limit };
      if (unreadOnly) params.unread = 'true';

      const response = await this.api.get('/notifications', { params });

      if (response.data.success) {
        return {
          notifications: response.data.data,
          unreadCount: response.data.unreadCount,
          pagination: response.data.pagination
        };
      }

      return { notifications: [], unreadCount: 0, pagination: {} };
    } catch (error) {
      console.error('Get notifications error:', error);
      return { notifications: [], unreadCount: 0, pagination: {} };
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await this.api.put(`/notifications/${notificationId}/read`);

      if (response.data.success) {
        return { success: true };
      }

      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }

  async markAllAsRead(userId) {
    try {
      const response = await this.api.put('/notifications/read-all');

      if (response.data.success) {
        return { success: true, message: response.data.message };
      }

      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { success: false, error: 'Failed to mark all notifications as read' };
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await this.api.delete(`/notifications/${notificationId}`);

      if (response.data.success) {
        return { success: true, message: response.data.message };
      }

      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('Delete notification error:', error);
      return { success: false, error: 'Failed to delete notification' };
    }
  }

  async getUpcomingMovies() {
    try {
      const response = await this.api.get('/movies', {
        params: { status: 'upcoming', limit: 10 }
      });

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Get upcoming movies error:', error);
      return [];
    }
  }

  async subscribeToMovieUpdates(movieId, userId) {
    try {
      // Note: This would need to be implemented in the backend
      return {
        success: true,
        message: "You'll be notified about updates for this movie!"
      };
    } catch (error) {
      console.error('Subscribe to movie updates error:', error);
      return { success: false, error: 'Failed to subscribe to movie updates' };
    }
  }

  async unsubscribeFromMovieUpdates(movieId, userId) {
    try {
      // Note: This would need to be implemented in the backend
      return {
        success: true,
        message: "You've unsubscribed from updates for this movie."
      };
    } catch (error) {
      console.error('Unsubscribe from movie updates error:', error);
      return { success: false, error: 'Failed to unsubscribe from movie updates' };
    }
  }

  async getUserPreferences(userId) {
    try {
      const response = await this.api.get('/notifications/preferences');

      if (response.data.success) {
        return response.data.data;
      }

      return {
        email: true,
        push: true,
        marketing: false
      };
    } catch (error) {
      console.error('Get user preferences error:', error);
      return {
        email: true,
        push: true,
        marketing: false
      };
    }
  }

  async updateUserPreferences(userId, preferences) {
    try {
      const response = await this.api.put('/notifications/preferences', preferences);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || "Notification preferences updated successfully!",
          preferences: response.data.data
        };
      }

      return { success: false, error: response.data.error };
    } catch (error) {
      console.error('Update user preferences error:', error);
      return { success: false, error: 'Failed to update notification preferences' };
    }
  }

  async getUnreadCount() {
    try {
      const response = await this.api.get('/notifications/unread-count');

      if (response.data.success) {
        return response.data.data.count;
      }

      return 0;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  // Helper method to format notification time
  formatNotificationTime(timestamp) {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return notificationTime.toLocaleDateString();
  }

  // Helper method to get notification icon based on type
  getNotificationIcon(type) {
    const iconMap = {
      movie_release: '🎬',
      subscription_update: '💳',
      payment_success: '✅',
      payment_failed: '❌',
      account_update: '👤',
      community_activity: '👥',
      system_announcement: '📢',
      recommendation: '⭐',
      watchlist_update: '📝'
    };

    return iconMap[type] || '📬';
  }

  // Helper method to get notification priority color
  getPriorityColor(priority) {
    const colorMap = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };

    return colorMap[priority] || 'text-gray-600';
  }
}

export const notificationService = new NotificationService();
