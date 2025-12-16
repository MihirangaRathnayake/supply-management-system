import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBoxes,
    faCube,
    faWarehouse,
    faTriangleExclamation,
    faTruck,
    faClipboardList,
    faChartLine,
    faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';
import ModernCard from '../components/ModernCard';
import SearchBar from '../components/SearchBar';
import AnimatedButton from '../components/AnimatedButton';

// Lightweight query helper to mimic react-query behaviour without adding a dependency
const useFetchQuery = (key, fetcher, options = {}) => {
    const [data, setData] = useState(options.initialData ?? null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetcher();
            setData(res);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { data, isLoading, error, refetch };
};

const KPI_CARD_CONFIG = [
    { key: 'totalSuppliers', label: 'Total Suppliers', icon: faClipboardList, color: 'from-sky-500 to-blue-500' },
    { key: 'totalProducts', label: 'Total Products', icon: faBoxes, color: 'from-indigo-500 to-purple-500' },
    { key: 'totalWarehouses', label: 'Total Warehouses', icon: faWarehouse, color: 'from-emerald-500 to-teal-500' },
    { key: 'lowStockCount', label: 'Low Stock Items', icon: faTriangleExclamation, color: 'from-amber-500 to-orange-500' },
    { key: 'openPoCount', label: 'Open Purchase Orders', icon: faClipboardList, color: 'from-pink-500 to-rose-500' },
    { key: 'inTransitShipments', label: 'In-Transit Shipments', icon: faTruck, color: 'from-cyan-500 to-blue-500' }
];

const STATUS_COLORS = ['#6366F1', '#22C55E', '#F97316', '#06B6D4', '#A855F7', '#0EA5E9'];

const Analytics = () => {
    const overviewQuery = useFetchQuery('overview', async () => {
        const res = await axios.get('/api/analytics/overview');
        return res.data?.data || res.data;
    });

    const poStatusQuery = useFetchQuery('po-status', async () => {
        const res = await axios.get('/api/analytics/po-status');
        return res.data?.data || res.data || [];
    }, { initialData: [] });

    const inventoryByWhQuery = useFetchQuery('inventory-by-wh', async () => {
        const res = await axios.get('/api/analytics/inventory-by-warehouse');
        return res.data?.data || res.data || [];
    }, { initialData: [] });

    const timelineQuery = useFetchQuery('shipments-timeline', async () => {
        const res = await axios.get('/api/analytics/shipments-timeline');
        return res.data?.data || res.data || [];
    }, { initialData: [] });

    const lowStockQuery = useFetchQuery('low-stock', async () => {
        const res = await axios.get('/api/analytics/low-stock-products');
        return res.data?.data || res.data || [];
    }, { initialData: [] });

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const filteredLowStock = useMemo(() => {
        const term = search.trim().toLowerCase();
        const list = lowStockQuery.data || [];
        if (!term) return list;
        return list.filter((item) =>
            [item.sku, item.name, item.warehouseName].filter(Boolean).some((v) => v.toLowerCase().includes(term))
        );
    }, [search, lowStockQuery.data]);

    const totalPages = Math.max(1, Math.ceil((filteredLowStock.length || 0) / pageSize));
    const pagedRows = filteredLowStock.slice((page - 1) * pageSize, page * pageSize);

    const renderStatusBadge = (row) => {
        const critical = row.qtyOnHand <= 0 || row.qtyOnHand <= row.reorderLevel * 0.4;
        const warning = !critical && row.qtyOnHand <= row.reorderLevel;
        const ok = !critical && !warning;
        const style = critical
            ? 'bg-rose-100 text-rose-700'
            : warning
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700';
        const label = critical ? 'Critical' : warning ? 'Warning' : 'OK';
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>{label}</span>;
    };

    const loadingAny =
        overviewQuery.isLoading ||
        poStatusQuery.isLoading ||
        inventoryByWhQuery.isLoading ||
        timelineQuery.isLoading ||
        lowStockQuery.isLoading;

    const errorAny = overviewQuery.error || poStatusQuery.error || inventoryByWhQuery.error || timelineQuery.error || lowStockQuery.error;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-50 via-sky-50 to-emerald-50 border border-slate-200/70 rounded-2xl p-5 shadow-md">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">Analytics & Reports</p>
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Operations pulse across supply network</h1>
                        <p className="text-sm text-slate-600">Real-time signals across suppliers, inventory, purchase orders, and shipments.</p>
                    </div>
                    <div className="flex gap-2">
                        <AnimatedButton icon={faChartLine} variant="outline" size="sm" onClick={() => {
                            overviewQuery.refetch();
                            poStatusQuery.refetch();
                            inventoryByWhQuery.refetch();
                            timelineQuery.refetch();
                            lowStockQuery.refetch();
                        }}>
                            Refresh
                        </AnimatedButton>
                    </div>
                </div>
            </div>

            {errorAny && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
                    Unable to load analytics right now. We’ll keep trying—please refresh.
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {KPI_CARD_CONFIG.map((card) => {
                    const value = overviewQuery.data ? overviewQuery.data[card.key] ?? 0 : 0;
                    return (
                        <div key={card.key} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-lg`}>
                                <FontAwesomeIcon icon={card.icon} />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">{card.label}</p>
                                <p className="text-2xl font-black text-slate-900">{loadingAny ? '—' : value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ModernCard className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <FontAwesomeIcon icon={faClipboardList} />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">Purchase Orders</p>
                                <h3 className="text-lg font-bold text-slate-900">Status distribution</h3>
                            </div>
                        </div>
                    </div>
                    <div className="h-72">
                        {poStatusQuery.isLoading ? (
                            <div className="animate-pulse bg-slate-100 rounded-xl h-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={poStatusQuery.data || []} dataKey="count" nameKey="status" innerRadius={60} outerRadius={100} paddingAngle={3}>
                                        {(poStatusQuery.data || []).map((entry, index) => (
                                            <Cell key={`cell-${entry.status}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ModernCard>

                <ModernCard className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <FontAwesomeIcon icon={faWarehouse} />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">Inventory</p>
                                <h3 className="text-lg font-bold text-slate-900">By warehouse</h3>
                            </div>
                        </div>
                    </div>
                    <div className="h-72">
                        {inventoryByWhQuery.isLoading ? (
                            <div className="animate-pulse bg-slate-100 rounded-xl h-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inventoryByWhQuery.data || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="warehouseName" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="totalQty" fill="#6366F1" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ModernCard>
            </div>

            <ModernCard className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                            <FontAwesomeIcon icon={faTruck} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">Shipments</p>
                            <h3 className="text-lg font-bold text-slate-900">Timeline</h3>
                        </div>
                    </div>
                </div>
                <div className="h-80">
                    {timelineQuery.isLoading ? (
                        <div className="animate-pulse bg-slate-100 rounded-xl h-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timelineQuery.data || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="created" stroke="#6366F1" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="inTransit" stroke="#F59E0B" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </ModernCard>

            <ModernCard className="p-4 lg:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">Inventory health</p>
                            <h3 className="text-lg font-bold text-slate-900">Low Stock Products</h3>
                        </div>
                    </div>
                    <div className="flex-1 md:max-w-md">
                        <div className="relative">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search SKU, product, or warehouse"
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">SKU</th>
                                <th className="px-4 py-3">Product Name</th>
                                <th className="px-4 py-3">Warehouse</th>
                                <th className="px-4 py-3">Qty On Hand</th>
                                <th className="px-4 py-3">Reorder Level</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockQuery.isLoading ? (
                                [...Array(5)].map((_, idx) => (
                                    <tr key={idx} className="border-b border-slate-100">
                                        <td className="px-4 py-4" colSpan={6}>
                                            <div className="animate-pulse h-4 bg-slate-200 rounded w-1/3 mb-2" />
                                            <div className="animate-pulse h-3 bg-slate-100 rounded w-1/4" />
                                        </td>
                                    </tr>
                                ))
                            ) : pagedRows.length ? (
                                pagedRows.map((row) => (
                                    <tr key={`${row.sku}-${row.warehouseName}`} className="border-b border-slate-100 hover:bg-slate-50/60">
                                        <td className="px-4 py-4 font-semibold text-slate-900">{row.sku}</td>
                                        <td className="px-4 py-4 text-slate-700">{row.name}</td>
                                        <td className="px-4 py-4 text-slate-700">{row.warehouseName}</td>
                                        <td className="px-4 py-4 text-slate-700">{row.qtyOnHand}</td>
                                        <td className="px-4 py-4 text-slate-700">{row.reorderLevel}</td>
                                        <td className="px-4 py-4">{renderStatusBadge(row)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                                        No low stock products right now. Great job staying ahead!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border border-slate-200 rounded-lg bg-white disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 border border-slate-200 rounded-lg bg-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </ModernCard>
        </div>
    );
};

export default Analytics;
