const { Schema, model, models } = require('mongoose');

const auditLogSchema = new Schema(
    {
        action: { type: String, required: true },
        source: {
            type: String,
            default: 'oracle',
            enum: ['oracle', 'mongo', 'system']
        },
        user: {
            id: String,
            email: String,
            role: String,
            firstName: String,
            lastName: String
        },
        resource: {
            type: {
                type: String,
                enum: [
                    'SUPPLIER',
                    'PRODUCT',
                    'WAREHOUSE',
                    'INVENTORY',
                    'PURCHASE_ORDER',
                    'SHIPMENT',
                    'USER',
                    'SYSTEM'
                ],
                default: 'SYSTEM'
            },
            id: String,
            name: String
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {}
        },
        result: {
            success: { type: Boolean, default: true },
            message: String
        },
        correlationId: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        collection: 'audit_logs'
    }
);

module.exports = models.AuditLog || model('AuditLog', auditLogSchema);

