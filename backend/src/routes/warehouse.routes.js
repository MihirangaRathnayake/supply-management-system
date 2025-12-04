/**
 * Warehouse Routes
 * ================
 */

const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouse.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.route('/')
    .get(warehouseController.getAllWarehouses)
    .post(authorize('ADMIN'), warehouseController.createWarehouse);

module.exports = router;
