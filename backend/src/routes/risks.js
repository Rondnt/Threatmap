const express = require('express');
const router = express.Router();
const {
  getAllRisks,
  getRiskById,
  createRisk,
  updateRisk,
  deleteRisk,
  calculateRiskScore,
  getRiskMatrix,
  getPrioritizedRisks
} = require('../controllers/riskController');
const { createRiskValidator, updateRiskValidator, calculateRiskValidator } = require('../validators/riskValidator');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Utility routes
router.post('/calculate', calculateRiskValidator, validate, calculateRiskScore);
router.get('/matrix', getRiskMatrix);
router.get('/prioritized', getPrioritizedRisks);

// CRUD operations
router.get('/', getAllRisks);
router.get('/:id', getRiskById);
router.post('/', authorize('admin', 'analyst'), createRiskValidator, validate, createRisk);
router.put('/:id', authorize('admin', 'analyst'), updateRiskValidator, validate, updateRisk);
router.delete('/:id', authorize('admin', 'analyst'), deleteRisk);

module.exports = router;
