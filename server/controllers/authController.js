const { User, Subscription, Notification } = require('../models');
const { isDatabaseConnected } = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock users for testing when database is not available
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@flicknet.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    subscription: 'premium',
    createdAt: new Date(),
    lastLogin: new Date()
  },
  {
    id: '2',
    username: 'moviefan',
    email: 'fan@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
    firstName: 'Movie',
    lastName: 'Fan',
    role: 'user',
    subscription: 'basic',
    createdAt: new Date(),
    lastLogin: new Date()
  },
  {
    id: '3',
    username: 'testuser',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // test123
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    subscription: 'free',
    createdAt: new Date(),
    lastLogin: new Date()
  },
  {
    id: '4',
    username: 'moderator',
    email: 'moderator@flicknet.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // mod123
    firstName: 'Content',
    lastName: 'Moderator',
    role: 'moderator',
    subscription: 'basic',
    createdAt: new Date(),
    lastLogin: new Date()
  }
];

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!isDatabaseConnected()) {
      // Mock signup for testing
      console.log('🔧 Using mock signup (database not connected)');

      // Check if user already exists in mock data
      const existingUser = mockUsers.find(u => u.email === email || u.username === username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
        });
      }

      // Create new mock user
      const newUser = {
        id: String(mockUsers.length + 1),
        username,
        email,
        password: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        role: 'user',
        subscription: 'free',
        createdAt: new Date(),
        lastLogin: new Date()
      };

      mockUsers.push(newUser);

      // Generate token
      const token = generateToken(newUser.id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          fullName: `${newUser.firstName} ${newUser.lastName}`,
          role: newUser.role,
          subscription: newUser.subscription,
          avatar: null,
          joinDate: newUser.createdAt
        }
      });
    }

    // MongoDB signup
    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUsername = await User.findOne({ username });

    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        error: 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName
    });

    // Create free subscription for new user
    await Subscription.create({
      userId: user._id,
      type: 'freemium',
      plan: {
        name: 'Freemium',
        price: 0,
        currency: 'USD',
        interval: 'month'
      },
      status: 'active'
    });

    // Create welcome notification
    await Notification.create({
      userId: user._id,
      type: 'system',
      title: 'Welcome to FlickNet!',
      message: 'Your account has been created successfully. Start exploring movies and building your watchlist!',
      data: {
        actionUrl: '/dashboard'
      }
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        avatar: user.profile?.avatar,
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    if (!isDatabaseConnected()) {
      // Mock login for testing
      console.log('🔧 Using mock login (database not connected)');

      // Find user in mock data
      const user = mockUsers.find(u => u.email === email);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check password (for mock users, we'll accept common test passwords)
      const isValidPassword = password === 'admin123' || password === 'password123' || password === 'test123' || password === 'mod123' ||
                             await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Update last login
      user.lastLogin = new Date();

      // Generate token
      const token = generateToken(user.id);

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          role: user.role,
          subscription: user.subscription,
          avatar: null,
          joinDate: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
    }

    // MongoDB login
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        avatar: user.profile?.avatar,
        joinDate: user.createdAt,
        lastLogin: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      // Mock getMe for testing
      console.log('🔧 Using mock getMe (database not connected)');

      const user = mockUsers.find(u => u.id === req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          role: user.role,
          subscription: user.subscription,
          avatar: null,
          joinDate: user.createdAt,
          lastLogin: user.lastLogin,
          preferences: {}
        }
      });
    }

    // MongoDB getMe
    const user = await User.findById(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        avatar: user.profile?.avatar,
        joinDate: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.profile?.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    const allowedFields = ['firstName', 'lastName', 'username', 'preferences'];

    // Only update allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        subscription: user.subscription,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      // Mock users for testing
      console.log('🔧 Using mock getAllUsers (database not connected)');

      const allUsers = mockUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        subscription: user.subscription,
        avatar: null,
        joinDate: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: true
      }));

      return res.status(200).json({
        success: true,
        users: allUsers,
        count: allUsers.length
      });
    }

    // Database implementation
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        subscription: user.subscription,
        avatar: user.avatar,
        joinDate: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive
      })),
      count: users.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      // Mock delete for testing
      console.log('🔧 Using mock deleteUser (database not connected)');

      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      mockUsers.splice(userIndex, 1);

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    }

    // Database implementation
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified'
      });
    }

    if (!isDatabaseConnected()) {
      // Mock update for testing
      console.log('🔧 Using mock updateUserRole (database not connected)');

      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      user.role = role;

      return res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subscription: user.subscription
        }
      });
    }

    // Database implementation
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        subscription: user.subscription,
        avatar: user.avatar,
        joinDate: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get database statistics (admin only)
// @route   GET /api/auth/database/stats
// @access  Private/Admin
const getDatabaseStats = async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      // Mock stats for testing
      console.log('🔧 Using mock database stats (database not connected)');

      return res.status(200).json({
        success: true,
        stats: {
          database: {
            connected: false,
            type: 'mock',
            host: 'localhost (mock)',
            status: 'Mock data active'
          },
          users: {
            total: mockUsers.length,
            active: mockUsers.filter(u => u.role !== 'banned').length,
            admins: mockUsers.filter(u => u.role === 'admin').length,
            bySubscription: {
              free: mockUsers.filter(u => u.subscription === 'free').length,
              basic: mockUsers.filter(u => u.subscription === 'basic').length,
              premium: mockUsers.filter(u => u.subscription === 'premium').length
            }
          },
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development'
          }
        }
      });
    }

    // Database implementation
    const mongoose = require('mongoose');
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscription.type',
          count: { $sum: 1 }
        }
      }
    ]);

    const subscriptionCounts = {
      freemium: 0,
      premium: 0
    };

    subscriptionStats.forEach(stat => {
      if (subscriptionCounts.hasOwnProperty(stat._id)) {
        subscriptionCounts[stat._id] = stat.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        database: {
          connected: true,
          type: 'MongoDB',
          host: mongoose.connection.host,
          status: 'Connected',
          readyState: mongoose.connection.readyState
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          bySubscription: subscriptionCounts
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  logout,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getDatabaseStats
};
