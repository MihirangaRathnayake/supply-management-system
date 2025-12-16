const oracleService = require('../services/oracle.service');
const Shipment = require('../models/shipment.model');
const PurchaseOrder = require('../models/purchaseOrder.model');
const { asyncHandler } = require('../middleware/error.middleware');

const toRows = (result) => {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (result.rows) return result.rows;
    return [];
};

const getOverview = asyncHandler(async (_req, res) => {
    const [suppliers, products, warehouses] = await Promise.all([
        oracleService.findAll('SUPPLIERS'),
        oracleService.findAll('PRODUCTS'),
        oracleService.findAll('WAREHOUSES')
    ]);

    const lowStockRows = toRows(
        await oracleService.executeQuery(
            `SELECT COUNT(*) AS COUNT FROM INVENTORY i 
             JOIN PRODUCTS p ON i.PRODUCT_ID = p.PRODUCT_ID 
             WHERE i.QUANTITY_ON_HAND <= p.REORDER_POINT`
        )
    );
    const lowStockCount = lowStockRows[0]?.COUNT || lowStockRows[0]?.count || 0;

    const poAgg = await PurchaseOrder.aggregate([
        {
            $group: {
                _id: null,
                openPoCount: {
                    $sum: {
                        $cond: [
                            {
                                $in: [
                                    '$STATUS',
                                    ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'IN_TRANSIT']
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);
    const openPoCount = poAgg[0]?.openPoCount || 0;

    const shipAgg = await Shipment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const inTransitShipments = shipAgg.find((s) => s._id === 'IN_TRANSIT')?.count || 0;

    res.status(200).json({
        success: true,
        data: {
            totalSuppliers: suppliers.length,
            totalProducts: products.length,
            totalWarehouses: warehouses.length,
            lowStockCount,
            openPoCount,
            inTransitShipments
        }
    });
});

const getPoStatus = asyncHandler(async (_req, res) => {
    const statusCounts = await PurchaseOrder.aggregate([
        { $group: { _id: '$STATUS', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);
    res.status(200).json({ success: true, data: statusCounts });
});

const getInventoryByWarehouse = asyncHandler(async (_req, res) => {
    const result = await oracleService.executeQuery(
        `SELECT w.WAREHOUSE_NAME as warehouseName, SUM(i.QUANTITY_ON_HAND) as totalQty
         FROM INVENTORY i
         JOIN WAREHOUSES w ON i.WAREHOUSE_ID = w.WAREHOUSE_ID
         GROUP BY w.WAREHOUSE_NAME
         ORDER BY w.WAREHOUSE_NAME`
    );
    const rows = toRows(result).map((r) => ({
        warehouseName: r.WAREHOUSE_NAME || r.warehousename || r.WAREHOUSENAME || r.warehouseName,
        totalQty: Number(r.TOTALQTY || r.TOTAL_QTY || r.totalQty || r.totalqty || 0)
    }));
    res.status(200).json({ success: true, data: rows });
});

const getShipmentsTimeline = asyncHandler(async (_req, res) => {
    const timeline = await Shipment.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                created: { $sum: 1 },
                delivered: {
                    $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] }
                },
                inTransit: {
                    $sum: { $cond: [{ $eq: ['$status', 'IN_TRANSIT'] }, 1, 0] }
                }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                date: '$_id',
                created: 1,
                delivered: 1,
                inTransit: 1
            }
        }
    ]);
    res.status(200).json({ success: true, data: timeline });
});

const getLowStockProducts = asyncHandler(async (_req, res) => {
    const result = await oracleService.executeQuery(
        `SELECT 
            p.SKU,
            p.PRODUCT_NAME as name,
            w.WAREHOUSE_NAME as warehouseName,
            i.QUANTITY_ON_HAND as qtyOnHand,
            p.REORDER_POINT as reorderLevel
         FROM INVENTORY i
         JOIN PRODUCTS p ON i.PRODUCT_ID = p.PRODUCT_ID
         JOIN WAREHOUSES w ON i.WAREHOUSE_ID = w.WAREHOUSE_ID
         WHERE i.QUANTITY_ON_HAND <= p.REORDER_POINT
         ORDER BY i.QUANTITY_ON_HAND ASC`
    );
    const rows = toRows(result).map((r) => ({
        sku: r.SKU || r.sku,
        name: r.NAME || r.name || r.PRODUCT_NAME,
        warehouseName: r.WAREHOUSE_NAME || r.warehousename,
        qtyOnHand: Number(r.QTYONHAND || r.QUANTITY_ON_HAND || r.qtyOnHand || 0),
        reorderLevel: Number(r.REORDERLEVEL || r.REORDER_LEVEL || r.reorderLevel || r.REORDER_POINT || 0)
    }));
    res.status(200).json({ success: true, data: rows });
});

module.exports = {
    getOverview,
    getPoStatus,
    getInventoryByWarehouse,
    getShipmentsTimeline,
    getLowStockProducts
};
