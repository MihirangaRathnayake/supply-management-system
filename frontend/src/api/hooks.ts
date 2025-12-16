import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './client';
import {
  Supplier,
  Product,
  Warehouse,
  PurchaseOrderCreateInput,
  Shipment,
  LowStockAlert,
  InventoryItem,
  InventorySummary,
  InventoryMovement,
  normalizeSupplier,
  normalizeProduct,
  normalizeWarehouse,
  normalizeInventoryItem,
  normalizeInventoryMovement
} from './types';

export const queryKeys = {
  suppliers: ['suppliers'] as const,
  products: ['products'] as const,
  warehouses: ['warehouses'] as const,
  purchaseOrders: ['purchase-orders'] as const,
  inventory: ['inventory'] as const,
  inventorySummary: ['inventory-summary'] as const,
  shipments: ['shipments'] as const,
  lowStockAlerts: ['low-stock-alerts'] as const
};

const extractData = <T>(res: any, fallback: T) => (res?.data?.data ?? res?.data ?? fallback) as T;

const fetchSuppliers = async (): Promise<Supplier[]> => {
  const res = await api.get('/api/suppliers');
  const list = extractData<any[]>(res, []);
  return list.map((row) => normalizeSupplier(row));
};

const fetchProducts = async (): Promise<Product[]> => {
  const res = await api.get('/api/products');
  const list = extractData<any[]>(res, []);
  return list.map((row) => normalizeProduct(row));
};

const fetchWarehouses = async (): Promise<Warehouse[]> => {
  const res = await api.get('/api/warehouses');
  const list = extractData<any[]>(res, []);
  return list.map((row) => normalizeWarehouse(row));
};

const fetchShipments = async (): Promise<Shipment[]> => {
  const res = await api.get('/api/shipments');
  const list = extractData<any[]>(res, []);
  return list.map((row) => ({
    id: row?.SHIPMENT_ID || row?._id || row?.id || '',
    status: row?.STATUS || row?.status || '',
    warehouse: row?.WAREHOUSE || row?.warehouse,
    items: row?.ITEMS || row?.items,
    createdAt: row?.createdAt || row?.CREATED_AT
  }));
};

const fetchLowStockAlerts = async (): Promise<LowStockAlert[]> => {
  const res = await api.get('/api/low-stock-alerts');
  const list = extractData<any[]>(res, []);
  return list.map((row) => ({
    id: row?._id || row?.id || `${row?.sku || 'alert'}`,
    sku: row?.sku || row?.SKU || '',
    productName: row?.productName || row?.PRODUCT_NAME || '',
    stockLevel: Number(row?.stockLevel ?? row?.stock_level ?? 0),
    reorderLevel: Number(row?.reorderLevel ?? row?.reorder_level ?? 0)
  }));
};

export const useSuppliers = () => useQuery({ queryKey: queryKeys.suppliers, queryFn: fetchSuppliers });
export const useProducts = () => useQuery({ queryKey: queryKeys.products, queryFn: fetchProducts });
export const useWarehouses = () => useQuery({ queryKey: queryKeys.warehouses, queryFn: fetchWarehouses });
export const useShipments = () => useQuery({ queryKey: queryKeys.shipments, queryFn: fetchShipments });
export const useLowStockAlerts = () => useQuery({ queryKey: queryKeys.lowStockAlerts, queryFn: fetchLowStockAlerts });

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Supplier>) => {
      const res = await api.post('/api/suppliers', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    }
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Supplier> & { id: string }) => {
      const res = await api.put(`/api/suppliers/${id}`, payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    }
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/suppliers/${id}`);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    }
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const res = await api.post('/api/products', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Product> & { id: string }) => {
      const res = await api.put(`/api/products/${id}`, payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/products/${id}`);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    }
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PurchaseOrderCreateInput) => {
      const res = await api.post('/api/purchase-orders', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
    }
  });
};

export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.put(`/api/purchase-orders/${id}`, { status });
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
    }
  });
};

export const useAdjustInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await api.post('/api/inventory/adjust', { productId, quantity });
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.lowStockAlerts });
    }
  });
};

