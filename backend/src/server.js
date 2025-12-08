const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS configuration - allow multiple origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === '*') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ThreatMap API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
const apiRoutes = require('./routes');
app.use('/api/v1', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 ThreatMap Server Started`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;

 
