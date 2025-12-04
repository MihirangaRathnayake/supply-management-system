/**
 * Product Routes
 * ==============
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.route('/')
    .get(productController.getAllProducts)
    .post(authorize('ADMIN', 'MANAGER'), productController.createProduct);

router.route('/:id')
    .get(productController.getProductById);

module.exports = router;
