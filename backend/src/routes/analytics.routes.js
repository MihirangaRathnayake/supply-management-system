const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/recent-activity', analyticsController.getRecentActivity);
router.get('/revenue-orders-trend', analyticsController.getRevenueOrdersTrend);
router.get('/po-status', analyticsController.getPoStatus);
router.get('/inventory-by-warehouse', analyticsController.getInventoryByWarehouse);
router.get('/shipments-timeline', analyticsController.getShipmentsTimeline);
router.get('/low-stock-products', analyticsController.getLowStockProducts);

module.exports = router;
