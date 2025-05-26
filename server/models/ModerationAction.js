const mongoose = require('mongoose');

const ModerationActionSchema = new mongoose.Schema({
  moderatorId: {
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
    enum: ['Movie', 'User', 'Comment', 'Review', 'ContentReport', 'SupportTicket']
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'warning',
      'temporary_suspension',
      'permanent_ban',
      'content_removal',
      'content_flag',
      'account_restriction',
      'report_resolution',
      'ticket_resolution',
      'privilege_revocation',
      'other'
    ]
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for the action'],
    maxlength: [500, 'Reason cannot be more than 500 characters']
  },
  details: {
    originalContent: String,
    suspensionDuration: Number, // in hours
    restrictionType: String,
    relatedReportId: {
      type: mongoose.Schema.ObjectId,
      ref: 'ContentReport'
    },
    relatedTicketId: {
      type: mongoose.Schema.ObjectId,
      ref: 'SupportTicket'
    },
    additionalNotes: String
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'major', 'severe'],
    default: 'moderate'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'appealed'],
    default: 'active'
  },
  expiresAt: {
    type: Date
  },
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  revocationReason: {
    type: String
  },
  appealInfo: {
    appealedAt: Date,
    appealReason: String,
    appealStatus: {
      type: String,
      enum: ['pending', 'approved', 'denied']
    },
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  },
  evidence: [{
    type: {
      type: String,
      enum: ['screenshot', 'log', 'report', 'other']
    },
    description: String,
    url: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better performance
ModerationActionSchema.index({ moderatorId: 1 });
ModerationActionSchema.index({ targetUserId: 1 });
ModerationActionSchema.index({ actionType: 1 });
ModerationActionSchema.index({ status: 1 });
ModerationActionSchema.index({ expiresAt: 1 });
ModerationActionSchema.index({ createdAt: -1 });

// Virtual for checking if action is expired
ModerationActionSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for checking if action is currently effective
ModerationActionSchema.virtual('isEffective').get(function() {
  return this.status === 'active' && !this.isExpired;
});

// Pre-save middleware to handle expiration
ModerationActionSchema.pre('save', function(next) {
  if (this.expiresAt && new Date() > this.expiresAt && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Method to revoke action
ModerationActionSchema.methods.revoke = function(revokedBy, reason) {
  this.status = 'revoked';
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revocationReason = reason;
  return this.save();
};

// Method to appeal action
ModerationActionSchema.methods.appeal = function(appealReason) {
  this.appealInfo = {
    appealedAt: new Date(),
    appealReason,
    appealStatus: 'pending'
  };
  this.status = 'appealed';
  return this.save();
};

// Method to review appeal
ModerationActionSchema.methods.reviewAppeal = function(reviewedBy, approved, reviewNotes) {
  this.appealInfo.reviewedBy = reviewedBy;
  this.appealInfo.reviewedAt = new Date();
  this.appealInfo.appealStatus = approved ? 'approved' : 'denied';
  this.appealInfo.reviewNotes = reviewNotes;

  if (approved) {
    this.status = 'revoked';
    this.revokedAt = new Date();
    this.revokedBy = reviewedBy;
    this.revocationReason = 'Appeal approved';
  } else {
    this.status = 'active';
  }

  return this.save();
};

// Static method to get active actions for user
ModerationActionSchema.statics.getActiveForUser = function(userId) {
  return this.find({
    targetUserId: userId,
    status: 'active',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).populate('moderatorId', 'username firstName lastName');
};

// Static method to get moderation history for user
ModerationActionSchema.statics.getHistoryForUser = function(userId, limit = 10) {
  return this.find({ targetUserId: userId })
    .populate('moderatorId', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get actions by moderator
ModerationActionSchema.statics.getByModerator = function(moderatorId, limit = 20) {
  return this.find({ moderatorId })
    .populate('targetUserId', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to check if user is currently suspended
ModerationActionSchema.statics.isUserSuspended = function(userId) {
  return this.findOne({
    targetUserId: userId,
    actionType: { $in: ['temporary_suspension', 'permanent_ban'] },
    status: 'active',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Ensure virtual fields are serialized
ModerationActionSchema.set('toJSON', { virtuals: true });
ModerationActionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ModerationAction', ModerationActionSchema);
