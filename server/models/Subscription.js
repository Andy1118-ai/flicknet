const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['freemium', 'premium'],
    required: [true, 'Please specify subscription type']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due', 'unpaid'],
    default: 'active'
  },
  plan: {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    interval: {
      type: String,
      enum: ['month', 'year'],
      required: true
    }
  },
  billing: {
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    nextBillingDate: {
      type: Date
    },
    lastBillingDate: {
      type: Date
    },
    trialEnd: {
      type: Date
    }
  },
  stripe: {
    customerId: {
      type: String,
      required: function() {
        return this.type === 'premium';
      }
    },
    subscriptionId: {
      type: String,
      required: function() {
        return this.type === 'premium';
      }
    },
    priceId: String,
    paymentMethodId: String,
    invoiceId: String
  },
  features: {
    maxStreams: {
      type: Number,
      default: 1
    },
    hdStreaming: {
      type: Boolean,
      default: false
    },
    downloadOffline: {
      type: Boolean,
      default: false
    },
    adFree: {
      type: Boolean,
      default: false
    },
    exclusiveContent: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    streamsThisMonth: {
      type: Number,
      default: 0
    },
    downloadsThisMonth: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'upgraded', 'downgraded', 'cancelled', 'renewed', 'payment_failed'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    details: String,
    amount: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ type: 1 });
SubscriptionSchema.index({ 'stripe.customerId': 1 });
SubscriptionSchema.index({ 'stripe.subscriptionId': 1 });
SubscriptionSchema.index({ 'billing.endDate': 1 });

// Virtual for checking if subscription is expired
SubscriptionSchema.virtual('isExpired').get(function() {
  if (!this.billing.endDate) return false;
  return new Date() > this.billing.endDate;
});

// Virtual for days remaining
SubscriptionSchema.virtual('daysRemaining').get(function() {
  if (!this.billing.endDate) return null;
  const now = new Date();
  const endDate = new Date(this.billing.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Method to check if user has access to premium features
SubscriptionSchema.methods.hasPremiumAccess = function() {
  return this.type === 'premium' && 
         this.status === 'active' && 
         !this.isExpired;
};

// Method to add usage tracking
SubscriptionSchema.methods.addUsage = function(type, amount = 1) {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  // Reset usage if it's a new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.streamsThisMonth = 0;
    this.usage.downloadsThisMonth = 0;
    this.usage.lastResetDate = now;
  }
  
  if (type === 'stream') {
    this.usage.streamsThisMonth += amount;
  } else if (type === 'download') {
    this.usage.downloadsThisMonth += amount;
  }
  
  return this.save();
};

// Method to add history entry
SubscriptionSchema.methods.addHistory = function(action, details, amount) {
  this.history.push({
    action,
    details,
    amount,
    date: new Date()
  });
  return this.save();
};

// Ensure virtual fields are serialized
SubscriptionSchema.set('toJSON', { virtuals: true });
SubscriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
