import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExternalLinkAlt, FaCrown, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdDisplay = ({ position = 'bottom', onClose, className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentAd, setCurrentAd] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5);

  // Sample ads for demonstration
  const sampleAds = [
    {
      id: 1,
      title: "Upgrade to FlickNet Premium",
      description: "Enjoy ad-free streaming, exclusive content, and 4K quality",
      image: "/api/placeholder/400/200",
      cta: "Upgrade Now",
      type: "internal",
      action: () => navigate('/subscription'),
      backgroundColor: "from-blue-600 to-purple-600"
    },
    {
      id: 2,
      title: "New Action Movies This Week",
      description: "Don't miss the latest blockbusters - streaming now!",
      image: "/api/placeholder/400/200",
      cta: "Watch Now",
      type: "internal",
      action: () => navigate('/genre/action'),
      backgroundColor: "from-red-600 to-orange-600"
    },
    {
      id: 3,
      title: "FlickNet Originals",
      description: "Exclusive content you won't find anywhere else",
      image: "/api/placeholder/400/200",
      cta: "Explore",
      type: "internal",
      action: () => navigate('/genre/exclusive'),
      backgroundColor: "from-green-600 to-blue-600"
    }
  ];

  useEffect(() => {
    // Only show ads for non-premium users
    if (!isAuthenticated || !user?.subscription?.isPremium) {
      // Randomly select an ad
      const randomAd = sampleAds[Math.floor(Math.random() * sampleAds.length)];
      setCurrentAd(randomAd);
    } else {
      setIsVisible(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (currentAd && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, currentAd]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleAdClick = () => {
    if (currentAd?.action) {
      currentAd.action();
    }
  };

  // Don't render if user is premium or ad is not visible
  if (!isVisible || !currentAd || (isAuthenticated && user?.subscription?.isPremium)) {
    return null;
  }

  const adVariants = {
    hidden: { 
      opacity: 0, 
      y: position === 'bottom' ? 100 : -100,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: { 
      opacity: 0, 
      y: position === 'bottom' ? 100 : -100,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={adVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`
            fixed z-50 left-4 right-4 mx-auto max-w-4xl
            ${position === 'bottom' ? 'bottom-4' : 'top-4'}
            ${className}
          `}
        >
          <div className={`
            relative overflow-hidden rounded-xl shadow-2xl
            bg-gradient-to-r ${currentAd.backgroundColor}
            border border-white/20
          `}>
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              disabled={timeLeft > 0}
            >
              <FaTimes className="text-sm" />
            </button>

            {/* Timer */}
            {timeLeft > 0 && (
              <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-black/40 rounded-full text-white text-sm font-medium">
                {timeLeft}s
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center p-6">
              {/* Ad Image */}
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="w-32 h-20 md:w-40 md:h-24 bg-white/10 rounded-lg overflow-hidden">
                  <img
                    src={currentAd.image}
                    alt={currentAd.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/200';
                    }}
                  />
                </div>
              </div>

              {/* Ad Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                  {currentAd.title}
                  {currentAd.type === 'internal' && <FaCrown className="text-yellow-400 text-sm" />}
                </h3>
                <p className="text-white/90 mb-4 text-sm md:text-base">
                  {currentAd.description}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdClick}
                    disabled={timeLeft > 0}
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {currentAd.cta}
                    <FaArrowRight className="text-sm" />
                  </motion.button>
                  
                  {!isAuthenticated && (
                    <button
                      onClick={() => navigate('/login')}
                      className="text-white/80 hover:text-white text-sm underline transition-colors"
                    >
                      Sign in to remove ads
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Upgrade Hint */}
            {isAuthenticated && !user?.subscription?.isPremium && (
              <div className="bg-black/20 px-6 py-3 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">
                    Tired of ads? Upgrade to Premium for an ad-free experience
                  </span>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-1"
                  >
                    <FaCrown className="text-xs" />
                    Upgrade
                  </button>
                </div>
              </div>
            )}

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdDisplay;
