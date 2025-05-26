const express = require('express');
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  getUnreadCount,
  createTestNotification
} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Notification routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.put('/read-all', markAllAsRead);
router.post('/test', createTestNotification);
router.get('/:id', getNotification);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
