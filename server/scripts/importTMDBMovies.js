// FlickNet TMDB Movie Import Script
// Script to import popular movies from TMDB into the local database

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Movie = require('../models/Movie');
const tmdbService = require('../services/tmdbService');
const youtubeService = require('../services/youtubeService');

// Import configuration
const IMPORT_CONFIG = {
  popularMovies: {
    enabled: true,
    pages: 5, // Import first 5 pages (100 movies)
    description: 'Popular movies from TMDB'
  },
  topRatedMovies: {
    enabled: true,
    pages: 3, // Import first 3 pages (60 movies)
    description: 'Top rated movies from TMDB'
  },
  upcomingMovies: {
    enabled: true,
    pages: 2, // Import first 2 pages (40 movies)
    description: 'Upcoming movies from TMDB'
  },
  trendingMovies: {
    enabled: true,
    pages: 2, // Import first 2 pages (40 movies)
    description: 'Trending movies from TMDB'
  }
};

class TMDBImporter {
  constructor() {
    this.importedCount = 0;
    this.skippedCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }

  async importMovie(tmdbMovie) {
    try {
      // Check if movie already exists
      const existingMovie = await Movie.findOne({ tmdbId: tmdbMovie.id.toString() });
      if (existingMovie) {
        console.log(`⏭️  Skipping ${tmdbMovie.title} (already exists)`);
        this.skippedCount++;
        return null;
      }

      // Convert TMDB data to FlickNet format
      const movieData = tmdbService.convertToFlickNetFormat(tmdbMovie);

      // Get detailed movie information
      const detailedMovie = await tmdbService.getMovieDetails(tmdbMovie.id);
      const credits = await tmdbService.getMovieCredits(tmdbMovie.id);

      // Add cast and crew information
      if (credits.cast && credits.cast.length > 0) {
        movieData.cast = credits.cast.slice(0, 10).map(actor => actor.name);
      }
      if (credits.crew) {
        const director = credits.crew.find(person => person.job === 'Director');
        if (director) movieData.director = director.name;
      }

      // Try to get trailer from YouTube
      if (youtubeService.isEnabled()) {
        try {
          const trailer = await youtubeService.findBestTrailer(movieData.title, movieData.year);
          if (trailer) {
            movieData.trailer = trailer.url;
            movieData.trailerEmbed = trailer.embedUrl;
          }
        } catch (trailerError) {
          console.warn(`⚠️  Could not fetch trailer for ${movieData.title}`);
        }
      }

      // Create movie in database
      const movie = await Movie.create(movieData);
      console.log(`✅ Imported: ${movie.title} (${movie.year})`);
      this.importedCount++;
      
      return movie;
    } catch (error) {
      console.error(`❌ Error importing ${tmdbMovie.title}:`, error.message);
      this.errorCount++;
      return null;
    }
  }

  async importMovieCategory(categoryName, fetchFunction, pages) {
    console.log(`\n📥 Importing ${categoryName}...`);
    
    for (let page = 1; page <= pages; page++) {
      try {
        console.log(`📄 Fetching page ${page}/${pages}...`);
        const results = await fetchFunction(page);
        
        if (!results.results || results.results.length === 0) {
          console.log(`⚠️  No results found for page ${page}`);
          break;
        }

        // Import movies with delay to respect rate limits
        for (const tmdbMovie of results.results) {
          await this.importMovie(tmdbMovie);
          
          // Add small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Longer delay between pages
        if (page < pages) {
          console.log('⏳ Waiting before next page...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Error fetching ${categoryName} page ${page}:`, error.message);
      }
    }
  }

  async run() {
    try {
      console.log('🚀 Starting TMDB movie import...\n');

      // Check if services are enabled
      if (!tmdbService.isEnabled()) {
        throw new Error('TMDB service is not enabled. Please check your API key.');
      }

      console.log(`📊 Services status:`);
      console.log(`   TMDB: ${tmdbService.isEnabled() ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   YouTube: ${youtubeService.isEnabled() ? '✅ Enabled' : '❌ Disabled'}`);

      // Import different categories
      if (IMPORT_CONFIG.popularMovies.enabled) {
        await this.importMovieCategory(
          'Popular Movies',
          (page) => tmdbService.getPopularMovies(page),
          IMPORT_CONFIG.popularMovies.pages
        );
      }

      if (IMPORT_CONFIG.topRatedMovies.enabled) {
        await this.importMovieCategory(
          'Top Rated Movies',
          (page) => tmdbService.getTopRatedMovies(page),
          IMPORT_CONFIG.topRatedMovies.pages
        );
      }

      if (IMPORT_CONFIG.upcomingMovies.enabled) {
        await this.importMovieCategory(
          'Upcoming Movies',
          (page) => tmdbService.getUpcomingMovies(page),
          IMPORT_CONFIG.upcomingMovies.pages
        );
      }

      if (IMPORT_CONFIG.trendingMovies.enabled) {
        await this.importMovieCategory(
          'Trending Movies',
          (page) => tmdbService.getTrendingMovies('week', page),
          IMPORT_CONFIG.trendingMovies.pages
        );
      }

      // Print summary
      const duration = Math.round((Date.now() - this.startTime) / 1000);
      console.log('\n📊 Import Summary:');
      console.log(`   ✅ Imported: ${this.importedCount} movies`);
      console.log(`   ⏭️  Skipped: ${this.skippedCount} movies (already exist)`);
      console.log(`   ❌ Errors: ${this.errorCount} movies`);
      console.log(`   ⏱️  Duration: ${duration} seconds`);
      console.log('\n🎉 Import completed!');

    } catch (error) {
      console.error('💥 Import failed:', error.message);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    // Connect to database
    await connectDB();
    console.log('📦 Connected to MongoDB');

    // Run import
    const importer = new TMDBImporter();
    await importer.run();

  } catch (error) {
    console.error('💥 Script failed:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    process.exit(0);
  }
}

// Handle script arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🎬 FlickNet TMDB Movie Import Script

Usage: node importTMDBMovies.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be imported without actually importing
  
Environment Variables Required:
  TMDB_API_KEY   Your TMDB API key
  YOUTUBE_API_KEY Your YouTube API key (optional)
  MONGODB_URI    MongoDB connection string

Examples:
  node importTMDBMovies.js
  node importTMDBMovies.js --dry-run
  `);
  process.exit(0);
}

if (args.includes('--dry-run')) {
  console.log('🔍 DRY RUN MODE - No movies will be imported');
  // Override the importMovie method for dry run
  TMDBImporter.prototype.importMovie = async function(tmdbMovie) {
    console.log(`🔍 Would import: ${tmdbMovie.title} (${new Date(tmdbMovie.release_date).getFullYear()})`);
    this.importedCount++;
    return null;
  };
}

// Run the script
main();
