import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faQrcode,
    faBarcode,
    faTruck,
    faBox,
    faCheckCircle,
    faTimesCircle,
    faClock,
    faUser,
    faCalendar,
    faCamera,
    faTimes,
    faExclamationTriangle,
    faShippingFast,
    faWarehouse,
    faClipboardList,
    faArrowRight,
    faSync,
    faDollarSign,
    faChartLine,
    faBoxOpen,
    faStar,
    faFire
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import ModernCard from '../components/ModernCard';
import { SkeletonList } from '../components/Skeleton';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';

const OrderScanEnhanced = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [scanMode, setScanMode] = useState(false);
    const [scanInput, setScanInput] = useState('');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const scanInputRef = useRef(null);

    useEffect(() => {
        fetchOrders();
        fetchAnalytics();
    }, []);

    useEffect(() => {
        if (scanMode && scanInputRef.current) {
            scanInputRef.current.focus();
        }
    }, [scanMode]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/purchase-orders');
            setOrders(res.data.data || []);
        } catch (err) {
            console.error('Failed to load orders', err);
            showToast('Unable to load orders', 'error', 4000);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('/api/purchase-orders/analytics');
            setAnalytics(res.data.data || {});
        } catch (err) {
            console.error('Failed to load analytics', err);
        }
    };

    const handleScan = async (e) => {
        e.preventDefault();
        if (!scanInput.trim()) return;

        setLoading(true);
        try {
            const res = await axios.get(`/api/purchase-orders/${scanInput.trim()}`);
            setSelectedOrder(res.data.data);
            setScanInput('');
            setScanMode(false);
            showToast('Order found successfully', 'success');
        } catch (err) {
            console.error('Order not found', err);
            showToast(err.response?.data?.message || 'Order not found', 'error', 4000);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedData = async () => {
        if (user?.role !== 'ADMIN') {
            showToast('Only admin can seed data', 'error', 4000);
            return;
        }
        setSeeding(true);
        try {
            const res = await axios.post('/api/purchase-orders/seed');
            showToast(res.data.message || 'Sample orders created successfully', 'success');
            await fetchOrders();
            await fetchAnalytics();
        } catch (err) {
            console.error('Failed to seed orders', err);
            showToast(err.response?.data?.message || 'Failed to seed orders', 'error', 4000);
        } finally {
            setSeeding(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            DRAFT: { label: 'Draft', color: 'slate', icon: faClipboardList, gradient: 'from-slate-400 to-slate-500' },
            PENDING_APPROVAL: { label: 'Pending', color: 'amber', icon: faClock, gradient: 'from-amber-400 to-amber-500' },
            APPROVED: { label: 'Approved', color: 'blue', icon: faCheckCircle, gradient: 'from-blue-400 to-blue-500' },
            SENT: { label: 'Sent', color: 'indigo', icon: faShippingFast, gradient: 'from-indigo-400 to-indigo-500' },
            IN_TRANSIT: { label: 'In Transit', color: 'purple', icon: faTruck, gradient: 'from-purple-400 to-purple-500' },
            PARTIALLY_RECEIVED: { label: 'Partial', color: 'cyan', icon: faBox, gradient: 'from-cyan-400 to-cyan-500' },
            RECEIVED: { label: 'Received', color: 'green', icon: faCheckCircle, gradient: 'from-green-400 to-green-500' },
            CANCELLED: { label: 'Cancelled', color: 'red', icon: faTimesCircle, gradient: 'from-red-400 to-red-500' },
            REJECTED: { label: 'Rejected', color: 'red', icon: faTimesCircle, gradient: 'from-red-400 to-red-500' }
        };
        return configs[status] || configs.DRAFT;
    };

    const getPriorityBadge = (priority) => {
        const configs = {
            LOW: { label: 'Low', color: 'bg-slate-100 text-slate-700', icon: null },
            NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-700', icon: null },
            HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700', icon: faFire },
            URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-700 animate-pulse', icon: faExclamationTriangle }
        };
        const config = configs[priority] || configs.NORMAL;
        return (
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${config.color} inline-flex items-center gap-1.5`}>
                {config.icon && <FontAwesomeIcon icon={config.icon} />}
                {config.label}
            </span>
        );
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'ALL' || order.STATUS === filterStatus;
        const matchesSearch = !searchTerm || 
            order.PO_NUMBER?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.SUPPLIER_NAME?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Hero Header */}
                <ModernCard className="mb-8 p-8" glow={true} gradient={true}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg animate-pulse">
                                    <FontAwesomeIcon icon={faQrcode} className="text-3xl" />
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Order Scanner
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">Scan, track, and manage orders in real-time</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <AnimatedButton
                                icon={faSync}
                                onClick={() => { fetchOrders(); fetchAnalytics(); }}
                                variant="outline"
                                size="md"
                            >
                                Refresh
                            </AnimatedButton>
                            <AnimatedButton
                                icon={scanMode ? faTimes : faQrcode}
                                onClick={() => setScanMode(!scanMode)}
                                variant={scanMode ? 'danger' : 'primary'}
                                size="lg"
                            >
                                {scanMode ? 'Close Scanner' : 'Scan Order'}
                            </AnimatedButton>
                        </div>
                    </div>

                    {/* Scanner Interface */}
                    {scanMode && (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
                            <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
                                <form onSubmit={handleScan} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative group">
                                            <FontAwesomeIcon 
                                                icon={faBarcode} 
                                                className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 text-2xl group-focus-within:text-white transition-colors"
                                            />
                                            <input
                                                ref={scanInputRef}
                                                type="text"
                                                value={scanInput}
                                                onChange={(e) => setScanInput(e.target.value)}
                                                placeholder="Enter PO Number or scan barcode..."
                                                className="w-full pl-16 pr-6 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-white placeholder-white/60 text-xl font-semibold focus:outline-none focus:border-white/60 focus:bg-white/30 transition-all"
                                            />
                                        </div>
                                        <AnimatedButton
                                            type="submit"
                                            variant="secondary"
                                            size="lg"
                                            loading={loading}
                                            disabled={!scanInput.trim()}
                                        >
                                            Search
                                        </AnimatedButton>
                                    </div>
                                    <div className="flex items-center justify-center gap-8 text-white/90 text-sm font-medium">
                                        <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                                            <FontAwesomeIcon icon={faQrcode} className="text-lg" />
                                            <span>QR Code</span>
                                        </div>
                                        <div className="w-px h-5 bg-white/30" />
                                        <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                                            <FontAwesomeIcon icon={faBarcode} className="text-lg" />
                                            <span>Barcode</span>
                                        </div>
                                        <div className="w-px h-5 bg-white/30" />
                                        <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                                            <FontAwesomeIcon icon={faCamera} className="text-lg" />
                                            <span>Manual Entry</span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </ModernCard>

                {/* Analytics Stats */}
                {analytics && !selectedOrder && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={faClipboardList}
                            label="Total Orders"
                            value={analytics.TOTAL_ORDERS || 0}
                            gradient="from-blue-500 to-blue-600"
                            trend="up"
                            trendValue="12%"
                        />
                        <StatCard
                            icon={faDollarSign}
                            label="Total Value"
                            value={`$${((analytics.TOTAL_VALUE || 0) / 1000).toFixed(1)}K`}
                            gradient="from-purple-500 to-purple-600"
                            trend="up"
                            trendValue="8%"
                        />
                        <StatCard
                            icon={faChartLine}
                            label="Avg Order Value"
                            value={`$${((analytics.AVG_ORDER_VALUE || 0)).toFixed(0)}`}
                            gradient="from-pink-500 to-pink-600"
                        />
                        <StatCard
                            icon={faCheckCircle}
                            label="Received"
                            value={analytics.RECEIVED_COUNT || 0}
                            gradient="from-green-500 to-green-600"
                            trend="up"
                            trendValue="15%"
                        />
                    </div>
                )}

                {/* Main Content */}
                {selectedOrder ? (
                    /* Order Details View */
                    <div className="space-y-6">
                        <AnimatedButton
                            icon={faArrowRight}
                            onClick={() => setSelectedOrder(null)}
                            variant="outline"
                            size="md"
                            className="rotate-180"
                        >
                            Back to Orders
                        </AnimatedButton>

                        {/* Order Header */}
                        <ModernCard className="p-8" glow={true}>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <h2 className="text-4xl font-black text-slate-900">{selectedOrder.PO_NUMBER}</h2>
                                        {getPriorityBadge(selectedOrder.PRIORITY)}
                                    </div>
                                    <p className="text-slate-600 font-medium text-lg">Purchase Order Details</p>
                                </div>
                                <StatusBadge
                                    {...getStatusConfig(selectedOrder.STATUS)}
                                    size="lg"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ModernCard className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg">
                                            <FontAwesomeIcon icon={faUser} className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Supplier</p>
                                            <p className="text-lg font-bold text-slate-900">{selectedOrder.SUPPLIER_NAME || 'N/A'}</p>
                                        </div>
                                    </div>
                                </ModernCard>

                                <ModernCard className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
                                            <FontAwesomeIcon icon={faWarehouse} className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Warehouse</p>
                                            <p className="text-lg font-bold text-slate-900">{selectedOrder.WAREHOUSE_NAME || 'N/A'}</p>
                                        </div>
                                    </div>
                                </ModernCard>

                                <ModernCard className="p-6 bg-gradient-to-br from-pink-50 to-pink-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white flex items-center justify-center shadow-lg">
                                            <FontAwesomeIcon icon={faCalendar} className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-pink-600 font-bold uppercase tracking-wider mb-1">Order Date</p>
                                            <p className="text-lg font-bold text-slate-900">
                                                {selectedOrder.ORDER_DATE ? new Date(selectedOrder.ORDER_DATE).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </ModernCard>
                            </div>
                        </ModernCard>

                        {/* Order Timeline */}
                        <ModernCard className="p-8">
                            <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                                    <FontAwesomeIcon icon={faClock} />
                                </div>
                                Order Timeline
                            </h3>
                            <div className="relative">
                                <div className="absolute left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
                                {[
                                    { label: 'Order Created', date: selectedOrder.CREATED_AT, icon: faClipboardList, color: 'blue' },
                                    { label: 'Approved', date: selectedOrder.APPROVED_AT, icon: faCheckCircle, color: 'green' },
                                    { label: 'Sent to Supplier', date: selectedOrder.SENT_AT, icon: faShippingFast, color: 'indigo' },
                                    { label: 'Expected Delivery', date: selectedOrder.EXPECTED_DATE, icon: faTruck, color: 'purple' }
                                ].map((event, idx) => (
                                    <div key={idx} className="relative flex items-start gap-8 mb-10 last:mb-0 group">
                                        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-${event.color}-400 to-${event.color}-600 text-white flex items-center justify-center shadow-xl z-10 group-hover:scale-110 transition-transform`}>
                                            <FontAwesomeIcon icon={event.icon} className="text-2xl" />
                                        </div>
                                        <ModernCard className="flex-1 p-6 hover:shadow-2xl">
                                            <h4 className="font-black text-slate-900 text-xl mb-2">{event.label}</h4>
                                            <p className="text-slate-600 font-medium">
                                                {event.date ? new Date(event.date).toLocaleString() : 'Pending'}
                                            </p>
                                        </ModernCard>
                                    </div>
                                ))}
                            </div>
                        </ModernCard>

                        {/* Order Items */}
                        <ModernCard className="p-8">
                            <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                    <FontAwesomeIcon icon={faBoxOpen} />
                                </div>
                                Order Items
                            </h3>
                            <div className="space-y-4">
                                {selectedOrder.items?.map((item, idx) => (
                                    <ModernCard key={idx} className="p-6 hover:shadow-xl" hover={true}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-lg mb-1">{item.PRODUCT_NAME}</h4>
                                                    <p className="text-sm text-slate-600 font-medium">SKU: {item.SKU}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                    {item.QUANTITY_ORDERED}
                                                </p>
                                                <p className="text-sm text-slate-600 font-semibold">units</p>
                                            </div>
                                        </div>
                                        {item.QUANTITY_RECEIVED > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                <ProgressBar 
                                                    value={item.QUANTITY_RECEIVED} 
                                                    max={item.QUANTITY_ORDERED}
                                                    showLabel={true}
                                                />
                                            </div>
                                        )}
                                    </ModernCard>
                                )) || (
                                    <div className="text-center py-12">
                                        <FontAwesomeIcon icon={faBox} className="text-6xl text-slate-300 mb-4" />
                                        <p className="text-slate-500 font-medium">No items found</p>
                                    </div>
                                )}
                            </div>
                        </ModernCard>
                    </div>
                ) : (
                    /* Orders List View */
                    <div className="space-y-6">
                        {/* Filters */}
                        <ModernCard className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <SearchBar
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClear={() => setSearchTerm('')}
                                    placeholder="Search by PO number or supplier..."
                                    className="flex-1"
                                />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 font-semibold transition-all"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="PENDING_APPROVAL">Pending</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="SENT">Sent</option>
                                    <option value="RECEIVED">Received</option>
                                </select>
                            </div>
                        </ModernCard>

                        {/* Empty State */}
                        {!loading && filteredOrders.length === 0 && orders.length === 0 && user?.role === 'ADMIN' && (
                            <ModernCard className="p-16 text-center" glow={true}>
                                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-2xl animate-bounce">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-3">No Orders Yet</h3>
                                <p className="text-slate-600 mb-8 text-lg">Create sample purchase orders to get started</p>
                                <AnimatedButton
                                    icon={faBox}
                                    onClick={handleSeedData}
                                    loading={seeding}
                                    variant="primary"
                                    size="xl"
                                >
                                    {seeding ? 'Creating Orders...' : 'Create Sample Orders'}
                                </AnimatedButton>
                            </ModernCard>
                        )}

                        {/* Orders Grid */}
                        {loading ? (
                            <SkeletonList count={6} />
                        ) : filteredOrders.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.STATUS);
                                    return (
                                        <ModernCard
                                            key={order.PO_ID}
                                            className="p-6 cursor-pointer group"
                                            onClick={() => setSelectedOrder(order)}
                                            hover={true}
                                            glow={order.PRIORITY === 'URGENT'}
                                        >
                                            <div className="flex items-start justify-between mb-5">
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                                                        {order.PO_NUMBER}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 font-medium">{order.SUPPLIER_NAME}</p>
                                                </div>
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${statusConfig.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                    <FontAwesomeIcon icon={statusConfig.icon} className="text-xl" />
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-5">
                                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                                    <FontAwesomeIcon icon={faWarehouse} className="text-slate-400 w-4" />
                                                    <span className="font-medium">{order.WAREHOUSE_NAME || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                                    <FontAwesomeIcon icon={faCalendar} className="text-slate-400 w-4" />
                                                    <span className="font-medium">
                                                        {order.ORDER_DATE ? new Date(order.ORDER_DATE).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-5 border-t border-slate-200">
                                                <StatusBadge
                                                    {...statusConfig}
                                                    size="sm"
                                                />
                                                {getPriorityBadge(order.PRIORITY)}
                                            </div>
                                        </ModernCard>
                                    );
                                })}
                            </div>
                        ) : (
                            <ModernCard className="p-16 text-center">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-slate-300 mb-4" />
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Orders Found</h3>
                                <p className="text-slate-600">Try adjusting your filters or scan a new order</p>
                            </ModernCard>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderScanEnhanced;
