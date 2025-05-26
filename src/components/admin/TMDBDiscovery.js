// FlickNet TMDB Discovery Component
// Admin component for discovering and importing movies from TMDB

import React, { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaEye, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { externalApiService } from '../../services/externalApiService';

const TMDBDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState({});
  const [activeTab, setActiveTab] = useState('search');
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    checkApiStatus();
    if (activeTab === 'popular') {
      fetchPopularMovies();
    } else if (activeTab === 'trending') {
      fetchTrendingMovies();
    }
  }, [activeTab]);

  const checkApiStatus = async () => {
    const result = await externalApiService.getAPIStatus();
    if (result.success) {
      setApiStatus(result.status);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const result = await externalApiService.searchTMDBMovies(searchQuery);
      if (result.success) {
        setSearchResults(result.movies);
      } else {
        console.error('Search failed:', result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularMovies = async () => {
    setLoading(true);
    try {
      const result = await externalApiService.getTMDBPopularMovies();
      if (result.success) {
        setPopularMovies(result.movies);
      }
    } catch (error) {
      console.error('Error fetching popular movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingMovies = async () => {
    setLoading(true);
    try {
      const result = await externalApiService.getTMDBTrendingMovies();
      if (result.success) {
        setTrendingMovies(result.movies);
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportMovie = async (movie) => {
    if (!movie.tmdbId) return;

    setImporting(prev => ({ ...prev, [movie.tmdbId]: true }));
    
    try {
      const result = await externalApiService.importMovieFromTMDB(movie.tmdbId);
      if (result.success) {
        // Show success feedback
        setImporting(prev => ({ ...prev, [movie.tmdbId]: 'success' }));
        setTimeout(() => {
          setImporting(prev => ({ ...prev, [movie.tmdbId]: false }));
        }, 2000);
      } else {
        console.error('Import failed:', result.error);
        setImporting(prev => ({ ...prev, [movie.tmdbId]: 'error' }));
        setTimeout(() => {
          setImporting(prev => ({ ...prev, [movie.tmdbId]: false }));
        }, 3000);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImporting(prev => ({ ...prev, [movie.tmdbId]: 'error' }));
      setTimeout(() => {
        setImporting(prev => ({ ...prev, [movie.tmdbId]: false }));
      }, 3000);
    }
  };

  const getImportButtonContent = (movieId) => {
    const status = importing[movieId];
    
    if (status === true) {
      return <FaSpinner className="animate-spin" />;
    } else if (status === 'success') {
      return <FaCheck className="text-green-500" />;
    } else if (status === 'error') {
      return <FaTimes className="text-red-500" />;
    }
    
    return <FaDownload />;
  };

  const MovieCard = ({ movie }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={movie.poster || '/api/placeholder/300/450'}
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{movie.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{movie.year}</p>
        <p className="text-gray-700 text-sm mb-3 line-clamp-3">{movie.description}</p>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleImportMovie(movie)}
            disabled={importing[movie.tmdbId]}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded transition-colors
              ${importing[movie.tmdbId] === 'success' 
                ? 'bg-green-500 text-white' 
                : importing[movie.tmdbId] === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
              ${importing[movie.tmdbId] === true ? 'opacity-75 cursor-not-allowed' : ''}
            `}
          >
            {getImportButtonContent(movie.tmdbId)}
            <span>Import</span>
          </button>
          
          <button
            onClick={() => window.open(`https://www.themoviedb.org/movie/${movie.tmdbId}`, '_blank')}
            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            title="View on TMDB"
          >
            <FaEye />
          </button>
        </div>
      </div>
    </div>
  );

  const getCurrentMovies = () => {
    switch (activeTab) {
      case 'search':
        return searchResults;
      case 'popular':
        return popularMovies;
      case 'trending':
        return trendingMovies;
      default:
        return [];
    }
  };

  if (!apiStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
        <span>Loading API status...</span>
      </div>
    );
  }

  if (!apiStatus.tmdb?.enabled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">TMDB Service Not Available</h3>
        <p className="text-yellow-700">
          The TMDB service is not enabled. Please check your API configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">TMDB Movie Discovery</h2>
        
        {/* API Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">API Status:</h4>
          <div className="flex space-x-4 text-sm">
            <span className={`flex items-center ${apiStatus.tmdb?.enabled ? 'text-green-600' : 'text-red-600'}`}>
              {apiStatus.tmdb?.enabled ? '✅' : '❌'} TMDB: {apiStatus.tmdb?.status}
            </span>
            <span className={`flex items-center ${apiStatus.youtube?.enabled ? 'text-green-600' : 'text-red-600'}`}>
              {apiStatus.youtube?.enabled ? '✅' : '❌'} YouTube: {apiStatus.youtube?.status}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          {[
            { id: 'search', label: 'Search' },
            { id: 'popular', label: 'Popular' },
            { id: 'trending', label: 'Trending' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Form */}
        {activeTab === 'search' && (
          <form onSubmit={handleSearch} className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies on TMDB..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            </button>
          </form>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
            <span>Loading movies...</span>
          </div>
        ) : getCurrentMovies().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getCurrentMovies().map((movie) => (
              <MovieCard key={movie.tmdbId} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            {activeTab === 'search' 
              ? 'Search for movies to see results here'
              : 'No movies found'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default TMDBDiscovery;
