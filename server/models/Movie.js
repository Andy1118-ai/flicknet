const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a movie title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  originalTitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please add a release date']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please add movie duration']
  },
  genres: [{
    type: String,
    required: true
  }],
  rating: {
    imdb: {
      type: Number,
      min: 0,
      max: 10
    },
    tmdb: {
      type: Number,
      min: 0,
      max: 10
    },
    flicknet: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    }
  },
  cast: [{
    name: {
      type: String,
      required: true
    },
    character: String,
    profilePath: String
  }],
  crew: [{
    name: {
      type: String,
      required: true
    },
    job: {
      type: String,
      required: true
    },
    department: String,
    profilePath: String
  }],
  images: {
    poster: {
      type: String,
      required: [true, 'Please add a poster image']
    },
    backdrop: String,
    gallery: [String]
  },
  videos: [{
    key: {
      type: String,
      required: true
    },
    name: String,
    site: {
      type: String,
      default: 'YouTube'
    },
    type: {
      type: String,
      enum: ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes'],
      default: 'Trailer'
    },
    official: {
      type: Boolean,
      default: false
    }
  }],
  externalIds: {
    imdb: String,
    tmdb: {
      type: Number,
      sparse: true
    }
  },
  language: {
    type: String,
    default: 'en'
  },
  country: [String],
  budget: Number,
  revenue: Number,
  status: {
    type: String,
    enum: ['Rumored', 'Planned', 'In Production', 'Post Production', 'Released', 'Canceled'],
    default: 'Released'
  },
  adult: {
    type: Boolean,
    default: false
  },
  popularity: {
    type: Number,
    default: 0
  },
  voteCount: {
    type: Number,
    default: 0
  },
  keywords: [String],
  productionCompanies: [{
    name: String,
    logoPath: String,
    originCountry: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  subscriptionRequired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better performance
MovieSchema.index({ title: 'text', description: 'text' });
MovieSchema.index({ genres: 1 });
MovieSchema.index({ releaseDate: -1 });
MovieSchema.index({ 'rating.flicknet': -1 });
MovieSchema.index({ popularity: -1 });
MovieSchema.index({ featured: 1 });
MovieSchema.index({ trending: 1 });
MovieSchema.index({ 'externalIds.tmdb': 1 }, { unique: true, sparse: true });

// Virtual for formatted release year
MovieSchema.virtual('releaseYear').get(function() {
  return this.releaseDate ? this.releaseDate.getFullYear() : null;
});

// Virtual for formatted duration
MovieSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return null;
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Ensure virtual fields are serialized
MovieSchema.set('toJSON', { virtuals: true });
MovieSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Movie', MovieSchema);
