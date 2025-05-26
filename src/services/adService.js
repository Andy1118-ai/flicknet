import axios from 'axios';

class AdService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Sample ads for demonstration - in a real app, these would come from an ad server
  getSampleAds() {
    return [
      {
        id: 1,
        title: "Upgrade to FlickNet Premium",
        description: "Enjoy ad-free streaming, exclusive content, and 4K quality",
        image: "/api/placeholder/400/200",
        cta: "Upgrade Now",
        type: "internal",
        targetUrl: "/subscription",
        backgroundColor: "from-blue-600 to-purple-600",
        category: "subscription"
      },
      {
        id: 2,
        title: "New Action Movies This Week",
        description: "Don't miss the latest blockbusters - streaming now!",
        image: "/api/placeholder/400/200",
        cta: "Watch Now",
        type: "internal",
        targetUrl: "/genre/action",
        backgroundColor: "from-red-600 to-orange-600",
        category: "content"
      },
      {
        id: 3,
        title: "FlickNet Originals",
        description: "Exclusive content you won't find anywhere else",
        image: "/api/placeholder/400/200",
        cta: "Explore",
        type: "internal",
        targetUrl: "/genre/exclusive",
        backgroundColor: "from-green-600 to-blue-600",
        category: "originals"
      },
      {
        id: 4,
        title: "Join FlickNet Community",
        description: "Connect with fellow movie lovers and share reviews",
        image: "/api/placeholder/400/200",
        cta: "Join Now",
        type: "internal",
        targetUrl: "/community",
        backgroundColor: "from-purple-600 to-pink-600",
        category: "community"
      },
      {
        id: 5,
        title: "Download FlickNet Mobile App",
        description: "Watch your favorite movies on the go",
        image: "/api/placeholder/400/200",
        cta: "Download",
        type: "external",
        targetUrl: "https://app.flicknet.com",
        backgroundColor: "from-indigo-600 to-blue-600",
        category: "mobile"
      }
    ];
  }

  // Get ads based on user context
  async getContextualAds(context = {}) {
    try {
      const {
        userType = 'free',
        currentPage = 'dashboard',
        movieGenre = null,
        limit = 1
      } = context;

      const allAds = this.getSampleAds();
      let filteredAds = allAds;

      // Filter ads based on context
      if (currentPage === 'movie-detail' && movieGenre) {
        // Show content-related ads on movie detail pages
        filteredAds = allAds.filter(ad =>
          ad.category === 'content' || ad.category === 'subscription'
        );
      } else if (currentPage === 'dashboard') {
        // Show subscription and general ads on dashboard
        filteredAds = allAds.filter(ad =>
          ad.category === 'subscription' || ad.category === 'originals'
        );
      } else if (currentPage === 'genre') {
        // Show content and subscription ads on genre pages
        filteredAds = allAds.filter(ad =>
          ad.category === 'content' || ad.category === 'subscription'
        );
      }

      // For free users, prioritize subscription ads
      if (userType === 'free') {
        const subscriptionAds = filteredAds.filter(ad => ad.category === 'subscription');
        const otherAds = filteredAds.filter(ad => ad.category !== 'subscription');
        filteredAds = [...subscriptionAds, ...otherAds];
      }

      // Randomly select from filtered ads
      const selectedAds = this.shuffleArray(filteredAds).slice(0, limit);

      return {
        success: true,
        ads: selectedAds,
        context
      };
    } catch (error) {
      console.error('Error getting contextual ads:', error);
      return {
        success: false,
        ads: [],
        error: error.message
      };
    }
  }

  // Get ads for specific placement
  async getAdsForPlacement(placement, userContext = {}) {
    try {
      const placements = {
        'movie-detail-bottom': {
          categories: ['subscription', 'content'],
          limit: 1
        },
        'dashboard-sidebar': {
          categories: ['subscription', 'originals'],
          limit: 2
        },
        'genre-page-top': {
          categories: ['content', 'subscription'],
          limit: 1
        },
        'player-preroll': {
          categories: ['subscription'],
          limit: 1
        }
      };

      const placementConfig = placements[placement];
      if (!placementConfig) {
        throw new Error(`Unknown placement: ${placement}`);
      }

      const allAds = this.getSampleAds();
      const filteredAds = allAds.filter(ad =>
        placementConfig.categories.includes(ad.category)
      );

      const selectedAds = this.shuffleArray(filteredAds).slice(0, placementConfig.limit);

      return {
        success: true,
        ads: selectedAds,
        placement,
        userContext
      };
    } catch (error) {
      console.error('Error getting ads for placement:', error);
      return {
        success: false,
        ads: [],
        error: error.message
      };
    }
  }

  // Track ad impression
  async trackImpression(adId, context = {}) {
    try {
      // In a real app, this would send data to an analytics service
      console.log('Ad impression tracked:', { adId, context, timestamp: new Date() });

      return {
        success: true,
        tracked: true
      };
    } catch (error) {
      console.error('Error tracking ad impression:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Track ad click
  async trackClick(adId, context = {}) {
    try {
      // In a real app, this would send data to an analytics service
      console.log('Ad click tracked:', { adId, context, timestamp: new Date() });

      return {
        success: true,
        tracked: true
      };
    } catch (error) {
      console.error('Error tracking ad click:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if user should see ads
  shouldShowAds(user, isAuthenticated) {
    // Don't show ads to premium users
    if (isAuthenticated && user?.subscription?.isPremium) {
      return false;
    }

    // Show ads to free users and non-authenticated users
    return true;
  }

  // Get ad frequency settings
  getAdFrequency(userType = 'free') {
    const frequencies = {
      'free': {
        movieDetail: 'always', // Show on every movie detail page
        dashboard: 'session', // Show once per session
        genre: 'every-3rd', // Show every 3rd page visit
        player: 'every-video' // Show before every video
      },
      'basic': {
        movieDetail: 'reduced', // Show less frequently
        dashboard: 'never',
        genre: 'never',
        player: 'every-5th' // Show every 5th video
      },
      'premium': {
        movieDetail: 'never',
        dashboard: 'never',
        genre: 'never',
        player: 'never'
      }
    };

    return frequencies[userType] || frequencies['free'];
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get ad configuration for different user types
  getAdConfig(userType = 'free') {
    const configs = {
      'free': {
        showAds: true,
        maxAdsPerPage: 2,
        adTypes: ['subscription', 'content', 'originals'],
        skipDelay: 5, // seconds before skip button appears
        autoClose: false
      },
      'basic': {
        showAds: true,
        maxAdsPerPage: 1,
        adTypes: ['subscription'],
        skipDelay: 3,
        autoClose: true
      },
      'premium': {
        showAds: false,
        maxAdsPerPage: 0,
        adTypes: [],
        skipDelay: 0,
        autoClose: true
      }
    };

    return configs[userType] || configs['free'];
  }
}

export const adService = new AdService();
