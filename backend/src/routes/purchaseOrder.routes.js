const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const purchaseOrderController = require('../controllers/purchaseOrder.controller');

router.use(authenticate);

router.get('/', purchaseOrderController.getPurchaseOrders);
router.get('/analytics', purchaseOrderController.getPurchaseOrderAnalytics);
router.get('/:id', purchaseOrderController.getPurchaseOrderById);
router.patch('/:id/status', purchaseOrderController.updatePurchaseOrderStatus);
router.post('/', authorize('ADMIN', 'MANAGER', 'STAFF'), purchaseOrderController.createPurchaseOrder);
router.post('/seed', authorize('ADMIN'), purchaseOrderController.seedPurchaseOrders);

module.exports = router;
