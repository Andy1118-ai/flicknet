// FlickNet Movie Trailer Component
// Component for displaying movie trailers with YouTube integration

import React, { useState, useEffect } from 'react';
import { FaPlay, FaTimes, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import { externalApiService } from '../../services/externalApiService';

const MovieTrailer = ({ movie, onClose, autoPlay = false }) => {
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    fetchTrailer();
  }, [movie.id]);

  const fetchTrailer = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get trailer from the movie data
      if (movie.trailer) {
        setTrailer({
          url: movie.trailer,
          embedUrl: movie.trailerEmbed || movie.trailer,
          source: 'database'
        });
        setLoading(false);
        return;
      }

      // Try to get trailer from backend
      const result = await externalApiService.getMovieTrailer(movie.id);
      
      if (result.success && result.trailer) {
        setTrailer(result.trailer);
      } else {
        setError(result.error || 'No trailer available for this movie');
      }
    } catch (err) {
      console.error('Error fetching trailer:', err);
      setError('Failed to load trailer');
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = () => {
    if (!trailer) return null;

    // If we have a specific embed URL, use it
    if (trailer.embedUrl && trailer.embedUrl !== trailer.url) {
      return trailer.embedUrl;
    }

    // Extract YouTube video ID and create embed URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = trailer.url.match(youtubeRegex);
    
    if (match) {
      const videoId = match[1];
      const autoplayParam = isPlaying ? '1' : '0';
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}&controls=1&showinfo=0&rel=0&modestbranding=1`;
    }

    return trailer.url;
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const handleOpenInNewTab = () => {
    if (trailer?.url) {
      window.open(trailer.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
            <span className="text-lg">Loading trailer...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Trailer Not Available</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!trailer) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-white">
          <div>
            <h3 className="text-xl font-bold">{movie.title} - Trailer</h3>
            {trailer.title && trailer.title !== movie.title && (
              <p className="text-sm text-gray-300">{trailer.title}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {trailer.url && (
              <button
                onClick={handleOpenInNewTab}
                className="text-white hover:text-blue-400 transition-colors"
                title="Open in new tab"
              >
                <FaExternalLinkAlt size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          {!isPlaying ? (
            // Thumbnail with play button
            <div className="absolute inset-0 flex items-center justify-center">
              {trailer.thumbnail && (
                <img
                  src={trailer.thumbnail}
                  alt={`${movie.title} trailer thumbnail`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <button
                  onClick={handlePlayClick}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors transform hover:scale-110"
                >
                  <FaPlay size={24} className="ml-1" />
                </button>
              </div>
            </div>
          ) : (
            // Embedded video
            <iframe
              src={getEmbedUrl()}
              title={`${movie.title} trailer`}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Trailer Info */}
        {trailer.source && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Source: {trailer.source === 'youtube' ? 'YouTube' : 
                      trailer.source === 'tmdb' ? 'TMDB' : 'Database'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Trailer Button Component
export const TrailerButton = ({ movie, className = '', size = 'md' }) => {
  const [showTrailer, setShowTrailer] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <>
      <button
        onClick={() => setShowTrailer(true)}
        className={`
          bg-red-600 hover:bg-red-700 text-white rounded-lg 
          transition-colors flex items-center space-x-2
          ${sizeClasses[size]} ${className}
        `}
      >
        <FaPlay size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />
        <span>Watch Trailer</span>
      </button>

      {showTrailer && (
        <MovieTrailer
          movie={movie}
          onClose={() => setShowTrailer(false)}
          autoPlay={true}
        />
      )}
    </>
  );
};

export default MovieTrailer;
