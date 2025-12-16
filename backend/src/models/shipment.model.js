const { mongoose } = require('../config/database');

const EventSchema = new mongoose.Schema(
    {
        label: { type: String, required: true },
        timestamp: { type: Date, required: true }
    },
    { _id: false }
);

const ShipmentSchema = new mongoose.Schema(
    {
        shipmentId: { type: String, required: true, unique: true },
        poNumber: { type: String, required: true },
        carrier: { type: String, required: true },
        mode: { type: String, enum: ['AIR', 'SEA', 'GROUND'], default: 'GROUND' },
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        status: { type: String, enum: ['CREATED', 'IN_TRANSIT', 'DELAYED', 'DELIVERED', 'CANCELLED'], default: 'CREATED' },
        eta: { type: Date },
        updatedAt: { type: Date, default: Date.now },
        itemsCount: { type: Number, default: 0 },
        progress: { type: Number, default: 0 },
        events: { type: [EventSchema], default: [] }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Shipment', ShipmentSchema);
