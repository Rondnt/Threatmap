const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const threatRoutes = require('./threats');
const riskRoutes = require('./risks');
const vulnerabilityRoutes = require('./vulnerabilities');
const assetRoutes = require('./assets');
const alertRoutes = require('./alerts');
const reportRoutes = require('./reports');

// API information
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ThreatMap API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      threats: '/api/v1/threats',
      risks: '/api/v1/risks',
      vulnerabilities: '/api/v1/vulnerabilities',
      assets: '/api/v1/assets',
      alerts: '/api/v1/alerts',
      reports: '/api/v1/reports'
    },
    documentation: 'See README.md for API documentation'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/threats', threatRoutes);
router.use('/risks', riskRoutes);
router.use('/vulnerabilities', vulnerabilityRoutes);
router.use('/assets', assetRoutes);
router.use('/alerts', alertRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
