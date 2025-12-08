const express = require('express');
const router = express.Router();
const {
  getAllThreats,
  getThreatById,
  createThreat,
  updateThreat,
  deleteThreat,
  getThreatStatistics
} = require('../controllers/threatController');
const { createThreatValidator, updateThreatValidator } = require('../validators/threatValidator');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/statistics', getThreatStatistics);

// CRUD operations
router.get('/', getAllThreats);
router.get('/:id', getThreatById);
router.post('/', authorize('admin', 'analyst'), createThreatValidator, validate, createThreat);
router.put('/:id', authorize('admin', 'analyst'), updateThreatValidator, validate, updateThreat);
router.delete('/:id', authorize('admin', 'analyst'), deleteThreat);

module.exports = router;
