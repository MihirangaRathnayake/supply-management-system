import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTruck,
    faShip,
    faPlane,
    faBoxes,
    faClock,
    faSync,
    faExclamationTriangle,
    faCheckCircle,
    faGlobe,
    faBarcode,
    faWarehouse,
    faArrowRight,
    faBoxOpen,
    faTimes,
    faPlus,
    faMapMarkerAlt,
    faCalendarDays
} from '@fortawesome/free-solid-svg-icons';
import ModernCard from '../components/ModernCard';
import StatCard from '../components/StatCard';
import AnimatedButton from '../components/AnimatedButton';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import { SkeletonList } from '../components/Skeleton';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
    CREATED: { label: 'Created', gradient: 'from-slate-200 to-slate-300', icon: faBoxes },
    IN_TRANSIT: { label: 'In Transit', gradient: 'from-sky-200 to-blue-300', icon: faTruck },
    DELAYED: { label: 'Delayed', gradient: 'from-amber-200 to-orange-300', icon: faExclamationTriangle },
    DELIVERED: { label: 'Delivered', gradient: 'from-emerald-200 to-green-300', icon: faCheckCircle },
    CANCELLED: { label: 'Cancelled', gradient: 'from-red-200 to-rose-300', icon: faExclamationTriangle }
};

const modePills = {
    AIR: { label: 'Air', className: 'bg-sky-50 text-sky-700 border border-sky-100', icon: faPlane },
    SEA: { label: 'Sea', className: 'bg-blue-50 text-blue-700 border border-blue-100', icon: faShip },
    GROUND: { label: 'Ground', className: 'bg-emerald-50 text-emerald-700 border border-emerald-100', icon: faTruck }
};

