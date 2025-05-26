const express = require('express');
const {
  getMovies,
  getMovie,
  getMovieBySlug,
  getFeaturedMovies,
  getMoviesByGenre,
  searchMovies,
  getRecommendations,
  getMovieRecommendations,
  addToWatchlist,
  removeFromWatchlist,
  rateMovie,
  getMovieTrailer,
  enrichMovieData
} = require('../controllers/movieController');

const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/search', searchMovies);
router.get('/genre/:genre', getMoviesByGenre);
router.get('/slug/:slug', getMovie);
router.get('/:id/recommendations', getMovieRecommendations);
router.get('/:id', getMovie);

// Protected routes
router.get('/recommendations', protect, getRecommendations);
router.post('/:id/watchlist', protect, addToWatchlist);
router.delete('/:id/watchlist', protect, removeFromWatchlist);
router.post('/:id/rate', protect, rateMovie);

// Trailer routes
router.get('/:id/trailer', getMovieTrailer);

// Admin routes
router.put('/:id/enrich', protect, enrichMovieData);

module.exports = router;
