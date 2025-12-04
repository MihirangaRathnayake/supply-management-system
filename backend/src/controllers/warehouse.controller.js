/**
 * Warehouse Controller
 * ====================
 */

const { v4: uuidv4 } = require('uuid');
const oracleService = require('../services/oracle.service');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');
const { logAuditEvent } = require('../services/auditLog.service');

const createWarehouse = asyncHandler(async (req, res) => {
    const { warehouseName, warehouseCode, addressLine1, city, type } = req.body;

    const warehouseId = uuidv4();

    await oracleService.executeQuery(
        `INSERT INTO WAREHOUSES (
      WAREHOUSE_ID, WAREHOUSE_CODE, WAREHOUSE_NAME, ADDRESS_LINE1, CITY, WAREHOUSE_TYPE
    ) VALUES (
      :id, :code, :name, :address, :city, :type
    )`,
        {
            id: warehouseId,
            code: warehouseCode,
            name: warehouseName,
            address: addressLine1,
            city: city,
            type: type || 'DISTRIBUTION'
        }
    );

    res.status(201).json({
        success: true,
        message: 'Warehouse created successfully',
        data: { warehouseId, ...req.body }
    });

    await logAuditEvent({
        action: 'CREATE_WAREHOUSE',
        user: req.user,
        resource: {
            type: 'WAREHOUSE',
            id: warehouseId,
            name: warehouseName
        },
        metadata: req.body
    });
});

const getAllWarehouses = asyncHandler(async (req, res) => {
    const warehouses = await oracleService.findAll('WAREHOUSES', "WHERE STATUS = 'ACTIVE'");
    res.status(200).json({
        success: true,
        count: warehouses.length,
        data: warehouses
    });
});

module.exports = {
    createWarehouse,
    getAllWarehouses
};
