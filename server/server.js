const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const subscriptionRoutes = require('./routes/subscriptions');
const notificationRoutes = require('./routes/notifications');
const moderationRoutes = require('./routes/moderation');
const externalRoutes = require('./routes/external');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:3006'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to FlickNet API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      movies: '/api/movies',
      subscriptions: '/api/subscriptions',
      notifications: '/api/notifications',
      moderation: '/api/moderation',
      external: '/api/external'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FlickNet API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/external', externalRoutes);

// Placeholder image endpoint for development
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const color = req.query.color || '6366f1'; // Default to primary color
  const text = req.query.text || `${width}x${height}`;

  // Redirect to a placeholder service
  const placeholderUrl = `https://via.placeholder.com/${width}x${height}/${color}/ffffff?text=${encodeURIComponent(text)}`;
  res.redirect(placeholderUrl);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FlickNet API Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
