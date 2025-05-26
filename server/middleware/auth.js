const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { isDatabaseConnected } = require('../config/database');

// Mock users for testing when database is not available
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@flicknet.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    subscription: 'premium'
  },
  {
    id: '2',
    username: 'moviefan',
    email: 'fan@example.com',
    firstName: 'Movie',
    lastName: 'Fan',
    role: 'user',
    subscription: 'basic'
  },
  {
    id: '3',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    subscription: 'free'
  }
];

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

      if (!isDatabaseConnected()) {
        // Mock authentication for testing
        console.log('🔧 Using mock authentication (database not connected)');

        const user = mockUsers.find(u => u.id === decoded.id);

        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'No user found with this token'
          });
        }

        req.user = user;
        return next();
      }

      // Database authentication (original code)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'No user found with this token'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Grant access to moderators and admins
const authorizeModeratorOrAdmin = (req, res, next) => {
  if (!['moderator', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: `User role ${req.user.role} is not authorized to access this route`
    });
  }
  next();
};

// Grant access to admins only (for admin-exclusive features)
const authorizeAdminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required for this route'
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without user
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, authorize, authorizeModeratorOrAdmin, authorizeAdminOnly, optionalAuth };
