// Combined sample movie data for FlickNet testing
import { sampleMovies } from './sampleMovies';
import { additionalMovies } from './additionalMovies';

// Combine all sample movies
export const allSampleMovies = [...sampleMovies, ...additionalMovies];

// Helper functions for testing
export const getMoviesByGenre = (genre) => {
  return allSampleMovies.filter(movie => 
    movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
  );
};

export const getFeaturedMovies = () => {
  return allSampleMovies
    .filter(movie => movie.averageRating >= 8.0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10);
};

export const getTrendingMovies = () => {
  return allSampleMovies
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);
};

export const getTopRatedMovies = () => {
  return allSampleMovies
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 15);
};

export const getNewReleases = () => {
  return allSampleMovies
    .filter(movie => movie.year >= 2023)
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    .slice(0, 12);
};

export const getPremiumMovies = () => {
  return allSampleMovies.filter(movie => movie.isPremium);
};

export const getFreeMovies = () => {
  return allSampleMovies.filter(movie => !movie.isPremium);
};

export const searchMovies = (query) => {
  const searchTerm = query.toLowerCase();
  return allSampleMovies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm) ||
    movie.description.toLowerCase().includes(searchTerm) ||
    movie.genre.some(g => g.toLowerCase().includes(searchTerm)) ||
    movie.director.toLowerCase().includes(searchTerm) ||
    movie.cast.some(actor => actor.toLowerCase().includes(searchTerm))
  );
};

export const getMovieById = (id) => {
  return allSampleMovies.find(movie => movie._id === id);
};

export const getRecommendations = (movieId, limit = 10) => {
  const currentMovie = getMovieById(movieId);
  if (!currentMovie) return [];

  // Get movies with similar genres
  const recommendations = allSampleMovies
    .filter(movie => 
      movie._id !== movieId && 
      movie.genre.some(g => currentMovie.genre.includes(g))
    )
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);

  return recommendations;
};

// Pagination helper
export const paginateMovies = (movies, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMovies = movies.slice(startIndex, endIndex);
  
  return {
    movies: paginatedMovies,
    totalPages: Math.ceil(movies.length / limit),
    currentPage: page,
    totalResults: movies.length,
    hasNextPage: endIndex < movies.length,
    hasPrevPage: page > 1
  };
};

// Filter and sort helper
export const filterAndSortMovies = (movies, filters = {}) => {
  let filteredMovies = [...movies];

  // Apply filters
  if (filters.year) {
    filteredMovies = filteredMovies.filter(movie => movie.year.toString() === filters.year);
  }

  if (filters.rating) {
    const minRating = parseFloat(filters.rating);
    filteredMovies = filteredMovies.filter(movie => movie.averageRating >= minRating);
  }

  if (filters.isPremium !== undefined) {
    filteredMovies = filteredMovies.filter(movie => movie.isPremium === filters.isPremium);
  }

  if (filters.genre) {
    filteredMovies = filteredMovies.filter(movie => 
      movie.genre.some(g => g.toLowerCase() === filters.genre.toLowerCase())
    );
  }

  // Apply sorting
  if (filters.sort) {
    const { sort, order = 'desc' } = filters;
    filteredMovies.sort((a, b) => {
      let aValue, bValue;

      switch (sort) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'year':
        case 'releaseDate':
          aValue = new Date(a.releaseDate);
          bValue = new Date(b.releaseDate);
          break;
        case 'rating':
        case 'averageRating':
          aValue = a.averageRating;
          bValue = b.averageRating;
          break;
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'runtime':
          aValue = a.runtime;
          bValue = b.runtime;
          break;
        default:
          aValue = a.averageRating;
          bValue = b.averageRating;
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  return filteredMovies;
};

// Genre statistics
export const getGenreStats = () => {
  const genreCount = {};
  const genreRatings = {};

  allSampleMovies.forEach(movie => {
    movie.genre.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
      if (!genreRatings[genre]) {
        genreRatings[genre] = [];
      }
      genreRatings[genre].push(movie.averageRating);
    });
  });

  const genreStats = Object.keys(genreCount).map(genre => ({
    genre,
    count: genreCount[genre],
    averageRating: genreRatings[genre].reduce((a, b) => a + b, 0) / genreRatings[genre].length
  }));

  return genreStats.sort((a, b) => b.count - a.count);
};

// Export all available genres
export const getAllGenres = () => {
  const genres = new Set();
  allSampleMovies.forEach(movie => {
    movie.genre.forEach(genre => genres.add(genre));
  });
  return Array.from(genres).sort();
};

// Export sample data for easy access
export { sampleMovies, additionalMovies };
