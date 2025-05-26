const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get user's subscription
// @route   GET /api/subscriptions/me
// @access  Private
const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
const getPlans = async (req, res, next) => {
  try {
    const plans = {
      free: {
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        features: {
          movieBrowsing: true,
          basicSearch: true,
          movieDetails: true,
          watchlistLimit: 10,
          ratingsLimit: 5,
          reviewsLimit: 2,
          advancedSearch: false,
          recommendations: false,
          communityFeatures: false,
          prioritySupport: false,
          exclusiveContent: false,
          downloadReceipts: false,
          multipleProfiles: false,
          hdStreaming: false,
          offlineViewing: false
        },
        description: 'Perfect for casual movie browsing'
      },
      basic: {
        name: 'Basic',
        price: { monthly: 9.99, yearly: 99.99 },
        features: {
          movieBrowsing: true,
          basicSearch: true,
          movieDetails: true,
          watchlistLimit: 100,
          ratingsLimit: 50,
          reviewsLimit: 20,
          advancedSearch: true,
          recommendations: true,
          communityFeatures: true,
          downloadReceipts: true,
          hdStreaming: true,
          multipleProfiles: 2,
          prioritySupport: false,
          exclusiveContent: false,
          offlineViewing: false
        },
        description: 'Enhanced features for movie enthusiasts'
      },
      premium: {
        name: 'Premium',
        price: { monthly: 19.99, yearly: 199.99 },
        features: {
          movieBrowsing: true,
          basicSearch: true,
          movieDetails: true,
          watchlistLimit: -1, // unlimited
          ratingsLimit: -1, // unlimited
          reviewsLimit: -1, // unlimited
          advancedSearch: true,
          recommendations: true,
          communityFeatures: true,
          prioritySupport: true,
          exclusiveContent: true,
          downloadReceipts: true,
          offlineViewing: true,
          hdStreaming: true,
          multipleProfiles: 5
        },
        description: 'Complete access to all FlickNet features'
      }
    };

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription plan
// @route   PUT /api/subscriptions/plan
// @access  Private
const updatePlan = async (req, res, next) => {
  try {
    const { plan, billingCycle, paymentMethod } = req.body;

    // Validate plan
    const validPlans = ['free', 'basic', 'premium'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription plan'
      });
    }

    // Validate billing cycle for paid plans
    if (plan !== 'free' && !['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing cycle'
      });
    }

    // Get current subscription
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      // Create new subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active'
      });
    }

    // Calculate pricing
    const pricing = Subscription.getPlanPricing();
    const amount = pricing[plan][billingCycle] || 0;

    // Update subscription
    const oldPlan = subscription.plan;
    subscription.plan = plan;
    subscription.status = 'active';

    if (plan !== 'free') {
      subscription.billingCycle = billingCycle;
      subscription.amount = amount;
      subscription.paymentMethod = paymentMethod;
      subscription.autoRenew = true;

      // Set end date based on billing cycle
      const now = new Date();
      if (billingCycle === 'monthly') {
        subscription.endDate = new Date(now.setMonth(now.getMonth() + 1));
      } else {
        subscription.endDate = new Date(now.setFullYear(now.getFullYear() + 1));
      }
    } else {
      // Free plan
      subscription.endDate = undefined;
      subscription.billingCycle = undefined;
      subscription.amount = 0;
      subscription.paymentMethod = undefined;
    }

    await subscription.save();

    // Update user's subscription field
    await User.findByIdAndUpdate(req.user.id, { subscription: plan });

    // Create notification
    const notificationType = oldPlan === 'free' ? 'upgrade' : 'renewal';
    await Notification.createSubscriptionNotification(req.user.id, subscription, notificationType);

    res.status(200).json({
      success: true,
      message: `Subscription updated to ${plan}`,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel subscription
// @route   DELETE /api/subscriptions/cancel
// @access  Private
const cancelSubscription = async (req, res, next) => {
  try {
    const { reason, cancelAtPeriodEnd = true } = req.body;

    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    if (subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel free subscription'
      });
    }

    // Update subscription
    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      subscription.cancellationReason = reason;
    } else {
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      subscription.cancellationReason = reason;
      subscription.autoRenew = false;

      // Downgrade to free immediately
      subscription.plan = 'free';
      subscription.endDate = undefined;
      await User.findByIdAndUpdate(req.user.id, { subscription: 'free' });
    }

    await subscription.save();

    // Create notification
    await Notification.createSubscriptionNotification(req.user.id, subscription, 'cancelled');

    res.status(200).json({
      success: true,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be cancelled at the end of the billing period'
        : 'Subscription cancelled immediately',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscription usage
// @route   GET /api/subscriptions/usage
// @access  Private
const getUsage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    const usage = {
      watchlist: {
        current: user.watchlist.length,
        limit: subscription.features.watchlistLimit,
        unlimited: subscription.features.watchlistLimit === -1
      },
      ratings: {
        current: user.ratings.length,
        limit: subscription.features.ratingsLimit,
        unlimited: subscription.features.ratingsLimit === -1
      },
      reviews: {
        current: user.reviews.length,
        limit: subscription.features.reviewsLimit,
        unlimited: subscription.features.reviewsLimit === -1
      }
    };

    res.status(200).json({
      success: true,
      data: usage
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySubscription,
  getPlans,
  updatePlan,
  cancelSubscription,
  getUsage
};
