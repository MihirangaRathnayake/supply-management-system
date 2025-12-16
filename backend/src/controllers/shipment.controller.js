const { v4: uuidv4 } = require('uuid');
const Shipment = require('../models/shipment.model');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

const demoShipments = [
    {
        shipmentId: 'SHP-1010',
        poNumber: 'PO-2045',
        carrier: 'DHL Express',
        mode: 'AIR',
        origin: 'Singapore',
        destination: 'Central DC',
        status: 'IN_TRANSIT',
        eta: '2024-11-13T08:00:00Z',
        updatedAt: '2024-11-10T09:30:00Z',
        itemsCount: 2,
        progress: 65,
        events: [
            { label: 'Picked up', timestamp: '2024-11-08T04:00:00Z' },
            { label: 'Departed hub', timestamp: '2024-11-09T02:30:00Z' },
            { label: 'Arrived at Colombo', timestamp: '2024-11-10T06:00:00Z' }
        ]
    },
    {
        shipmentId: 'SHP-1011',
        poNumber: 'PO-2046',
        carrier: 'Maersk',
        mode: 'SEA',
        origin: 'Shenzhen',
        destination: 'East Coast DC',
        status: 'DELAYED',
        eta: '2024-11-22T18:00:00Z',
        updatedAt: '2024-11-09T12:15:00Z',
        itemsCount: 3,
        progress: 40,
        events: [
            { label: 'Loaded on vessel', timestamp: '2024-11-05T10:00:00Z' },
            { label: 'Departed port', timestamp: '2024-11-06T14:00:00Z' }
        ]
    },
    {
        shipmentId: 'SHP-1012',
        poNumber: 'PO-2047',
        carrier: 'UPS Ground',
        mode: 'GROUND',
        origin: 'Mumbai',
        destination: 'West Coast DC',
        status: 'DELIVERED',
        eta: '2024-11-08T10:00:00Z',
        updatedAt: '2024-11-08T11:00:00Z',
        itemsCount: 1,
        progress: 100,
        events: [
            { label: 'Out for delivery', timestamp: '2024-11-08T07:00:00Z' },
            { label: 'Delivered', timestamp: '2024-11-08T11:00:00Z' }
        ]
    }
];

const ensureShipmentId = (id) => id || `SHP-${uuidv4().slice(0, 8).toUpperCase()}`;

const normalizeIncomingEvents = (events = []) =>
    events.map((e) => ({
        label: e.label,
        timestamp: e.timestamp || new Date()
    }));

const getShipments = asyncHandler(async (_req, res) => {
    const shipments = await Shipment.find().sort({ updatedAt: -1, createdAt: -1 });
    res.status(200).json({
        success: true,
        data: shipments
    });
});

const getShipmentAnalytics = asyncHandler(async (_req, res) => {
    const [totals] = await Shipment.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                inTransit: { $sum: { $cond: [{ $eq: ['$status', 'IN_TRANSIT'] }, 1, 0] } },
                delayed: { $sum: { $cond: [{ $eq: ['$status', 'DELAYED'] }, 1, 0] } },
                delivered: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            TOTAL: totals?.total || 0,
            IN_TRANSIT: totals?.inTransit || 0,
            DELAYED: totals?.delayed || 0,
            DELIVERED: totals?.delivered || 0
        }
    });
});

const createShipment = asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const shipmentId = ensureShipmentId(payload.shipmentId);

    const newShipment = await Shipment.create({
        shipmentId,
        poNumber: payload.poNumber,
        carrier: payload.carrier,
        mode: payload.mode || 'GROUND',
        origin: payload.origin,
        destination: payload.destination,
        status: payload.status || 'CREATED',
        eta: payload.eta,
        updatedAt: new Date(),
        itemsCount: payload.itemsCount || 0,
        progress: payload.progress || 0,
        events: normalizeIncomingEvents(payload.events)
    });

    res.status(201).json({
        success: true,
        message: 'Shipment created',
        data: newShipment
    });
});

const updateShipment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const update = {
        ...req.body,
        updatedAt: new Date()
    };

    if (update.events) {
        update.events = normalizeIncomingEvents(update.events);
    }

    const shipment = await Shipment.findOneAndUpdate(
        { shipmentId: id },
        { $set: update },
        { new: true }
    );

    if (!shipment) {
        throw ApiError.notFound('Shipment not found');
    }

    res.status(200).json({
        success: true,
        message: 'Shipment updated',
        data: shipment
    });
});

const deleteShipment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await Shipment.deleteOne({ shipmentId: id });

    if (result.deletedCount === 0) {
        throw ApiError.notFound('Shipment not found');
    }

    res.status(200).json({
        success: true,
        message: 'Shipment deleted'
    });
});

const seedShipments = asyncHandler(async (_req, res) => {
    const existing = await Shipment.find({}, { shipmentId: 1 });
    const existingIds = new Set(existing.map((s) => s.shipmentId));

    const toInsert = demoShipments
        .filter((s) => !existingIds.has(s.shipmentId))
        .map((s) => ({
            ...s,
            eta: s.eta ? new Date(s.eta) : undefined,
            updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
            events: normalizeIncomingEvents(s.events)
        }));

    if (toInsert.length) {
        await Shipment.insertMany(toInsert);
    }

    res.status(201).json({
        success: true,
        message: 'Sample shipments ready',
        data: { created: toInsert.length }
    });
});

module.exports = {
    getShipments,
    getShipmentAnalytics,
    createShipment,
    updateShipment,
    deleteShipment,
    seedShipments
};
