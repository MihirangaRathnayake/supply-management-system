const crypto = require('crypto');
const AuditLog = require('../models/auditLog.model');
const { mongoose } = require('../config/database');

const isMongoReady = () => mongoose.connection.readyState === 1;

async function logAuditEvent({
    action,
    user,
    resource,
    metadata = {},
    result = {}
}) {
    if (!isMongoReady()) {
        console.warn('MongoDB not connected - skipping audit log for action:', action);
        return null;
    }

    const correlationId = metadata.correlationId || crypto.randomUUID();

    const payload = {
        action,
        source: metadata.source || 'oracle',
        user: user
            ? {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
            : undefined,
        resource,
        metadata: {
            ...metadata,
            correlationId
        },
        result: {
            success: result.success ?? true,
            message: result.message
        },
        correlationId
    };

    return AuditLog.create(payload);
}

async function getRecentAuditLogs({ limit = 20, filter = {} } = {}) {
    if (!isMongoReady()) {
        console.warn('MongoDB not connected - returning empty audit log list');
        return [];
    }

    const sanitizedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);

    return AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(sanitizedLimit)
        .lean();
}

module.exports = {
    logAuditEvent,
    getRecentAuditLogs,
    isMongoReady
};

