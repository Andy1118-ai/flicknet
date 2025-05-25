// FlickNet Subscription Service
// Real API implementation for subscription operations

import axios from 'axios';

class SubscriptionService {
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

  async getPlans() {
    try {
      const response = await this.api.get('/subscriptions/plans');

      if (response.data.success) {
        return response.data.data;
      }

      return {};
    } catch (error) {
      console.error('Get plans error:', error);
      return {};
    }
  }

  async getUserSubscription() {
    try {
      const response = await this.api.get('/subscriptions/me');

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Get user subscription error:', error);
      return null;
    }
  }

  async updateSubscription(planData) {
    try {
      const response = await this.api.put('/subscriptions/plan', planData);

      if (response.data.success) {
        return {
          success: true,
          subscription: response.data.data,
          message: response.data.message
        };
      }

      return {
        success: false,
        error: response.data.error || 'Failed to update subscription'
      };
    } catch (error) {
      console.error('Update subscription error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update subscription'
      };
    }
  }

  async cancelSubscription(reason = '', cancelAtPeriodEnd = true) {
    try {
      const response = await this.api.delete('/subscriptions/cancel', {
        data: { reason, cancelAtPeriodEnd }
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          subscription: response.data.data
        };
      }

      return {
        success: false,
        error: response.data.error || 'Failed to cancel subscription'
      };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel subscription'
      };
    }
  }

  async getUsage() {
    try {
      const response = await this.api.get('/subscriptions/usage');

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Get usage error:', error);
      return null;
    }
  }

  // Helper method to check if user can access a feature
  canAccessFeature(subscription, feature) {
    if (!subscription) return false;
    
    const features = subscription.features || {};
    return features[feature] === true;
  }

  // Helper method to check usage limits
  checkUsageLimit(subscription, usage, feature) {
    if (!subscription || !usage) return false;
    
    const limit = subscription.features?.[feature];
    const current = usage[feature.replace('Limit', '')]?.current || 0;
    
    if (limit === -1) return true; // unlimited
    return current < limit;
  }

  // Get feature comparison for plans
  getFeatureComparison() {
    return {
      free: {
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        features: [
          'Basic movie browsing',
          'Limited watchlist (10 items)',
          'Limited ratings (5 items)',
          'Basic search only'
        ]
      },
      basic: {
        name: 'Basic',
        price: { monthly: 9.99, yearly: 99.99 },
        features: [
          'Enhanced watchlist (100 items)',
          'More ratings (50 items)',
          'Advanced search & recommendations',
          'Community features',
          'HD streaming'
        ]
      },
      premium: {
        name: 'Premium',
        price: { monthly: 19.99, yearly: 199.99 },
        features: [
          'Unlimited watchlist & ratings',
          'Priority support',
          'Exclusive content',
          'Offline viewing',
          'Multiple profiles (5)',
          'All features unlocked'
        ]
      }
    };
  }
}

export const subscriptionService = new SubscriptionService();
