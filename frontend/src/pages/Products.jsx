import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBoxOpen,
    faBolt,
    faPlus,
    faSync,
    faSearch,
    faTag,
    faDollarSign,
    faArrowTrendUp,
    faGauge,
    faCircleCheck,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
    productName: '',
    sku: '',
    description: '',
    unitPrice: '',
    costPrice: '',
    minStockLevel: ''
};

const normalizeProduct = (row = {}) => {
    const id =
        row.PRODUCT_ID ||
        row.product_id ||
        row.productId ||
        row.id ||
        row.SKU ||
        row.sku;

    const unitPrice = Number(row.UNIT_PRICE ?? row.unit_price ?? row.unitPrice ?? 0);
    const costPrice = Number(row.COST_PRICE ?? row.cost_price ?? row.costPrice ?? 0);
    const margin = unitPrice - costPrice;
    const marginPct = unitPrice ? ((unitPrice - costPrice) / unitPrice) * 100 : 0;

    return {
        id,
        sku: row.SKU || row.sku || 'N/A',
        name: row.PRODUCT_NAME || row.product_name || row.productName || 'Unnamed product',
        description: row.DESCRIPTION || row.description || '',
        unitPrice,
        costPrice,
        minStockLevel: Number(row.MIN_STOCK_LEVEL ?? row.min_stock_level ?? row.minStockLevel ?? 0),
        status: row.STATUS || row.status || 'ACTIVE',
        margin,
        marginPct
    };
};

