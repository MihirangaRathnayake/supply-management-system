/**
 * Product Controller
 * ==================
 */

const { v4: uuidv4 } = require('uuid');
const oracleService = require('../services/oracle.service');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');
const { logAuditEvent } = require('../services/auditLog.service');

const createProduct = asyncHandler(async (req, res) => {
    const { productName, sku, description, unitPrice, costPrice, minStockLevel } = req.body;

    const productId = uuidv4();

    await oracleService.executeQuery(
        `INSERT INTO PRODUCTS (
      PRODUCT_ID, SKU, PRODUCT_NAME, DESCRIPTION, UNIT_PRICE, COST_PRICE, 
      MIN_STOCK_LEVEL, CREATED_BY
    ) VALUES (
      :id, :sku, :name, :desc, :price, :cost, :minStock, :createdBy
    )`,
        {
            id: productId,
            sku: sku,
            name: productName,
            desc: description,
            price: unitPrice,
            cost: costPrice,
            minStock: minStockLevel,
            createdBy: req.user.id
        }
    );

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { productId, ...req.body }
    });

    await logAuditEvent({
        action: 'CREATE_PRODUCT',
        user: req.user,
        resource: {
            type: 'PRODUCT',
            id: productId,
            name: productName
        },
        metadata: req.body
    });
});

const getAllProducts = asyncHandler(async (req, res) => {
    const products = await oracleService.findAll('PRODUCTS', "WHERE STATUS = 'ACTIVE'");
    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await oracleService.findById('PRODUCTS', 'PRODUCT_ID', req.params.id);

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
