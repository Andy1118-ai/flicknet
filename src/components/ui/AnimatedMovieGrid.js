import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import EnhancedMovieCard from './EnhancedMovieCard';

const AnimatedMovieGrid = ({ 
  movies = [], 
  columns = { sm: 2, md: 3, lg: 4, xl: 6 },
  onMovieClick,
  onMoviePlay,
  onMovieBookmark,
  onMovieLike,
  onMovieShare
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const getGridClasses = () => {
    const { sm, md, lg, xl } = columns;
    return `grid grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl} gap-6`;
  };

  if (!movies.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">No movies found</div>
        <div className="text-gray-500">Try adjusting your search or filters</div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={getGridClasses()}
    >
      {movies.map((movie, index) => (
        <motion.div
          key={movie.id}
          variants={itemVariants}
          whileHover={{ 
            scale: 1.05,
            zIndex: 10,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onMovieClick?.(movie)}
        >
          <EnhancedMovieCard
            movie={movie}
            index={index}
            onPlay={onMoviePlay}
            onBookmark={onMovieBookmark}
            onLike={onMovieLike}
            onShare={onMovieShare}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AnimatedMovieGrid;
