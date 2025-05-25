const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: function() {
      return this.plan !== 'free';
    }
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  // Payment information
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
    required: function() {
      return this.plan !== 'free';
    }
  },
  // Billing details
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: function() {
      return this.plan !== 'free';
    }
  },
  amount: {
    type: Number,
    required: function() {
      return this.plan !== 'free';
    },
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    required: function() {
      return this.plan !== 'free';
    }
  },
  // Trial information
  trialStart: Date,
  trialEnd: Date,
  isTrialActive: {
    type: Boolean,
    default: false
  },
  // Cancellation details
  cancelledAt: Date,
  cancellationReason: String,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  // Usage tracking
  features: {
    watchlistLimit: {
      type: Number,
      default: function() {
        switch(this.plan) {
          case 'free': return 10;
          case 'basic': return 100;
          case 'premium': return -1; // unlimited
          default: return 10;
        }
      }
    },
    ratingsLimit: {
      type: Number,
      default: function() {
        switch(this.plan) {
          case 'free': return 5;
          case 'basic': return 50;
          case 'premium': return -1; // unlimited
          default: return 5;
        }
      }
    },
    reviewsLimit: {
      type: Number,
      default: function() {
        switch(this.plan) {
          case 'free': return 2;
          case 'basic': return 20;
          case 'premium': return -1; // unlimited
          default: return 2;
        }
      }
    },
    advancedSearch: {
      type: Boolean,
      default: function() {
        return this.plan !== 'free';
      }
    },
    recommendations: {
      type: Boolean,
      default: function() {
        return this.plan !== 'free';
      }
    },
    communityFeatures: {
      type: Boolean,
      default: function() {
        return this.plan !== 'free';
      }
    },
    prioritySupport: {
      type: Boolean,
      default: function() {
        return this.plan === 'premium';
      }
    },
    exclusiveContent: {
      type: Boolean,
      default: function() {
        return this.plan === 'premium';
      }
    }
  },
  // Metadata
  notes: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Virtual for checking if subscription is active
SubscriptionSchema.virtual('isActive').get(function() {
  if (this.plan === 'free') return true;
  if (this.status !== 'active') return false;
  if (this.endDate && this.endDate < new Date()) return false;
  return true;
});

// Virtual for days remaining
SubscriptionSchema.virtual('daysRemaining').get(function() {
  if (this.plan === 'free') return null;
  if (!this.endDate) return null;
  
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Method to check if user can access feature
SubscriptionSchema.methods.canAccess = function(feature) {
  if (!this.isActive) return false;
  
  const featureValue = this.features[feature];
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  return true; // Default allow if feature not defined
};

// Method to check usage limits
SubscriptionSchema.methods.checkLimit = function(feature, currentUsage) {
  if (!this.isActive) return false;
  
  const limit = this.features[feature];
  if (limit === -1) return true; // unlimited
  if (typeof limit === 'number') {
    return currentUsage < limit;
  }
  
  return true; // Default allow if limit not defined
};

// Static method to get plan pricing
SubscriptionSchema.statics.getPlanPricing = function() {
  return {
    free: { monthly: 0, yearly: 0 },
    basic: { monthly: 9.99, yearly: 99.99 },
    premium: { monthly: 19.99, yearly: 199.99 }
  };
};

// Ensure virtual fields are serialized
SubscriptionSchema.set('toJSON', { virtuals: true });

// Indexes
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ plan: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ endDate: 1 });
SubscriptionSchema.index({ stripeCustomerId: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
