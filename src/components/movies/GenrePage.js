import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFilter, FaSortAmountDown, FaTh, FaList, FaArrowLeft } from 'react-icons/fa';
import { movieService } from '../../services/movieService';
import AnimatedMovieGrid from '../ui/AnimatedMovieGrid';
import GlassCard from '../ui/GlassCard';

const GenrePage = () => {
  const { genre } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    year: '',
    rating: '',
    status: ''
  });

  const subCategory = searchParams.get('sub');

  useEffect(() => {
    fetchMovies();
  }, [genre, subCategory, currentPage, sortBy, sortOrder, filters]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (genre === 'trending') {
        response = await movieService.getTrendingMovies();
        setMovies(response.movies || []);
        setTotalPages(1);
        setTotalResults(response.movies?.length || 0);
      } else if (genre === 'new-releases') {
        response = await movieService.getMovies(currentPage, 20, {
          sort: 'releaseDate',
          order: 'desc',
          ...filters
        });
        setMovies(response.movies || []);
        setTotalPages(response.totalPages || 1);
        setTotalResults(response.totalResults || 0);
      } else if (genre === 'top-rated') {
        response = await movieService.getMovies(currentPage, 20, {
          sort: 'averageRating',
          order: 'desc',
          ...filters
        });
        setMovies(response.movies || []);
        setTotalPages(response.totalPages || 1);
        setTotalResults(response.totalResults || 0);
      } else {
        response = await movieService.getMoviesByGenre(genre, currentPage, 20, {
          sort: sortBy,
          order: sortOrder,
          ...filters
        });
        setMovies(response.movies || []);
        setTotalPages(response.totalPages || 1);
        setTotalResults(response.totalResults || 0);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie._id || movie.id}`);
  };

  const handleMoviePlay = (movie) => {
    navigate(`/watch/${movie._id || movie.id}`);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const getPageTitle = () => {
    if (genre === 'trending') return 'Trending Movies';
    if (genre === 'new-releases') return 'New Releases';
    if (genre === 'top-rated') return 'Top Rated Movies';

    const capitalizedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);
    if (subCategory) {
      const capitalizedSub = subCategory.charAt(0).toUpperCase() + subCategory.slice(1);
      return `${capitalizedGenre} - ${capitalizedSub}`;
    }
    return `${capitalizedGenre} Movies`;
  };

  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'releaseDate', label: 'Release Date' },
    { value: 'title', label: 'Title' },
    { value: 'views', label: 'Popularity' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Movies</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchMovies}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {totalResults} movies found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Filters:</span>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <FaSortAmountDown className="text-gray-600 dark:text-gray-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <React.Fragment key={option.value}>
                    <option value={`${option.value}-desc`}>{option.label} (High to Low)</option>
                    <option value={`${option.value}-asc`}>{option.label} (Low to High)</option>
                  </React.Fragment>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="9">9+ Stars</option>
              <option value="8">8+ Stars</option>
              <option value="7">7+ Stars</option>
              <option value="6">6+ Stars</option>
            </select>
          </div>
        </GlassCard>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <AnimatedMovieGrid
            movies={movies}
            columns={{ sm: 2, md: 3, lg: 4, xl: 6 }}
            onMovieClick={handleMovieClick}
            onMoviePlay={handleMoviePlay}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Movies Found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenrePage;
