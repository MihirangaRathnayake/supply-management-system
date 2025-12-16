export interface Supplier {
  id: string;
  code?: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitPrice?: number;
  costPrice?: number;
  minStockLevel?: number;
  status?: string;
}

export interface Warehouse {
  id: string;
  code?: string;
  name: string;
  city?: string;
  country?: string;
  type?: string;
}

export interface PurchaseOrderItemInput {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderCreateInput {
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  city?: string;
  expectedDate: string;
  priority?: string;
  notes?: string;
  items: PurchaseOrderItemInput[];
  shipping?: number;
  taxRate?: number;
  total?: number;
}

export interface Shipment {
  id: string;
  status: string;
  warehouse?: string;
  items?: unknown[];
  createdAt?: string;
}

export interface LowStockAlert {
  id: string;
  sku: string;
  productName: string;
  stockLevel: number;
  reorderLevel: number;
}

export type InventoryStatus = 'OK' | 'LOW' | 'CRITICAL';

export interface InventoryItem {
  inventoryId: string;
  productId: string;
  warehouseId: string;
  sku: string;
  productName: string;
  warehouseName?: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
  reorderPoint: number;
  unitPrice: number;
  status: InventoryStatus;
  updatedAt?: string;
}

export interface InventorySummary {
  totalSkus: number;
  lowStock: number;
  critical: number;
  reserved: number;
  stockValue: number;
}

export interface InventoryMovement {
  id?: string;
  inventoryId?: string;
  productId?: string;
  warehouseId?: string;
  type?: string;
  qtyChange?: number;
  previousQty?: number;
  newQty?: number;
  reason?: string;
  note?: string;
  referenceType?: string;
  referenceId?: string;
  createdAt?: string;
  user?: unknown;
  metadata?: Record<string, unknown>;
}

export const normalizeSupplier = (row: any): Supplier => {
  const id =
    row?.SUPPLIER_ID ||
    row?.supplier_id ||
    row?.supplierId ||
    row?.id ||
    row?.SUPPLIER_CODE ||
    row?.supplierCode;

  return {
    id: String(id || ''),
    code: row?.SUPPLIER_CODE || row?.supplierCode || row?.code,
    name: row?.SUPPLIER_NAME || row?.supplier_name || row?.supplierName || row?.name || 'Unnamed supplier',
    contactPerson: row?.CONTACT_PERSON || row?.contact_person || row?.contactPerson,
    email: row?.EMAIL || row?.email,
    phone: row?.PHONE || row?.phone,
    city: row?.CITY || row?.city,
    country: row?.COUNTRY || row?.country
  };
};

export const normalizeInventoryItem = (row: any): InventoryItem => {
  const qtyOnHand = Number(row?.qtyOnHand ?? row?.QUANTITY_ON_HAND ?? row?.quantity_on_hand ?? 0);
  const qtyReserved = Number(row?.qtyReserved ?? row?.QUANTITY_RESERVED ?? row?.quantity_reserved ?? 0);
  const reorderPoint = Number(row?.reorderPoint ?? row?.REORDER_POINT ?? row?.reorder_point ?? 0);
  return {
    inventoryId: String(row?.inventoryId || row?.INVENTORY_ID || row?.id || ''),
    productId: String(row?.productId || row?.PRODUCT_ID || ''),
    warehouseId: String(row?.warehouseId || row?.WAREHOUSE_ID || ''),
    sku: row?.sku || row?.SKU || 'SKU',
    productName: row?.productName || row?.PRODUCT_NAME || 'Product',
    warehouseName: row?.warehouseName || row?.WAREHOUSE_NAME,
    qtyOnHand,
    qtyReserved,
    qtyAvailable: Number(row?.qtyAvailable ?? qtyOnHand - qtyReserved),
    reorderPoint,
    unitPrice: Number(row?.unitPrice ?? row?.UNIT_PRICE ?? row?.unit_price ?? 0),
    status: (row?.status || row?.STATUS || 'OK') as InventoryStatus,
    updatedAt: row?.updatedAt || row?.UPDATED_AT
  };
};

export const normalizeInventoryMovement = (row: any): InventoryMovement => ({
  id: row?._id || row?.id || String(row?.inventoryId || ''),
  inventoryId: row?.inventoryId,
  productId: row?.productId,
  warehouseId: row?.warehouseId,
  type: row?.type,
  qtyChange: Number(row?.qtyChange ?? 0),
  previousQty: Number(row?.previousQty ?? 0),
  newQty: Number(row?.newQty ?? 0),
  reason: row?.reason,
  note: row?.note,
  referenceType: row?.referenceType,
  referenceId: row?.referenceId,
  createdAt: row?.createdAt,
  user: row?.user,
  metadata: row?.metadata
});

export const normalizeProduct = (row: any): Product => {
  const id = row?.PRODUCT_ID || row?.product_id || row?.productId || row?.id || row?.SKU || row?.sku;

  return {
    id: String(id || ''),
    sku: row?.SKU || row?.sku || 'SKU',
    name: row?.PRODUCT_NAME || row?.product_name || row?.productName || row?.name || 'Product',
    description: row?.DESCRIPTION || row?.description,
    unitPrice: Number(row?.UNIT_PRICE ?? row?.unitPrice ?? row?.unit_price ?? 0),
    costPrice: Number(row?.COST_PRICE ?? row?.costPrice ?? row?.cost_price ?? 0),
    minStockLevel: Number(row?.MIN_STOCK_LEVEL ?? row?.minStockLevel ?? row?.min_stock_level ?? 0),
    status: row?.STATUS || row?.status
  };
};

export const normalizeWarehouse = (row: any): Warehouse => {
  const id = row?.WAREHOUSE_ID || row?.warehouse_id || row?.warehouseId || row?.id || row?.WAREHOUSE_CODE || row?.warehouseCode;

  return {
    id: String(id || ''),
    code: row?.WAREHOUSE_CODE || row?.warehouseCode || row?.code,
    name: row?.WAREHOUSE_NAME || row?.warehouse_name || row?.warehouseName || row?.name || 'Warehouse',
    city: row?.CITY || row?.city,
    country: row?.COUNTRY || row?.country,
    type: row?.WAREHOUSE_TYPE || row?.warehouseType || row?.type
  };
};
