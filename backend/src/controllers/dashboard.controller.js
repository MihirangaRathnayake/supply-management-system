const oracleService = require('../services/oracle.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { getRecentAuditLogs } = require('../services/auditLog.service');
const { getDbHealth } = require('../config/database');

async function safeCount(table) {
    try {
        const result = await oracleService.executeQuery(`SELECT COUNT(*) AS total FROM ${table}`);
        const row = result?.rows?.[0] || {};
        const firstKey = Object.keys(row)[0];
        return Number(row[firstKey]) || 0;
    } catch (error) {
        console.warn(`Unable to fetch count for ${table}:`, error.message);
        return 0;
    }
}

const getDashboardOverview = asyncHandler(async (req, res) => {
    const [supplierCount, productCount, warehouseCount, auditTrail] = await Promise.all([
        safeCount('SUPPLIERS'),
        safeCount('PRODUCTS'),
        safeCount('WAREHOUSES'),
        getRecentAuditLogs({ limit: 15 })
    ]);

    res.status(200).json({
        success: true,
        data: {
            kpis: {
                suppliers: supplierCount,
                products: productCount,
                warehouses: warehouseCount
            },
            auditTrail,
            databases: getDbHealth()
        }
    });
});

module.exports = {
    getDashboardOverview
};

