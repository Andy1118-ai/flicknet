import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlay, FaStar, FaBookmark } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RecommendationCarousel = ({ 
  movies = [], 
  title = "Recommended for You",
  onMovieClick,
  onMoviePlay,
  onMovieBookmark
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleMovies, setVisibleMovies] = useState(6);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateVisibleMovies = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleMovies(2);
      else if (width < 768) setVisibleMovies(3);
      else if (width < 1024) setVisibleMovies(4);
      else if (width < 1280) setVisibleMovies(5);
      else setVisibleMovies(6);
    };

    updateVisibleMovies();
    window.addEventListener('resize', updateVisibleMovies);
    return () => window.removeEventListener('resize', updateVisibleMovies);
  }, []);

  const maxIndex = Math.max(0, movies.length - visibleMovies);

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleMovieClick = (movie) => {
    onMovieClick?.(movie) || navigate(`/movie/${movie._id || movie.id}`);
  };

  const handleMoviePlay = (movie, e) => {
    e.stopPropagation();
    onMoviePlay?.(movie) || navigate(`/watch/${movie._id || movie.id}`);
  };

  const handleMovieBookmark = (movie, e) => {
    e.stopPropagation();
    onMovieBookmark?.(movie);
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FaChevronLeft className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FaChevronRight className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="flex gap-4"
          animate={{
            x: `-${currentIndex * (100 / visibleMovies)}%`
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie._id || movie.id || index}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / visibleMovies}% - ${(visibleMovies - 1) * 16 / visibleMovies}px)` }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              transition={{ duration: 0.2 }}
            >
              <MovieCard
                movie={movie}
                onClick={() => handleMovieClick(movie)}
                onPlay={(e) => handleMoviePlay(movie, e)}
                onBookmark={(e) => handleMovieBookmark(movie, e)}
                isHovered={isHovered}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Overlay */}
        <AnimatePresence>
          {isHovered && movies.length > visibleMovies && (
            <>
              {currentIndex > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <FaChevronLeft className="text-xl" />
                </motion.button>
              )}
              
              {currentIndex < maxIndex && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <FaChevronRight className="text-xl" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      {movies.length > visibleMovies && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MovieCard = ({ movie, onClick, onPlay, onBookmark, isHovered }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    e.target.src = '/api/placeholder/300/450';
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 mb-3">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse" />
        )}

        {/* Movie Image */}
        <img
          src={movie.poster || '/api/placeholder/300/450'}
          alt={movie.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } group-hover:scale-110`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action Buttons */}
        <AnimatePresence>
          {cardHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={onPlay}
                  className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 hover:scale-110 transition-all duration-200"
                >
                  <FaPlay className="text-lg ml-1" />
                </button>
                <button
                  onClick={onBookmark}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 hover:scale-110 transition-all duration-200"
                >
                  <FaBookmark className="text-sm" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating Badge */}
        {movie.averageRating && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center gap-1">
            <FaStar className="text-yellow-400" />
            {movie.averageRating.toFixed(1)}
          </div>
        )}

        {/* Premium Badge */}
        {movie.isPremium && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xs font-bold">
            PREMIUM
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{movie.year}</span>
          {movie.runtime && (
            <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
          )}
        </div>
        {movie.genre && movie.genre.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.genre.slice(0, 2).map((g, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCarousel;
