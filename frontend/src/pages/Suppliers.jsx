import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faSearch,
    faFilter,
    faSync,
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faEdit,
    faTrash,
    faBuilding,
    faGlobe,
    faCheckCircle,
    faExclamationTriangle,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/ToastContainer';

const emptyForm = {
    supplierName: '',
    contactPerson: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    country: ''
};

const normalizeSupplier = (row = {}) => {
    const id =
        row.SUPPLIER_ID ||
        row.supplier_id ||
        row.supplierId ||
        row.id ||
        row.SUPPLIER_CODE ||
        row.supplierCode ||
        row.code ||
        row.EMAIL ||
        row.email;

    return {
        id,
        code: row.SUPPLIER_CODE || row.supplier_code || row.supplierCode || row.code || 'N/A',
        name: row.SUPPLIER_NAME || row.supplier_name || row.supplierName || row.name || 'Unnamed supplier',
        contactPerson: row.CONTACT_PERSON || row.contact_person || row.contactPerson || '',
        email: row.EMAIL || row.email || '',
        phone: row.PHONE || row.phone || '',
        addressLine1: row.ADDRESS_LINE1 || row.address_line1 || row.address || row.addressLine1 || '',
        city: row.CITY || row.city || '',
        country: row.COUNTRY || row.country || '',
        status: row.STATUS || row.status || 'ACTIVE',
        createdAt: row.CREATED_AT || row.createdAt || row.created_at || null
    };
};

