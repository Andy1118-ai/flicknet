const Movie = require('../models/Movie');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Filter by genre
    if (req.query.genre) {
      query.genre = { $in: [req.query.genre] };
    }

    // Filter by year
    if (req.query.year) {
      query.year = parseInt(req.query.year);
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { director: searchRegex },
        { cast: { $in: [searchRegex] } }
      ];
    }

    // Sort options
    let sortBy = {};
    if (req.query.sort) {
      const sortField = req.query.sort;
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sortBy[sortField] = sortOrder;
    } else {
      sortBy = { createdAt: -1 }; // Default sort by newest
    }

    // Execute query
    const movies = await Movie.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip(startIndex);

    // Get total count for pagination
    const total = await Movie.countDocuments(query);

    // Pagination info
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json({
      success: true,
      count: movies.length,
      pagination,
      data: movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
const getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    // Increment view count
    movie.views += 1;
    await movie.save();

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie by slug
// @route   GET /api/movies/slug/:slug
// @access  Public
const getMovieBySlug = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug, isActive: true });

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    // Increment view count
    movie.views += 1;
    await movie.save();

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured movies
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const movies = await Movie.find({ isActive: true })
      .sort({ rating: -1, views: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movies by genre
// @route   GET /api/movies/genre/:genre
// @access  Public
const getMoviesByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const movies = await Movie.find({
      genre: { $in: [genre] },
      isActive: true
    })
      .sort({ rating: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Movie.countDocuments({
      genre: { $in: [genre] },
      isActive: true
    });

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json({
      success: true,
      count: movies.length,
      pagination,
      data: movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search movies
// @route   GET /api/movies/search
// @access  Public
const searchMovies = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const movies = await Movie.search(q)
      .limit(limit)
      .skip(startIndex);

    const total = await Movie.search(q).countDocuments();

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json({
      success: true,
      count: movies.length,
      pagination,
      data: movies,
      query: q
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie recommendations
// @route   GET /api/movies/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const limit = parseInt(req.query.limit, 10) || 10;

    // Check if user has access to recommendations
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription || !subscription.canAccess('recommendations')) {
      return res.status(403).json({
        success: false,
        error: 'Recommendations require Basic or Premium subscription'
      });
    }

    // Simple recommendation logic based on user's ratings and watchlist
    let recommendedMovies = [];

    if (user.ratings.length > 0) {
      // Get genres from highly rated movies
      const ratedMovieIds = user.ratings
        .filter(rating => rating.rating >= 7)
        .map(rating => rating.movieId);

      if (ratedMovieIds.length > 0) {
        const ratedMovies = await Movie.find({ _id: { $in: ratedMovieIds } });
        const preferredGenres = [...new Set(ratedMovies.flatMap(movie => movie.genre))];

        recommendedMovies = await Movie.find({
          genre: { $in: preferredGenres },
          _id: { $nin: [...ratedMovieIds, ...user.watchlist.map(w => w.movieId)] },
          isActive: true
        })
          .sort({ rating: -1, views: -1 })
          .limit(limit);
      }
    }

    // If no recommendations from ratings, use popular movies
    if (recommendedMovies.length < limit) {
      const additionalMovies = await Movie.find({
        _id: { $nin: [...user.watchlist.map(w => w.movieId), ...recommendedMovies.map(m => m._id)] },
        isActive: true
      })
        .sort({ rating: -1, views: -1 })
        .limit(limit - recommendedMovies.length);

      recommendedMovies = [...recommendedMovies, ...additionalMovies];
    }

    res.status(200).json({
      success: true,
      count: recommendedMovies.length,
      data: recommendedMovies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/movies/:id/watchlist
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const movie = await Movie.findById(req.params.id);

    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    // Check if already in watchlist
    const existingEntry = user.watchlist.find(
      item => item.movieId.toString() === req.params.id
    );

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        error: 'Movie already in watchlist'
      });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription.checkLimit('watchlistLimit', user.watchlist.length)) {
      return res.status(403).json({
        success: false,
        error: 'Watchlist limit reached for your subscription plan'
      });
    }

    // Add to watchlist
    user.watchlist.push({ movieId: req.params.id });
    await user.save();

    // Update movie watchlist count
    movie.watchlistCount += 1;
    await movie.save();

    res.status(200).json({
      success: true,
      message: 'Movie added to watchlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/movies/:id/watchlist
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    // Remove from watchlist
    user.watchlist = user.watchlist.filter(
      item => item.movieId.toString() !== req.params.id
    );
    await user.save();

    // Update movie watchlist count
    movie.watchlistCount = Math.max(0, movie.watchlistCount - 1);
    await movie.save();

    res.status(200).json({
      success: true,
      message: 'Movie removed from watchlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate a movie
// @route   POST /api/movies/:id/rate
// @access  Private
const rateMovie = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const user = await User.findById(req.user.id);
    const movie = await Movie.findById(req.params.id);

    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 10'
      });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ user: req.user.id });
    const existingRating = user.ratings.find(
      r => r.movieId.toString() === req.params.id
    );

    if (!existingRating && !subscription.checkLimit('ratingsLimit', user.ratings.length)) {
      return res.status(403).json({
        success: false,
        error: 'Rating limit reached for your subscription plan'
      });
    }

    // Update or add rating
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.ratedAt = new Date();
    } else {
      user.ratings.push({ movieId: req.params.id, rating });
      movie.ratingCount += 1;
    }

    await user.save();

    // Recalculate movie average rating
    const allRatings = await User.aggregate([
      { $unwind: '$ratings' },
      { $match: { 'ratings.movieId': movie._id } },
      { $group: { _id: null, avgRating: { $avg: '$ratings.rating' } } }
    ]);

    if (allRatings.length > 0) {
      movie.averageRating = Math.round(allRatings[0].avgRating * 10) / 10;
    }

    await movie.save();

    res.status(200).json({
      success: true,
      message: 'Movie rated successfully',
      data: {
        rating,
        movieAverageRating: movie.averageRating
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommendations for a specific movie
// @route   GET /api/movies/:id/recommendations
// @access  Public
const getMovieRecommendations = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    const limit = parseInt(req.query.limit, 10) || 10;

    // Get recommendations based on genre and rating
    const recommendations = await Movie.find({
      _id: { $ne: req.params.id }, // Exclude current movie
      genre: { $in: movie.genre },
      isActive: true
    })
      .sort({ averageRating: -1, views: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  rateMovie
};
