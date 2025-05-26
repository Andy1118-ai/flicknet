import React, { useState, useEffect } from 'react';
import {
  FaFilm,
  FaEdit,
  FaSearch,
  FaFilter,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';
import { movieService } from '../../services/movieService';
import GlassCard from '../ui/GlassCard';

const ContentManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    genre: ''
  });

  useEffect(() => {
    loadMovies();
  }, [filters]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const result = await movieService.getMovies({ limit: 20 });
      if (result.success) {
        setMovies(result.movies || []);
      }
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMovie = (movie) => {
    setSelectedMovie(movie);
    setEditForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre ? movie.genre.join(', ') : '',
      director: movie.director || '',
      cast: movie.cast ? movie.cast.join(', ') : '',
      year: movie.year || '',
      rating: movie.rating || '',
      runtime: movie.runtime || ''
    });
    setShowEditModal(true);
  };

  const handleSaveMovie = async () => {
    try {
      // In a real implementation, this would call an API to update the movie
      console.log('Saving movie:', editForm);
      alert('Movie metadata updated successfully!');
      setShowEditModal(false);
      setSelectedMovie(null);
      loadMovies();
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('Failed to save movie changes');
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">Edit movie metadata and manage content accuracy</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {movies.length} movies found
          </span>
        </div>
      </div>

      {/* Notice */}
      <GlassCard className="p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Moderator Content Permissions</h4>
            <p className="text-sm text-blue-700">
              As a moderator, you can edit movie metadata for accuracy but cannot delete movies or add premium content (admin-only features).
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search movies by title, director, or cast..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Genres</option>
              <option value="Action">Action</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Thriller">Thriller</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Movies List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Loading movies...</p>
        </div>
      ) : movies.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FaFilm className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Movies Found</h3>
          <p className="text-gray-600">No movies match your current filters.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <GlassCard key={movie.id} className="p-4">
              <div className="aspect-w-2 aspect-h-3 mb-4">
                <img
                  src={movie.poster || '/api/placeholder/300/450?text=No+Poster'}
                  alt={movie.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{movie.title}</h3>
                
                <div className="text-sm text-gray-600">
                  <div><span className="font-medium">Year:</span> {movie.year}</div>
                  <div><span className="font-medium">Director:</span> {movie.director}</div>
                  <div><span className="font-medium">Rating:</span> {movie.rating}/10</div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {movie.genre?.slice(0, 2).map((g, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {g}
                    </span>
                  ))}
                  {movie.genre?.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{movie.genre.length - 2} more
                    </span>
                  )}
                </div>

                <button
                  className="w-full btn-outline flex items-center gap-2 justify-center mt-4"
                  onClick={() => handleEditMovie(movie)}
                >
                  <FaEdit />
                  Edit Metadata
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Edit Movie Modal */}
      {showEditModal && selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Edit Movie Metadata</h3>
              <p className="text-gray-600">Update movie information for accuracy</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={editForm.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Director
                    </label>
                    <input
                      type="text"
                      value={editForm.director}
                      onChange={(e) => handleInputChange('director', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Runtime (minutes)
                    </label>
                    <input
                      type="number"
                      value={editForm.runtime}
                      onChange={(e) => handleInputChange('runtime', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cast (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.cast}
                    onChange={(e) => handleInputChange('cast', e.target.value)}
                    placeholder="Actor 1, Actor 2, Actor 3..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genres (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    placeholder="Action, Drama, Thriller..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={editForm.rating}
                    onChange={(e) => handleInputChange('rating', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  className="btn-outline flex items-center gap-2"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMovie(null);
                  }}
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={handleSaveMovie}
                >
                  <FaSave />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
