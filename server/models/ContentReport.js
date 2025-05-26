const mongoose = require('mongoose');

const ContentReportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  targetUserId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  targetContentId: {
    type: mongoose.Schema.ObjectId,
    refPath: 'targetContentType'
  },
  targetContentType: {
    type: String,
    enum: ['Movie', 'User', 'Comment', 'Review']
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for the report'],
    enum: [
      'inappropriate_content',
      'spam',
      'harassment',
      'copyright_violation',
      'fake_information',
      'violence',
      'hate_speech',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    enum: ['content', 'user', 'technical', 'legal'],
    default: 'content'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  moderatorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  moderatorNotes: {
    type: String,
    maxlength: [1000, 'Moderator notes cannot be more than 1000 characters']
  },
  action: {
    type: String,
    enum: ['no_action', 'content_removed', 'user_warned', 'user_suspended', 'content_flagged']
  },
  evidence: [{
    type: {
      type: String,
      enum: ['screenshot', 'url', 'text', 'other']
    },
    content: String,
    description: String
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  },
  resolvedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
ContentReportSchema.index({ status: 1, priority: -1 });
ContentReportSchema.index({ reportedBy: 1 });
ContentReportSchema.index({ targetUserId: 1 });
ContentReportSchema.index({ moderatorId: 1 });
ContentReportSchema.index({ createdAt: -1 });

// Virtual for checking if report is overdue
ContentReportSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'pending') return false;
  const hoursSinceReport = (new Date() - this.createdAt) / (1000 * 60 * 60);
  return hoursSinceReport > 24; // Consider overdue after 24 hours
});

// Method to assign to moderator
ContentReportSchema.methods.assignToModerator = function(moderatorId) {
  this.moderatorId = moderatorId;
  this.status = 'in_review';
  return this.save();
};

// Method to resolve report
ContentReportSchema.methods.resolve = function(action, notes) {
  this.status = 'resolved';
  this.action = action;
  this.moderatorNotes = notes;
  this.resolvedAt = new Date();
  return this.save();
};

// Static method to get pending reports count
ContentReportSchema.statics.getPendingCount = function() {
  return this.countDocuments({ status: 'pending' });
};

// Static method to get reports by priority
ContentReportSchema.statics.getByPriority = function(priority, limit = 10) {
  return this.find({ status: 'pending', priority })
    .populate('reportedBy', 'username firstName lastName')
    .populate('targetUserId', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Ensure virtual fields are serialized
ContentReportSchema.set('toJSON', { virtuals: true });
ContentReportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ContentReport', ContentReportSchema);
