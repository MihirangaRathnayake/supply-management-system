const { mongoose } = require('../config/database');

const ItemSchema = new mongoose.Schema(
    {
        SKU: String,
        PRODUCT_NAME: String,
        QUANTITY_ORDERED: { type: Number, default: 0 },
        QUANTITY_RECEIVED: { type: Number, default: 0 },
        UNIT_PRICE: { type: Number, default: 0 }
    },
    { _id: false }
);

const PurchaseOrderSchema = new mongoose.Schema(
    {
        PO_ID: { type: String, unique: true, index: true },
        PO_NUMBER: { type: String, unique: true, index: true },
        SUPPLIER_ID: String,
        SUPPLIER_NAME: String,
        WAREHOUSE_ID: String,
        WAREHOUSE_NAME: String,
        CITY: String,
        STATUS: { type: String, default: 'DRAFT' },
        PRIORITY: { type: String, default: 'NORMAL' },
        ORDER_DATE: Date,
        EXPECTED_DATE: Date,
        TOTAL_VALUE: { type: Number, default: 0 },
        NOTES: String,
        items: { type: [ItemSchema], default: [] }
    },
    { timestamps: true }
);

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
