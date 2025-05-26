// FlickNet External API Service
// Frontend service for TMDB and YouTube integrations

import axios from 'axios';

class ExternalApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    // Configure axios defaults
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
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

  // TMDB Integration Methods

  /**
   * Search movies on TMDB
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @returns {Promise<Object>} Search results
   */
  async searchTMDBMovies(query, page = 1) {
    try {
      const response = await this.api.get('/external/tmdb/search', {
        params: { query, page }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          pagination: response.data.pagination,
          success: true
        };
      }

      return { movies: [], pagination: {}, success: false };
    } catch (error) {
      console.error('TMDB search error:', error);
      return {
        movies: [],
        pagination: {},
        success: false,
        error: error.response?.data?.error || 'Search failed'
      };
    }
  }

  /**
   * Get popular movies from TMDB
   * @param {number} page - Page number
   * @returns {Promise<Object>} Popular movies
   */
  async getTMDBPopularMovies(page = 1) {
    try {
      const response = await this.api.get('/external/tmdb/popular', {
        params: { page }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          pagination: response.data.pagination,
          success: true
        };
      }

      return { movies: [], pagination: {}, success: false };
    } catch (error) {
      console.error('TMDB popular movies error:', error);
      return {
        movies: [],
        pagination: {},
        success: false,
        error: error.response?.data?.error || 'Failed to fetch popular movies'
      };
    }
  }

  /**
   * Get trending movies from TMDB
   * @param {string} timeWindow - 'day' or 'week'
   * @param {number} page - Page number
   * @returns {Promise<Object>} Trending movies
   */
  async getTMDBTrendingMovies(timeWindow = 'week', page = 1) {
    try {
      const response = await this.api.get('/external/tmdb/trending', {
        params: { timeWindow, page }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          pagination: response.data.pagination,
          timeWindow: response.data.timeWindow,
          success: true
        };
      }

      return { movies: [], pagination: {}, success: false };
    } catch (error) {
      console.error('TMDB trending movies error:', error);
      return {
        movies: [],
        pagination: {},
        success: false,
        error: error.response?.data?.error || 'Failed to fetch trending movies'
      };
    }
  }

  /**
   * Get upcoming movies from TMDB
   * @param {number} page - Page number
   * @returns {Promise<Object>} Upcoming movies
   */
  async getTMDBUpcomingMovies(page = 1) {
    try {
      const response = await this.api.get('/external/tmdb/upcoming', {
        params: { page }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          pagination: response.data.pagination,
          success: true
        };
      }

      return { movies: [], pagination: {}, success: false };
    } catch (error) {
      console.error('TMDB upcoming movies error:', error);
      return {
        movies: [],
        pagination: {},
        success: false,
        error: error.response?.data?.error || 'Failed to fetch upcoming movies'
      };
    }
  }

  /**
   * Get movie details from TMDB
   * @param {string} tmdbId - TMDB movie ID
   * @returns {Promise<Object>} Movie details
   */
  async getTMDBMovieDetails(tmdbId) {
    try {
      const response = await this.api.get(`/external/tmdb/movie/${tmdbId}`);

      if (response.data.success) {
        return {
          movie: response.data.data,
          success: true
        };
      }

      return { movie: null, success: false };
    } catch (error) {
      console.error('TMDB movie details error:', error);
      return {
        movie: null,
        success: false,
        error: error.response?.data?.error || 'Failed to fetch movie details'
      };
    }
  }

  // YouTube Integration Methods

  /**
   * Search movie trailers on YouTube
   * @param {string} movieTitle - Movie title
   * @param {number} year - Release year
   * @param {number} maxResults - Maximum results
   * @returns {Promise<Object>} Trailer search results
   */
  async searchYouTubeTrailers(movieTitle, year = null, maxResults = 5) {
    try {
      const response = await this.api.get('/external/youtube/search', {
        params: { movieTitle, year, maxResults }
      });

      if (response.data.success) {
        return {
          trailers: response.data.data,
          count: response.data.count,
          success: true
        };
      }

      return { trailers: [], count: 0, success: false };
    } catch (error) {
      console.error('YouTube trailer search error:', error);
      return {
        trailers: [],
        count: 0,
        success: false,
        error: error.response?.data?.error || 'Failed to search trailers'
      };
    }
  }

  /**
   * Get best trailer for a movie
   * @param {string} movieTitle - Movie title
   * @param {number} year - Release year
   * @returns {Promise<Object>} Best trailer
   */
  async getBestTrailer(movieTitle, year = null) {
    try {
      const response = await this.api.get('/external/youtube/best-trailer', {
        params: { movieTitle, year }
      });

      if (response.data.success) {
        return {
          trailer: response.data.data,
          success: true
        };
      }

      return { trailer: null, success: false };
    } catch (error) {
      console.error('Best trailer error:', error);
      return {
        trailer: null,
        success: false,
        error: error.response?.data?.error || 'No trailer found'
      };
    }
  }

  // Movie Management Methods (Admin only)

  /**
   * Import movie from TMDB to local database
   * @param {string} tmdbId - TMDB movie ID
   * @returns {Promise<Object>} Import result
   */
  async importMovieFromTMDB(tmdbId) {
    try {
      const response = await this.api.post(`/external/import/movie/${tmdbId}`);

      if (response.data.success) {
        return {
          movie: response.data.data,
          message: response.data.message,
          success: true
        };
      }

      return {
        movie: null,
        success: false,
        error: response.data.error || 'Import failed'
      };
    } catch (error) {
      console.error('Movie import error:', error);
      return {
        movie: null,
        success: false,
        error: error.response?.data?.error || 'Failed to import movie'
      };
    }
  }

  /**
   * Sync movie with TMDB data
   * @param {string} movieId - Local movie ID
   * @returns {Promise<Object>} Sync result
   */
  async syncMovieWithTMDB(movieId) {
    try {
      const response = await this.api.put(`/external/sync/movie/${movieId}`);

      if (response.data.success) {
        return {
          movie: response.data.data,
          message: response.data.message,
          success: true
        };
      }

      return {
        movie: null,
        success: false,
        error: response.data.error || 'Sync failed'
      };
    } catch (error) {
      console.error('Movie sync error:', error);
      return {
        movie: null,
        success: false,
        error: error.response?.data?.error || 'Failed to sync movie'
      };
    }
  }

  /**
   * Get movie trailer from backend
   * @param {string} movieId - Movie ID
   * @returns {Promise<Object>} Trailer data
   */
  async getMovieTrailer(movieId) {
    try {
      const response = await this.api.get(`/movies/${movieId}/trailer`);

      if (response.data.success) {
        return {
          trailer: response.data.data,
          success: true
        };
      }

      return { trailer: null, success: false };
    } catch (error) {
      console.error('Movie trailer error:', error);
      return {
        trailer: null,
        success: false,
        error: error.response?.data?.error || 'No trailer found'
      };
    }
  }

  /**
   * Enrich movie with external data
   * @param {string} movieId - Movie ID
   * @returns {Promise<Object>} Enrichment result
   */
  async enrichMovieData(movieId) {
    try {
      const response = await this.api.put(`/movies/${movieId}/enrich`);

      if (response.data.success) {
        return {
          movie: response.data.data,
          message: response.data.message,
          enrichedFields: response.data.enrichedFields,
          success: true
        };
      }

      return {
        movie: null,
        success: false,
        error: response.data.error || 'Enrichment failed'
      };
    } catch (error) {
      console.error('Movie enrichment error:', error);
      return {
        movie: null,
        success: false,
        error: error.response?.data?.error || 'Failed to enrich movie'
      };
    }
  }

  /**
   * Get external API status
   * @returns {Promise<Object>} API status
   */
  async getAPIStatus() {
    try {
      const response = await this.api.get('/external/status');

      if (response.data.success) {
        return {
          status: response.data.data,
          success: true
        };
      }

      return { status: null, success: false };
    } catch (error) {
      console.error('API status error:', error);
      return {
        status: null,
        success: false,
        error: 'Failed to get API status'
      };
    }
  }
}

export const externalApiService = new ExternalApiService();
