const express = require('express');
const {
  getModerationStats,
  getContentReports,
  handleContentReport,
  getSupportTickets,
  assignTicket,
  getUsers,
  suspendUser
} = require('../controllers/moderationController');

const { protect, authorizeModeratorOrAdmin, authorizeAdminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require moderator or admin access
router.use(protect);
router.use(authorizeModeratorOrAdmin);

// Dashboard stats
router.get('/stats', getModerationStats);

// Content reports management
router.get('/reports', getContentReports);
router.put('/reports/:id', handleContentReport);

// Support tickets management
router.get('/tickets', getSupportTickets);
router.put('/tickets/:id/assign', assignTicket);

// User management (limited for moderators)
router.get('/users', getUsers);
router.post('/users/:id/suspend', suspendUser);

module.exports = router;
