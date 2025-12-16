import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClipboardList,
    faTruck,
    faCheckCircle,
    faTimes,
    faWarehouse,
    faUser,
    faCalendar,
    faArrowRight,
    faSync,
    faExclamationTriangle,
    faBoxes,
    faDollarSign,
    faPaperPlane,
    faBoxOpen,
    faFire,
    faFilter
} from '@fortawesome/free-solid-svg-icons';
import ModernCard from '../components/ModernCard';
import AnimatedButton from '../components/AnimatedButton';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import ProgressBar from '../components/ProgressBar';
import { SkeletonList } from '../components/Skeleton';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';

const sampleOrders = [
    {
        PO_ID: 'PO-2045',
        PO_NUMBER: 'PO-2045',
        SUPPLIER_NAME: 'Global Industrial Supplies',
        WAREHOUSE_NAME: 'Central DC',
        CITY: 'Colombo',
        STATUS: 'PENDING_APPROVAL',
        PRIORITY: 'HIGH',
        ORDER_DATE: '2024-11-05T00:00:00Z',
        EXPECTED_DATE: '2024-11-12T00:00:00Z',
        TOTAL_VALUE: 48500,
        items: [
            { SKU: 'SKU-1001', PRODUCT_NAME: 'High Torque Motor', QUANTITY_ORDERED: 10, QUANTITY_RECEIVED: 4 },
            { SKU: 'SKU-3005', PRODUCT_NAME: 'Sensor Array', QUANTITY_ORDERED: 30, QUANTITY_RECEIVED: 10 }
        ]
    },
    {
        PO_ID: 'PO-2046',
        PO_NUMBER: 'PO-2046',
        SUPPLIER_NAME: 'Pacific Manufacturing Co.',
        WAREHOUSE_NAME: 'East Coast DC',
        CITY: 'Galle',
        STATUS: 'SENT',
        PRIORITY: 'NORMAL',
        ORDER_DATE: '2024-11-03T00:00:00Z',
        EXPECTED_DATE: '2024-11-15T00:00:00Z',
        TOTAL_VALUE: 22800,
        items: [
            { SKU: 'SKU-2004', PRODUCT_NAME: 'Optical Sensor Kit', QUANTITY_ORDERED: 20, QUANTITY_RECEIVED: 0 },
            { SKU: 'SKU-4010', PRODUCT_NAME: 'Steel Fasteners', QUANTITY_ORDERED: 500, QUANTITY_RECEIVED: 0 }
        ]
    },
    {
        PO_ID: 'PO-2047',
        PO_NUMBER: 'PO-2047',
        SUPPLIER_NAME: 'Atlantic Components Ltd.',
        WAREHOUSE_NAME: 'West Coast DC',
        CITY: 'Kandy',
        STATUS: 'RECEIVED',
        PRIORITY: 'LOW',
        ORDER_DATE: '2024-10-28T00:00:00Z',
        EXPECTED_DATE: '2024-11-08T00:00:00Z',
        TOTAL_VALUE: 17300,
        items: [
            { SKU: 'SKU-5001', PRODUCT_NAME: 'HVAC Control Board', QUANTITY_ORDERED: 15, QUANTITY_RECEIVED: 15 },
            { SKU: 'SKU-2100', PRODUCT_NAME: 'Packing Foam', QUANTITY_ORDERED: 120, QUANTITY_RECEIVED: 120 }
        ]
    }
];

const statusConfig = {
    DRAFT: { label: 'Draft', color: 'slate', gradient: 'from-slate-200 to-slate-300', icon: faClipboardList },
    PENDING_APPROVAL: { label: 'Pending Approval', color: 'amber', gradient: 'from-amber-200 to-amber-300', icon: faExclamationTriangle },
    APPROVED: { label: 'Approved', color: 'blue', gradient: 'from-blue-200 to-blue-300', icon: faCheckCircle },
    SENT: { label: 'Sent', color: 'indigo', gradient: 'from-indigo-200 to-indigo-300', icon: faPaperPlane },
    IN_TRANSIT: { label: 'In Transit', color: 'purple', gradient: 'from-purple-200 to-purple-300', icon: faTruck },
    PARTIALLY_RECEIVED: { label: 'Partially Received', color: 'cyan', gradient: 'from-cyan-200 to-cyan-300', icon: faBoxes },
    RECEIVED: { label: 'Received', color: 'green', gradient: 'from-green-200 to-green-300', icon: faCheckCircle },
    CANCELLED: { label: 'Cancelled', color: 'red', gradient: 'from-red-200 to-red-300', icon: faTimes },
    REJECTED: { label: 'Rejected', color: 'red', gradient: 'from-red-200 to-red-300', icon: faTimes }
};

