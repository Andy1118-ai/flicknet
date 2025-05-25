const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'movie_release',
      'subscription_update',
      'payment_success',
      'payment_failed',
      'account_update',
      'community_activity',
      'system_announcement',
      'recommendation',
      'watchlist_update'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Related entities
  relatedMovie: {
    type: mongoose.Schema.ObjectId,
    ref: 'Movie'
  },
  relatedSubscription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription'
  },
  // Action data
  actionUrl: String,
  actionText: String,
  // Delivery settings
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  // Delivery status
  deliveryStatus: {
    inApp: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    },
    email: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      opened: { type: Boolean, default: false },
      openedAt: Date
    },
    push: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      clicked: { type: Boolean, default: false },
      clickedAt: Date
    }
  },
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Virtual for checking if notification is expired
NotificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

// Virtual for checking if notification is scheduled
NotificationSchema.virtual('isScheduled').get(function() {
  if (!this.scheduledFor) return false;
  return this.scheduledFor > new Date();
});

// Method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.deliveryStatus.inApp.delivered = true;
  this.deliveryStatus.inApp.deliveredAt = new Date();
  return this.save();
};

// Method to mark email as opened
NotificationSchema.methods.markEmailOpened = function() {
  this.deliveryStatus.email.opened = true;
  this.deliveryStatus.email.openedAt = new Date();
  return this.save();
};

// Method to mark push as clicked
NotificationSchema.methods.markPushClicked = function() {
  this.deliveryStatus.push.clicked = true;
  this.deliveryStatus.push.clickedAt = new Date();
  return this.save();
};

// Static method to create movie release notification
NotificationSchema.statics.createMovieReleaseNotification = function(userId, movie) {
  return this.create({
    user: userId,
    type: 'movie_release',
    title: `New Movie: ${movie.title}`,
    message: `${movie.title} (${movie.year}) is now available! ${movie.description.substring(0, 100)}...`,
    relatedMovie: movie._id,
    actionUrl: `/movies/${movie.slug}`,
    actionText: 'Watch Now',
    channels: {
      inApp: true,
      email: true,
      push: true
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });
};

// Static method to create subscription notification
NotificationSchema.statics.createSubscriptionNotification = function(userId, subscription, type) {
  const messages = {
    upgrade: `Welcome to ${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}! Your subscription is now active.`,
    renewal: `Your ${subscription.plan} subscription has been renewed successfully.`,
    expiring: `Your ${subscription.plan} subscription expires in ${subscription.daysRemaining} days.`,
    cancelled: `Your ${subscription.plan} subscription has been cancelled.`
  };

  return this.create({
    user: userId,
    type: 'subscription_update',
    title: `Subscription ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    message: messages[type] || 'Your subscription has been updated.',
    relatedSubscription: subscription._id,
    actionUrl: '/subscription',
    actionText: 'Manage Subscription',
    channels: {
      inApp: true,
      email: true,
      push: false
    }
  });
};

// Static method to get unread count for user
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    user: userId,
    isRead: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Indexes
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ scheduledFor: 1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ 'deliveryStatus.email.delivered': 1 });
NotificationSchema.index({ 'deliveryStatus.push.delivered': 1 });

// Ensure virtual fields are serialized
NotificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Notification', NotificationSchema);
