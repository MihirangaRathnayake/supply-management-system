/**
 * Product Controller (In-memory fallback)
 * =======================================
 * Provides mock CRUD so the UI keeps working without Oracle.
 */

const { v4: uuidv4 } = require('uuid');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

const seedProducts = [
    {
        PRODUCT_ID: 'PROD-1001',
        SKU: 'SKU-1001',
        PRODUCT_NAME: 'High Torque Motor',
        DESCRIPTION: 'Industrial motor for conveyor applications',
        UNIT_PRICE: 450,
        COST_PRICE: 320,
        MIN_STOCK_LEVEL: 50,
        STATUS: 'ACTIVE'
    },
    {
        PRODUCT_ID: 'PROD-1002',
        SKU: 'SKU-2004',
        PRODUCT_NAME: 'Optical Sensor Kit',
        DESCRIPTION: 'Precision optical sensors for QA lines',
        UNIT_PRICE: 180,
        COST_PRICE: 90,
        MIN_STOCK_LEVEL: 40,
        STATUS: 'ACTIVE'
    },
    {
        PRODUCT_ID: 'PROD-1003',
        SKU: 'SKU-4010',
        PRODUCT_NAME: 'Steel Fasteners',
        DESCRIPTION: 'Bulk fasteners for assembly',
        UNIT_PRICE: 2.5,
        COST_PRICE: 1.1,
        MIN_STOCK_LEVEL: 200,
        STATUS: 'ACTIVE'
    }
];

let products = [...seedProducts];

const normalizeNumber = (val) => Number(val || 0);

const createProduct = asyncHandler(async (req, res) => {
    const { productName, sku, description, unitPrice, costPrice, minStockLevel } = req.body || {};

    if (!productName || !sku) {
        throw ApiError.badRequest('productName and sku are required');
    }

    // Prevent duplicate SKU locally
    const exists = products.some((p) => (p.SKU || '').toLowerCase() === sku.toLowerCase());
    if (exists) {
        throw ApiError.conflict('SKU already exists. Please use a unique SKU.');
    }

    const productId = uuidv4();
    const newProduct = {
        PRODUCT_ID: productId,
        SKU: sku,
        PRODUCT_NAME: productName,
        DESCRIPTION: description || '',
        UNIT_PRICE: normalizeNumber(unitPrice),
        COST_PRICE: normalizeNumber(costPrice),
        MIN_STOCK_LEVEL: normalizeNumber(minStockLevel),
        STATUS: 'ACTIVE'
    };

    products = [newProduct, ...products];

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
    });
});

const getAllProducts = asyncHandler(async (_req, res) => {
    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

const getProductById = asyncHandler(async (req, res) => {
    const product = products.find(
        (p) =>
            p.PRODUCT_ID === req.params.id ||
            p.SKU === req.params.id
    );

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

module.exports = {
    createProduct,
    getAllProducts,
    getProductById
};