const priorityPills = {
    LOW: { label: 'Low', className: 'bg-slate-50 text-slate-700 border border-slate-200' },
    NORMAL: { label: 'Normal', className: 'bg-blue-50 text-blue-700 border border-blue-100' },
    HIGH: { label: 'High', className: 'bg-orange-50 text-orange-700 border border-orange-100' },
    URGENT: { label: 'Urgent', className: 'bg-red-50 text-red-700 border border-red-100 animate-pulse' }
};

const Orders = () => {
    const { showToast } = useToast();
    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        loadOrders();
        loadAnalytics();
    }, []);

    const normalizeOrder = (order) => {
        const status = order.STATUS || order.status || 'DRAFT';
        const priority = order.PRIORITY || order.priority || 'NORMAL';
        const orderDate = order.ORDER_DATE || order.order_date;
        const expectedDate = order.EXPECTED_DATE || order.expected_date;
        return {
            id: order.PO_ID || order.po_id || order.id,
            number: order.PO_NUMBER || order.po_number || order.number,
            supplier: order.SUPPLIER_NAME || order.supplier || order.supplier_name,
            warehouse: order.WAREHOUSE_NAME || order.warehouse || order.warehouse_name,
            city: order.CITY || order.city || '',
            status,
            priority,
            orderDate,
            expectedDate,
            totalValue: Number(order.TOTAL_VALUE || order.total_value || 0),
            items: order.items || []
        };
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/purchase-orders');
            const data = Array.isArray(res.data?.data) ? res.data.data : [];
            setOrders(data.map(normalizeOrder));
        } catch (err) {
            console.error('Failed to load purchase orders, using sample data', err);
            showToast('Orders API not ready. Showing live demo data instead.', 'error', 4000);
            setOrders(sampleOrders.map(normalizeOrder));
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            const res = await axios.get('/api/purchase-orders/analytics');
            setAnalytics(res.data?.data || {});
        } catch (err) {
            const normalized = sampleOrders.map(normalizeOrder);
            const total = normalized.length;
            const open = normalized.filter(o => ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'IN_TRANSIT'].includes(o.status)).length;
            const received = normalized.filter(o => o.status === 'RECEIVED').length;
            const value = normalized.reduce((sum, o) => sum + o.totalValue, 0);
            setAnalytics({
                TOTAL_ORDERS: total,
                OPEN_ORDERS: open,
                RECEIVED_COUNT: received,
                TOTAL_VALUE: value
            });
        }
    };

    const handleSeed = async () => {
        if (user?.role !== 'ADMIN') {
            showToast('Only admin can seed purchase orders', 'error', 4000);
            return;
        }
        setSeeding(true);
        try {
            await axios.post('/api/purchase-orders/seed');
            await Promise.all([loadOrders(), loadAnalytics()]);
            showToast('Sample purchase orders created', 'success');
        } catch (err) {
            console.error('Failed to seed purchase orders', err);
            showToast(err.response?.data?.message || 'Unable to seed orders', 'error', 4000);
        } finally {
            setSeeding(false);
        }
    };

    const handleStatusChange = async (order, nextStatus) => {
        setUpdatingStatus(true);
        try {
            await axios.patch(`/api/purchase-orders/${order.id}/status`, { status: nextStatus });
        } catch (err) {
            console.error('Status update failed, applying locally', err);
            showToast('API not ready, status updated locally for now.', 'error', 3500);
        } finally {
            setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
            );
            setSelectedOrder((prev) => (prev && prev.id === order.id ? { ...prev, status: nextStatus } : prev));
            setUpdatingStatus(false);
        }
    };

    const filteredOrders = useMemo(() => {
        const term = search.trim().toLowerCase();
        return orders.filter((order) => {
            const matchesTerm =
                !term ||
                order.number?.toLowerCase().includes(term) ||
                order.supplier?.toLowerCase().includes(term) ||
                order.warehouse?.toLowerCase().includes(term);
            const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
            const matchesPriority = filterPriority === 'ALL' || order.priority === filterPriority;
            return matchesTerm && matchesStatus && matchesPriority;
        });
    }, [orders, search, filterStatus, filterPriority]);

    const computedAnalytics = useMemo(() => {
        const total = analytics.TOTAL_ORDERS ?? orders.length;
        const open = analytics.OPEN_ORDERS ?? orders.filter(o => o.status !== 'RECEIVED' && o.status !== 'CANCELLED').length;
        const received = analytics.RECEIVED_COUNT ?? orders.filter(o => o.status === 'RECEIVED').length;
        const totalValue = analytics.TOTAL_VALUE ?? orders.reduce((sum, o) => sum + o.totalValue, 0);
        return { total, open, received, totalValue };
    }, [analytics, orders]);

    const renderPriority = (priority) => {
        const config = priorityPills[priority] || priorityPills.NORMAL;
        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${config.className} inline-flex items-center gap-1`}>
                {priority === 'HIGH' && <FontAwesomeIcon icon={faFire} />}
                {priority === 'URGENT' && <FontAwesomeIcon icon={faExclamationTriangle} />}
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <ModernCard className="p-5 lg:p-6 bg-gradient-to-r from-slate-50 via-sky-50 to-emerald-50 border border-slate-200/70 shadow-md">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 shadow-sm">
                        <FontAwesomeIcon icon={faClipboardList} />
                        Purchase Orders Command
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                        Orchestrate every supplier, warehouse, and receipt in one board.
                    </h1>
                    <p className="text-slate-600 text-sm lg:text-base">
                        Live control center for approvals, logistics, and receipts across Oracle + Mongo.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                            <FontAwesomeIcon icon={faTruck} className="text-slate-500" /> In-transit visibility
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-slate-500" /> Approval workflows
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                            <FontAwesomeIcon icon={faBoxes} className="text-slate-500" /> Item-level receipts
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                            <FontAwesomeIcon icon={faDollarSign} className="text-slate-500" />
                            Total value: ${computedAnalytics.totalValue.toLocaleString()}
                        </span>
                    </div>
                </div>
            </ModernCard>

            <ModernCard className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                    <div className="flex-1 flex flex-col md:flex-row gap-3">
                        <SearchBar
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClear={() => setSearch('')}
                            placeholder="Search PO number, supplier, or warehouse..."
                            className="flex-1"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                            <option value="ALL">All Status</option>
                            {Object.keys(statusConfig).map((key) => (
                                <option key={key} value={key}>{statusConfig[key].label}</option>
                            ))}
                        </select>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                            <option value="ALL">All Priority</option>
                            <option value="LOW">Low</option>
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>
                    <div className="flex gap-3">
                        {user?.role === 'ADMIN' && (
                            <AnimatedButton
                                icon={faBoxes}
                                onClick={handleSeed}
                                loading={seeding}
                                variant="secondary"
                                size="md"
                            >
                                Seed Sample POs
                            </AnimatedButton>
                        )}
                        <AnimatedButton
                            icon={faSync}
                            onClick={() => { loadOrders(); loadAnalytics(); }}
                            variant="outline"
                            size="md"
                        >
                            Refresh
                        </AnimatedButton>
                    </div>
                </div>
            </ModernCard>

            {loading ? (
                <SkeletonList count={6} />
            ) : filteredOrders.length === 0 ? (
                <ModernCard className="p-12 text-center" glow>
                    <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-100 via-purple-100 to-pink-200 flex items-center justify-center text-slate-700 shadow-lg mb-4 border border-slate-200">
                        <FontAwesomeIcon icon={faFilter} className="text-2xl" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">No orders match your filters</h3>
                    <p className="text-slate-600">Adjust status or priority filters, or create / seed new purchase orders.</p>
                </ModernCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredOrders.map((order) => {
                        const cfg = statusConfig[order.status] || statusConfig.DRAFT;
                        return (
                            <ModernCard
                                key={order.id || order.number}
                                className="p-6 cursor-pointer"
                                onClick={() => setSelectedOrder(order)}
                                hover
                                glow={order.priority === 'URGENT'}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-2xl font-black text-slate-900">{order.number}</h3>
                                            {renderPriority(order.priority)}
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">{order.supplier}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} text-white flex items-center justify-center shadow-lg`}>
                                        <FontAwesomeIcon icon={cfg.icon} />
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faWarehouse} className="text-slate-400" />
                                        <span className="font-semibold">{order.warehouse}</span>
                                        {order.city && <span className="text-slate-400">- {order.city}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendar} className="text-slate-400" />
                                        <span className="font-medium">
                                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <span className="text-slate-400">-&gt;</span>
                                        <span className="font-medium text-slate-700">
                                            {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <ProgressBar
                                        value={order.items.reduce((sum, item) => sum + Number(item.QUANTITY_RECEIVED || 0), 0)}
                                        max={order.items.reduce((sum, item) => sum + Number(item.QUANTITY_ORDERED || 0), 0) || 1}
                                        showLabel
                                    />
                                    <div className="flex items-center justify-between">
                                        <StatusBadge {...cfg} size="sm" />
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 font-semibold">Value</p>
                                            <p className="text-lg font-black text-slate-900">${order.totalValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </ModernCard>
                        );
                    })}
                </div>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div className="w-full max-w-5xl">
                        <ModernCard className="p-6 lg:p-8" hover={false}>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-3xl font-black text-slate-900">{selectedOrder.number}</h2>
                                        {renderPriority(selectedOrder.priority)}
                                    </div>
                                    <p className="text-slate-600 font-medium">Purchase Order Details - {selectedOrder.supplier}</p>
                                </div>
                                <div className="flex gap-2">
                                    <AnimatedButton
                                        icon={faCheckCircle}
                                        variant="primary"
                                        size="sm"
                                        loading={updatingStatus}
                                        onClick={() => handleStatusChange(selectedOrder, 'RECEIVED')}
                                    >
                                        Mark Received
                                    </AnimatedButton>
                                    <AnimatedButton
                                        icon={faPaperPlane}
                                        variant="outline"
                                        size="sm"
                                        loading={updatingStatus}
                                        onClick={() => handleStatusChange(selectedOrder, 'SENT')}
                                    >
                                        Send to Supplier
                                    </AnimatedButton>
                                    <AnimatedButton
                                        icon={faTimes}
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setSelectedOrder(null)}
                                    >
                                        Close
                                    </AnimatedButton>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <ModernCard className="p-4" hover={false}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faUser} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Supplier</p>
                                            <p className="text-sm font-bold text-slate-900">{selectedOrder.supplier}</p>
                                        </div>
                                    </div>
                                </ModernCard>
                                <ModernCard className="p-4" hover={false}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faWarehouse} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Warehouse</p>
                                            <p className="text-sm font-bold text-slate-900">{selectedOrder.warehouse}</p>
                                        </div>
                                    </div>
                                </ModernCard>
                                <ModernCard className="p-4" hover={false}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faDollarSign} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Value</p>
                                            <p className="text-sm font-bold text-slate-900">${selectedOrder.totalValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </ModernCard>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <ModernCard className="p-4 lg:col-span-2" hover={false}>
                                    <h4 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faBoxOpen} className="text-purple-500" />
                                        Line Items
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={`${item.SKU}-${idx}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/60 px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.PRODUCT_NAME}</p>
                                                    <p className="text-xs text-slate-500">SKU: {item.SKU}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-slate-900">{item.QUANTITY_ORDERED}</p>
                                                    <p className="text-xs text-slate-500">Ordered / {item.QUANTITY_RECEIVED || 0} received</p>
                                                </div>
                                            </div>
                                        )) || (
                                            <div className="text-sm text-slate-500">No items on this order.</div>
                                        )}
                                    </div>
                                </ModernCard>

                                <ModernCard className="p-4 space-y-3" hover={false}>
                                    <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendar} className="text-indigo-500" />
                                        Timeline
                                    </h4>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                            Created: {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                                            Expected: {selectedOrder.expectedDate ? new Date(selectedOrder.expectedDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            Status: <StatusBadge {...(statusConfig[selectedOrder.status] || statusConfig.DRAFT)} size="sm" />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Progress</p>
                                        <ProgressBar
                                            value={selectedOrder.items.reduce((sum, item) => sum + Number(item.QUANTITY_RECEIVED || 0), 0)}
                                            max={selectedOrder.items.reduce((sum, item) => sum + Number(item.QUANTITY_ORDERED || 0), 0) || 1}
                                            showLabel
                                        />
                                    </div>
                                </ModernCard>
                            </div>
                        </ModernCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
