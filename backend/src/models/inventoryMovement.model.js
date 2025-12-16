const { Schema, model, models } = require('mongoose');

const inventoryMovementSchema = new Schema(
    {
        productId: { type: String, required: true },
        warehouseId: { type: String, required: true },
        inventoryId: { type: String },
        type: {
            type: String,
            required: true,
            enum: ['ADJUST', 'RESERVE', 'RELEASE', 'TRANSFER_OUT', 'TRANSFER_IN', 'REORDER_UPDATE']
        },
        qtyChange: { type: Number, required: true },
        previousQty: { type: Number },
        newQty: { type: Number },
        referenceType: { type: String },
        referenceId: { type: String },
        note: { type: String },
        reason: { type: String },
        user: {
            id: String,
            email: String,
            role: String,
            firstName: String,
            lastName: String
        },
        metadata: { type: Schema.Types.Mixed, default: {} },
        createdAt: { type: Date, default: Date.now }
    },
    {
        versionKey: false,
        collection: 'inventory_movements'
    }
);

module.exports = models.InventoryMovement || model('InventoryMovement', inventoryMovementSchema);
