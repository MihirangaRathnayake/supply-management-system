import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faWarehouse,
    faPlus,
    faSync,
    faSearch,
    faMapMarkerAlt,
    faBox,
    faChartPie,
    faPhone,
    faEnvelope,
    faTimes,
    faExclamationTriangle,
    faIndustry,
    faStore,
    faSnowflake,
    faRadiation,
    faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../components/ToastContainer";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
    warehouseName: "",
    warehouseCode: "",
    warehouseType: "DISTRIBUTION",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "Sri Lanka",
    postalCode: "",
    phone: "",
    email: "",
    totalCapacity: ""
};

const warehouseTypes = [
    { value: "DISTRIBUTION", label: "Distribution Center", icon: faWarehouse, color: "blue" },
    { value: "MANUFACTURING", label: "Manufacturing", icon: faIndustry, color: "purple" },
    { value: "RETAIL", label: "Retail Store", icon: faStore, color: "green" },
    { value: "COLD_STORAGE", label: "Cold Storage", icon: faSnowflake, color: "cyan" },
    { value: "HAZMAT", label: "Hazmat Facility", icon: faRadiation, color: "red" }
];

const typeColors = {
    blue: { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
    purple: { border: "border-purple-500", bg: "bg-purple-50", text: "text-purple-600" },
    green: { border: "border-green-500", bg: "bg-green-50", text: "text-green-600" },
    cyan: { border: "border-cyan-500", bg: "bg-cyan-50", text: "text-cyan-600" },
    red: { border: "border-red-500", bg: "bg-red-50", text: "text-red-600" }
};

const normalizeWarehouse = (row = {}) => {
    const id = row.WAREHOUSE_ID || row.warehouse_id || row.warehouseId || row.id;
    const totalCapacity = Number(row.TOTAL_CAPACITY ?? row.total_capacity ?? row.totalCapacity ?? 0);
    const usedCapacity = Number(row.USED_CAPACITY ?? row.used_capacity ?? row.usedCapacity ?? 0);
    const utilizationPct = totalCapacity ? (usedCapacity / totalCapacity) * 100 : 0;

    return {
        id,
        code: row.WAREHOUSE_CODE || row.warehouse_code || row.warehouseCode || "N/A",
        name: row.WAREHOUSE_NAME || row.warehouse_name || row.warehouseName || "Unnamed warehouse",
        type: row.WAREHOUSE_TYPE || row.warehouse_type || row.warehouseType || "DISTRIBUTION",
        addressLine1: row.ADDRESS_LINE1 || row.address_line1 || row.addressLine1 || "",
        addressLine2: row.ADDRESS_LINE2 || row.address_line2 || row.addressLine2 || "",
        city: row.CITY || row.city || "",
        state: row.STATE || row.state || "",
        country: row.COUNTRY || row.country || "Sri Lanka",
        postalCode: row.POSTAL_CODE || row.postal_code || row.postalCode || "",
        phone: row.PHONE || row.phone || "",
        email: row.EMAIL || row.email || "",
        totalCapacity,
        usedCapacity,
        utilizationPct,
        status: row.STATUS || row.status || "ACTIVE"
    };
};

const Warehouses = () => {
    const { showToast } = useToast();
    const { user } = useAuth();

    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const canManage = user?.role === "ADMIN";

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("/api/warehouses");
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setWarehouses(list.map(normalizeWarehouse));
        } catch (err) {
            console.error("Failed to load warehouses", err);
            setError(err.response?.data?.message || "Unable to load warehouses.");
            showToast("Unable to load warehouses", "error", 4000);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = warehouses.length;
        const totalCapacity = warehouses.reduce((sum, w) => sum + (w.totalCapacity || 0), 0);
        const usedCapacity = warehouses.reduce((sum, w) => sum + (w.usedCapacity || 0), 0);
        const avgUtilization = total ? warehouses.reduce((sum, w) => sum + w.utilizationPct, 0) / total : 0;
        return { total, totalCapacity, usedCapacity, avgUtilization };
    }, [warehouses]);

    const filteredWarehouses = useMemo(() => {
        const term = search.trim().toLowerCase();
        let list = [...warehouses];

        if (term) {
            list = list.filter((w) =>
                [w.name, w.code, w.city, w.type].filter(Boolean).some((v) => v.toLowerCase().includes(term))
            );
        }

        if (filterType !== "ALL") {
            list = list.filter((w) => w.type === filterType);
        }

        return list;
    }, [warehouses, search, filterType]);

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
            showToast("Only admin can create warehouses.", "error", 4000);
            return;
        }
        setSaving(true);
        const payload = {
            warehouseName: form.warehouseName.trim(),
            warehouseCode: form.warehouseCode.trim(),
            warehouseType: form.warehouseType,
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            totalCapacity: Number(form.totalCapacity) || 0
        };
        try {
            await axios.post("/api/warehouses", payload);
            showToast("Warehouse created successfully", "success");
            closeDrawer();
            await fetchWarehouses();
        } catch (err) {
            console.error("Failed to create warehouse", err);
            const msg = err.response?.data?.message || "Unable to create warehouse.";
            setError(msg);
            showToast(msg, "error", 4000);
        } finally {
            setSaving(false);
        }
    };

    const getTypeConfig = (type) => warehouseTypes.find((t) => t.value === type) || warehouseTypes[0];

    const getUtilizationColor = (pct) => {
        if (pct >= 90) return "text-red-600 bg-red-50";
        if (pct >= 70) return "text-amber-600 bg-amber-50";
        return "text-green-600 bg-green-50";
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-6 shadow-lg border border-indigo-200/40 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] font-semibold text-white/70">Warehouse Management</p>
                        <div className="flex items-end gap-2">
                            <h1 className="text-3xl font-bold">Warehouses</h1>
                            <span className="text-sm bg-white/20 px-2 py-1 rounded-full font-semibold">
                                {stats.total} facilities
                            </span>
                        </div>
                        <p className="text-sm text-white/80">Oracle-backed storage network with utilization visibility.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchWarehouses}
                            className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faSync} /> Refresh
                        </button>
                        <button
                            onClick={openDrawer}
                            className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold shadow-md flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            New warehouse
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="relative flex-1">
                    <FontAwesomeIcon icon={faSearch} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, code, city..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="ALL">All Types</option>
                    {warehouseTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Warehouse</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Capacity</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(4)].map((_, idx) => (
                                <tr key={idx} className="border-b border-slate-100">
                                    <td className="px-4 py-4" colSpan={5}>
                                        <div className="animate-pulse h-4 bg-slate-200 rounded w-1/2 mb-2" />
                                        <div className="animate-pulse h-3 bg-slate-100 rounded w-1/3" />
                                    </td>
                                </tr>
                            ))
                        ) : filteredWarehouses.length ? (
                            filteredWarehouses.map((w) => {
                                const cfg = getTypeConfig(w.type);
                                return (
                                    <tr key={w.id || w.code} className="border-b border-slate-100 hover:bg-slate-50/60">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faWarehouse} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{w.name}</div>
                                                    <div className="text-xs text-slate-500">Code: {w.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold">
                                                <FontAwesomeIcon icon={cfg.icon} className="text-indigo-500" />
                                                {cfg.label}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-400" />
                                                <span>{[w.city, w.country].filter(Boolean).join(', ') || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getUtilizationColor(w.utilizationPct)}`}>
                                                <FontAwesomeIcon icon={faChartPie} />
                                                {w.usedCapacity}/{w.totalCapacity || 0} ({w.utilizationPct.toFixed(0)}%)
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={openDrawer}
                                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                Add
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                                    No warehouses found. Adjust filters or create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 rounded-2xl animate-scale-in">
                        <div className="flex items-start justify-between mb-6 sticky top-0 bg-white/90 backdrop-blur z-10 pb-3 border-b border-slate-100">
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-indigo-600 font-semibold">Create Warehouse</p>
                                <h2 className="text-2xl font-bold text-slate-900 mt-1">New Warehouse</h2>
                                <p className="text-sm text-slate-500">Add a new storage facility to your network</p>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="text-slate-500 hover:text-slate-800 px-3 py-1 rounded-lg border border-slate-200"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        {!canManage && (
                            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-center gap-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                Only admin can create warehouses.
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Warehouse Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faWarehouse} className="text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.warehouseName}
                                            onChange={(e) => setForm({ ...form, warehouseName: e.target.value })}
                                            required
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="e.g. Central Distribution Center"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Warehouse Code <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faBox} className="text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.warehouseCode}
                                            onChange={(e) => setForm({ ...form, warehouseCode: e.target.value })}
                                            required
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="e.g. WH-001"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Warehouse Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {warehouseTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, warehouseType: type.value })}
                                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                                form.warehouseType === type.value
                                                    ? `${(typeColors[type.color] || typeColors.blue).border} ${(typeColors[type.color] || typeColors.blue).bg}`
                                                    : "border-slate-200 hover:border-slate-300"
                                            }`}
                                        >
                                            <FontAwesomeIcon
                                                icon={type.icon}
                                                className={`${(typeColors[type.color] || typeColors.blue).text} mb-1`}
                                            />
                                            <div className="text-xs font-semibold text-slate-900">{type.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Address Line 1</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={form.addressLine1}
                                        onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Street address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Address Line 2</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={form.addressLine2}
                                        onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Building, floor, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.city}
                                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="City"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">State/Province</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.state}
                                            onChange={(e) => setForm({ ...form, state: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="State"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Postal Code</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faBox} className="text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.postalCode}
                                            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Postal code"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Country</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faGlobe} className="text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={form.country}
                                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Country"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faPhone} className="text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-purple-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="warehouse@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Total Capacity (units)</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faChartPie} className="text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.totalCapacity}
                                        onChange={(e) => setForm({ ...form, totalCapacity: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="10000"
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
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Saving..." : "Create warehouse"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Warehouses;
