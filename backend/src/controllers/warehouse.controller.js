/**
 * Warehouse Controller
 * ====================
 */

const { v4: uuidv4 } = require('uuid');
const oracleService = require('../services/oracle.service');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');
const { logAuditEvent } = require('../services/auditLog.service');

const createWarehouse = asyncHandler(async (req, res) => {
    const {
        warehouseName,
        warehouseCode,
        warehouseType,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        phone,
        email,
        totalCapacity
    } = req.body;

    const warehouseId = uuidv4();

    await oracleService.executeQuery(
        `INSERT INTO WAREHOUSES (
      WAREHOUSE_ID, WAREHOUSE_CODE, WAREHOUSE_NAME, WAREHOUSE_TYPE,
      ADDRESS_LINE1, ADDRESS_LINE2, CITY, STATE, COUNTRY, POSTAL_CODE,
      PHONE, EMAIL, TOTAL_CAPACITY, USED_CAPACITY
    ) VALUES (
      :id, :code, :name, :type, :addr1, :addr2, :city, :state, :country,
      :postal, :phone, :email, :capacity, 0
    )`,
        {
            id: warehouseId,
            code: warehouseCode,
            name: warehouseName,
            type: warehouseType || 'DISTRIBUTION',
            addr1: addressLine1 || null,
            addr2: addressLine2 || null,
            city: city || null,
            state: state || null,
            country: country || 'Sri Lanka',
            postal: postalCode || null,
            phone: phone || null,
            email: email || null,
            capacity: totalCapacity || 0
        }
    );

    const warehouseData = {
        warehouseId,
        warehouseCode,
        warehouseName,
        warehouseType: warehouseType || 'DISTRIBUTION',
        addressLine1,
        city,
        status: 'ACTIVE'
    };

    res.status(201).json({
        success: true,
        message: 'Warehouse created successfully',
        data: warehouseData
    });

    await logAuditEvent({
        action: 'CREATE_WAREHOUSE',
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            firstName: req.user.firstName,
            lastName: req.user.lastName
        },
        resource: {
            type: 'WAREHOUSE',
            id: warehouseId,
            name: warehouseName
        },
        metadata: {
            warehouseCode,
            warehouseType: warehouseType || 'DISTRIBUTION',
            city
        }
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