const Suppliers = () => {
    const { showToast } = useToast();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [countryFilter, setCountryFilter] = useState('all');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [confirmState, setConfirmState] = useState({ open: false, supplier: null });
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/suppliers');
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setSuppliers(list.map(normalizeSupplier));
        } catch (err) {
            console.error('Failed to load suppliers', err);
            setError(err.response?.data?.message || 'Unable to load suppliers right now.');
            showToast('Unable to load suppliers', 'error', 4000);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const coverage = new Set();
        const countriesSet = new Set();
        let verifiedContacts = 0;

        suppliers.forEach((supplier) => {
            if (supplier.city) coverage.add(supplier.city);
            if (supplier.country) countriesSet.add(supplier.country);
            if (supplier.email && supplier.phone) verifiedContacts += 1;
        });

        return {
            total: suppliers.length,
            cities: coverage.size,
            countries: countriesSet.size,
            verifiedContacts
        };
    }, [suppliers]);

    const countryOptions = useMemo(() => {
        const set = new Set();
        suppliers.forEach((supplier) => {
            if (supplier.country) {
                set.add(supplier.country);
            }
        });
        return Array.from(set);
    }, [suppliers]);

    const filteredSuppliers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return suppliers.filter((supplier) => {
            const matchesSearch = term
                ? [supplier.name, supplier.code, supplier.contactPerson, supplier.email, supplier.city, supplier.country]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(term))
                : true;

            const matchesCountry = countryFilter === 'all' || supplier.country === countryFilter;

            return matchesSearch && matchesCountry;
        });
    }, [suppliers, search, countryFilter]);

    const openCreateDrawer = () => {
        setSelectedSupplier(null);
        setForm(emptyForm);
        setDrawerOpen(true);
    };

    const openEditDrawer = (supplier) => {
        setSelectedSupplier(supplier);
        setForm({
            supplierName: supplier.name || '',
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            addressLine1: supplier.addressLine1 || '',
            city: supplier.city || '',
            country: supplier.country || ''
        });
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setSelectedSupplier(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            supplierName: form.supplierName.trim(),
            contactPerson: form.contactPerson.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            addressLine1: form.addressLine1.trim(),
            city: form.city.trim(),
            country: form.country.trim()
        };

        try {
            if (selectedSupplier) {
                await axios.put(`/api/suppliers/${selectedSupplier.id}`, payload);
                showToast('Supplier updated', 'success');
            } else {
                await axios.post('/api/suppliers', payload);
                showToast('Supplier created', 'success');
            }
            closeDrawer();
            await fetchSuppliers();
        } catch (err) {
            console.error('Failed to save supplier', err);
            const message = err.response?.data?.message || 'Unable to save supplier.';
            setError(message);
            showToast(message, 'error', 4000);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmState.supplier) return;
        try {
            await axios.delete(`/api/suppliers/${confirmState.supplier.id}`);
            setSuppliers((prev) => prev.filter((supplier) => supplier.id !== confirmState.supplier.id));
            showToast('Supplier removed', 'success');
        } catch (err) {
            console.error('Failed to delete supplier', err);
            const message = err.response?.data?.message || 'Unable to delete supplier.';
            showToast(message, 'error', 4000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white rounded-2xl p-6 shadow-lg border border-primary-200/40">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] font-semibold text-white/70">Supplier Network</p>
                        <div className="flex items-end gap-2">
                            <h1 className="text-3xl font-bold">Suppliers</h1>
                            <span className="text-sm text-white/80">Real-time view from Oracle</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchSuppliers}
                            className="px-4 py-2 bg-white/15 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faSync} />
                            Refresh
                        </button>
                        <button
                            onClick={openCreateDrawer}
                            className="px-4 py-2 bg-white text-primary-700 rounded-lg font-semibold shadow-md hover:bg-slate-50 flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Add supplier
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Active suppliers',
                        value: stats.total,
                        icon: faBuilding,
                        color: 'bg-white border border-slate-200',
                        iconColor: 'bg-emerald-50 text-emerald-600'
                    },
                    {
                        label: 'Cities covered',
                        value: stats.cities,
                        icon: faMapMarkerAlt,
                        color: 'bg-white border border-slate-200',
                        iconColor: 'bg-sky-50 text-sky-600'
                    },
                    {
                        label: 'Countries',
                        value: stats.countries,
                        icon: faGlobe,
                        color: 'bg-white border border-slate-200',
                        iconColor: 'bg-indigo-50 text-indigo-600'
                    },
                    {
                        label: 'Contacts ready',
                        value: stats.verifiedContacts,
                        icon: faCheckCircle,
                        color: 'bg-white border border-slate-200',
                        iconColor: 'bg-amber-50 text-amber-600'
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
                                placeholder="Search by name, code, contact, city..."
                                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faFilter} className="text-slate-400" />
                            <select
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                            >
                                <option value="all">All countries</option>
                                {countryOptions.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchSuppliers}
                            className="px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faSync} />
                            Sync
                        </button>
                        <button
                            onClick={openCreateDrawer}
                            className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            New supplier
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Supplier</th>
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3 text-right">Actions</th>
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
                            ) : filteredSuppliers.length ? (
                                filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id || supplier.code} className="border-b border-slate-100 hover:bg-slate-50/60">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{supplier.name}</span>
                                                <span className="text-xs text-slate-500">Code: {supplier.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <span>{supplier.contactPerson || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                                                <span className="truncate max-w-[180px]">{supplier.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <FontAwesomeIcon icon={faPhone} className="text-slate-400" />
                                                <span>{supplier.phone || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-400" />
                                                <span>{[supplier.city, supplier.country].filter(Boolean).join(', ') || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditDrawer(supplier)}
                                                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setConfirmState({ open: true, supplier })}
                                                    className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-1"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                                        No suppliers found. Try adjusting filters or add a new supplier.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 rounded-2xl animate-scale-in">
                        <div className="flex items-start justify-between mb-4 sticky top-0 bg-white/90 backdrop-blur z-10 pb-3 border-b border-slate-100">
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-primary-600 font-semibold">
                                    {selectedSupplier ? 'Update supplier' : 'Create supplier'}
                                </p>
                                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                                    {selectedSupplier ? selectedSupplier.name : 'New supplier'}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Capture supplier master data and keep it in sync with Oracle.
                                </p>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="text-slate-500 hover:text-slate-800 px-3 py-1 rounded-lg border border-slate-200"
                            >
                                Close
                            </button>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Supplier name</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faBuilding} className="text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={form.supplierName}
                                        onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                                        required
                                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="e.g. Global Industrial Supplies"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Contact person</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faUser} className="text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.contactPerson}
                                            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                                            required
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Primary contact name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-sky-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            required
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="contact@supplier.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faPhone} className="text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="+1 555 123 4567"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Address line</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.addressLine1}
                                            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Street and number"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.city}
                                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="City"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Country</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faGlobe} className="text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={form.country}
                                            onChange={(e) => setForm({ ...form, country: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Country"
                                        />
                                    </div>
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
                                    disabled={saving}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : selectedSupplier ? 'Update supplier' : 'Create supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmState.open}
                onClose={() => setConfirmState({ open: false, supplier: null })}
                onConfirm={handleDelete}
                title="Delete supplier?"
                message={`This will mark ${confirmState.supplier?.name || 'this supplier'} as inactive.`}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default Suppliers;
