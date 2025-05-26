// FlickNet External API Controller
// Handles TMDB and YouTube API integrations

const tmdbService = require('../services/tmdbService');
const youtubeService = require('../services/youtubeService');
const Movie = require('../models/Movie');

// @desc    Search movies on TMDB
// @route   GET /api/external/tmdb/search
// @access  Public
const searchTMDBMovies = async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    if (!tmdbService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'TMDB service is not available'
      });
    }

    const results = await tmdbService.searchMovies(query, page);

    res.status(200).json({
      success: true,
      data: results.results.map(movie => tmdbService.convertToFlickNetFormat(movie)),
      pagination: {
        page: results.page,
        totalPages: results.totalPages,
        totalResults: results.totalResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular movies from TMDB
// @route   GET /api/external/tmdb/popular
// @access  Public
const getTMDBPopularMovies = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    if (!tmdbService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'TMDB service is not available'
      });
    }

    const results = await tmdbService.getPopularMovies(page);

    res.status(200).json({
      success: true,
      data: results.results.map(movie => tmdbService.convertToFlickNetFormat(movie)),
      pagination: {
        page: results.page,
        totalPages: results.totalPages,
        totalResults: results.totalResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending movies from TMDB
// @route   GET /api/external/tmdb/trending
// @access  Public
const getTMDBTrendingMovies = async (req, res, next) => {
  try {
    const { timeWindow = 'week', page = 1 } = req.query;

    if (!tmdbService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'TMDB service is not available'
      });
    }

    const results = await tmdbService.getTrendingMovies(timeWindow, page);

    res.status(200).json({
      success: true,
      data: results.results.map(movie => tmdbService.convertToFlickNetFormat(movie)),
      pagination: {
        page: results.page,
        totalPages: results.totalPages,
        totalResults: results.totalResults
      },
      timeWindow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming movies from TMDB
// @route   GET /api/external/tmdb/upcoming
// @access  Public
const getTMDBUpcomingMovies = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    if (!tmdbService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'TMDB service is not available'
      });
    }

    const results = await tmdbService.getUpcomingMovies(page);

    res.status(200).json({
      success: true,
      data: results.results.map(movie => tmdbService.convertToFlickNetFormat(movie)),
      pagination: {
        page: results.page,
        totalPages: results.totalPages,
        totalResults: results.totalResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie details from TMDB
// @route   GET /api/external/tmdb/movie/:tmdbId
// @access  Public
const getTMDBMovieDetails = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    if (!tmdbService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'TMDB service is not available'
      });
    }

    const movieDetails = await tmdbService.getMovieDetails(tmdbId);
    const convertedMovie = tmdbService.convertToFlickNetFormat(movieDetails);

    // Get additional data
    const credits = await tmdbService.getMovieCredits(tmdbId);
    convertedMovie.cast = credits.cast.slice(0, 10).map(actor => actor.name);
    convertedMovie.director = credits.crew.find(person => person.job === 'Director')?.name;

    res.status(200).json({
      success: true,
      data: convertedMovie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search movie trailers on YouTube
// @route   GET /api/external/youtube/search
// @access  Public
const searchYouTubeTrailers = async (req, res, next) => {
  try {
    const { movieTitle, year, maxResults = 5 } = req.query;

    if (!movieTitle) {
      return res.status(400).json({
        success: false,
        error: 'Movie title is required'
      });
    }

    if (!youtubeService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'YouTube service is not available'
      });
    }

    const trailers = await youtubeService.searchMovieTrailers(
      movieTitle,
      year ? parseInt(year) : null,
      parseInt(maxResults)
    );

    res.status(200).json({
      success: true,
      data: trailers,
      count: trailers.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get best trailer for a movie
// @route   GET /api/external/youtube/best-trailer
// @access  Public
const getBestTrailer = async (req, res, next) => {
  try {
    const { movieTitle, year } = req.query;

    if (!movieTitle) {
      return res.status(400).json({
        success: false,
        error: 'Movie title is required'
      });
    }

    if (!youtubeService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'YouTube service is not available'
      });
    }

    const trailer = await youtubeService.findBestTrailer(
      movieTitle,
      year ? parseInt(year) : null
    );

    if (!trailer) {
      return res.status(404).json({
        success: false,
        error: 'No trailer found for this movie'
      });
    }

    res.status(200).json({
      success: true,
      data: trailer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import movie from TMDB to local database
// @route   POST /api/external/import/movie/:tmdbId
// @access  Private (Admin only)
const importMovieFromTMDB = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    if (!tmdbService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'TMDB service is not available'
      });
    }

    // Check if movie already exists
    const existingMovie = await Movie.findOne({ tmdbId });
    if (existingMovie) {
      return res.status(409).json({
        success: false,
        error: 'Movie already exists in database'
      });
    }

    // Get movie details from TMDB
    const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);
    const convertedMovie = tmdbService.convertToFlickNetFormat(tmdbMovie);

    // Get additional data
    const credits = await tmdbService.getMovieCredits(tmdbId);
    convertedMovie.cast = credits.cast.slice(0, 10).map(actor => actor.name);
    convertedMovie.director = credits.crew.find(person => person.job === 'Director')?.name;

    // Try to get trailer
    if (youtubeService.isEnabled()) {
      try {
        const trailer = await youtubeService.findBestTrailer(tmdbMovie.title, convertedMovie.year);
        if (trailer) {
          convertedMovie.trailer = trailer.url;
          convertedMovie.trailerEmbed = trailer.embedUrl;
        }
      } catch (trailerError) {
        console.warn('Could not fetch trailer for movie:', tmdbMovie.title);
      }
    }

    // Create movie in database
    const movie = await Movie.create(convertedMovie);

    res.status(201).json({
      success: true,
      data: movie,
      message: 'Movie imported successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync movie data with TMDB
// @route   PUT /api/external/sync/movie/:id
// @access  Private (Admin only)
const syncMovieWithTMDB = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    if (!movie.tmdbId) {
      return res.status(400).json({
        success: false,
        error: 'Movie does not have TMDB ID'
      });
    }

    if (!tmdbService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'TMDB service is not available'
      });
    }

    // Get updated data from TMDB
    const tmdbMovie = await tmdbService.getMovieDetails(movie.tmdbId);
    const updatedData = tmdbService.convertToFlickNetFormat(tmdbMovie);

    // Get additional data
    const credits = await tmdbService.getMovieCredits(movie.tmdbId);
    updatedData.cast = credits.cast.slice(0, 10).map(actor => actor.name);
    updatedData.director = credits.crew.find(person => person.job === 'Director')?.name;

    // Update movie in database
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { ...updatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedMovie,
      message: 'Movie synced successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get API status
// @route   GET /api/external/status
// @access  Public
const getAPIStatus = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        tmdb: {
          enabled: tmdbService.isEnabled(),
          status: tmdbService.isEnabled() ? 'available' : 'disabled'
        },
        youtube: {
          enabled: youtubeService.isEnabled(),
          status: youtubeService.isEnabled() ? 'available' : 'disabled'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchTMDBMovies,
  getTMDBPopularMovies,
  getTMDBTrendingMovies,
  getTMDBUpcomingMovies,
  getTMDBMovieDetails,
  searchYouTubeTrailers,
  getBestTrailer,
  importMovieFromTMDB,
  syncMovieWithTMDB,
  getAPIStatus
};
