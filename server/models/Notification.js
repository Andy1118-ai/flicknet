const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'system',
      'subscription',
      'movie_added',
      'movie_recommendation',
      'payment',
      'security',
      'promotional',
      'reminder'
    ],
    required: [true, 'Please specify notification type']
  },
  title: {
    type: String,
    required: [true, 'Please add a notification title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add a notification message'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  data: {
    // Additional data specific to notification type
    movieId: String,
    subscriptionId: String,
    paymentId: String,
    actionUrl: String,
    imageUrl: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  delivery: {
    channels: [{
      type: String,
      enum: ['in_app', 'email', 'push', 'sms'],
      default: 'in_app'
    }],
    sentAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    readAt: {
      type: Date
    },
    clickedAt: {
      type: Date
    }
  },
  scheduling: {
    sendAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    },
    recurring: {
      enabled: {
        type: Boolean,
        default: false
      },
      interval: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      },
      endDate: {
        type: Date
      }
    }
  },
  actions: [{
    label: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    url: String,
    style: {
      type: String,
      enum: ['primary', 'secondary', 'danger'],
      default: 'primary'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    default: 'general'
  },
  tags: [String]
}, {
  timestamps: true
});

// Create indexes for better performance
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ 'scheduling.sendAt': 1 });
NotificationSchema.index({ 'scheduling.expiresAt': 1 });
NotificationSchema.index({ status: 1, createdAt: -1 });

// Virtual for checking if notification is expired
NotificationSchema.virtual('isExpired').get(function() {
  if (!this.scheduling.expiresAt) return false;
  return new Date() > this.scheduling.expiresAt;
});

// Virtual for checking if notification should be sent
NotificationSchema.virtual('shouldSend').get(function() {
  const now = new Date();
  return this.scheduling.sendAt <= now && !this.isExpired;
});

// Method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.delivery.readAt = new Date();
  return this.save();
};

// Method to mark as delivered
NotificationSchema.methods.markAsDelivered = function() {
  this.delivery.deliveredAt = new Date();
  return this.save();
};

// Method to mark as clicked
NotificationSchema.methods.markAsClicked = function() {
  this.delivery.clickedAt = new Date();
  return this.save();
};

// Method to archive notification
NotificationSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Static method to get unread count for user
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    userId: userId,
    status: 'unread',
    isActive: true,
    $or: [
      { 'scheduling.expiresAt': { $exists: false } },
      { 'scheduling.expiresAt': { $gt: new Date() } }
    ]
  });
};

// Static method to get notifications for user with pagination
NotificationSchema.statics.getForUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    type,
    priority
  } = options;

  const query = {
    userId: userId,
    isActive: true,
    $or: [
      { 'scheduling.expiresAt': { $exists: false } },
      { 'scheduling.expiresAt': { $gt: new Date() } }
    ]
  };

  if (status) query.status = status;
  if (type) query.type = type;
  if (priority) query.priority = priority;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
};

// Static method to mark all as read for user
NotificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    {
      userId: userId,
      status: 'unread',
      isActive: true
    },
    {
      $set: {
        status: 'read',
        'delivery.readAt': new Date()
      }
    }
  );
};

// Ensure virtual fields are serialized
NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', NotificationSchema);
