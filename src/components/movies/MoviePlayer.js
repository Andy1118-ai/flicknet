import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand,
  FaCompress, FaBackward, FaForward, FaTimes, FaCog
} from 'react-icons/fa';
import { movieService } from '../../services/movieService';
import { useAuth } from '../../context/AuthContext';
import LoadingAnimation from '../ui/LoadingAnimation';

const MoviePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const videoRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            handleExit();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const movieData = await movieService.getMovieById(id);
      setMovie(movieData);

      // Check if user has access to this movie
      if (movieData.isPremium && (!isAuthenticated || !user?.subscription?.isPremium)) {
        setError('This is a premium movie. Please upgrade your subscription to watch.');
        return;
      }

      // Simulate loading time for the enhanced dramatic branded animation
      setTimeout(() => {
        setShowLoadingAnimation(false);
        setLoading(false);
      }, 5000);

    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('Failed to load movie. Please try again.');
      setLoading(false);
      setShowLoadingAnimation(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExit = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    }
    navigate(-1);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (showLoadingAnimation) {
    return (
      <LoadingAnimation
        isVisible={true}
        onComplete={() => setShowLoadingAnimation(false)}
        movieTitle={movie?.title}
        type="movie"
        duration={5000}
        allowSkip={true}
      />
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md mx-auto px-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Playback Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/subscription')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Upgrade Now
            </button>
            <button
              onClick={handleExit}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onMouseMove={showControlsTemporarily}
      onClick={showControlsTemporarily}
    >
      {/* Video Player */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={movie?.backdrop || movie?.poster}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onDurationChange={(e) => setDuration(e.target.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onLoadedData={() => setBuffering(false)}
      >
        {/* Video sources would be added here based on available qualities */}
        <source src={movie?.videoUrl || '/api/placeholder/video'} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Buffering Indicator */}
      <AnimatePresence>
        {buffering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Buffering...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExit}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
                <div className="text-white">
                  <h1 className="text-xl font-bold">{movie?.title}</h1>
                  <p className="text-sm text-gray-300">{movie?.year} • {movie?.genre?.join(', ')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <FaCog />
                  </button>
                  {showQualityMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-black/90 rounded-lg p-2 min-w-[120px]">
                      {['1080p', '720p', '480p', '360p'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            setShowQualityMenu(false);
                          }}
                          className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                            quality === q ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlayPause}
                className="p-4 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all duration-200 hover:scale-110"
              >
                {isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl ml-1" />}
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* Progress Bar */}
              <div className="mb-4">
                <div
                  className="w-full h-2 bg-white/30 rounded-full cursor-pointer"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-blue-600 rounded-full relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={skipBackward}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <FaBackward />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
                  </button>

                  <button
                    onClick={skipForward}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <FaForward />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">{quality}</span>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoviePlayer;
