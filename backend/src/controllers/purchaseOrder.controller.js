const { v4: uuidv4 } = require('uuid');
const PurchaseOrder = require('../models/purchaseOrder.model');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

const seedTemplates = [
    {
        PO_ID: 'PO-2045',
        PO_NUMBER: 'PO-2045',
        SUPPLIER_NAME: 'Global Industrial Supplies',
        WAREHOUSE_NAME: 'Central DC',
        CITY: 'Colombo',
        STATUS: 'PENDING_APPROVAL',
        PRIORITY: 'HIGH',
        ORDER_DATE: '2024-11-05T00:00:00Z',
        EXPECTED_DATE: '2024-11-12T00:00:00Z',
        TOTAL_VALUE: 48500,
        items: [
            { SKU: 'SKU-1001', PRODUCT_NAME: 'High Torque Motor', QUANTITY_ORDERED: 10, QUANTITY_RECEIVED: 4, UNIT_PRICE: 450 },
            { SKU: 'SKU-3005', PRODUCT_NAME: 'Sensor Array', QUANTITY_ORDERED: 30, QUANTITY_RECEIVED: 10, UNIT_PRICE: 180 }
        ]
    },
    {
        PO_ID: 'PO-2046',
        PO_NUMBER: 'PO-2046',
        SUPPLIER_NAME: 'Pacific Manufacturing Co.',
        WAREHOUSE_NAME: 'East Coast DC',
        CITY: 'Galle',
        STATUS: 'SENT',
        PRIORITY: 'NORMAL',
        ORDER_DATE: '2024-11-03T00:00:00Z',
        EXPECTED_DATE: '2024-11-15T00:00:00Z',
        TOTAL_VALUE: 22800,
        items: [
            { SKU: 'SKU-2004', PRODUCT_NAME: 'Optical Sensor Kit', QUANTITY_ORDERED: 20, QUANTITY_RECEIVED: 0, UNIT_PRICE: 180 },
            { SKU: 'SKU-4010', PRODUCT_NAME: 'Steel Fasteners', QUANTITY_ORDERED: 500, QUANTITY_RECEIVED: 0, UNIT_PRICE: 2.5 }
        ]
    },
    {
        PO_ID: 'PO-2047',
        PO_NUMBER: 'PO-2047',
        SUPPLIER_NAME: 'Atlantic Components Ltd.',
        WAREHOUSE_NAME: 'West Coast DC',
        CITY: 'Kandy',
        STATUS: 'RECEIVED',
        PRIORITY: 'LOW',
        ORDER_DATE: '2024-10-28T00:00:00Z',
        EXPECTED_DATE: '2024-11-08T00:00:00Z',
        TOTAL_VALUE: 17300,
        items: [
            { SKU: 'SKU-5001', PRODUCT_NAME: 'HVAC Control Board', QUANTITY_ORDERED: 15, QUANTITY_RECEIVED: 15, UNIT_PRICE: 520 },
            { SKU: 'SKU-2100', PRODUCT_NAME: 'Packing Foam', QUANTITY_ORDERED: 120, QUANTITY_RECEIVED: 120, UNIT_PRICE: 12 }
        ]
    }
];

const normalizeNumber = (num) => Number(num || 0);

const getPurchaseOrders = asyncHandler(async (_req, res) => {
    const orders = await PurchaseOrder.find().sort({ ORDER_DATE: -1, createdAt: -1 });
    res.status(200).json({
        success: true,
        data: orders
    });
});

const getPurchaseOrderById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const order = await PurchaseOrder.findOne({
        $or: [{ PO_ID: id }, { PO_NUMBER: id }, { _id: id }]
    });

    if (!order) {
        throw ApiError.notFound('Purchase order not found');
    }

    res.status(200).json({
        success: true,
        data: order
    });
});

