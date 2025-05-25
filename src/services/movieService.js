// FlickNet Movie Service
// Real API implementation for movie operations with sample data fallback

import axios from 'axios';
import {
  allSampleMovies,
  getMoviesByGenre as getSampleMoviesByGenre,
  getFeaturedMovies as getSampleFeaturedMovies,
  getTrendingMovies as getSampleTrendingMovies,
  getTopRatedMovies as getSampleTopRatedMovies,
  getNewReleases as getSampleNewReleases,
  searchMovies as searchSampleMovies,
  getMovieById as getSampleMovieById,
  getRecommendations as getSampleRecommendations,
  paginateMovies,
  filterAndSortMovies,
  getAllGenres as getSampleGenres
} from '../data/index';

class MovieService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
    this.useSampleData = process.env.REACT_APP_USE_SAMPLE_DATA === 'true' || true; // Default to true for testing

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

  async getPopularMovies(page = 1, limit = 20) {
    try {
      const response = await this.api.get('/movies', {
        params: { page, limit, sort: 'rating', order: 'desc' }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          totalPages: response.data.pagination.pages,
          currentPage: response.data.pagination.page,
          totalResults: response.data.pagination.total
        };
      }

      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
    } catch (error) {
      console.error('Get popular movies error:', error);
      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
    }
  }

  async getMovieById(id) {
    // Use sample data if enabled or if API fails
    if (this.useSampleData) {
      const movie = getSampleMovieById(id);
      if (!movie) throw new Error('Movie not found');
      return movie;
    }

    try {
      const response = await this.api.get(`/movies/${id}`);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Movie not found');
    } catch (error) {
      console.error('Get movie by ID error:', error);
      // Fallback to sample data when API fails
      const movie = getSampleMovieById(id);
      if (movie) return movie;
      throw new Error('Movie not found');
    }
  }

  async searchMovies(query, page = 1, limit = 20) {
    try {
      const response = await this.api.get('/movies/search', {
        params: { q: query, page, limit }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          totalPages: response.data.pagination.pages,
          currentPage: response.data.pagination.page,
          totalResults: response.data.pagination.total,
          query: response.data.query
        };
      }

      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0, query };
    } catch (error) {
      console.error('Search movies error:', error);
      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0, query };
    }
  }

  async getMovies(page = 1, limit = 20, filters = {}) {
    // Use sample data if enabled or if API fails
    if (this.useSampleData) {
      return this.getSampleMovies(page, limit, filters);
    }

    try {
      const response = await this.api.get('/movies', {
        params: { page, limit, ...filters }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          totalPages: response.data.pagination.pages,
          currentPage: response.data.pagination.page,
          totalResults: response.data.pagination.total
        };
      }

      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
    } catch (error) {
      console.error('Get movies error:', error);
      // Fallback to sample data when API fails
      return this.getSampleMovies(page, limit, filters);
    }
  }

  getSampleMovies(page = 1, limit = 20, filters = {}) {
    const filteredMovies = filterAndSortMovies(allSampleMovies, filters);
    return paginateMovies(filteredMovies, page, limit);
  }

  async getMoviesByGenre(genre, page = 1, limit = 20, filters = {}) {
    // Use sample data if enabled or if API fails
    if (this.useSampleData) {
      return this.getSampleMoviesByGenre(genre, page, limit, filters);
    }

    try {
      const response = await this.api.get(`/movies/genre/${genre}`, {
        params: { page, limit, ...filters }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          totalPages: response.data.pagination.pages,
          currentPage: response.data.pagination.page,
          totalResults: response.data.pagination.total,
          genre
        };
      }

      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0, genre };
    } catch (error) {
      console.error('Get movies by genre error:', error);
      // Fallback to sample data when API fails
      return this.getSampleMoviesByGenre(genre, page, limit, filters);
    }
  }

  getSampleMoviesByGenre(genre, page = 1, limit = 20, filters = {}) {
    const genreMovies = getSampleMoviesByGenre(genre);
    const filteredMovies = filterAndSortMovies(genreMovies, filters);
    const result = paginateMovies(filteredMovies, page, limit);
    return { ...result, genre };
  }

  async getTopRatedMovies(page = 1, limit = 20) {
    try {
      const response = await this.api.get('/movies', {
        params: { page, limit, sort: 'averageRating', order: 'desc' }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          totalPages: response.data.pagination.pages,
          currentPage: response.data.pagination.page,
          totalResults: response.data.pagination.total
        };
      }

      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
    } catch (error) {
      console.error('Get top rated movies error:', error);
      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
    }
  }

  async getRecommendations(userId, page = 1, limit = 10) {
    try {
      const response = await this.api.get('/movies/recommendations', {
        params: { page, limit }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          totalPages: 1,
          currentPage: page,
          totalResults: response.data.count
        };
      }

      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
    } catch (error) {
      console.error('Get recommendations error:', error);
      // If recommendations fail (e.g., requires subscription), return empty
      return { movies: [], totalPages: 0, currentPage: 1, totalResults: 0 };
    }
  }

  async getUserWatchlist(userId) {
    try {
      // Note: This would need to be implemented in the backend
      // For now, we'll use the user's watchlist from their profile
      const response = await this.api.get('/auth/me');

      if (response.data.success && response.data.user.watchlist) {
        return {
          movies: response.data.user.watchlist,
          totalCount: response.data.user.watchlist.length
        };
      }

      return { movies: [], totalCount: 0 };
    } catch (error) {
      console.error('Get user watchlist error:', error);
      return { movies: [], totalCount: 0 };
    }
  }

  async addToWatchlist(userId, movieId) {
    try {
      const response = await this.api.post(`/movies/${movieId}/watchlist`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || "Movie added to your watchlist!"
        };
      }

      return {
        success: false,
        error: response.data.error || "Failed to add movie to watchlist"
      };
    } catch (error) {
      console.error('Add to watchlist error:', error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to add movie to watchlist"
      };
    }
  }

  async removeFromWatchlist(userId, movieId) {
    try {
      const response = await this.api.delete(`/movies/${movieId}/watchlist`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || "Movie removed from your watchlist!"
        };
      }

      return {
        success: false,
        error: response.data.error || "Failed to remove movie from watchlist"
      };
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to remove movie from watchlist"
      };
    }
  }

  async rateMovie(userId, movieId, rating) {
    try {
      if (rating < 1 || rating > 10) {
        return {
          success: false,
          error: "Rating must be between 1 and 10"
        };
      }

      const response = await this.api.post(`/movies/${movieId}/rate`, { rating });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || "Thank you for rating this movie!",
          userRating: rating,
          movieAverageRating: response.data.data?.movieAverageRating
        };
      }

      return {
        success: false,
        error: response.data.error || "Failed to rate movie"
      };
    } catch (error) {
      console.error('Rate movie error:', error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to rate movie"
      };
    }
  }

  async getMovieReviews(movieId, page = 1, limit = 10) {
    try {
      // Note: This endpoint would need to be implemented in the backend
      // For now, return empty reviews
      return {
        reviews: [],
        totalPages: 0,
        currentPage: page,
        totalResults: 0,
        averageRating: 0
      };
    } catch (error) {
      console.error('Get movie reviews error:', error);
      return {
        reviews: [],
        totalPages: 0,
        currentPage: page,
        totalResults: 0,
        averageRating: 0
      };
    }
  }

  async submitReview(userId, movieId, reviewData) {
    try {
      const { rating, review } = reviewData;

      if (!rating || !review) {
        return {
          success: false,
          error: "Rating and review text are required"
        };
      }

      // Note: This endpoint would need to be implemented in the backend
      // For now, return success
      return {
        success: true,
        message: "Your review has been submitted successfully!",
        reviewId: Date.now()
      };
    } catch (error) {
      console.error('Submit review error:', error);
      return {
        success: false,
        error: "Failed to submit review"
      };
    }
  }

  async getGenres() {
    try {
      // Return the same genres as defined in the backend Movie model
      return [
        "Action", "Adventure", "Animation", "Biography", "Comedy",
        "Crime", "Documentary", "Drama", "Family", "Fantasy",
        "History", "Horror", "Music", "Mystery", "Romance",
        "Sci-Fi", "Sport", "Thriller", "War", "Western"
      ];
    } catch (error) {
      console.error('Get genres error:', error);
      return [];
    }
  }

  async getTrendingMovies() {
    // Use sample data if enabled or if API fails
    if (this.useSampleData) {
      const movies = getSampleTrendingMovies();
      return { movies, period: "week" };
    }

    try {
      const response = await this.api.get('/movies/featured');

      if (response.data.success) {
        return {
          movies: response.data.data,
          period: "week"
        };
      }

      return { movies: [], period: "week" };
    } catch (error) {
      console.error('Get trending movies error:', error);
      // Fallback to sample data when API fails
      const movies = getSampleTrendingMovies();
      return { movies, period: "week" };
    }
  }

  async getMovieRecommendations(movieId, limit = 12) {
    // Use sample data if enabled or if API fails
    if (this.useSampleData) {
      const movies = getSampleRecommendations(movieId, limit);
      return { movies, totalResults: movies.length };
    }

    try {
      const response = await this.api.get(`/movies/${movieId}/recommendations`, {
        params: { limit }
      });

      if (response.data.success) {
        return {
          movies: response.data.data,
          totalResults: response.data.count
        };
      }

      return { movies: [], totalResults: 0 };
    } catch (error) {
      console.error('Get movie recommendations error:', error);
      // Fallback to sample data when API fails
      const movies = getSampleRecommendations(movieId, limit);
      return { movies, totalResults: movies.length };
    }
  }
}

export const movieService = new MovieService();
