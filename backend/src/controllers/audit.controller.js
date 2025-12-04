const { asyncHandler } = require('../middleware/error.middleware');
const { getRecentAuditLogs } = require('../services/auditLog.service');

const listAuditLogs = asyncHandler(async (req, res) => {
    const { limit = 50, resourceType } = req.query;

    const filter = {};
    if (resourceType) {
        filter['resource.type'] = resourceType.toUpperCase();
    }

    const logs = await getRecentAuditLogs({ limit, filter });

    res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
    });
});

module.exports = {
    listAuditLogs
};

