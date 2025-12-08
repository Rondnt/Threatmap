const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware
router.use(authenticate);

// CRUD routes
router.post('/', assetController.create);
router.get('/', assetController.getAll);
router.get('/statistics', assetController.getStatistics);
router.get('/topology', assetController.getTopology);
router.get('/:id', assetController.getById);
router.put('/:id', assetController.update);
router.patch('/:id/position', assetController.updatePosition);
router.delete('/:id', assetController.deleteAsset);

module.exports = router;