const Shipments = () => {
    const { showToast } = useToast();
    const { user } = useAuth();

    const [shipments, setShipments] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterMode, setFilterMode] = useState('ALL');
    const [selected, setSelected] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const defaultForm = {
        shipmentId: '',
        poNumber: '',
        carrier: '',
        mode: 'AIR',
        origin: '',
        destination: '',
        status: 'CREATED',
        eta: '',
        itemsCount: 0,
        progress: 0
    };
    const [form, setForm] = useState(defaultForm);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadShipments();
        loadAnalytics();
    }, []);

    const normalizeShipment = (s) => {
        const status = s.STATUS || s.status || 'CREATED';
        const mode = s.MODE || s.mode || 'GROUND';
        return {
            id: s.SHIPMENT_ID || s.shipmentId || s.id,
            poNumber: s.PO_NUMBER || s.poNumber || s.po_number,
            carrier: s.CARRIER || s.carrier,
            mode,
            origin: s.ORIGIN || s.origin,
            destination: s.DESTINATION || s.destination,
            status,
            eta: s.ETA || s.eta,
            updatedAt: s.UPDATED_AT || s.updatedAt,
            progress: Number(s.PROGRESS ?? 0),
            itemsCount: s.ITEMS_COUNT || s.itemsCount || 0,
            events: s.EVENTS || s.events || []
        };
    };

    const markDelivered = async (shipment) => {
        setUpdating(true);
        try {
            const now = new Date().toISOString();
            const res = await axios.put(`/api/shipments/${shipment.id}`, {
                status: 'DELIVERED',
                progress: 100,
                updatedAt: now
            });
            const updated = normalizeShipment(res.data?.data || shipment);
            setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setSelected((prev) => (prev && prev.id === updated.id ? updated : prev));
            showToast(`Shipment ${updated.id} marked delivered`, 'success');
        } catch (err) {
            console.error('Failed to mark delivered', err);
            showToast(err.response?.data?.message || 'Unable to update shipment', 'error', 3500);
        } finally {
            setUpdating(false);
        }
    };

    const loadShipments = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/shipments');
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setShipments(list.map(normalizeShipment));
        } catch (err) {
            console.error('Failed to load shipments', err);
            showToast(err.response?.data?.message || 'Unable to load shipments.', 'error', 3500);
            setShipments([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            const res = await axios.get('/api/shipments/analytics');
            setAnalytics(res.data?.data || {});
        } catch (err) {
            // Fall back to current list to avoid breaking the page
            const total = shipments.length;
            const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT').length;
            const delayed = shipments.filter(s => s.status === 'DELAYED').length;
            const delivered = shipments.filter(s => s.status === 'DELIVERED').length;
            setAnalytics({ TOTAL: total, IN_TRANSIT: inTransit, DELAYED: delayed, DELIVERED: delivered });
        }
    };

    const handleSeed = async () => {
        if (user?.role !== 'ADMIN') {
            showToast('Only admin can seed shipments', 'error', 4000);
            return;
        }
        setSeeding(true);
        try {
            await axios.post('/api/shipments/seed');
            await Promise.all([loadShipments(), loadAnalytics()]);
            showToast('Sample shipments created', 'success');
        } catch (err) {
            console.error('Failed to seed shipments', err);
            showToast(err.response?.data?.message || 'Unable to seed shipments', 'error', 4000);
        } finally {
            setSeeding(false);
        }
    };

    const validateForm = () => {
        const e = {};
        if (!form.poNumber) e.poNumber = 'PO number is required';
        if (!form.carrier) e.carrier = 'Carrier is required';
        if (!form.origin) e.origin = 'Origin is required';
        if (!form.destination) e.destination = 'Destination is required';
        if (!form.eta) e.eta = 'ETA is required';
        setFormErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleCreateShipment = async (evt) => {
        evt.preventDefault();
        if (!validateForm()) return;
        setSaving(true);
        try {
            await axios.post('/api/shipments', {
                shipmentId: form.shipmentId || undefined,
                poNumber: form.poNumber,
                carrier: form.carrier,
                mode: form.mode,
                origin: form.origin,
                destination: form.destination,
                status: form.status,
                eta: form.eta,
                itemsCount: Number(form.itemsCount) || 0,
                progress: Number(form.progress) || 0,
                events: form.events || []
            });
            showToast('Shipment created', 'success');
            setShowForm(false);
            setForm(defaultForm);
            await Promise.all([loadShipments(), loadAnalytics()]);
        } catch (err) {
            console.error('Create shipment failed', err);
            showToast(err.response?.data?.message || 'Unable to create shipment.', 'error', 4000);
        } finally {
            setSaving(false);
        }
    };

    const filteredShipments = useMemo(() => {
        const term = search.trim().toLowerCase();
        return shipments.filter((s) => {
            const matchesTerm =
                !term ||
                s.id?.toLowerCase().includes(term) ||
                s.poNumber?.toLowerCase().includes(term) ||
                s.carrier?.toLowerCase().includes(term) ||
                s.destination?.toLowerCase().includes(term);
            const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
            const matchesMode = filterMode === 'ALL' || s.mode === filterMode;
            return matchesTerm && matchesStatus && matchesMode;
        });
    }, [shipments, search, filterStatus, filterMode]);

    const metrics = useMemo(() => {
        return {
            total: analytics.TOTAL ?? shipments.length,
            inTransit: analytics.IN_TRANSIT ?? shipments.filter(s => s.status === 'IN_TRANSIT').length,
            delayed: analytics.DELAYED ?? shipments.filter(s => s.status === 'DELAYED').length,
            delivered: analytics.DELIVERED ?? shipments.filter(s => s.status === 'DELIVERED').length
        };
    }, [analytics, shipments]);

    const renderModePill = (mode) => {
        const cfg = modePills[mode] || modePills.GROUND;
        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${cfg.className}`}>
                <FontAwesomeIcon icon={cfg.icon} />
                {cfg.label}
            </span>
        );
    };

    const renderStatusBadge = (status) => {
        const cfg = statusConfig[status] || statusConfig.CREATED;
        return (
            <StatusBadge icon={cfg.icon} label={cfg.label} gradient={cfg.gradient} size="sm" />
        );
    };

    const progressColor = (status) => {
        if (status === 'DELIVERED') return null; // use gradient for delivered
        if (status === 'DELAYED') return '#F59E0B'; // amber
        if (status === 'IN_TRANSIT') return '#38BDF8'; // sky
        return '#A5B4FC'; // default soft indigo
    };

    const progressGradient = (status) => {
        if (status === 'DELIVERED') return '#63a4ff, #a066ff, #ff6ec4'; // blue to violet to pink
        return null;
    };

    const displayProgress = (status, value) => (status === 'DELIVERED' ? 100 : Number(value || 0));

    return (
        <div className="space-y-6">
            <ModernCard className="p-5 lg:p-6 bg-gradient-to-r from-slate-50 via-sky-50 to-emerald-50 border border-slate-200/70 shadow-md">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 shadow-sm">
                        <FontAwesomeIcon icon={faTruck} />
                        Live Shipments Control
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                        Track every shipment, milestone, and exception in real time.
                    </h1>
                    <p className="text-slate-600 text-xs lg:text-sm">
                        Unified view across carriers and modes with Oracle PO linkage and MongoDB event streams.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                            <FontAwesomeIcon icon={faGlobe} className="text-slate-500" /> Multi-mode routing
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-slate-500" /> Exception alerts
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                            <FontAwesomeIcon icon={faBarcode} className="text-slate-500" /> PO + ASN linkage
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
                            placeholder="Search shipment ID, PO, carrier, destination..."
                            className="flex-1"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                        >
                            <option value="ALL">All Status</option>
                            {Object.keys(statusConfig).map((key) => (
                                <option key={key} value={key}>{statusConfig[key].label}</option>
                            ))}
                        </select>
                        <select
                            value={filterMode}
                            onChange={(e) => setFilterMode(e.target.value)}
                            className="px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                        >
                            <option value="ALL">All Modes</option>
                            <option value="AIR">Air</option>
                            <option value="SEA">Sea</option>
                            <option value="GROUND">Ground</option>
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <AnimatedButton icon={faPlus} onClick={() => setShowForm(true)} variant="primary" size="md">
                            Add Shipment
                        </AnimatedButton>
                        {user?.role === 'ADMIN' && (
                            <AnimatedButton icon={faBoxes} onClick={handleSeed} loading={seeding} variant="secondary" size="md">
                                Seed Sample Shipments
                            </AnimatedButton>
                        )}
                        <AnimatedButton icon={faSync} onClick={() => { loadShipments(); loadAnalytics(); }} variant="outline" size="md">
                            Refresh
                        </AnimatedButton>
                    </div>
                </div>
            </ModernCard>

            {loading ? (
                <SkeletonList count={6} />
            ) : filteredShipments.length === 0 ? (
                <ModernCard className="p-12 text-center" glow>
                    <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-100 via-purple-100 to-pink-200 flex items-center justify-center text-slate-700 shadow-lg mb-4 border border-slate-200">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">No shipments match your filters</h3>
                    <p className="text-slate-600">Adjust status or mode filters, or seed new shipments.</p>
                </ModernCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredShipments.map((s) => {
                        const cfg = statusConfig[s.status] || statusConfig.CREATED;
                        return (
                            <ModernCard
                                key={s.id}
                                className="p-6 cursor-pointer"
                                onClick={() => setSelected(s)}
                                hover
                                glow={s.status === 'DELAYED'}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-slate-900">{s.id}</h3>
                                            {renderModePill(s.mode)}
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">PO: {s.poNumber}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} text-white flex items-center justify-center shadow-lg`}>
                                        <FontAwesomeIcon icon={cfg.icon} />
                                    </div>
                                </div>

                                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faGlobe} className="text-slate-400" />
                                        <span className="font-semibold">{s.origin}</span>
                                        <span className="text-slate-400">&rarr;</span>
                                        <span className="font-semibold">{s.destination}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faClock} className="text-slate-400" />
                                        <span className="font-medium">ETA {s.eta ? new Date(s.eta).toLocaleString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faWarehouse} className="text-slate-400" />
                                        <span className="font-medium text-slate-700">{s.carrier}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <ProgressBar
                                        value={displayProgress(s.status, s.progress)}
                                        max={100}
                                        showLabel
                                        gradient={!progressColor(s.status)}
                                        barColor={progressColor(s.status)}
                                        gradientColors={progressGradient(s.status)}
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {renderStatusBadge(s.status)}
                                            {s.status !== 'DELIVERED' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markDelivered(s);
                                                    }}
                                                    disabled={updating}
                                                    className="px-3 py-1 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                                >
                                                    Mark delivered
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 font-semibold">Updated</p>
                                            <p className="text-sm font-bold text-slate-900">{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </ModernCard>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-6 relative">
                        <button
                            onClick={() => { setShowForm(false); setFormErrors({}); }}
                            className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className="mb-4">
                            <h2 className="text-xl font-black text-slate-900">Add Shipment</h2>
                            <p className="text-sm text-slate-600">Capture PO link, carrier, route, ETA, and status.</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleCreateShipment}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Shipment ID (optional)</label>
                                    <input
                                        type="text"
                                        value={form.shipmentId}
                                        onChange={(e) => setForm((prev) => ({ ...prev, shipmentId: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="SHP-3001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">PO Number *</label>
                                    <input
                                        type="text"
                                        value={form.poNumber}
                                        onChange={(e) => setForm((prev) => ({ ...prev, poNumber: e.target.value }))}
                                        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                        placeholder="PO-2045"
                                    />
                                    {formErrors.poNumber && <p className="text-xs text-rose-600 mt-1">{formErrors.poNumber}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Carrier *</label>
                                    <input
                                        type="text"
                                        value={form.carrier}
                                        onChange={(e) => setForm((prev) => ({ ...prev, carrier: e.target.value }))}
                                        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                        placeholder="DHL Express"
                                    />
                                    {formErrors.carrier && <p className="text-xs text-rose-600 mt-1">{formErrors.carrier}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mode</label>
                                    <select
                                        value={form.mode}
                                        onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}
                                        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                    >
                                        <option value="AIR">Air</option>
                                        <option value="SEA">Sea</option>
                                        <option value="GROUND">Ground</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Origin *</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-sky-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.origin}
                                            onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
                                            className="w-full rounded-lg border pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                            placeholder="Origin"
                                        />
                                    </div>
                                    {formErrors.origin && <p className="text-xs text-rose-600 mt-1">{formErrors.origin}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Destination *</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.destination}
                                            onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
                                            className="w-full rounded-lg border pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                            placeholder="Destination"
                                        />
                                    </div>
                                    {formErrors.destination && <p className="text-xs text-rose-600 mt-1">{formErrors.destination}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">ETA *</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faCalendarDays} className="text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="datetime-local"
                                            value={form.eta}
                                            onChange={(e) => setForm((prev) => ({ ...prev, eta: e.target.value }))}
                                            className="w-full rounded-lg border pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                        />
                                    </div>
                                    {formErrors.eta && <p className="text-xs text-rose-600 mt-1">{formErrors.eta}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                                        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                    >
                                        <option value="CREATED">Created</option>
                                        <option value="IN_TRANSIT">In Transit</option>
                                        <option value="DELAYED">Delayed</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Items count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.itemsCount}
                                        onChange={(e) => setForm((prev) => ({ ...prev, itemsCount: e.target.value }))}
                                        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Progress (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.progress}
                                        onChange={(e) => setForm((prev) => ({ ...prev, progress: e.target.value }))}
                                        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setForm(defaultForm); setFormErrors({}); }}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Create shipment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div className="w-full max-w-5xl">
                        <ModernCard className="p-6 lg:p-8" hover={false}>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-3xl font-black text-slate-900">{selected.id}</h2>
                                        {renderModePill(selected.mode)}
                                    </div>
                                    <p className="text-slate-600 font-medium">PO: {selected.poNumber} - {selected.carrier}</p>
                                </div>
                                <div className="flex gap-2">
                                    <AnimatedButton icon={faSync} variant="outline" size="sm" onClick={() => loadShipments()}>
                                        Reload
                                    </AnimatedButton>
                                    <AnimatedButton icon={faTimes} variant="danger" size="sm" onClick={() => setSelected(null)}>
                                        Close
                                    </AnimatedButton>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <ModernCard className="p-4" hover={false}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faGlobe} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Route</p>
                                            <p className="text-sm font-bold text-slate-900">{selected.origin} &rarr; {selected.destination}</p>
                                        </div>
                                    </div>
                                </ModernCard>
                                <ModernCard className="p-4" hover={false}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faClock} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">ETA</p>
                                            <p className="text-sm font-bold text-slate-900">{selected.eta ? new Date(selected.eta).toLocaleString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </ModernCard>
                                <ModernCard className="p-4" hover={false}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faBoxOpen} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Contents</p>
                                            <p className="text-sm font-bold text-slate-900">{selected.itemsCount} item groups</p>
                                        </div>
                                    </div>
                                </ModernCard>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <ModernCard className="p-4 lg:col-span-2" hover={false}>
                                    <h4 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faClock} className="text-sky-500" />
                                        Timeline
                                    </h4>
                                    <div className="space-y-3">
                                        {selected.events && selected.events.length > 0 ? (
                                            selected.events.map((ev, idx) => (
                                                <div key={idx} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                                                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-900">{ev.label}</p>
                                                        <p className="text-xs text-slate-500">{ev.timestamp ? new Date(ev.timestamp).toLocaleString() : 'Pending'}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">No events yet.</p>
                                        )}
                                    </div>
                                </ModernCard>
                                <ModernCard className="p-4 space-y-3" hover={false}>
                                    <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faGlobe} className="text-emerald-500" />
                                        Status
                                    </h4>
                                    {renderStatusBadge(selected.status)}
                                    <div className="pt-2">
                                        <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Progress</p>
                                        <ProgressBar
                                            value={displayProgress(selected.status, selected.progress)}
                                            max={100}
                                            showLabel
                                            gradient={!progressColor(selected.status)}
                                            barColor={progressColor(selected.status)}
                                            gradientColors={progressGradient(selected.status)}
                                        />
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        Last update: {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : 'N/A'}
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

export default Shipments;
