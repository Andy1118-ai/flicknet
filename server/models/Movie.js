const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a movie title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  year: {
    type: Number,
    required: [true, 'Please add a release year'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 5, 'Year cannot be more than 5 years in the future']
  },
  genre: [{
    type: String,
    required: true,
    enum: [
      'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
      'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
      'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller',
      'War', 'Western'
    ]
  }],
  rating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [10, 'Rating cannot be more than 10'],
    default: 0
  },
  director: {
    type: String,
    required: [true, 'Please add a director'],
    maxlength: [100, 'Director name cannot be more than 100 characters']
  },
  cast: [{
    type: String,
    maxlength: [100, 'Cast member name cannot be more than 100 characters']
  }],
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  poster: {
    type: String,
    default: '/api/placeholder/300/450'
  },
  backdrop: {
    type: String,
    default: '/api/placeholder/1200/675'
  },
  trailer: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'released', 'in-production'],
    default: 'released'
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please add a release date']
  },
  runtime: {
    type: Number, // in minutes
    min: [1, 'Runtime must be at least 1 minute']
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  boxOffice: {
    type: Number,
    min: [0, 'Box office cannot be negative']
  },
  language: {
    type: String,
    default: 'English'
  },
  country: {
    type: String,
    default: 'United States'
  },
  awards: [{
    name: String,
    year: Number,
    category: String
  }],
  // User engagement metrics
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  watchlistCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  // Content flags
  isExclusive: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // SEO and search
  slug: {
    type: String,
    unique: true,
    index: true
  },
  tags: [String],
  // External IDs
  imdbId: String,
  tmdbId: String
}, {
  timestamps: true
});

// Create movie slug from title
MovieSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      + '-' + this.year;
  }
  next();
});

// Static method to get movies by genre
MovieSchema.statics.getByGenre = function(genre) {
  return this.find({ genre: { $in: [genre] }, isActive: true });
};

// Static method to search movies
MovieSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { director: { $regex: query, $options: 'i' } },
          { cast: { $in: [new RegExp(query, 'i')] } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  });
};

// Index for search performance
MovieSchema.index({ title: 'text', description: 'text', director: 'text', cast: 'text' });
MovieSchema.index({ genre: 1 });
MovieSchema.index({ year: 1 });
MovieSchema.index({ rating: -1 });
MovieSchema.index({ releaseDate: -1 });

module.exports = mongoose.model('Movie', MovieSchema);
