const express = require('express');
const router = express.Router();
const vulnerabilityController = require('../controllers/vulnerabilityController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas CRUD
router.post('/', vulnerabilityController.create);
router.get('/', vulnerabilityController.getAll);
router.get('/statistics', vulnerabilityController.getStatistics);
router.get('/:id', vulnerabilityController.getById);
router.put('/:id', vulnerabilityController.update);
router.delete('/:id', vulnerabilityController.deleteVulnerability);

// Asociar amenaza
router.post('/:id/threats', vulnerabilityController.associateThreat);

module.exports = router;
