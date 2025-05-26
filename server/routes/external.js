// FlickNet External API Routes
// Routes for TMDB and YouTube API integrations

const express = require('express');
const {
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
} = require('../controllers/externalApiController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes - TMDB
router.get('/tmdb/search', searchTMDBMovies);
router.get('/tmdb/popular', getTMDBPopularMovies);
router.get('/tmdb/trending', getTMDBTrendingMovies);
router.get('/tmdb/upcoming', getTMDBUpcomingMovies);
router.get('/tmdb/movie/:tmdbId', getTMDBMovieDetails);

// Public routes - YouTube
router.get('/youtube/search', searchYouTubeTrailers);
router.get('/youtube/best-trailer', getBestTrailer);

// Admin only routes - Data management
router.post('/import/movie/:tmdbId', protect, authorize('admin'), importMovieFromTMDB);
router.put('/sync/movie/:id', protect, authorize('admin'), syncMovieWithTMDB);

// Status route
router.get('/status', getAPIStatus);

module.exports = router;
