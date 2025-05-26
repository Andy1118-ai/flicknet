import React, { useState } from 'react';
import { FaStar, FaPlay, FaBookmark, FaHeart, FaShare } from 'react-icons/fa';
import GlassCard from './GlassCard';

const EnhancedMovieCard = ({ movie, index = 0, onPlay, onBookmark, onLike, onShare }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    e.target.src = '/api/placeholder/300/450';
  };

  return (
    <div
      className="movie-card group cursor-pointer"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton animate-pulse" />
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

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(movie);
            }}
            className="bg-white/20 backdrop-blur-md rounded-full p-4 text-white hover:bg-white/30 hover:scale-110 transition-all duration-200"
          >
            <FaPlay className="text-xl ml-1" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.(movie);
            }}
            className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
          >
            <FaBookmark className="text-sm" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike?.(movie);
            }}
            className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-red-500 transition-colors"
          >
            <FaHeart className="text-sm" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(movie);
            }}
            className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-blue-500 transition-colors"
          >
            <FaShare className="text-sm" />
          </button>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3">
          <GlassCard className="px-2 py-1" opacity="medium">
            <div className="flex items-center gap-1 glass-text-primary text-sm font-semibold text-shadow">
              <FaStar className="text-yellow-400 text-xs" />
              <span>{movie.rating}</span>
            </div>
          </GlassCard>
        </div>

        {/* Year Badge */}
        <div className="absolute bottom-3 left-3">
          <GlassCard className="px-2 py-1" opacity="medium">
            <span className="glass-text-primary text-xs font-medium text-shadow">{movie.year}</span>
          </GlassCard>
        </div>
      </div>

      {/* Movie Info */}
      <div className="mt-3 space-y-2">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {movie.title}
        </h4>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span className="truncate">{movie.director}</span>
          <div className="flex items-center gap-1 ml-2">
            <FaStar className="text-yellow-400" />
            <span className="font-medium">{movie.rating}</span>
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {movie.genre?.slice(0, 2).map((genre, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
            >
              {genre}
            </span>
          ))}
          {movie.genre?.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              +{movie.genre.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Hover Details */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <GlassCard className="absolute -top-2 -left-2 -right-2 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div>
              <h5 className="glass-text-primary font-bold text-sm mb-1 text-shadow">{movie.title}</h5>
              <p className="glass-text-secondary text-xs opacity-90 line-clamp-3 text-shadow">{movie.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="bg-white/20 glass-text-primary px-2 py-1 rounded text-shadow">{movie.year}</span>
                <span className="bg-white/20 glass-text-primary px-2 py-1 rounded text-shadow">{movie.director}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default EnhancedMovieCard;
