import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileInvoiceDollar,
    faIndustry,
    faWarehouse,
    faCalendarAlt,
    faStickyNote,
    faBoxes,
    faTrashAlt,
    faPen,
    faClipboardList,
    faDollarSign,
    faUserTie,
    faClock,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ModernCard from '../components/ModernCard';
import AnimatedButton from '../components/AnimatedButton';
import { useToast } from '../components/ToastContainer';
import { useCreatePurchaseOrder, useProducts, useSuppliers, useWarehouses } from '../api/hooks';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';

const defaultForm = {
    supplierId: '',
    warehouseId: '',
    expectedDate: '',
    priority: 'NORMAL',
    notes: '',
    shipping: 0,
    taxRate: 0.07
};

const priorityOptions = [
    { value: 'LOW', label: 'Low', className: 'bg-emerald-100 text-emerald-700' },
    { value: 'NORMAL', label: 'Normal', className: 'bg-blue-100 text-blue-700' },
    { value: 'HIGH', label: 'High', className: 'bg-rose-100 text-rose-700' }
];

const CreateOrder = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { data: suppliers = [], isLoading: suppliersLoading, error: suppliersError } = useSuppliers();
    const { data: warehouses = [], isLoading: warehousesLoading, error: warehousesError } = useWarehouses();
    const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
    const createPurchaseOrder = useCreatePurchaseOrder();

    const [form, setForm] = useState(defaultForm);
    const [items, setItems] = useState([]);
    const [itemDraft, setItemDraft] = useState({ productId: '', qty: 1, unitPrice: '' });
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        const err = suppliersError || warehousesError || productsError;
        if (err) {
            showToast(err.message || 'Unable to load reference data.', 'error', 4000);
        }
    }, [suppliersError, warehousesError, productsError, showToast]);

    const dirty = useMemo(() => {
        const base = { ...defaultForm, items: [] };
        return JSON.stringify({ ...form, items }) !== JSON.stringify({ ...base, items: [] });
    }, [form, items]);

    const errors = useMemo(() => {
        const e = {};
        if (!form.supplierId) e.supplierId = 'Supplier is required';
        if (!form.warehouseId) e.warehouseId = 'Destination warehouse is required';
        if (!form.expectedDate) e.expectedDate = 'Expected delivery date is required';
        if (!items.length) e.items = 'Add at least one item';
        return e;
    }, [form, items]);

    const subtotal = useMemo(
        () => items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0),
        [items]
    );
    const tax = useMemo(() => subtotal * (Number(form.taxRate) || 0), [subtotal, form.taxRate]);
    const shipping = Number(form.shipping) || 0;
    const total = useMemo(() => subtotal + tax + shipping, [subtotal, tax, shipping]);

    const costChartData = useMemo(
        () => items.map((it) => ({ name: it.sku || it.productName || it.productId, cost: (Number(it.qty) || 0) * (Number(it.unitPrice) || 0) })),
        [items]
    );

    useUnsavedChanges(dirty, 'You have unsaved changes on the purchase order.');

    const resetItemDraft = () => setItemDraft({ productId: '', qty: 1, unitPrice: '' });

    const handleAddOrUpdateItem = () => {
        if (!itemDraft.productId) return;
        const product = products.find((p) => p.id === itemDraft.productId) || {};
        const payload = {
            productId: itemDraft.productId,
            sku: product.sku || product.SKU || 'SKU',
            productName: product.name || product.PRODUCT_NAME || product.productName || 'Product',
            qty: Number(itemDraft.qty) || 0,
            unitPrice: Number(itemDraft.unitPrice ?? product.unitPrice ?? product.UNIT_PRICE ?? 0) || 0
        };
        if (editingIndex !== null) {
            setItems((prev) => prev.map((it, idx) => (idx === editingIndex ? payload : it)));
        } else {
            setItems((prev) => [...prev, payload]);
        }
        setEditingIndex(null);
        resetItemDraft();
    };

    const handleEditItem = (idx) => {
        const current = items[idx];
        setItemDraft({ productId: current.productId, qty: current.qty, unitPrice: current.unitPrice });
        setEditingIndex(idx);
    };

    const handleDeleteItem = (idx) => {
        setItems((prev) => prev.filter((_, i) => i !== idx));
        if (editingIndex === idx) {
            setEditingIndex(null);
            resetItemDraft();
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(errors).length) {
            showToast('Please fill all required fields and add at least one item.', 'error', 3000);
            return;
        }
        try {
            const supplier = suppliers.find((s) => s.id === form.supplierId);
            const warehouse = warehouses.find((w) => w.id === form.warehouseId);
            const payload = {
                supplierId: form.supplierId,
                supplierName: supplier?.name,
                warehouseId: form.warehouseId,
                warehouseName: warehouse?.name,
                city: warehouse?.city,
                expectedDate: form.expectedDate,
                priority: form.priority,
                notes: form.notes,
                items: items.map((it) => ({
                    productId: it.productId,
                    sku: it.sku,
                    productName: it.productName,
                    quantity: Number(it.qty) || 0,
                    unitPrice: Number(it.unitPrice) || 0
                })),
                shipping,
                taxRate: Number(form.taxRate) || 0,
                total
            };
            await createPurchaseOrder.mutateAsync(payload);
            showToast('Purchase order created successfully', 'success');
            navigate('/orders');
        } catch (err) {
            console.error('Failed to create order', err);
            const message = err?.response?.data?.message || err?.message || 'Unable to create purchase order.';
            showToast(message, 'error', 4000);
        }
    };

    const selectedSupplier = suppliers.find((s) => s.id === form.supplierId);

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                        <FontAwesomeIcon icon={faFileInvoiceDollar} />
                        <span>Purchase Orders / New</span>
                        {dirty && <span className="text-amber-600 text-xs">Unsaved changes</span>}
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Create Purchase Order</h1>
                    <p className="text-slate-600 text-sm lg:text-base">
                        Capture supplier, warehouse, items and expected delivery.
                    </p>
                </div>
                <div className="flex gap-2">
                    <AnimatedButton variant="outline" size="md" onClick={() => navigate('/orders')}>
                        Cancel
                    </AnimatedButton>
                    <AnimatedButton variant="primary" size="md" onClick={handleSubmit} loading={createPurchaseOrder.isPending} disabled={createPurchaseOrder.isPending}>
                        Save Order
                    </AnimatedButton>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 space-y-4">
                    <ModernCard className="p-6 shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-blue-500" />
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
                                <p className="text-sm text-slate-600">All fields required</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faIndustry} className="text-blue-500" /> Supplier
                                </label>
                                <select
                                    value={form.supplierId}
                                    onChange={(e) => setForm((prev) => ({ ...prev, supplierId: e.target.value }))}
                                    disabled={suppliersLoading}
                                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.supplierId ? 'border-rose-300' : 'border-slate-200'}`}
                                >
                                    <option value="">{suppliersLoading ? 'Loading suppliers...' : 'Select supplier'}</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name || 'Supplier'}
                                        </option>
                                    ))}
                                </select>
                                {errors.supplierId && <p className="text-xs text-rose-600 mt-1">{errors.supplierId}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faWarehouse} className="text-blue-500" /> Destination Warehouse
                                </label>
                                <select
                                    value={form.warehouseId}
                                    onChange={(e) => setForm((prev) => ({ ...prev, warehouseId: e.target.value }))}
                                    disabled={warehousesLoading}
                                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.warehouseId ? 'border-rose-300' : 'border-slate-200'}`}
                                >
                                    <option value="">{warehousesLoading ? 'Loading warehouses...' : 'Select warehouse'}</option>
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name || 'Warehouse'}
                                        </option>
                                    ))}
                                </select>
                                {errors.warehouseId && <p className="text-xs text-rose-600 mt-1">{errors.warehouseId}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500" /> Expected Delivery Date
                                </label>
                                <input
                                    type="date"
                                    value={form.expectedDate}
                                    onChange={(e) => setForm((prev) => ({ ...prev, expectedDate: e.target.value }))}
                                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.expectedDate ? 'border-rose-300' : 'border-slate-200'}`}
                                />
                                {errors.expectedDate && <p className="text-xs text-rose-600 mt-1">{errors.expectedDate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                >
                                    {priorityOptions.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                    Priority badge
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faStickyNote} className="text-blue-500" /> Notes / Instructions
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.notes}
                                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                    placeholder="Add handling instructions, packaging notes, or delivery windows."
                                />
                            </div>
                        </div>
                    </ModernCard>

                    <ModernCard className="p-6 shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faBoxes} className="text-orange-400" />
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Items to Purchase</h2>
                                    <p className="text-sm text-slate-600">Add SKUs and quantities.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddOrUpdateItem}
                                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                >
                                    {editingIndex !== null ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <select
                                value={itemDraft.productId}
                                onChange={(e) => {
                                    const selected = products.find((p) => p.id === e.target.value);
                                    setItemDraft((prev) => ({
                                        ...prev,
                                        productId: e.target.value,
                                        unitPrice: selected && typeof selected.unitPrice === 'number' ? selected.unitPrice : prev.unitPrice
                                    }));
                                }}
                                disabled={productsLoading}
                                className="rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">{productsLoading ? 'Loading products...' : 'Select product'}</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {(p.sku ? `${p.sku} - ` : '') + (p.name || 'Product')}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                value={itemDraft.qty}
                                onChange={(e) => setItemDraft((prev) => ({ ...prev, qty: e.target.value }))}
                                className="rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Qty"
                            />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={itemDraft.unitPrice}
                                onChange={(e) => setItemDraft((prev) => ({ ...prev, unitPrice: e.target.value }))}
                                className="rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Unit price"
                            />
                        </div>

                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">SKU</th>
                                        <th className="px-4 py-3">Product Name</th>
                                        <th className="px-4 py-3">Qty</th>
                                        <th className="px-4 py-3">Unit Price</th>
                                        <th className="px-4 py-3">Line Total</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-4 text-slate-500" colSpan={6}>
                                                No items added yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((it, idx) => (
                                            <tr key={`${it.productId}-${idx}`} className="border-t border-slate-100 hover:bg-slate-50/60">
                                                <td className="px-4 py-3 font-semibold text-slate-900">{it.sku}</td>
                                                <td className="px-4 py-3 text-slate-700">{it.productName}</td>
                                                <td className="px-4 py-3 text-slate-700">{it.qty}</td>
                                                <td className="px-4 py-3 text-slate-700">LKR {Number(it.unitPrice).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-slate-900 font-bold">LKR {(Number(it.qty) * Number(it.unitPrice)).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                                                    <button className="text-teal-600 hover:text-teal-700" onClick={() => handleEditItem(idx)}>
                                                        <FontAwesomeIcon icon={faPen} />
                                                    </button>
                                                    <button className="text-red-500 hover:text-red-600" onClick={() => handleDeleteItem(idx)}>
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {errors.items && <p className="text-xs text-rose-600">{errors.items}</p>}
                    </ModernCard>
                </div>

                <div className="space-y-4">
                    <ModernCard className="p-6 shadow-md space-y-3">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClipboardList} className="text-purple-500" />
                            <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>
                        </div>
                        <div className="space-y-2 text-sm text-slate-700">
                            <div className="flex items-center justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold">LKR {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Tax ({(Number(form.taxRate) * 100).toFixed(1)}%)</span>
                                <span className="font-semibold">LKR {tax.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span>Shipping</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.shipping}
                                    onChange={(e) => setForm((prev) => ({ ...prev, shipping: Number(e.target.value) }))}
                                    className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                                <span>Total</span>
                                <span>LKR {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </ModernCard>

                    <ModernCard className="p-6 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faDollarSign} className="text-emerald-500" />
                                <h3 className="text-md font-bold text-slate-900">Cost by Item</h3>
                            </div>
                            <span className="text-xs text-slate-500">Live preview</span>
                        </div>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={costChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="cost" fill="#6366F1" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ModernCard>

                    <ModernCard className="p-6 shadow-md space-y-3">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUserTie} className="text-blue-500" />
                            <h3 className="text-md font-bold text-slate-900">Supplier Snapshot</h3>
                        </div>
                        <div className="text-sm text-slate-700 space-y-1">
                            <div className="flex items-center justify-between">
                                <span>Name</span>
                                <span className="font-semibold">{selectedSupplier?.name || 'Select a supplier'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Last PO date</span>
                                <span className="font-semibold">{selectedSupplier ? '2024-11-08' : '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Total POs</span>
                                <span className="font-semibold">{selectedSupplier ? '14' : '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1"><FontAwesomeIcon icon={faClock} className="text-amber-500" /> On-time %</span>
                                <span className="font-semibold">{selectedSupplier ? '93%' : '—'}</span>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <FontAwesomeIcon icon={faCheckCircle} /> Preferred supplier
                        </div>
                    </ModernCard>
                </div>
            </div>
        </div>
    );
};

export default CreateOrder;