const createPurchaseOrder = asyncHandler(async (req, res) => {
    const {
        supplierId,
        warehouseId,
        expectedDate,
        priority,
        notes,
        items = [],
        shipping = 0,
        taxRate = 0,
        total
    } = req.body || {};

    const poId = uuidv4();
    const poNumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderDate = new Date();

    const mappedItems = items.map((item, idx) => ({
        SKU: item.sku || `SKU-${idx + 1}`,
        PRODUCT_NAME: item.productName || `Item ${idx + 1}`,
        QUANTITY_ORDERED: normalizeNumber(item.quantity || item.qty),
        QUANTITY_RECEIVED: 0,
        UNIT_PRICE: normalizeNumber(item.unitPrice)
    }));

    const lineSum = mappedItems.reduce(
        (sum, i) => sum + normalizeNumber(i.QUANTITY_ORDERED) * normalizeNumber(i.UNIT_PRICE),
        0
    );
    const totalValue = total ?? lineSum + normalizeNumber(shipping) + normalizeNumber(taxRate) * lineSum;

    const newOrder = await PurchaseOrder.create({
        PO_ID: poId,
        PO_NUMBER: poNumber,
        SUPPLIER_ID: supplierId,
        SUPPLIER_NAME: req.body.supplierName || 'New Supplier',
        WAREHOUSE_ID: warehouseId,
        WAREHOUSE_NAME: req.body.warehouseName || 'Destination Warehouse',
        CITY: req.body.city || '',
        STATUS: 'DRAFT',
        PRIORITY: priority || 'NORMAL',
        ORDER_DATE: orderDate,
        EXPECTED_DATE: expectedDate,
        TOTAL_VALUE: Number(totalValue) || 0,
        NOTES: notes || '',
        items: mappedItems
    });

    res.status(201).json({
        success: true,
        message: 'Purchase order created',
        data: newOrder
    });
});

const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};

    const updated = await PurchaseOrder.findOneAndUpdate(
        { $or: [{ PO_ID: id }, { _id: id }] },
        { $set: { STATUS: status } },
        { new: true }
    );

    if (!updated) {
        throw ApiError.notFound('Purchase order not found');
    }

    res.status(200).json({
        success: true,
        message: 'Status updated',
        data: updated
    });
});

const getPurchaseOrderAnalytics = asyncHandler(async (_req, res) => {
    const [totals] = await PurchaseOrder.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                openOrders: {
                    $sum: {
                        $cond: [
                            { $in: ['$STATUS', ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'IN_TRANSIT']] },
                            1,
                            0
                        ]
                    }
                },
                receivedCount: {
                    $sum: {
                        $cond: [{ $eq: ['$STATUS', 'RECEIVED'] }, 1, 0]
                    }
                },
                totalValue: { $sum: '$TOTAL_VALUE' }
            }
        }
    ]);

    const totalOrders = totals?.totalOrders || 0;
    const totalValue = totals?.totalValue || 0;

    res.status(200).json({
        success: true,
        data: {
            TOTAL_ORDERS: totalOrders,
            OPEN_ORDERS: totals?.openOrders || 0,
            RECEIVED_COUNT: totals?.receivedCount || 0,
            TOTAL_VALUE: totalValue,
            AVG_ORDER_VALUE: totalOrders ? totalValue / totalOrders : 0
        }
    });
});

const seedPurchaseOrders = asyncHandler(async (_req, res) => {
    const existing = await PurchaseOrder.find({}, { PO_NUMBER: 1, PO_ID: 1 });
    const existingIds = new Set(existing.map((o) => o.PO_ID));

    const toInsert = seedTemplates
        .filter((po) => !existingIds.has(po.PO_ID))
        .map((po) => ({
            ...po,
            ORDER_DATE: po.ORDER_DATE ? new Date(po.ORDER_DATE) : new Date(),
            EXPECTED_DATE: po.EXPECTED_DATE ? new Date(po.EXPECTED_DATE) : null
        }));

    if (toInsert.length) {
        await PurchaseOrder.insertMany(toInsert);
    }

    res.status(201).json({
        success: true,
        message: 'Sample purchase orders ready',
        data: { created: toInsert.length }
    });
});

module.exports = {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    getPurchaseOrderAnalytics,
    seedPurchaseOrders
};