export const useCreateShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Shipment>) => {
      const res = await api.post('/api/shipments', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments });
    }
  });
};

export const useUpdateShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Shipment> & { id: string }) => {
      const res = await api.put(`/api/shipments/${id}`, payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments });
    }
  });
};

export const useDeleteShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/shipments/${id}`);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments });
    }
  });
};

export const useCreateLowStockAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<LowStockAlert>) => {
      const res = await api.post('/api/low-stock-alerts', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lowStockAlerts });
    }
  });
};

// -------------------------
// Inventory (enhanced)
// -------------------------

type InventoryFilters = {
  q?: string;
  warehouseId?: string;
  status?: string;
  page?: number;
  limit?: number;
};

type InventoryListResponse = {
  rows: InventoryItem[];
  total: number;
  page: number;
  limit: number;
};

const fetchInventoryList = async (filters: InventoryFilters): Promise<InventoryListResponse> => {
  const res = await api.get('/api/inventory', { params: filters });
  const payload: any = res?.data?.data ?? res?.data ?? {};
  const rowsRaw = payload.rows || payload.data || [];
  return {
    rows: Array.isArray(rowsRaw) ? rowsRaw.map((r: any) => normalizeInventoryItem(r)) : [],
    total: Number(payload.total ?? 0),
    page: Number(payload.page ?? filters.page ?? 1),
    limit: Number(payload.limit ?? filters.limit ?? 20)
  };
};

const fetchInventorySummary = async (): Promise<InventorySummary> => {
  const res = await api.get('/api/inventory/summary');
  const payload: any = res?.data?.data ?? res?.data ?? {};
  return {
    totalSkus: Number(payload.totalSkus ?? 0),
    lowStock: Number(payload.lowStock ?? 0),
    critical: Number(payload.critical ?? 0),
    reserved: Number(payload.reserved ?? 0),
    stockValue: Number(payload.stockValue ?? 0)
  };
};

const fetchInventoryHistory = async (productId?: string, warehouseId?: string): Promise<InventoryMovement[]> => {
  if (!productId || !warehouseId) return [];
  const res = await api.get(`/api/inventory/${productId}/${warehouseId}/history`);
  const list = extractData<any[]>(res, []);
  return list.map((m) => normalizeInventoryMovement(m));
};

export const useInventoryList = (filters: InventoryFilters) =>
  useQuery({
    queryKey: [...queryKeys.inventory, filters],
    queryFn: () => fetchInventoryList(filters),
    keepPreviousData: true
  });

export const useInventorySummary = () =>
  useQuery({
    queryKey: queryKeys.inventorySummary,
    queryFn: fetchInventorySummary
  });

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: string; warehouseId: string; qtyChange: number; reason?: string; note?: string }) => {
      const res = await api.post('/api/inventory/adjust', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventorySummary });
    }
  });
};

export const useReserveStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: string; warehouseId: string; qty: number; referenceType?: string; referenceId?: string }) => {
      const res = await api.post('/api/inventory/reserve', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventorySummary });
    }
  });
};

export const useReleaseStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: string; warehouseId: string; qty: number; referenceType?: string; referenceId?: string }) => {
      const res = await api.post('/api/inventory/release', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventorySummary });
    }
  });
};

export const useTransferStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: string; fromWarehouseId: string; toWarehouseId: string; qty: number; note?: string }) => {
      const res = await api.post('/api/inventory/transfer', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventorySummary });
    }
  });
};

export const useUpdateReorderLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: string; warehouseId: string; reorderLevel: number }) => {
      const res = await api.put('/api/inventory/reorder-level', payload);
      return extractData(res, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventorySummary });
    }
  });
};

export const useInventoryHistory = (productId?: string, warehouseId?: string) =>
  useQuery({
    queryKey: [...queryKeys.inventory, 'history', productId, warehouseId],
    queryFn: () => fetchInventoryHistory(productId, warehouseId),
    enabled: Boolean(productId && warehouseId)
  });
