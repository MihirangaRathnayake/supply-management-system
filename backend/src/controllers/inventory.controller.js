const { asyncHandler, ApiError } = require('../middleware/error.middleware');
const inventoryService = require('../services/inventory.service');

const list = asyncHandler(async (req, res) => {
    const { q, warehouseId, status, page = 1, limit = 20 } = req.query;
    const data = await inventoryService.fetchInventoryList({ q, warehouseId, status, page, limit });
    res.status(200).json({ success: true, ...data });
});

const summary = asyncHandler(async (_req, res) => {
    const data = await inventoryService.fetchSummary();
    res.status(200).json({ success: true, data });
});

const adjust = asyncHandler(async (req, res) => {
    const { productId, warehouseId, qtyChange, reason, note } = req.body || {};
    if (!productId || !warehouseId || qtyChange === undefined) {
        throw ApiError.badRequest('productId, warehouseId, qtyChange are required');
    }
    const updated = await inventoryService.adjust({
        productId,
        warehouseId,
        qtyChange: Number(qtyChange),
        reason,
        note,
        user: req.user
    });
    res.status(200).json({ success: true, data: updated });
});

const reserve = asyncHandler(async (req, res) => {
    const { productId, warehouseId, qty, referenceType, referenceId } = req.body || {};
    if (!productId || !warehouseId || qty === undefined) {
        throw ApiError.badRequest('productId, warehouseId, qty are required');
    }
    const updated = await inventoryService.reserve({
        productId,
        warehouseId,
        qty: Number(qty),
        referenceType,
        referenceId,
        user: req.user
    });
    res.status(200).json({ success: true, data: updated });
});

const release = asyncHandler(async (req, res) => {
    const { productId, warehouseId, qty, referenceType, referenceId } = req.body || {};
    if (!productId || !warehouseId || qty === undefined) {
        throw ApiError.badRequest('productId, warehouseId, qty are required');
    }
    const updated = await inventoryService.release({
        productId,
        warehouseId,
        qty: Number(qty),
        referenceType,
        referenceId,
        user: req.user
    });
    res.status(200).json({ success: true, data: updated });
});

const transfer = asyncHandler(async (req, res) => {
    const { productId, fromWarehouseId, toWarehouseId, qty, note } = req.body || {};
    if (!productId || !fromWarehouseId || !toWarehouseId || qty === undefined) {
        throw ApiError.badRequest('productId, fromWarehouseId, toWarehouseId, qty are required');
    }
    const result = await inventoryService.transfer({
        productId,
        fromWarehouseId,
        toWarehouseId,
        qty: Number(qty),
        note,
        user: req.user
    });
    res.status(200).json({ success: true, data: result });
});

const reorderLevel = asyncHandler(async (req, res) => {
    const { productId, warehouseId, reorderLevel } = req.body || {};
    if (!productId || !warehouseId || reorderLevel === undefined) {
        throw ApiError.badRequest('productId, warehouseId, reorderLevel are required');
    }
    const updated = await inventoryService.updateReorder({
        productId,
        warehouseId,
        reorderLevel: Number(reorderLevel),
        user: req.user
    });
    res.status(200).json({ success: true, data: updated });
});

const history = asyncHandler(async (req, res) => {
    const { productId, warehouseId } = req.params;
    const items = await inventoryService.getHistory({ productId, warehouseId });
    res.status(200).json({ success: true, data: items });
});

module.exports = {
    list,
    summary,
    adjust,
    reserve,
    release,
    transfer,
    reorderLevel,
    history
};
