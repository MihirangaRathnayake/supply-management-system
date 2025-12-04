/**
 * Supplier Routes
 * ===============
 */

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.route('/')
    .get(supplierController.getAllSuppliers)
    .post(authorize('ADMIN', 'MANAGER'), supplierController.createSupplier);

router.route('/:id')
    .get(supplierController.getSupplierById)
    .put(authorize('ADMIN', 'MANAGER'), supplierController.updateSupplier)
    .delete(authorize('ADMIN'), supplierController.deleteSupplier);

module.exports = router;
