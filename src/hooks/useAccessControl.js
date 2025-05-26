import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';

// Define feature permissions for each plan
const PLAN_PERMISSIONS = {
  free: {
    // Basic Features
    movieBrowsing: true,
    basicSearch: true,
    movieDetails: true,

    // Limited Features
    watchlistLimit: 10,
    ratingsLimit: 5,
    reviewsLimit: 2,

    // Restricted Features
    advancedSearch: false,
    recommendations: false,
    communityFeatures: false,
    prioritySupport: false,
    exclusiveContent: false,
    downloadReceipts: false,
    multipleProfiles: false,
    hdStreaming: false,
    offlineViewing: false,

    // Community
    createPosts: false,
    joinGroups: false,
    privateMessages: false,

    // Analytics
    viewingHistory: true,
    watchingStats: false,
    personalizedReports: false
  },

  basic: {
    // Basic Features (inherited from free)
    movieBrowsing: true,
    basicSearch: true,
    movieDetails: true,

    // Enhanced Features
    watchlistLimit: 100,
    ratingsLimit: 50,
    reviewsLimit: 20,
    advancedSearch: true,
    recommendations: true,
    downloadReceipts: true,

    // Community Features
    communityFeatures: true,
    createPosts: true,
    joinGroups: true,
    privateMessages: false, // Still limited

    // Streaming
    hdStreaming: true,
    multipleProfiles: 2,

    // Still Restricted
    prioritySupport: false,
    exclusiveContent: false,
    offlineViewing: false,

    // Analytics
    viewingHistory: true,
    watchingStats: true,
    personalizedReports: false
  },

  premium: {
    // All Features Unlocked
    movieBrowsing: true,
    basicSearch: true,
    movieDetails: true,
    advancedSearch: true,
    recommendations: true,

    // Unlimited
    watchlistLimit: Infinity,
    ratingsLimit: Infinity,
    reviewsLimit: Infinity,

    // Premium Features
    prioritySupport: true,
    exclusiveContent: true,
    downloadReceipts: true,
    offlineViewing: true,

    // Community
    communityFeatures: true,
    createPosts: true,
    joinGroups: true,
    privateMessages: true,

    // Streaming
    hdStreaming: true,
    multipleProfiles: 5,

    // Analytics
    viewingHistory: true,
    watchingStats: true,
    personalizedReports: true
  }
};

const useAccessControl = () => {
  const { user, isAuthenticated } = useAuth();

  // Get user's current plan (default to free for non-authenticated users)
  const currentPlan = isAuthenticated ? (user?.subscription || 'free') : 'free';
  const permissions = PLAN_PERMISSIONS[currentPlan] || PLAN_PERMISSIONS.free;

  // Check if user has access to a specific feature
  const hasAccess = useCallback((feature) => {
    return permissions[feature] === true;
  }, [permissions]);

  // Check if user has reached a limit for a feature
  const hasReachedLimit = useCallback((feature, currentCount) => {
    const limit = permissions[feature];
    if (typeof limit === 'number') {
      return currentCount >= limit;
    }
    return false;
  }, [permissions]);

  // Get the limit for a specific feature
  const getLimit = useCallback((feature) => {
    return permissions[feature];
  }, [permissions]);

  // Check if user can perform an action (considering limits)
  const canPerformAction = useCallback((feature, currentCount = 0) => {
    const limit = permissions[feature];

    if (typeof limit === 'boolean') {
      return limit;
    }

    if (typeof limit === 'number') {
      return currentCount < limit;
    }

    return false;
  }, [permissions]);

  // Get upgrade message for restricted features
  const getUpgradeMessage = (feature) => {
    const messages = {
      advancedSearch: 'Upgrade to Basic or Premium to access advanced search filters',
      recommendations: 'Upgrade to Basic or Premium to get personalized movie recommendations',
      communityFeatures: 'Upgrade to Basic or Premium to join our movie community',
      prioritySupport: 'Upgrade to Premium for priority customer support',
      exclusiveContent: 'Upgrade to Premium to access exclusive movies and content',
      offlineViewing: 'Upgrade to Premium to download movies for offline viewing',
      privateMessages: 'Upgrade to Premium to send private messages to other users',
      personalizedReports: 'Upgrade to Premium to get detailed viewing analytics',
      hdStreaming: 'Upgrade to Basic or Premium for HD streaming quality',
      multipleProfiles: 'Upgrade to Premium to manage multiple profiles',
      downloadReceipts: 'Upgrade to Basic or Premium to download movie receipts',
      viewingHistory: 'Upgrade to Basic or Premium to track your viewing history',
      watchingStats: 'Upgrade to Premium to get detailed watching statistics'
    };

    return messages[feature] || 'Upgrade your plan to access this feature';
  };

  // Get plan comparison for upgrade prompts
  const getPlanComparison = () => {
    return {
      current: currentPlan,
      permissions: permissions,
      upgradeTo: currentPlan === 'free' ? 'basic' : 'premium',
      allPlans: PLAN_PERMISSIONS
    };
  };

  // Check if feature requires authentication
  const requiresAuth = (feature) => {
    const authRequiredFeatures = [
      'watchlistLimit',
      'ratingsLimit',
      'reviewsLimit',
      'communityFeatures',
      'downloadReceipts',
      'viewingHistory',
      'watchingStats',
      'personalizedReports',
      'createPosts',
      'joinGroups',
      'privateMessages'
    ];

    return authRequiredFeatures.includes(feature);
  };

  // Get feature status with detailed information
  const getFeatureStatus = (feature, currentCount = 0) => {
    const requiresAuthentication = requiresAuth(feature);

    if (requiresAuthentication && !isAuthenticated) {
      return {
        available: false,
        reason: 'authentication_required',
        message: 'Please sign in to access this feature',
        canUpgrade: false
      };
    }

    const hasFeatureAccess = hasAccess(feature);
    const limit = getLimit(feature);
    const canPerform = canPerformAction(feature, currentCount);

    if (!hasFeatureAccess) {
      return {
        available: false,
        reason: 'plan_restriction',
        message: getUpgradeMessage(feature),
        canUpgrade: true,
        currentPlan,
        suggestedPlan: currentPlan === 'free' ? 'basic' : 'premium'
      };
    }

    if (typeof limit === 'number' && !canPerform) {
      return {
        available: false,
        reason: 'limit_reached',
        message: `You've reached your ${feature} limit (${limit}). Upgrade for more access.`,
        canUpgrade: true,
        currentCount,
        limit,
        currentPlan,
        suggestedPlan: currentPlan === 'free' ? 'basic' : 'premium'
      };
    }

    return {
      available: true,
      reason: 'allowed',
      message: 'Feature available',
      currentCount,
      limit: typeof limit === 'number' ? limit : null
    };
  };

  return {
    currentPlan,
    permissions,
    hasAccess,
    hasReachedLimit,
    getLimit,
    canPerformAction,
    getUpgradeMessage,
    getPlanComparison,
    requiresAuth,
    getFeatureStatus,
    isAuthenticated
  };
};

export default useAccessControl;
