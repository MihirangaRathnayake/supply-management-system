const { getOracleConnection } = require('../config/database');
const InventoryMovement = require('../models/inventoryMovement.model');
const AuditLog = require('../models/auditLog.model');
const { ApiError } = require('../middleware/error.middleware');

const STATUS = {
    OK: 'OK',
    LOW: 'LOW',
    CRITICAL: 'CRITICAL'
};

const computeStatus = (qtyOnHand, reorderPoint) => {
    const q = Number(qtyOnHand || 0);
    const r = Number(reorderPoint || 0);
    if (q <= 0) return STATUS.CRITICAL;
    if (q <= r) return STATUS.CRITICAL;
    if (q <= r * 1.5) return STATUS.LOW;
    return STATUS.OK;
};

const normalizeRow = (row) => {
    const qtyOnHand = Number(row.QUANTITY_ON_HAND || row.qty_on_hand || 0);
    const qtyReserved = Number(row.QUANTITY_RESERVED || row.qty_reserved || 0);
    const unitPrice = Number(row.UNIT_PRICE || row.unit_price || 0);
    const reorderPoint = Number(row.REORDER_POINT || row.reorder_point || 0);
    return {
        inventoryId: row.INVENTORY_ID,
        productId: row.PRODUCT_ID,
        warehouseId: row.WAREHOUSE_ID,
        sku: row.SKU,
        productName: row.PRODUCT_NAME,
        warehouseName: row.WAREHOUSE_NAME,
        qtyOnHand,
        qtyReserved,
        qtyAvailable: qtyOnHand - qtyReserved,
        reorderPoint,
        unitPrice,
        status: computeStatus(qtyOnHand - qtyReserved, reorderPoint),
        updatedAt: row.UPDATED_AT || row.updated_at
    };
};

const logAudit = async ({ action, user, resource, metadata, success = true, message }) => {
    try {
        await AuditLog.create({
            action,
            user,
            resource,
            metadata,
            result: { success, message }
        });
    } catch (err) {
        console.warn('Audit log failed:', err.message);
    }
};

const logMovement = async (movement) => {
    try {
        await InventoryMovement.create(movement);
    } catch (err) {
        console.warn('Movement log failed:', err.message);
    }
};