const StatCard = ({ label, value, icon, color }) => (
    <div className={`rounded-xl p-4 shadow-sm ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <FontAwesomeIcon icon={icon} />
            </div>
        </div>
    </div>
);

const Products = () => {
    const { showToast } = useToast();
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('table'); // table | cards
    const [sortDir, setSortDir] = useState('desc'); // asc | desc
    const [highlightMargin, setHighlightMargin] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const canManage = ['ADMIN', 'MANAGER'].includes(user?.role);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/products');
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setProducts(list.map(normalizeProduct));
        } catch (err) {
            console.error('Failed to load products', err);
            setError(err.response?.data?.message || 'Unable to load products.');
            showToast('Unable to load products', 'error', 4000);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = products.length;
        const avgPrice = total ? products.reduce((sum, p) => sum + (p.unitPrice || 0), 0) / total : 0;
        const avgMargin = total ? products.reduce((sum, p) => sum + (p.margin || 0), 0) / total : 0;
        const strongMargin = products.filter((p) => p.marginPct >= 20).length;
        return { total, avgPrice, avgMargin, strongMargin };
    }, [products]);

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        let list = [...products];

        if (term) {
            list = list.filter((p) =>
                [p.name, p.sku, p.description].filter(Boolean).some((v) => v.toLowerCase().includes(term))
            );
        }

        if (highlightMargin) {
            list = list.filter((p) => p.marginPct > 0);
        }

        list.sort((a, b) => {
            const val = (a.unitPrice || 0) - (b.unitPrice || 0);
            return sortDir === 'asc' ? val : -val;
        });

        return list;
    }, [products, search, highlightMargin, sortDir]);

    const openDrawer = () => {
        setForm(emptyForm);
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setForm(emptyForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canManage) {
            showToast('Only admin or manager can create products.', 'error', 4000);
            return;
        }
        setSaving(true);
        const payload = {
            productName: form.productName.trim(),
            sku: form.sku.trim(),
            description: form.description.trim(),
            unitPrice: Number(form.unitPrice) || 0,
            costPrice: Number(form.costPrice) || 0,
            minStockLevel: Number(form.minStockLevel) || 0
        };
        try {
            await axios.post('/api/products', payload);
            showToast('Product created', 'success');
            closeDrawer();
            await fetchProducts();
        } catch (err) {
            console.error('Failed to create product', err);
            const msg = err.response?.data?.message || 'Unable to create product.';
            setError(msg);
            showToast(msg, 'error', 4000);
        } finally {
            setSaving(false);
        }
    };

    const segmentedControl = (
        <div className="bg-slate-100 rounded-full p-1 inline-flex shadow-inner border border-slate-200">
            {['table', 'cards'].map((mode) => (
                <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                        viewMode === mode
                            ? 'bg-white shadow-sm text-primary-700'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {mode === 'table' ? 'Table view' : 'Cards view'}
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white rounded-2xl p-6 shadow-lg border border-primary-200/40 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] font-semibold text-white/70">Product Catalog</p>
                        <div className="flex items-end gap-2">
                            <h1 className="text-3xl font-bold">Products</h1>
                            <span className="text-sm text-white/80">Oracle-backed, with quick add and filters.</span>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        {segmentedControl}
                        <button
                            onClick={fetchProducts}
                            className="px-3 py-2 bg-white/15 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faSync} />
                            Refresh
                        </button>
                        <button
                            onClick={openDrawer}
                            disabled={!canManage}
                            className="px-4 py-2 bg-white text-primary-700 rounded-lg font-semibold shadow-md hover:bg-slate-50 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            title={canManage ? '' : 'Only admin or manager can create products'}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            New product
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Products',
                        value: stats.total,
                        icon: faBoxOpen,
                        color: 'bg-white border border-slate-200',
                        iconColor: 'bg-indigo-50 text-indigo-600'
                    },
                    {
                        label: 'Avg unit price',
                        value: stats.avgPrice ? `LKR ${stats.avgPrice.toFixed(2)}` : 'LKR 0.00',
                        icon: faDollarSign,
                        color: 'bg-white border border-slate-200',
                        iconColor: 'bg-emerald-50 text-emerald-600'
                    },
                    {
                        label: 'Avg margin',
                        value: stats.avgMargin ? `LKR ${stats.avgMargin.toFixed(2)}` : 'LKR 0.00',
                        icon: faArrowTrendUp,
                        color: 'bg-white border border-slate-200',
                        iconColor: 'bg-amber-50 text-amber-600'
                    },
                    {
                        label: 'Healthy margins',
                        value: stats.strongMargin,
                        icon: faGauge,
                        color: 'bg-white border border-slate-200',
                        iconColor: 'bg-sky-50 text-sky-600'
                    }
                ].map((stat) => (
                    <div key={stat.label} className={`rounded-xl p-4 shadow-sm ${stat.color}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconColor}`}>
                                <FontAwesomeIcon icon={stat.icon} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card border border-slate-200 shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-1">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name, SKU, description..."
                                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => setHighlightMargin((v) => !v)}
                                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                                    highlightMargin
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <FontAwesomeIcon icon={faCircleCheck} className="mr-2" />
                                Positive margin
                            </button>
                            <button
                                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50"
                            >
                                <FontAwesomeIcon icon={faTag} className="mr-2" />
                                Price {sortDir === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        {error}
                    </div>
                )}

                {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3">Unit price</th>
                                    <th className="px-4 py-3">Cost</th>
                                    <th className="px-4 py-3">Margin</th>
                                    <th className="px-4 py-3">Min stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(4)].map((_, idx) => (
                                        <tr key={idx} className="border-b border-slate-100">
                                            <td className="px-4 py-4" colSpan={6}>
                                                <div className="animate-pulse h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                                                <div className="animate-pulse h-3 bg-slate-100 rounded w-1/3"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredProducts.length ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id || product.sku} className="border-b border-slate-100 hover:bg-slate-50/60">
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{product.name}</span>
                                                    <span className="text-xs text-slate-500 line-clamp-1">{product.description || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-700">{product.sku}</td>
                                            <td className="px-4 py-4 text-slate-700">LKR {(product.unitPrice || 0).toFixed(2)}</td>
                                            <td className="px-4 py-4 text-slate-700">LKR {(product.costPrice || 0).toFixed(2)}</td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        product.margin > 0
                                                            ? 'bg-green-100 text-green-700'
                                                            : product.margin === 0
                                                                ? 'bg-slate-100 text-slate-700'
                                                                : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    ${product.margin.toFixed(2)} ({product.marginPct.toFixed(1)}%)
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-700">{product.minStockLevel}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                                            No products found. Try searching or add a new product.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading
                            ? [...Array(3)].map((_, idx) => (
                                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm animate-pulse">
                                      <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                                      <div className="h-3 bg-slate-100 rounded w-1/3 mb-4"></div>
                                      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                                  </div>
                              ))
                            : filteredProducts.map((product) => (
                                  <div
                                      key={product.id || product.sku}
                                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                                  >
                                      <div className="flex items-start justify-between">
                                          <div>
                                              <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">SKU {product.sku}</p>
                                              <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                                          </div>
                                          <span
                                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                  product.margin > 0
                                                      ? 'bg-green-100 text-green-700'
                                                      : product.margin === 0
                                                          ? 'bg-slate-100 text-slate-700'
                                                          : 'bg-red-100 text-red-700'
                                              }`}
                                          >
                                              {product.marginPct.toFixed(1)}%
                                          </span>
                                      </div>
                                      <p className="text-sm text-slate-600 line-clamp-2">{product.description || 'No description.'}</p>
                                      <div className="grid grid-cols-3 gap-2 text-sm">
                                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                                  <FontAwesomeIcon icon={faDollarSign} /> Price
                                              </p>
                                              <p className="font-semibold text-slate-900">LKR {(product.unitPrice || 0).toFixed(2)}</p>
                                          </div>
                                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                                  <FontAwesomeIcon icon={faBolt} /> Cost
                                              </p>
                                              <p className="font-semibold text-slate-900">LKR {(product.costPrice || 0).toFixed(2)}</p>
                                          </div>
                                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                                  <FontAwesomeIcon icon={faGauge} /> Min stock
                                              </p>
                                              <p className="font-semibold text-slate-900">{product.minStockLevel}</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                        {!loading && filteredProducts.length === 0 && (
                            <div className="col-span-full text-center text-slate-500 py-6">
                                No products found. Try searching or add a new product.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 rounded-2xl animate-scale-in">
                        <div className="flex items-start justify-between mb-4 sticky top-0 bg-white/90 backdrop-blur z-10 pb-3 border-b border-slate-100">
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-primary-600 font-semibold">Create product</p>
                                <h2 className="text-2xl font-bold text-slate-900 mt-1">New product</h2>
                                <p className="text-sm text-slate-500">Add item to the Oracle-backed catalog.</p>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="text-slate-500 hover:text-slate-800 px-3 py-1 rounded-lg border border-slate-200"
                            >
                                Close
                            </button>
                        </div>

                        {!canManage && (
                            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-center gap-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                Only admin or manager can create products. Switch account to proceed.
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Product name</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faBoxOpen} className="text-primary-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={form.productName}
                                        onChange={(e) => setForm({ ...form, productName: e.target.value })}
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="e.g. Industrial Motor X200"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">SKU</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faTag} className="text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.sku}
                                            onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                            required
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="SKU-001"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Min stock level</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faGauge} className="text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.minStockLevel}
                                            onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Unit price</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faDollarSign} className="text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.unitPrice}
                                            onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                                            required
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Cost price</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faArrowTrendUp} className="text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.costPrice}
                                            onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faBolt} className="text-primary-500 absolute left-3 top-3" />
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="What is this product used for?"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !canManage}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Create product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
