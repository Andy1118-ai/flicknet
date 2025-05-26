const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'technical_issue',
      'billing',
      'account',
      'content_request',
      'bug_report',
      'feature_request',
      'general_inquiry',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  messages: [{
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    senderType: {
      type: String,
      enum: ['user', 'support'],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [2000, 'Message cannot be more than 2000 characters']
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      mimeType: String
    }],
    isInternal: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceInfo: String,
    browserInfo: String
  },
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    resolutionNotes: String,
    resolutionType: {
      type: String,
      enum: ['solved', 'duplicate', 'not_reproducible', 'wont_fix', 'user_error']
    },
    resolvedAt: Date
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  escalated: {
    type: Boolean,
    default: false
  },
  escalatedAt: Date,
  escalatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  dueDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
SupportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
SupportTicketSchema.index({ userId: 1 });
SupportTicketSchema.index({ assignedTo: 1 });
SupportTicketSchema.index({ status: 1, priority: -1 });
SupportTicketSchema.index({ category: 1 });
SupportTicketSchema.index({ createdAt: -1 });

// Pre-save middleware to generate ticket number
SupportTicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `FLICK-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for checking if ticket is overdue
SupportTicketSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'resolved' || this.status === 'closed') return false;
  return new Date() > this.dueDate;
});

// Virtual for response time
SupportTicketSchema.virtual('responseTime').get(function() {
  if (this.messages.length < 2) return null;
  const firstMessage = this.messages[0];
  const firstResponse = this.messages.find(msg => msg.senderType === 'support');
  if (!firstResponse) return null;
  return firstResponse.timestamp - firstMessage.timestamp;
});

// Method to add message
SupportTicketSchema.methods.addMessage = function(senderId, senderType, message, isInternal = false) {
  this.messages.push({
    sender: senderId,
    senderType,
    message,
    isInternal,
    timestamp: new Date()
  });

  // Update status if user responds
  if (senderType === 'user' && this.status === 'waiting_for_user') {
    this.status = 'in_progress';
  }

  return this.save();
};

// Method to assign ticket
SupportTicketSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  this.status = 'in_progress';
  return this.save();
};

// Method to resolve ticket
SupportTicketSchema.methods.resolve = function(resolvedBy, resolutionNotes, resolutionType) {
  this.status = 'resolved';
  this.resolution = {
    resolvedBy,
    resolutionNotes,
    resolutionType,
    resolvedAt: new Date()
  };
  return this.save();
};

// Method to escalate ticket
SupportTicketSchema.methods.escalate = function(escalatedBy) {
  this.escalated = true;
  this.escalatedAt = new Date();
  this.escalatedBy = escalatedBy;
  this.priority = 'urgent';
  return this.save();
};

// Static method to get open tickets count
SupportTicketSchema.statics.getOpenCount = function() {
  return this.countDocuments({ status: { $in: ['open', 'in_progress'] } });
};

// Static method to get tickets by status
SupportTicketSchema.statics.getByStatus = function(status, limit = 10) {
  return this.find({ status })
    .populate('userId', 'username firstName lastName email')
    .populate('assignedTo', 'username firstName lastName')
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit);
};

// Ensure virtual fields are serialized
SupportTicketSchema.set('toJSON', { virtuals: true });
SupportTicketSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
