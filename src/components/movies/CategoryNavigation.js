import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaFilm, FaFire, FaHeart, FaLaugh, FaSkull, FaRocket, FaDragon } from 'react-icons/fa';
import { movieService } from '../../services/movieService';

const CategoryNavigation = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [subCategories, setSubCategories] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Genre icons mapping
  const genreIcons = {
    'Action': FaRocket,
    'Adventure': FaDragon,
    'Animation': FaFilm,
    'Comedy': FaLaugh,
    'Crime': FaSkull,
    'Drama': FaHeart,
    'Fantasy': FaDragon,
    'Horror': FaSkull,
    'Romance': FaHeart,
    'Sci-Fi': FaRocket,
    'Thriller': FaFire,
    'War': FaFire,
    'Western': FaFire,
    'Mystery': FaSkull,
    'Family': FaHeart,
    'Documentary': FaFilm,
    'Biography': FaFilm,
    'History': FaFilm,
    'Music': FaFilm,
    'Sport': FaFire
  };

  // Sub-categories for each genre
  const genreSubCategories = {
    'Action': ['Superhero', 'Martial Arts', 'Military', 'Spy', 'Heist'],
    'Adventure': ['Treasure Hunt', 'Survival', 'Exploration', 'Quest'],
    'Comedy': ['Romantic Comedy', 'Dark Comedy', 'Parody', 'Slapstick'],
    'Drama': ['Family Drama', 'Legal Drama', 'Medical Drama', 'Period Drama'],
    'Horror': ['Supernatural', 'Slasher', 'Psychological', 'Zombie'],
    'Sci-Fi': ['Space Opera', 'Cyberpunk', 'Time Travel', 'Dystopian'],
    'Thriller': ['Psychological Thriller', 'Crime Thriller', 'Political Thriller'],
    'Romance': ['Contemporary', 'Historical', 'Supernatural', 'Teen'],
    'Fantasy': ['Epic Fantasy', 'Urban Fantasy', 'Dark Fantasy', 'Fairy Tale'],
    'Crime': ['Detective', 'Gangster', 'Heist', 'Police Procedural']
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreList = await movieService.getGenres();
        setGenres(genreList);
        
        // Set up sub-categories
        const subCats = {};
        genreList.forEach(genre => {
          subCats[genre] = genreSubCategories[genre] || ['Popular', 'New Releases', 'Top Rated'];
        });
        setSubCategories(subCats);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreClick = (genre) => {
    if (selectedGenre === genre) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      setSelectedGenre(genre);
      setIsDropdownOpen(true);
    }
  };

  const handleSubCategoryClick = (genre, subCategory) => {
    setIsDropdownOpen(false);
    setSelectedGenre(null);
    navigate(`/genre/${genre.toLowerCase()}?sub=${encodeURIComponent(subCategory.toLowerCase())}`);
  };

  const handleGenreNavigate = (genre) => {
    setIsDropdownOpen(false);
    setSelectedGenre(null);
    navigate(`/genre/${genre.toLowerCase()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FaFilm className="text-blue-600" />
          Browse by Category
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {genres.length} genres available
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {genres.map((genre) => {
          const IconComponent = genreIcons[genre] || FaFilm;
          const isSelected = selectedGenre === genre;

          return (
            <div key={genre} className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative cursor-pointer rounded-xl p-4 transition-all duration-300
                  ${isSelected 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
                onClick={() => handleGenreClick(genre)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <IconComponent className="text-2xl" />
                  <span className="font-medium text-sm">{genre}</span>
                  <FaChevronDown 
                    className={`text-xs transition-transform duration-200 ${
                      isSelected && isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </motion.div>

              {/* Dropdown for sub-categories */}
              <AnimatePresence>
                {isSelected && isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="py-2">
                      <button
                        onClick={() => handleGenreNavigate(genre)}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        All {genre}
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      {subCategories[genre]?.map((subCategory) => (
                        <button
                          key={subCategory}
                          onClick={() => handleSubCategoryClick(genre, subCategory)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          {subCategory}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Quick access buttons */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/genre/trending')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300"
          >
            🔥 Trending Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/genre/new-releases')}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300"
          >
            ✨ New Releases
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/genre/top-rated')}
            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300"
          >
            ⭐ Top Rated
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;
