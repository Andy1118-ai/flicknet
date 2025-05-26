import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaFilter } from 'react-icons/fa';
import { movieService } from '../../services/movieService';
import AnimatedMovieGrid from '../ui/AnimatedMovieGrid';
import LoadingAnimation from '../ui/LoadingAnimation';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: ''
  });

  useEffect(() => {
    if (query) {
      searchMovies();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage, filters]);

  const searchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await movieService.searchMovies(query, {
        page: currentPage,
        limit: 20,
        ...filters
      });

      setMovies(response.movies || []);
      setTotalResults(response.totalResults || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Failed to search movies. Please try again.');
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

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No search query provided
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please enter a search term to find movies.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
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
                Search Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {loading ? 'Searching...' : `${totalResults} results for "${query}"`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="btn-outline flex items-center gap-2">
              <FaFilter />
              Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Genres</option>
                <option value="action">Action</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="horror">Horror</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="romance">Romance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Ratings</option>
                <option value="9+">9.0+ Stars</option>
                <option value="8+">8.0+ Stars</option>
                <option value="7+">7.0+ Stars</option>
                <option value="6+">6.0+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingAnimation />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">{error}</div>
            <button
              onClick={searchMovies}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : movies.length > 0 ? (
          <>
            <AnimatedMovieGrid
              movies={movies}
              columns={{ sm: 2, md: 3, lg: 4, xl: 6 }}
              onMovieClick={handleMovieClick}
              onMoviePlay={handleMoviePlay}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No movies found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
