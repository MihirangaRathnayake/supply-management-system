/**
 * Supplier Controller
 * ===================
 * Handles supplier management
 */

const { v4: uuidv4 } = require('uuid');
const oracleService = require('../services/oracle.service');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');
const { logAuditEvent } = require('../services/auditLog.service');

const createSupplier = asyncHandler(async (req, res) => {
    const { supplierName, contactPerson, email, phone, addressLine1, city, country } = req.body;

    const supplierId = uuidv4();
    const supplierCode = 'SUP-' + Math.floor(1000 + Math.random() * 9000); // Mock sequence

    await oracleService.executeQuery(
        `INSERT INTO SUPPLIERS (
      SUPPLIER_ID, SUPPLIER_CODE, SUPPLIER_NAME, CONTACT_PERSON, EMAIL, PHONE, 
      ADDRESS_LINE1, CITY, COUNTRY, CREATED_BY
    ) VALUES (
      :id, :code, :name, :contact, :email, :phone, :address, :city, :country, :createdBy
    )`,
        {
            id: supplierId,
            code: supplierCode,
            name: supplierName,
            contact: contactPerson,
            email: email,
            phone: phone,
            address: addressLine1,
            city: city,
            country: country,
            createdBy: req.user.id
        }
    );

    res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: { supplierId, supplierCode, ...req.body }
    });

    await logAuditEvent({
        action: 'CREATE_SUPPLIER',
        user: req.user,
        resource: {
            type: 'SUPPLIER',
            id: supplierId,
            name: supplierName
        },
        metadata: {
            supplierCode,
            payload: req.body
        }
    });
});

const getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await oracleService.findAll('SUPPLIERS', "WHERE STATUS = 'ACTIVE'");
    res.status(200).json({
        success: true,
        count: suppliers.length,
        data: suppliers
    });
});

const getSupplierById = asyncHandler(async (req, res) => {
    const supplier = await oracleService.findById('SUPPLIERS', 'SUPPLIER_ID', req.params.id);

    if (!supplier) {
        throw ApiError.notFound('Supplier not found');
    }

    res.status(200).json({
        success: true,
        data: supplier
    });
});

const updateSupplier = asyncHandler(async (req, res) => {
    const { supplierName, contactPerson, email, phone } = req.body;

    const result = await oracleService.executeQuery(
        `UPDATE SUPPLIERS SET 
      SUPPLIER_NAME = :name,
      CONTACT_PERSON = :contact,
      EMAIL = :email,
      PHONE = :phone,
      UPDATED_AT = CURRENT_TIMESTAMP
    WHERE SUPPLIER_ID = :id`,
        {
            name: supplierName,
            contact: contactPerson,
            email: email,
            phone: phone,
            id: req.params.id
        }
    );

    if (result.rowsAffected === 0) {
        throw ApiError.notFound('Supplier not found');
    }

    res.status(200).json({
        success: true,
        message: 'Supplier updated successfully'
    });

    await logAuditEvent({
        action: 'UPDATE_SUPPLIER',
        user: req.user,
        resource: {
            type: 'SUPPLIER',
            id: req.params.id
        },
        metadata: req.body
    });
});

const deleteSupplier = asyncHandler(async (req, res) => {
    // Soft delete
    const result = await oracleService.executeQuery(
        `UPDATE SUPPLIERS SET STATUS = 'INACTIVE' WHERE SUPPLIER_ID = :id`,
        [req.params.id]
    );

    if (result.rowsAffected === 0) {
        throw ApiError.notFound('Supplier not found');
    }

    res.status(200).json({
        success: true,
        message: 'Supplier deleted successfully'
    });

    await logAuditEvent({
        action: 'DELETE_SUPPLIER',
        user: req.user,
        resource: {
            type: 'SUPPLIER',
            id: req.params.id
        },
        metadata: {
            softDelete: true
        }
    });
});

module.exports = {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
};
