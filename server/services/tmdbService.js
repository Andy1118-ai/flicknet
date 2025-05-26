// FlickNet TMDB Service
// Service for interacting with The Movie Database (TMDB) API

const axios = require('axios');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseURL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

    if (!this.apiKey) {
      console.warn('⚠️ TMDB API key not found. TMDB features will be disabled.');
      this.enabled = false;
      return;
    }

    this.enabled = true;

    // Configure axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      params: {
        api_key: this.apiKey
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('TMDB API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Search for movies by title
   * @param {string} query - Movie title to search for
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} Search results
   */
  async searchMovies(query, page = 1) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get('/search/movie', {
        params: {
          query,
          page,
          include_adult: false
        }
      });

      return {
        results: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        page: response.data.page
      };
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }

  /**
   * Get movie details by TMDB ID
   * @param {number} tmdbId - TMDB movie ID
   * @returns {Promise<Object>} Movie details
   */
  async getMovieDetails(tmdbId) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get(`/movie/${tmdbId}`, {
        params: {
          append_to_response: 'videos,credits,images'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw error;
    }
  }

  /**
   * Get movie videos (trailers, teasers, etc.)
   * @param {number} tmdbId - TMDB movie ID
   * @returns {Promise<Array>} Array of video objects
   */
  async getMovieVideos(tmdbId) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get(`/movie/${tmdbId}/videos`);
      return response.data.results;
    } catch (error) {
      console.error('Error getting movie videos:', error);
      throw error;
    }
  }

  /**
   * Get YouTube trailer URL for a movie
   * @param {number} tmdbId - TMDB movie ID
   * @returns {Promise<string|null>} YouTube trailer URL or null if not found
   */
  async getMovieTrailer(tmdbId) {
    if (!this.enabled) {
      return null;
    }

    try {
      const videos = await this.getMovieVideos(tmdbId);

      // Find the best trailer (prefer official trailers from YouTube)
      const trailer = videos.find(video =>
        video.site === 'YouTube' &&
        video.type === 'Trailer' &&
        video.official === true
      ) || videos.find(video =>
        video.site === 'YouTube' &&
        video.type === 'Trailer'
      ) || videos.find(video =>
        video.site === 'YouTube' &&
        (video.type === 'Teaser' || video.type === 'Clip')
      );

      if (trailer) {
        return `https://www.youtube.com/watch?v=${trailer.key}`;
      }

      return null;
    } catch (error) {
      console.error('Error getting movie trailer:', error);
      return null;
    }
  }

  /**
   * Get movie images (posters, backdrops)
   * @param {number} tmdbId - TMDB movie ID
   * @returns {Promise<Object>} Images object with posters and backdrops
   */
  async getMovieImages(tmdbId) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get(`/movie/${tmdbId}/images`);
      return response.data;
    } catch (error) {
      console.error('Error getting movie images:', error);
      throw error;
    }
  }

  /**
   * Get full image URL from TMDB path
   * @param {string} path - Image path from TMDB
   * @param {string} size - Image size (w500, w780, original, etc.)
   * @returns {string} Full image URL
   */
  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  /**
   * Find movie by title and year (for matching with local database)
   * @param {string} title - Movie title
   * @param {number} year - Release year
   * @returns {Promise<Object|null>} Best matching movie or null
   */
  async findMovieByTitleAndYear(title, year) {
    if (!this.enabled) {
      return null;
    }

    try {
      const searchResults = await this.searchMovies(title);

      if (!searchResults.results || searchResults.results.length === 0) {
        return null;
      }

      // Find exact match by year
      let bestMatch = searchResults.results.find(movie => {
        const releaseYear = new Date(movie.release_date).getFullYear();
        return releaseYear === year;
      });

      // If no exact year match, find closest match by title similarity
      if (!bestMatch) {
        bestMatch = searchResults.results.find(movie =>
          movie.title.toLowerCase() === title.toLowerCase()
        );
      }

      // If still no match, return the first result
      if (!bestMatch && searchResults.results.length > 0) {
        bestMatch = searchResults.results[0];
      }

      return bestMatch;
    } catch (error) {
      console.error('Error finding movie by title and year:', error);
      return null;
    }
  }

  /**
   * Get trending movies
   * @param {string} timeWindow - 'day' or 'week'
   * @param {number} page - Page number
   * @returns {Promise<Object>} Trending movies
   */
  async getTrendingMovies(timeWindow = 'week', page = 1) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get(`/trending/movie/${timeWindow}`, {
        params: { page }
      });

      return {
        results: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        page: response.data.page
      };
    } catch (error) {
      console.error('Error getting trending movies:', error);
      throw error;
    }
  }

  /**
   * Get popular movies
   * @param {number} page - Page number
   * @returns {Promise<Object>} Popular movies
   */
  async getPopularMovies(page = 1) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get('/movie/popular', {
        params: { page }
      });

      return {
        results: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        page: response.data.page
      };
    } catch (error) {
      console.error('Error getting popular movies:', error);
      throw error;
    }
  }

  /**
   * Get top rated movies
   * @param {number} page - Page number
   * @returns {Promise<Object>} Top rated movies
   */
  async getTopRatedMovies(page = 1) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get('/movie/top_rated', {
        params: { page }
      });

      return {
        results: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        page: response.data.page
      };
    } catch (error) {
      console.error('Error getting top rated movies:', error);
      throw error;
    }
  }

  /**
   * Get upcoming movies
   * @param {number} page - Page number
   * @returns {Promise<Object>} Upcoming movies
   */
  async getUpcomingMovies(page = 1) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get('/movie/upcoming', {
        params: { page }
      });

      return {
        results: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        page: response.data.page
      };
    } catch (error) {
      console.error('Error getting upcoming movies:', error);
      throw error;
    }
  }

  /**
   * Get movie genres from TMDB
   * @returns {Promise<Array>} Array of genre objects
   */
  async getGenres() {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get('/genre/movie/list');
      return response.data.genres;
    } catch (error) {
      console.error('Error getting genres:', error);
      throw error;
    }
  }

  /**
   * Discover movies with filters
   * @param {Object} filters - Filter options
   * @param {number} page - Page number
   * @returns {Promise<Object>} Discovered movies
   */
  async discoverMovies(filters = {}, page = 1) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get('/discover/movie', {
        params: {
          page,
          ...filters
        }
      });

      return {
        results: response.data.results,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        page: response.data.page
      };
    } catch (error) {
      console.error('Error discovering movies:', error);
      throw error;
    }
  }

  /**
   * Get movie credits (cast and crew)
   * @param {number} tmdbId - TMDB movie ID
   * @returns {Promise<Object>} Credits object with cast and crew
   */
  async getMovieCredits(tmdbId) {
    if (!this.enabled) {
      throw new Error('TMDB service is not enabled');
    }

    try {
      const response = await this.api.get(`/movie/${tmdbId}/credits`);
      return response.data;
    } catch (error) {
      console.error('Error getting movie credits:', error);
      throw error;
    }
  }

  /**
   * Convert TMDB movie data to FlickNet movie format
   * @param {Object} tmdbMovie - TMDB movie object
   * @returns {Object} FlickNet movie object
   */
  convertToFlickNetFormat(tmdbMovie) {
    const genreMap = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Sci-Fi',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    };

    return {
      title: tmdbMovie.title,
      year: new Date(tmdbMovie.release_date).getFullYear(),
      genre: tmdbMovie.genre_ids ?
        tmdbMovie.genre_ids.map(id => genreMap[id]).filter(Boolean) :
        tmdbMovie.genres ? tmdbMovie.genres.map(g => genreMap[g.id] || g.name) : [],
      description: tmdbMovie.overview,
      poster: tmdbMovie.poster_path ? this.getImageUrl(tmdbMovie.poster_path, 'w500') : null,
      backdrop: tmdbMovie.backdrop_path ? this.getImageUrl(tmdbMovie.backdrop_path, 'w1280') : null,
      rating: tmdbMovie.vote_average || 0,
      releaseDate: new Date(tmdbMovie.release_date),
      runtime: tmdbMovie.runtime || null,
      language: tmdbMovie.original_language || 'en',
      country: tmdbMovie.production_countries?.[0]?.name || 'United States',
      tmdbId: tmdbMovie.id.toString(),
      status: tmdbMovie.status === 'Released' ? 'released' :
              tmdbMovie.status === 'Post Production' ? 'upcoming' : 'in-production'
    };
  }

  /**
   * Check if TMDB service is enabled and configured
   * @returns {boolean} True if service is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

module.exports = new TMDBService();