const fetchInventoryList = async ({ q, warehouseId, status, page = 1, limit = 20 }) => {
    const offset = (Number(page) - 1) * Number(limit);
    const filters = [];
    const binds = {};

    if (warehouseId) {
        filters.push('I.WAREHOUSE_ID = :warehouseId');
        binds.warehouseId = warehouseId;
    }
    if (q) {
        filters.push('(LOWER(P.SKU) LIKE :q OR LOWER(P.PRODUCT_NAME) LIKE :q)');
        binds.q = `%${q.toLowerCase()}%`;
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const baseSql = `
        SELECT I.INVENTORY_ID, I.PRODUCT_ID, I.WAREHOUSE_ID, I.QUANTITY_ON_HAND, I.QUANTITY_RESERVED,
               I.UPDATED_AT,
               P.SKU, P.PRODUCT_NAME, P.UNIT_PRICE, P.REORDER_POINT,
               W.WAREHOUSE_NAME
        FROM INVENTORY I
        JOIN PRODUCTS P ON I.PRODUCT_ID = P.PRODUCT_ID
        JOIN WAREHOUSES W ON I.WAREHOUSE_ID = W.WAREHOUSE_ID
        ${whereClause}
        ORDER BY P.PRODUCT_NAME
        OFFSET ${offset} ROWS FETCH NEXT ${Number(limit)} ROWS ONLY
    `;

    const countSql = `
        SELECT COUNT(*) AS TOTAL
        FROM INVENTORY I
        JOIN PRODUCTS P ON I.PRODUCT_ID = P.PRODUCT_ID
        JOIN WAREHOUSES W ON I.WAREHOUSE_ID = W.WAREHOUSE_ID
        ${whereClause}
    `;

    const conn = await getOracleConnection();
    try {
        const rowsRes = await conn.execute(baseSql, binds, { autoCommit: false });
        const countRes = await conn.execute(countSql, binds, { autoCommit: false });
        let rows = rowsRes.rows.map(normalizeRow);
        if (status) {
            rows = rows.filter((r) => r.status === status);
        }
        const total = Number(countRes.rows[0]?.TOTAL || countRes.rows[0]?.total || 0);
        return { rows, total, page: Number(page), limit: Number(limit) };
    } finally {
        await conn.close();
    }
};

const fetchSummary = async () => {
    const conn = await getOracleConnection();
    try {
        const totalSkuSql = 'SELECT COUNT(*) AS TOTAL FROM PRODUCTS WHERE STATUS = \'ACTIVE\'';
        const totalSku = await conn.execute(totalSkuSql, [], { autoCommit: false });
        const invSql = `
            SELECT 
                SUM(I.QUANTITY_ON_HAND) AS QOH,
                SUM(I.QUANTITY_RESERVED) AS QRES,
                SUM(I.QUANTITY_ON_HAND * P.UNIT_PRICE) AS VALUE,
                SUM(CASE WHEN (I.QUANTITY_ON_HAND - I.QUANTITY_RESERVED) <= P.REORDER_POINT THEN 1 ELSE 0 END) AS LOW_COUNT,
                SUM(CASE WHEN (I.QUANTITY_ON_HAND - I.QUANTITY_RESERVED) <= 0 THEN 1 ELSE 0 END) AS CRIT_COUNT
            FROM INVENTORY I
            JOIN PRODUCTS P ON I.PRODUCT_ID = P.PRODUCT_ID
        `;
        const inv = await conn.execute(invSql, [], { autoCommit: false });
        const row = inv.rows[0] || {};
        return {
            totalSkus: Number(totalSku.rows[0]?.TOTAL || 0),
            lowStock: Number(row.LOW_COUNT || 0),
            critical: Number(row.CRIT_COUNT || 0),
            reserved: Number(row.QRES || 0),
            stockValue: Number(row.VALUE || 0)
        };
    } finally {
        await conn.close();
    }
};

const withOracleTx = async (fn) => {
    const conn = await getOracleConnection();
    conn.autoCommit = false;
    try {
        const result = await fn(conn);
        await conn.commit();
        return result;
    } catch (err) {
        try {
            await conn.rollback();
        } catch (rErr) {
            console.error('Oracle rollback failed', rErr);
        }
        throw err;
    } finally {
        await conn.close();
    }
};

const getInventoryRow = async (conn, productId, warehouseId, lock = false) => {
    const sql = `
        SELECT I.*, P.SKU, P.PRODUCT_NAME, P.UNIT_PRICE, P.REORDER_POINT
        FROM INVENTORY I
        JOIN PRODUCTS P ON I.PRODUCT_ID = P.PRODUCT_ID
        WHERE I.PRODUCT_ID = :productId AND I.WAREHOUSE_ID = :warehouseId
        ${lock ? 'FOR UPDATE' : ''}
    `;
    const res = await conn.execute(sql, { productId, warehouseId }, { autoCommit: false });
    if (!res.rows.length) {
        throw ApiError.notFound('Inventory record not found');
    }
    return res.rows[0];
};

const insertInvTx = async (conn, { inventoryId, type, qtyChange, prevQty, newQty, reason, referenceType, referenceId, userId, unitCost }) => {
    const sql = `
        INSERT INTO INVENTORY_TRANSACTIONS (
            TRANSACTION_ID, INVENTORY_ID, TRANSACTION_TYPE,
            REFERENCE_TYPE, REFERENCE_ID, QUANTITY,
            PREVIOUS_QTY, NEW_QTY, UNIT_COST, REASON, PERFORMED_BY, TRANSACTION_DATE
        ) VALUES (
            SYS_GUID(), :inventoryId, :type,
            :referenceType, :referenceId, :qty,
            :prevQty, :newQty, :unitCost, :reason, :userId, CURRENT_TIMESTAMP
        )
    `;
    await conn.execute(sql, {
        inventoryId,
        type,
        referenceType,
        referenceId,
        qty: qtyChange,
        prevQty,
        newQty,
        unitCost: unitCost || 0,
        reason: reason || 'N/A',
        userId
    }, { autoCommit: false });
};

const adjust = async ({ productId, warehouseId, qtyChange, reason, note, user }) =>
    withOracleTx(async (conn) => {
        const row = await getInventoryRow(conn, productId, warehouseId, true);
        const prevQty = Number(row.QUANTITY_ON_HAND || 0);
        const newQty = prevQty + Number(qtyChange);
        if (newQty < 0) throw ApiError.badRequest('Adjustment would result in negative stock');

        await conn.execute(
            `UPDATE INVENTORY SET QUANTITY_ON_HAND = :newQty, UPDATED_AT = CURRENT_TIMESTAMP WHERE INVENTORY_ID = :id`,
            { newQty, id: row.INVENTORY_ID },
            { autoCommit: false }
        );

        await insertInvTx(conn, {
            inventoryId: row.INVENTORY_ID,
            type: 'ADJUSTMENT',
            qtyChange,
            prevQty,
            newQty,
            reason,
            referenceType: 'MANUAL',
            referenceId: null,
            userId: user?.id
        });

        await logMovement({
            productId,
            warehouseId,
            inventoryId: row.INVENTORY_ID,
            type: 'ADJUST',
            qtyChange,
            previousQty: prevQty,
            newQty,
            reason,
            note,
            user
        });

        await logAudit({
            action: 'ADJUST_INVENTORY',
            user,
            resource: { type: 'INVENTORY', id: row.INVENTORY_ID },
            metadata: { productId, warehouseId, qtyChange, reason, note }
        });

        return normalizeRow({ ...row, QUANTITY_ON_HAND: newQty });
    });

const reserve = async ({ productId, warehouseId, qty, referenceType, referenceId, user }) =>
    withOracleTx(async (conn) => {
        const row = await getInventoryRow(conn, productId, warehouseId, true);
        const qtyOnHand = Number(row.QUANTITY_ON_HAND || 0);
        const qtyReserved = Number(row.QUANTITY_RESERVED || 0);
        const available = qtyOnHand - qtyReserved;
        if (qty > available) throw ApiError.badRequest('Not enough available quantity to reserve');

        const newReserved = qtyReserved + qty;
        await conn.execute(
            `UPDATE INVENTORY SET QUANTITY_RESERVED = :newRes, UPDATED_AT = CURRENT_TIMESTAMP WHERE INVENTORY_ID = :id`,
            { newRes: newReserved, id: row.INVENTORY_ID },
            { autoCommit: false }
        );

        await insertInvTx(conn, {
            inventoryId: row.INVENTORY_ID,
            type: 'ISSUE',
            qtyChange: qty,
            prevQty: qtyOnHand - qtyReserved,
            newQty: qtyOnHand - newReserved,
            reason: 'Reserve',
            referenceType,
            referenceId,
            userId: user?.id
        });

        await logMovement({
            productId,
            warehouseId,
            inventoryId: row.INVENTORY_ID,
            type: 'RESERVE',
            qtyChange: -qty,
            previousQty: available,
            newQty: available - qty,
            referenceType,
            referenceId,
            user
        });

        return normalizeRow({ ...row, QUANTITY_RESERVED: newReserved });
    });

const release = async ({ productId, warehouseId, qty, referenceType, referenceId, user }) =>
    withOracleTx(async (conn) => {
        const row = await getInventoryRow(conn, productId, warehouseId, true);
        const qtyReserved = Number(row.QUANTITY_RESERVED || 0);
        if (qty > qtyReserved) throw ApiError.badRequest('Release exceeds reserved quantity');

        const newReserved = qtyReserved - qty;
        await conn.execute(
            `UPDATE INVENTORY SET QUANTITY_RESERVED = :newRes, UPDATED_AT = CURRENT_TIMESTAMP WHERE INVENTORY_ID = :id`,
            { newRes: newReserved, id: row.INVENTORY_ID },
            { autoCommit: false }
        );

        await insertInvTx(conn, {
            inventoryId: row.INVENTORY_ID,
            type: 'ADJUSTMENT',
            qtyChange: qty,
            prevQty: qtyReserved,
            newQty: newReserved,
            reason: 'Release',
            referenceType,
            referenceId,
            userId: user?.id
        });

        await logMovement({
            productId,
            warehouseId,
            inventoryId: row.INVENTORY_ID,
            type: 'RELEASE',
            qtyChange: qty,
            previousQty: qtyReserved,
            newQty: newReserved,
            referenceType,
            referenceId,
            user
        });

        return normalizeRow({ ...row, QUANTITY_RESERVED: newReserved });
    });

const transfer = async ({ productId, fromWarehouseId, toWarehouseId, qty, note, user }) =>
    withOracleTx(async (conn) => {
        if (fromWarehouseId === toWarehouseId) throw ApiError.badRequest('From and To warehouses must differ');

        const fromRow = await getInventoryRow(conn, productId, fromWarehouseId, true);
        const fromQty = Number(fromRow.QUANTITY_ON_HAND || 0);
        const fromReserved = Number(fromRow.QUANTITY_RESERVED || 0);
        const available = fromQty - fromReserved;
        if (qty > available) throw ApiError.badRequest('Not enough available quantity to transfer');

        await conn.execute(
            `UPDATE INVENTORY SET QUANTITY_ON_HAND = QUANTITY_ON_HAND - :qty, UPDATED_AT = CURRENT_TIMESTAMP WHERE INVENTORY_ID = :id`,
            { qty, id: fromRow.INVENTORY_ID },
            { autoCommit: false }
        );

        // Upsert into destination warehouse
        let toRow;
        try {
            toRow = await getInventoryRow(conn, productId, toWarehouseId, true);
        } catch (err) {
            // create record
            const newId = require('uuid').v4();
            await conn.execute(
                `INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, WAREHOUSE_ID, QUANTITY_ON_HAND, QUANTITY_RESERVED, CREATED_AT, UPDATED_AT)
                 VALUES (:id, :productId, :warehouseId, :qty, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                { id: newId, productId, warehouseId: toWarehouseId, qty },
                { autoCommit: false }
            );
            toRow = {
                INVENTORY_ID: newId,
                PRODUCT_ID: productId,
                WAREHOUSE_ID: toWarehouseId,
                QUANTITY_ON_HAND: 0,
                QUANTITY_RESERVED: 0,
                SKU: fromRow.SKU,
                PRODUCT_NAME: fromRow.PRODUCT_NAME,
                UNIT_PRICE: fromRow.UNIT_PRICE,
                REORDER_POINT: fromRow.REORDER_POINT,
                WAREHOUSE_NAME: undefined
            };
        }

        await conn.execute(
            `UPDATE INVENTORY SET QUANTITY_ON_HAND = QUANTITY_ON_HAND + :qty, UPDATED_AT = CURRENT_TIMESTAMP WHERE INVENTORY_ID = :id`,
            { qty, id: toRow.INVENTORY_ID },
            { autoCommit: false }
        );

        await insertInvTx(conn, {
            inventoryId: fromRow.INVENTORY_ID,
            type: 'TRANSFER_OUT',
            qtyChange: qty,
            prevQty: fromQty,
            newQty: fromQty - qty,
            referenceType: 'TRANSFER',
            referenceId: toWarehouseId,
            reason: note,
            userId: user?.id
        });

        const toPrevQty = Number(toRow.QUANTITY_ON_HAND || 0);
        await insertInvTx(conn, {
            inventoryId: toRow.INVENTORY_ID,
            type: 'TRANSFER_IN',
            qtyChange: qty,
            prevQty: toPrevQty,
            newQty: toPrevQty + qty,
            referenceType: 'TRANSFER',
            referenceId: fromWarehouseId,
            reason: note,
            userId: user?.id
        });

        await logMovement({
            productId,
            warehouseId: fromWarehouseId,
            inventoryId: fromRow.INVENTORY_ID,
            type: 'TRANSFER_OUT',
            qtyChange: -qty,
            previousQty: fromQty,
            newQty: fromQty - qty,
            note,
            user,
            metadata: { toWarehouseId }
        });

        await logMovement({
            productId,
            warehouseId: toWarehouseId,
            inventoryId: toRow.INVENTORY_ID,
            type: 'TRANSFER_IN',
            qtyChange: qty,
            previousQty: toPrevQty,
            newQty: toPrevQty + qty,
            note,
            user,
            metadata: { fromWarehouseId }
        });

        return {
            from: normalizeRow({ ...fromRow, QUANTITY_ON_HAND: fromQty - qty }),
            to: normalizeRow({ ...toRow, QUANTITY_ON_HAND: toPrevQty + qty })
        };
    });

const updateReorder = async ({ productId, warehouseId, reorderLevel, user }) =>
    withOracleTx(async (conn) => {
        const row = await getInventoryRow(conn, productId, warehouseId, true);
        await conn.execute(
            `UPDATE PRODUCTS SET REORDER_POINT = :reorderLevel, UPDATED_AT = CURRENT_TIMESTAMP WHERE PRODUCT_ID = :productId`,
            { reorderLevel, productId },
            { autoCommit: false }
        );

        await logMovement({
            productId,
            warehouseId,
            inventoryId: row.INVENTORY_ID,
            type: 'REORDER_UPDATE',
            qtyChange: 0,
            previousQty: Number(row.REORDER_POINT || 0),
            newQty: Number(reorderLevel),
            user
        });

        await logAudit({
            action: 'UPDATE_REORDER_LEVEL',
            user,
            resource: { type: 'INVENTORY', id: row.INVENTORY_ID },
            metadata: { productId, warehouseId, reorderLevel }
        });

        return normalizeRow({ ...row, REORDER_POINT: reorderLevel });
    });

const getHistory = async ({ productId, warehouseId }) => {
    const movements = await InventoryMovement.find({ productId, warehouseId }).sort({ createdAt: -1 }).limit(200);
    return movements;
};

module.exports = {
    fetchInventoryList,
    fetchSummary,
    adjust,
    reserve,
    release,
    transfer,
    updateReorder,
    getHistory
};
