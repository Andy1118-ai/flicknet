import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaFilm, FaVideo, FaStream, FaTimes, FaForward } from 'react-icons/fa';

const LoadingAnimation = ({
  isVisible = true,
  onComplete,
  duration = 4000,
  movieTitle = "Loading Movie...",
  type = "movie", // "movie" or "general"
  allowSkip = true
}) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('titleLetter'); // titleLetter, transition, loading, buffering, ready
  const [loadingText, setLoadingText] = useState('Preparing your movie...');
  const [showTitleLetter, setShowTitleLetter] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [showMainLoader, setShowMainLoader] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });

  const loadingMessages = useMemo(() => [
    'Preparing your cinematic experience...',
    'Loading ultra-high definition stream...',
    'Optimizing Dolby Vision playback...',
    'Buffering premium content...',
    'Initializing surround sound...',
    'Almost ready for showtime...',
    'Starting your movie...'
  ], []);

  // Enhanced title processing - get first 3 letters for staggered effect
  const titleLetters = useMemo(() => {
    if (!movieTitle) return ['M', 'O', 'V'];
    const cleanTitle = movieTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const letters = cleanTitle.split('').filter(char => char !== ' ').slice(0, 3);
    while (letters.length < 3) {
      letters.push('');
    }
    return letters.map(letter => letter.toUpperCase());
  }, [movieTitle]);

  // Skip animation handler
  const handleSkip = useCallback(() => {
    if (!allowSkip) return;
    setIsSkipped(true);
    setCurrentPhase('ready');
    setProgress(100);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  }, [allowSkip, onComplete]);

  // Spotlight movement effect
  useEffect(() => {
    if (!showMainLoader) return;

    const moveSpotlight = () => {
      setSpotlightPosition({
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    };

    const interval = setInterval(moveSpotlight, 3000);
    return () => clearInterval(interval);
  }, [showMainLoader]);

  useEffect(() => {
    if (!isVisible || isSkipped) return;

    // Show skip button after 1 second
    const skipButtonTimer = setTimeout(() => {
      setShowSkipButton(true);
    }, 1000);

    // Phase 1: Enhanced Title Letter Effect (2 seconds for staggered letters)
    const titleLetterTimer = setTimeout(() => {
      if (isSkipped) return;
      setCurrentPhase('transition');
      setShowTitleLetter(false);
      setShowTransition(true);
    }, 2000);

    // Phase 2: Transition Effect (0.8 seconds)
    const transitionTimer = setTimeout(() => {
      if (isSkipped) return;
      setCurrentPhase('loading');
      setShowTransition(false);
      setShowMainLoader(true);
    }, 2800);

    // Phase 3: Main Loading Animation
    const loadingStartTimer = setTimeout(() => {
      if (isSkipped) return;

      const interval = setInterval(() => {
        setProgress(prev => {
          if (isSkipped) {
            clearInterval(interval);
            return 100;
          }

          const newProgress = prev + (100 / ((duration - 2800) / 100));

          // Update loading text based on progress
          const messageIndex = Math.floor((newProgress / 100) * loadingMessages.length);
          if (messageIndex < loadingMessages.length) {
            setLoadingText(loadingMessages[messageIndex]);
          }

          // Update phase based on progress
          if (newProgress >= 90) {
            setCurrentPhase('ready');
          } else if (newProgress >= 60) {
            setCurrentPhase('buffering');
          }

          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              onComplete?.();
            }, 500);
            return 100;
          }

          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }, 2800);

    return () => {
      clearTimeout(skipButtonTimer);
      clearTimeout(titleLetterTimer);
      clearTimeout(transitionTimer);
      clearTimeout(loadingStartTimer);
    };
  }, [isVisible, duration, onComplete, movieTitle, loadingMessages, isSkipped]);

  // Animation variants for different phases
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: { duration: 0.5 }
    }
  };

  // Enhanced Title Letter Animation Variants with Staggering
  const titleLetterVariants = {
    initial: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      z: 0
    },
    zoom: {
      scale: [1, 1.5, 4, 12, 25],
      opacity: [1, 1, 0.9, 0.6, 0],
      rotateY: [0, 15, 45, 90, 180],
      z: [0, 50, 200, 500, 1000],
      transition: {
        duration: 2,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.2, 0.5, 0.8, 1]
      }
    }
  };

  // Individual letter stagger variants
  const letterStaggerVariants = {
    initial: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: 'hue-rotate(0deg)'
    },
    animate: (i) => ({
      scale: [1, 1.2, 2, 5, 15],
      opacity: [1, 1, 0.8, 0.4, 0],
      y: [0, -20, -50, -100, -200],
      rotateX: [0, 10, 30, 60, 90],
      filter: [
        'hue-rotate(0deg)',
        'hue-rotate(60deg)',
        'hue-rotate(120deg)',
        'hue-rotate(180deg)',
        'hue-rotate(240deg)'
      ],
      transition: {
        duration: 2,
        delay: i * 0.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.2, 0.5, 0.8, 1]
      }
    })
  };

  // Enhanced Transition Phase Variants with Curtain Effect
  const transitionVariants = {
    initial: { opacity: 0, scale: 0.8, rotateY: -90 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      rotateY: 90,
      transition: { duration: 0.5 }
    }
  };

  // Enhanced Logo Variants with Cinema Elements
  const logoVariants = {
    loading: {
      scale: [1, 1.15, 1],
      rotate: [0, 360],
      filter: [
        'brightness(1) saturate(1)',
        'brightness(1.2) saturate(1.3)',
        'brightness(1) saturate(1)'
      ],
      transition: {
        scale: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        },
        filter: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    buffering: {
      scale: 1.05,
      rotate: 0,
      filter: 'brightness(1.1) saturate(1.2)',
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    ready: {
      scale: 1.2,
      rotate: 5,
      filter: 'brightness(1.3) saturate(1.5) drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))',
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 200
      }
    }
  };

  // Enhanced Film Reel Animation Variants
  const filmReelVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Enhanced Streaming Indicator Variants
  const streamingVariants = {
    pulse: {
      scale: 1.2,
      opacity: 0.8,
      y: -3,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  // Enhanced Progress Variants with Elastic Effect
  const progressVariants = {
    hidden: { width: 0, scaleY: 1 },
    visible: {
      width: `${progress}%`,
      scaleY: 1.1,
      transition: {
        width: { duration: 0.3, ease: "easeOut" },
        scaleY: { duration: 0.5, ease: "easeInOut" }
      }
    }
  };

  // Particle Animation Variants
  const particleVariants = {
    float: (i) => ({
      y: -15,
      x: Math.sin(i) * 8,
      opacity: 0.6,
      scale: 1.1,
      transition: {
        duration: 3 + i * 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: i * 0.3
      }
    })
  };

  // Spotlight Animation Variants
  const spotlightVariants = {
    move: {
      x: `${spotlightPosition.x}%`,
      y: `${spotlightPosition.y}%`,
      transition: {
        duration: 3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(circle at center, #000000 0%, #0a0a0a 50%, #000000 100%)'
          }}
        >
          {/* Film Grain Overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              animation: 'grain 0.2s steps(10) infinite'
            }}
          />

          {/* Skip Button */}
          <AnimatePresence>
            {showSkipButton && allowSkip && !isSkipped && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
                className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm border border-blue-500/30 rounded-full text-white hover:border-blue-400/50 transition-all duration-300"
              >
                <FaForward className="text-sm" />
                <span className="text-sm font-medium">Skip</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Phase 1: Enhanced Title Letter Effect with Staggering */}
          <AnimatePresence>
            {showTitleLetter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* Cinematic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />

                {/* Staggered Letters */}
                <div className="flex items-center justify-center space-x-4">
                  {titleLetters.map((letter, i) => (
                    letter && (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={letterStaggerVariants}
                        initial="initial"
                        animate="animate"
                        className="text-blue-500 font-black text-center select-none"
                        style={{
                          fontSize: '6rem',
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          textShadow: '0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(59, 130, 246, 0.4)',
                          letterSpacing: '-0.05em',
                          WebkitTextStroke: '2px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        {letter}
                      </motion.div>
                    )
                  ))}
                </div>

                {/* Lens Flare Effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 2: Enhanced Transition Effect with Curtain Animation */}
          <AnimatePresence>
            {showTransition && (
              <motion.div
                variants={transitionVariants}
                initial="initial"
                animate="visible"
                exit="exit"
                className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center"
              >
                {/* Theater Curtain Effect */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                    transformOrigin: 'top'
                  }}
                />

                {/* Spotlight Effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    background: [
                      'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 40%)',
                      'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 40%)',
                      'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 40%)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <div className="text-center relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180, filter: 'brightness(0)' }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                      filter: 'brightness(1) drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))'
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                      type: "spring",
                      stiffness: 150
                    }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  >
                    <FaPlay className="text-white text-2xl ml-1" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {movieTitle}
                    </h2>
                    <p className="text-blue-200 text-lg font-medium">
                      Preparing your cinematic experience...
                    </p>
                  </motion.div>

                  {/* Floating Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={particleVariants}
                        animate="float"
                        className="absolute w-1 h-1 bg-blue-400 rounded-full"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${30 + (i % 2) * 40}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3: Enhanced Main Loading Animation */}
          <AnimatePresence>
            {showMainLoader && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center"
              >
                {/* Dynamic Spotlight */}
                <motion.div
                  variants={spotlightVariants}
                  animate="move"
                  className="absolute w-96 h-96 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                    filter: 'blur(20px)'
                  }}
                />

                {/* Enhanced Background Pattern */}
                <div className="absolute inset-0 opacity-15">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.4),transparent_60%)]"></div>
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.2),transparent)]"></div>

                  {/* Enhanced Film Strip Pattern */}
                  <div className="absolute inset-0 opacity-8">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute bg-gradient-to-b from-blue-400/20 to-purple-400/20"
                        style={{
                          left: `${i * 8.33}%`,
                          width: '3px',
                          height: '100%'
                        }}
                        animate={{
                          opacity: 0.3,
                          scaleY: 1.05
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>

                  {/* Floating Cinema Elements */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={particleVariants}
                        animate="float"
                        className="absolute"
                        style={{
                          left: `${10 + i * 12}%`,
                          top: `${20 + (i % 3) * 25}%`
                        }}
                      >
                        <div className="w-2 h-2 bg-blue-400/30 rounded-full blur-sm" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 text-center max-w-md mx-auto px-6">
                  {/* Enhanced FlickNet Logo with Cinema Elements */}
                  <motion.div
                    variants={logoVariants}
                    animate={currentPhase}
                    className="mb-8 flex items-center justify-center"
                  >
                    <div className="relative">
                      {/* Film Reels */}
                      <motion.div
                        variants={filmReelVariants}
                        animate="spin"
                        className="absolute -left-8 -top-2 w-6 h-6 border-2 border-blue-400/50 rounded-full"
                      >
                        <div className="absolute inset-1 border border-blue-400/30 rounded-full">
                          <div className="absolute inset-1 bg-blue-400/20 rounded-full"></div>
                        </div>
                      </motion.div>

                      <motion.div
                        variants={filmReelVariants}
                        animate="spin"
                        className="absolute -right-8 -top-2 w-6 h-6 border-2 border-purple-400/50 rounded-full"
                        style={{ animationDelay: '1s' }}
                      >
                        <div className="absolute inset-1 border border-purple-400/30 rounded-full">
                          <div className="absolute inset-1 bg-purple-400/20 rounded-full"></div>
                        </div>
                      </motion.div>

                      {/* Main Logo Circle */}
                      <div className="w-24 h-24 border-4 border-blue-500/30 rounded-full relative">
                        {/* Inner Circle with Icon */}
                        <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                          {type === 'movie' ? (
                            <FaPlay className="text-white text-2xl ml-1" />
                          ) : (
                            <FaFilm className="text-white text-2xl" />
                          )}
                        </div>

                        {/* Animated Rings */}
                        <motion.div
                          className="absolute inset-0 border-2 border-blue-400 rounded-full"
                          animate={{
                            scale: 1.2,
                            opacity: 0.4
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }}
                        />
                        <motion.div
                          className="absolute inset-0 border-2 border-purple-400 rounded-full"
                          animate={{
                            scale: 1.3,
                            opacity: 0.3
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: 0.5
                          }}
                        />
                      </div>

                      {/* Streaming Indicators */}
                      <motion.div
                        variants={streamingVariants}
                        animate="pulse"
                        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                      >
                        <div className="flex space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 h-3 bg-blue-400 rounded-full"
                              animate={{
                                scaleY: 1.5,
                                opacity: 0.8
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* FlickNet Brand */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                  >
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Flick<span className="text-blue-400">Net</span>
                    </h1>
                    <p className="text-blue-200 text-sm">Premium Streaming Experience</p>
                  </motion.div>

                  {/* Movie Title */}
                  {type === 'movie' && movieTitle && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mb-6"
                    >
                      <h2 className="text-xl font-semibold text-white mb-2">{movieTitle}</h2>
                      <div className="flex items-center justify-center space-x-2 text-blue-300">
                        <FaVideo className="text-sm" />
                        <span className="text-sm">Ultra HD • Dolby Vision</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Loading Text */}
                  <motion.div
                    key={loadingText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <p className="text-blue-200 text-lg font-medium">{loadingText}</p>
                  </motion.div>

                  {/* Enhanced Progress Bar */}
                  <div className="mb-6">
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-blue-500/20">
                      <motion.div
                        variants={progressVariants}
                        initial="hidden"
                        animate="visible"
                        className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-purple-600 rounded-full relative overflow-hidden"
                      >
                        {/* Enhanced Shimmer Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          animate={{
                            x: '100%'
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          style={{ x: '-100%' }}
                        />
                        {/* Progress Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-500/50 blur-sm"></div>
                      </motion.div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-blue-200">
                      <span>0%</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Enhanced Phase Indicators */}
                  <div className="flex justify-center space-x-6 mb-6">
                    {[
                      { phase: 'loading', icon: FaStream, label: 'Loading' },
                      { phase: 'buffering', icon: FaVideo, label: 'Buffering' },
                      { phase: 'ready', icon: FaPlay, label: 'Ready' }
                    ].map(({ phase, icon: Icon, label }, index) => (
                      <div
                        key={phase}
                        className={`flex flex-col items-center space-y-2 transition-all duration-300 ${
                          currentPhase === phase ||
                          (phase === 'loading' && currentPhase === 'loading') ||
                          (phase === 'buffering' && ['buffering', 'ready'].includes(currentPhase)) ||
                          (phase === 'ready' && currentPhase === 'ready')
                            ? 'text-blue-400'
                            : 'text-gray-500'
                        }`}
                      >
                        <motion.div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            currentPhase === phase
                              ? 'border-blue-400 bg-blue-400/20 scale-110'
                              : 'border-gray-600 bg-gray-800/50'
                          }`}
                          animate={currentPhase === phase ? {
                            boxShadow: '0 0 0 8px rgba(59, 130, 246, 0.2)'
                          } : {}}
                          transition={{
                            duration: 1.5,
                            repeat: currentPhase === phase ? Infinity : 0,
                            repeatType: "reverse"
                          }}
                        >
                          <Icon className="text-sm" />
                        </motion.div>
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ready State */}
                  {currentPhase === 'ready' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <motion.div
                        className="text-green-400 text-3xl mb-2"
                        animate={{
                          scale: 1.1,
                          rotate: 10
                        }}
                        transition={{
                          duration: 1,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        ✓
                      </motion.div>
                      <p className="text-green-400 font-medium text-lg">Ready to play!</p>
                      <p className="text-green-300 text-sm mt-1">Enjoy your movie experience</p>
                    </motion.div>
                  )}

                  {/* Enhanced Decorative Elements */}
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
                  <div className="absolute top-1/4 -right-8 w-16 h-16 bg-blue-400/5 rounded-full blur-lg"></div>
                  <div className="absolute bottom-1/4 -left-8 w-24 h-24 bg-purple-400/5 rounded-full blur-lg"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingAnimation;
