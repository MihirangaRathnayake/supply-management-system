const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const inventoryController = require('../controllers/inventory.controller');

router.use(authenticate);

router.get('/', inventoryController.list);
router.get('/summary', inventoryController.summary);
router.post('/adjust', authorize('ADMIN', 'MANAGER'), inventoryController.adjust);
router.post('/reserve', authorize('ADMIN', 'MANAGER', 'STAFF'), inventoryController.reserve);
router.post('/release', authorize('ADMIN', 'MANAGER', 'STAFF'), inventoryController.release);
router.post('/transfer', authorize('ADMIN', 'MANAGER'), inventoryController.transfer);
router.put('/reorder-level', authorize('ADMIN', 'MANAGER'), inventoryController.reorderLevel);
router.get('/:productId/:warehouseId/history', inventoryController.history);

module.exports = router;
