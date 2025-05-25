import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaPlay, FaBookmark, FaHeart, FaShare, FaStar, FaClock,
  FaCalendarAlt, FaArrowLeft, FaDownload, FaPlus
} from 'react-icons/fa';
import { movieService } from '../../services/movieService';
import { useAuth } from '../../context/AuthContext';
import RecommendationCarousel from './RecommendationCarousel';
import AdDisplay from './AdDisplay';
import GlassCard from '../ui/GlassCard';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showAdDisplay, setShowAdDisplay] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    // Show ad for non-premium users after 3 seconds
    if (!isAuthenticated || !user?.subscription?.isPremium) {
      const timer = setTimeout(() => {
        setShowAdDisplay(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const movieData = await movieService.getMovieById(id);
      setMovie(movieData);

      // Fetch recommendations based on movie
      try {
        const recResponse = await movieService.getMovieRecommendations(id, 12);
        setRecommendations(recResponse.movies || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to genre-based recommendations
        if (movieData.genre && movieData.genre.length > 0) {
          const recResponse = await movieService.getMoviesByGenre(movieData.genre[0], 1, 12);
          const filteredRecs = recResponse.movies?.filter(m => m._id !== id) || [];
          setRecommendations(filteredRecs);
        }
      }

      // Check if user has bookmarked/liked this movie (if authenticated)
      if (isAuthenticated) {
        // These would typically come from the API response
        setIsBookmarked(movieData.isBookmarked || false);
        setIsLiked(movieData.isLiked || false);
        setUserRating(movieData.userRating || 0);
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('Failed to load movie details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    navigate(`/watch/${id}`);
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await movieService.removeFromWatchlist(id);
      } else {
        await movieService.addToWatchlist(id);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      // This would be implemented in the movie service
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleRating = async (rating) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await movieService.rateMovie(id, rating);
      setUserRating(rating);
    } catch (error) {
      console.error('Error rating movie:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Check out ${movie.title} on FlickNet!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="aspect-[2/3] bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Movie Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The movie you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        {movie.backdrop && (
          <div className="absolute inset-0 h-96 lg:h-[500px]">
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/1920/1080';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6 pb-12">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Movie Poster */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <img
                  src={movie.poster || '/api/placeholder/400/600'}
                  alt={movie.title}
                  className="w-full max-w-sm mx-auto rounded-xl shadow-2xl"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/400/600';
                  }}
                />
                {movie.isPremium && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-sm font-bold">
                    PREMIUM
                  </div>
                )}
              </motion.div>
            </div>

            {/* Movie Details */}
            <div className="lg:col-span-2 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">{movie.title}</h1>

                {/* Movie Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-300">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    <span>{movie.year}</span>
                  </div>
                  {movie.runtime && (
                    <div className="flex items-center gap-2">
                      <FaClock />
                      <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                    </div>
                  )}
                  {movie.averageRating && (
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-400" />
                      <span>{movie.averageRating.toFixed(1)}/10</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {movie.genre && movie.genre.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genre.map((g, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                  {movie.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlay}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FaPlay />
                    Play Now
                  </motion.button>

                  <button
                    onClick={handleBookmark}
                    className={`p-3 rounded-lg transition-colors ${
                      isBookmarked
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    <FaBookmark />
                  </button>

                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-lg transition-colors ${
                      isLiked
                        ? 'bg-red-600 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    <FaHeart />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                  >
                    <FaShare />
                  </button>

                  {isAuthenticated && (
                    <button className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
                      <FaDownload />
                    </button>
                  )}
                </div>

                {/* User Rating */}
                {isAuthenticated && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Rate this movie:</h3>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRating(rating)}
                          className={`p-1 transition-colors ${
                            rating <= userRating ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'
                          }`}
                        >
                          <FaStar />
                        </button>
                      ))}
                      {userRating > 0 && (
                        <span className="ml-2 text-sm text-gray-300">
                          You rated: {userRating}/10
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Details Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Cast and Crew */}
        {(movie.cast || movie.director) && (
          <GlassCard className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cast & Crew</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {movie.director && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Director</h3>
                  <p className="text-gray-600 dark:text-gray-400">{movie.director}</p>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cast</h3>
                  <p className="text-gray-600 dark:text-gray-400">{movie.cast.join(', ')}</p>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <RecommendationCarousel
            movies={recommendations}
            title="More Like This"
            onMovieClick={(movie) => navigate(`/movie/${movie._id || movie.id}`)}
            onMoviePlay={(movie) => navigate(`/watch/${movie._id || movie.id}`)}
          />
        )}
      </div>

      {/* Ad Display for Non-Premium Users */}
      <AdDisplay
        position="bottom"
        isVisible={showAdDisplay}
        onClose={() => setShowAdDisplay(false)}
      />
    </div>
  );
};

export default MovieDetailPage;
