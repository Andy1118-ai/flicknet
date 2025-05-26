const express = require('express');
const {
  signup,
  login,
  getMe,
  updateProfile,
  logout,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getDatabaseStats
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

// Admin-only routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.get('/database/stats', protect, authorize('admin'), getDatabaseStats);

module.exports = router;
