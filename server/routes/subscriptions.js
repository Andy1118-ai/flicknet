const express = require('express');
const {
  getMySubscription,
  getPlans,
  updatePlan,
  cancelSubscription,
  getUsage
} = require('../controllers/subscriptionController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/plans', getPlans);

// Protected routes
router.get('/me', protect, getMySubscription);
router.get('/usage', protect, getUsage);
router.put('/plan', protect, updatePlan);
router.delete('/cancel', protect, cancelSubscription);

module.exports = router;
