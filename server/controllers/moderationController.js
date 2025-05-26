const { User, Movie, ContentReport, SupportTicket, ModerationAction } = require('../models');

// @desc    Get moderation dashboard stats
// @route   GET /api/moderation/stats
// @access  Private (Moderator/Admin)
const getModerationStats = async (req, res, next) => {
  try {
    const [
      pendingReports,
      openTickets,
      totalUsers,
      suspendedUsers,
      recentActions
    ] = await Promise.all([
      ContentReport.countDocuments({ status: 'pending' }),
      SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      User.countDocuments({ isActive: true }),
      ModerationAction.countDocuments({
        actionType: 'temporary_suspension',
        status: 'active',
        expiresAt: { $gt: new Date() }
      }),
      ModerationAction.countDocuments({
        moderatorId: req.user.id,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        pendingReports,
        openTickets,
        totalUsers,
        suspendedUsers,
        recentActions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get content reports queue
// @route   GET /api/moderation/reports
// @access  Private (Moderator/Admin)
const getContentReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status || 'pending';
    const priority = req.query.priority;

    const query = { status };
    if (priority) query.priority = priority;

    const reports = await ContentReport.find(query)
      .populate('reportedBy', 'username firstName lastName')
      .populate('targetUserId', 'username firstName lastName')
      .populate('moderatorId', 'username firstName lastName')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ContentReport.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle content report
// @route   PUT /api/moderation/reports/:id
// @access  Private (Moderator/Admin)
const handleContentReport = async (req, res, next) => {
  try {
    const { action, moderatorNotes } = req.body;

    const report = await ContentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Update report
    report.status = 'resolved';
    report.moderatorId = req.user.id;
    report.moderatorNotes = moderatorNotes;
    report.action = action;
    report.resolvedAt = new Date();

    await report.save();

    // Create moderation action record
    const moderationAction = new ModerationAction({
      moderatorId: req.user.id,
      targetUserId: report.targetUserId,
      actionType: 'report_resolution',
      reason: `Report resolved: ${report.reason}`,
      details: {
        relatedReportId: report._id,
        originalContent: moderatorNotes
      }
    });

    await moderationAction.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get support tickets
// @route   GET /api/moderation/tickets
// @access  Private (Moderator/Admin)
const getSupportTickets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status;
    const category = req.query.category;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'username firstName lastName email')
      .populate('assignedTo', 'username firstName lastName')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign ticket to moderator
// @route   PUT /api/moderation/tickets/:id/assign
// @access  Private (Moderator/Admin)
const assignTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    ticket.assignedTo = req.user.id;
    ticket.status = 'in_progress';
    await ticket.save();

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users for moderation
// @route   GET /api/moderation/users
// @access  Private (Moderator/Admin)
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search;

    const query = { role: { $ne: 'admin' } }; // Moderators can't manage admins
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend user temporarily
// @route   POST /api/moderation/users/:id/suspend
// @access  Private (Moderator/Admin)
const suspendUser = async (req, res, next) => {
  try {
    const { duration, reason } = req.body; // duration in hours

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Moderators cannot suspend admins or other moderators
    if (['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot suspend admin or moderator users'
      });
    }

    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

    const moderationAction = new ModerationAction({
      moderatorId: req.user.id,
      targetUserId: user._id,
      actionType: 'temporary_suspension',
      reason,
      details: {
        suspensionDuration: duration
      },
      expiresAt
    });

    await moderationAction.save();

    res.status(200).json({
      success: true,
      message: `User suspended for ${duration} hours`,
      data: moderationAction
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getModerationStats,
  getContentReports,
  handleContentReport,
  getSupportTickets,
  assignTicket,
  getUsers,
  suspendUser
};
