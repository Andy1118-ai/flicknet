import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaFilm,
  FaStar,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaBookmark,
  FaEye,
  FaLock,
  FaCrown,
  FaHeart
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { movieService } from '../../services/movieService';
import useAccessControl from '../../hooks/useAccessControl';
import GlassCard from '../ui/GlassCard';
import AnimatedMovieGrid from '../ui/AnimatedMovieGrid';
import MoodSelector from '../ui/MoodSelector';
import SmartSearch from '../ui/SmartSearch';
import AuthDebugPanel from '../debug/AuthDebugPanel';
import CategoryNavigation from '../movies/CategoryNavigation';


const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { getUpcomingReleases } = useNotifications();
  const { currentPlan, hasAccess, getFeatureStatus, getLimit } = useAccessControl();

  const [stats, setStats] = useState({
    totalMovies: 0,
    watchedMovies: 0,
    watchlistCount: 0,
    averageRating: 0
  });
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  // Memoize the watchlist limit calculation to prevent unnecessary re-renders
  const watchlistLimit = useMemo(() => {
    // Get the actual limit value from permissions, not just access boolean
    const limit = getLimit('watchlistLimit');
    if (typeof limit === 'number') return limit;
    if (limit === true || limit === Infinity) return Infinity;
    return 0;
  }, [getLimit]);

  // Memoize the load dashboard data function
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load trending movies
      const trendingData = await movieService.getTrendingMovies();
      setTrendingMovies(trendingData.movies);

      // Load upcoming releases from notifications
      const upcoming = getUpcomingReleases().slice(0, 4);
      setUpcomingMovies(upcoming);

      // Mock stats (in real app, these would come from API)
      const watchlistCount = isAuthenticated ? 23 : 0;

      setStats({
        totalMovies: 1247,
        watchedMovies: isAuthenticated ? 89 : 0,
        watchlistCount,
        watchlistLimit,
        averageRating: isAuthenticated ? 4.2 : 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [getUpcomingReleases, isAuthenticated, watchlistLimit]);

  useEffect(() => {
    // Only load dashboard data when auth is not loading
    if (!authLoading) {
      loadDashboardData();
    }
  }, [loadDashboardData, authLoading]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // New handlers for enhanced features
  const handleMoodSelect = useCallback(async (mood) => {
    setSelectedMood(mood);
    setLoading(true);

    try {
      // Simulate mood-based recommendation API call
      const moodMovies = trendingMovies.filter(movie =>
        mood.keywords.some(keyword =>
          movie.genre.some(g => g.toLowerCase().includes(keyword.toLowerCase()))
        )
      );
      setRecommendedMovies(moodMovies.slice(0, 8));
    } catch (error) {
      console.error('Error getting mood recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [trendingMovies]);

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setLoading(true);

    try {
      const searchResults = await movieService.searchMovies(query);
      setTrendingMovies(searchResults.movies);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMoviePlay = useCallback((movie) => {
    console.log('Playing movie:', movie.title);
    // In a real app, this would open a video player or navigate to watch page
  }, []);

  const handleMovieBookmark = useCallback((movie) => {
    console.log('Bookmarking movie:', movie.title);
    // In a real app, this would add/remove from watchlist
  }, []);

  const handleMovieLike = useCallback((movie) => {
    console.log('Liking movie:', movie.title);
    // In a real app, this would add/remove from favorites
  }, []);

  const handleMovieShare = useCallback((movie) => {
    console.log('Sharing movie:', movie.title);
    // In a real app, this would open share dialog
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Check out ${movie.title} on FlickNet!`,
        url: window.location.href
      });
    }
  }, []);

  const PlanUpgradePrompt = ({ feature, className = "" }) => {
    const featureStatus = getFeatureStatus(feature);

    if (featureStatus.available) return null;

    return (
      <div className={`bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-2">
          <FaLock className="text-primary-600" />
          <span className="font-medium text-primary-700">
            {currentPlan === 'free' ? 'Upgrade to unlock' : 'Premium feature'}
          </span>
        </div>
        <p className="text-sm text-primary-600 mb-3">{featureStatus.message}</p>
        <button
          className="btn-primary text-sm py-2 px-4"
          onClick={() => window.location.href = '/subscription'}
        >
          <FaCrown className="mr-1" />
          Upgrade Plan
        </button>
      </div>
    );
  };

  const formatReleaseDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-lg">Loading your movie dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Smart Search Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SmartSearch onSearch={handleSearch} />
      </motion.div>

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-8 bg-gradient-to-r from-primary-600 to-secondary-600 text-white border-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl lg:text-4xl font-bold">
                {isAuthenticated
                  ? `${getGreeting()}, ${user?.firstName}!`
                  : `${getGreeting()}! Welcome to FlickNet`
                }
              </h1>
              {isAuthenticated && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentPlan === 'free' ? 'bg-gray-100 text-gray-700' :
                  currentPlan === 'basic' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {currentPlan === 'free' ? 'Free' :
                   currentPlan === 'basic' ? 'Basic' : 'Premium'}
                  {currentPlan === 'premium' && <FaCrown className="inline ml-1" />}
                </span>
              )}
            </div>
            <p className="text-xl text-blue-100 mb-6">
              {isAuthenticated
                ? "Ready to discover your next favorite movie?"
                : "Discover amazing movies and join our community of film enthusiasts"
              }
            </p>
            {!isAuthenticated && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105"
                    onClick={() => window.location.href = '/signup'}
                  >
                    Join FlickNet Today
                  </button>
                  <button
                    className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                    onClick={() => setShowMoodSelector(!showMoodSelector)}
                  >
                    <FaHeart className="inline mr-2" />
                    Find by Mood
                  </button>
                </div>
                <p className="text-blue-100 text-sm">
                  Sign up to create watchlists, rate movies, and connect with other movie lovers!
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <FaFilm className="text-3xl text-blue-200" />
              <div>
                <div className="text-2xl font-bold">{stats.totalMovies}</div>
                <div className="text-blue-200 text-sm">Movies Available</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <FaEye className="text-3xl text-blue-200" />
              <div>
                <div className="text-2xl font-bold">
                  {isAuthenticated ? stats.watchedMovies : '2.4K'}
                </div>
                <div className="text-blue-200 text-sm">
                  {isAuthenticated ? 'Movies Watched' : 'Active Users'}
                </div>
              </div>
            </div>
          </div>
        </div>
        </GlassCard>
      </motion.div>

      {/* Mood Selector */}
      {(showMoodSelector || selectedMood) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-6">
            <MoodSelector
              onMoodSelect={handleMoodSelect}
              selectedMood={selectedMood}
            />
          </GlassCard>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, staggerChildren: 0.1 }}
      >
        {isAuthenticated ? (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard className="p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaBookmark className="text-xl text-primary-600" />
                <h3 className="font-semibold glass-text-primary text-shadow">Watchlist</h3>
                {currentPlan === 'free' && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Limited
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold glass-text-primary text-shadow">{stats.watchlistCount}</span>
                {stats.watchlistLimit !== Infinity && (
                  <span className="text-lg glass-text-secondary">/ {stats.watchlistLimit}</span>
                )}
              </div>
              <div className="text-sm glass-text-secondary">
                {stats.watchlistLimit === Infinity ? 'Unlimited movies' : 'Movies to watch'}
              </div>
              {currentPlan === 'free' && stats.watchlistCount >= 8 && (
                <div className="mt-3 text-xs text-yellow-600">
                  <FaLock className="inline mr-1" />
                  Upgrade for unlimited watchlist
                </div>
              )}
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <GlassCard className="p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <FaStar className="text-xl text-primary-600" />
                  <h3 className="font-semibold glass-text-primary text-shadow">Average Rating</h3>
                </div>
                <div className="text-3xl font-bold glass-text-primary text-shadow mb-1">{stats.averageRating}</div>
                <div className="text-sm glass-text-secondary">Your movie ratings</div>
              </GlassCard>
            </motion.div>

            <div className="card-hover p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaUsers className="text-xl text-primary-600" />
                <h3 className="font-semibold text-gray-700">Community</h3>
                {!hasAccess('communityFeatures') && (
                  <FaLock className="text-gray-400" />
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">2.4K</div>
              <div className="text-sm text-gray-600">Active members</div>
              {!hasAccess('communityFeatures') && (
                <div className="mt-3 text-xs text-yellow-600">
                  <FaLock className="inline mr-1" />
                  Upgrade to join discussions
                </div>
              )}
            </div>

            <div className="card-hover p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaChartLine className="text-xl text-primary-600" />
                <h3 className="font-semibold text-gray-700">This Week</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
              <div className="text-sm text-gray-600">Movies watched</div>
            </div>
          </>
        ) : (
          <>
            <div className="card-hover p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaUsers className="text-xl text-primary-600" />
                <h3 className="font-semibold text-gray-700">Community</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">2.4K</div>
              <div className="text-sm text-gray-600">Active members</div>
            </div>

            <div className="card-hover p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaStar className="text-xl text-primary-600" />
                <h3 className="font-semibold text-gray-700">Top Rated</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">8.9</div>
              <div className="text-sm text-gray-600">Average rating</div>
            </div>

            <div className="card-hover p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaChartLine className="text-xl text-primary-600" />
                <h3 className="font-semibold text-gray-700">New This Week</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">24</div>
              <div className="text-sm text-gray-600">Fresh releases</div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FaBookmark className="text-xl text-primary-600" />
                <h3 className="font-semibold text-primary-700">Create Watchlist</h3>
              </div>
              <div className="text-3xl font-bold text-primary-600 mb-4">∞</div>
              <button
                className="btn-outline text-sm py-2 px-4"
                onClick={() => window.location.href = '/signup'}
              >
                Sign up to start
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Category Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <CategoryNavigation />
      </motion.div>

      {/* Content Grid */}
      <motion.div
        className="grid lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Trending/Recommended Movies */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaChartLine className="text-primary-600" />
              {selectedMood ? `${selectedMood.name} Movies` : searchQuery ? 'Search Results' : 'Trending Now'}
            </h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              View All
            </button>
          </div>

          <AnimatedMovieGrid
            movies={selectedMood ? recommendedMovies : trendingMovies}
            columns={{ sm: 2, md: 3, lg: 4, xl: 4 }}
            onMoviePlay={handleMoviePlay}
            onMovieBookmark={handleMovieBookmark}
            onMovieLike={handleMovieLike}
            onMovieShare={handleMovieShare}
          />
        </div>

        {/* Upcoming Releases */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FaCalendarAlt className="text-primary-600" />
              Upcoming Releases
            </h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium">View All</button>
          </div>

          <div className="space-y-4">
            {upcomingMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <GlassCard className="p-4 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 rounded-lg p-3 text-center min-w-[60px]">
                    <div className="text-xs font-semibold text-primary-600 uppercase">
                      {formatReleaseDate(movie.releaseDate).split(' ')[0]}
                    </div>
                    <div className="text-lg font-bold text-primary-700">
                      {formatReleaseDate(movie.releaseDate).split(' ')[1]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold glass-text-primary text-shadow mb-1">{movie.title}</h4>
                    <p className="text-sm glass-text-secondary">{movie.message}</p>
                  </div>
                  <button className="glass-text-muted hover:text-primary-600 transition-colors p-2">
                    <FaBookmark />
                  </button>
                </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Plan-based Feature Prompts */}
      {isAuthenticated && currentPlan === 'free' && (
        <div className="grid md:grid-cols-2 gap-6">
          <PlanUpgradePrompt feature="advancedSearch" />
          <PlanUpgradePrompt feature="recommendations" />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isAuthenticated ? 'Quick Actions' : 'Get Started'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isAuthenticated ? (
            <>
              <button className="card-hover p-6 text-center group">
                <FaFilm className="text-3xl text-primary-600 group-hover:text-primary-700 mx-auto mb-3 transition-colors" />
                <span className="font-medium text-gray-700">Browse Movies</span>
              </button>
              <button className="card-hover p-6 text-center group">
                <FaBookmark className="text-3xl text-primary-600 group-hover:text-primary-700 mx-auto mb-3 transition-colors" />
                <span className="font-medium text-gray-700">My Watchlist</span>
              </button>
              <button className="card-hover p-6 text-center group" onClick={() => window.location.href = '/community'}>
                <FaUsers className="text-3xl text-primary-600 group-hover:text-primary-700 mx-auto mb-3 transition-colors" />
                <span className="font-medium text-gray-700">Community</span>
              </button>
              <button className="card-hover p-6 text-center group">
                <FaStar className="text-3xl text-primary-600 group-hover:text-primary-700 mx-auto mb-3 transition-colors" />
                <span className="font-medium text-gray-700">Rate Movies</span>
              </button>
            </>
          ) : (
            <>
              <button className="card-hover p-6 text-center group" onClick={() => window.location.href = '/signup'}>
                <FaUsers className="text-3xl text-primary-600 group-hover:text-primary-700 mx-auto mb-3 transition-colors" />
                <span className="font-medium text-gray-700">Join Community</span>
              </button>
              <button className="card-hover p-6 text-center group" onClick={() => window.location.href = '/signup'}>
                <FaBookmark className="text-3xl text-primary-600 group-hover:text-primary-700 mx-auto mb-3 transition-colors" />
                <span className="font-medium text-gray-700">Create Watchlist</span>
              </button>
              <button className="card-hover p-6 text-center group" onClick={() => window.location.href = '/signup'}>
                <FaStar className="text-3xl text-primary-600 group-hover:text-primary-700 mx-auto mb-3 transition-colors" />
                <span className="font-medium text-gray-700">Rate & Review</span>
              </button>
              <button className="card-hover p-6 text-center group" onClick={() => window.location.href = '/login'}>
                <FaFilm className="text-3xl text-primary-600 group-hover:text-primary-700 mx-auto mb-3 transition-colors" />
                <span className="font-medium text-gray-700">Sign In</span>
              </button>
            </>
          )}
        </div>

        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to unlock all features?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">Join thousands of movie enthusiasts and get personalized recommendations, create watchlists, and connect with fellow film lovers.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                onClick={() => window.location.href = '/signup'}
              >
                Create Free Account
              </button>
              <button
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auth Debug Panel - Only shows in development */}
      <AuthDebugPanel />
    </motion.div>
  );
};

export default Dashboard;
