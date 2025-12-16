const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const shipmentController = require('../controllers/shipment.controller');

router.use(authenticate);

router.get('/', shipmentController.getShipments);
router.get('/analytics', shipmentController.getShipmentAnalytics);
router.post('/', shipmentController.createShipment);
router.put('/:id', shipmentController.updateShipment);
router.delete('/:id', authorize('ADMIN'), shipmentController.deleteShipment);
router.post('/seed', authorize('ADMIN'), shipmentController.seedShipments);

module.exports = router;
