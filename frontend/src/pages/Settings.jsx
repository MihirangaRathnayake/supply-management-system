import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCog,
    faGlobe,
    faClock,
    faBell,
    faEnvelope,
    faBoxes,
    faTruck,
    faClipboardCheck,
    faPalette,
    faSliders,
    faInfoCircle,
    faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../components/ToastContainer';
import ModernCard from '../components/ModernCard';
import AnimatedButton from '../components/AnimatedButton';

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

    return { data, isLoading, error, refetch, setData };
};

const defaultSettings = {
    systemName: 'Supply Management System',
    defaultCurrency: 'LKR',
    timeZone: 'Asia/Colombo',
    systemEmailAlerts: true,
    lowStockAlerts: true,
    shipmentDelayNotifications: true,
    poApprovalNotifications: true,
    themeMode: 'light',
    dashboardDensity: 'comfortable',
    defaultLandingPage: 'dashboard'
};

const Settings = () => {
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(defaultSettings);
    const [initial, setInitial] = useState(defaultSettings);

    const settingsQuery = useFetchQuery(
        'settings',
        async () => {
            const res = await axios.get('/api/settings');
            return res.data?.data || res.data || defaultSettings;
        },
        { initialData: defaultSettings }
    );

    useEffect(() => {
        if (settingsQuery.data) {
            const merged = { ...defaultSettings, ...settingsQuery.data };
            setForm(merged);
            setInitial(merged);
        }
    }, [settingsQuery.data]);

    const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put('/api/settings', form);
            setInitial(form);
            showToast('Settings saved successfully', 'success');
        } catch (err) {
            console.error('Failed to save settings', err);
            showToast(err.response?.data?.message || 'Unable to save settings.', 'error', 4000);
        } finally {
            setSaving(false);
        }
    };

    const systemInfo = {
        version: 'v2.4.0',
        environment: 'Development',
        lastUpdated: new Date().toLocaleDateString(),
        health: {
            frontend: 'healthy',
            backend: 'healthy'
        }
    };

    const renderSkeletonCard = () => (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-3 animate-pulse">
            <div className="h-6 w-40 bg-slate-200 rounded"></div>
            <div className="h-4 w-64 bg-slate-200 rounded"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
        </div>
    );

    const ToggleRow = ({ icon, title, description, field }) => (
        <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                    <FontAwesomeIcon icon={icon} />
                </div>
                <div>
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                    type="checkbox"
                    checked={!!form[field]}
                    onChange={(e) => handleChange(field, e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors">
                    <div className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform ${form[field] ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
            </label>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
                    <FontAwesomeIcon icon={faCog} className="text-indigo-600" />
                    System Settings
                </h1>
                <p className="text-slate-600 mt-1 text-sm lg:text-base">
                    Configure global preferences, alerts, and defaults for the supply network.
                </p>
            </div>

            {settingsQuery.isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {renderSkeletonCard()}
                    {renderSkeletonCard()}
                    {renderSkeletonCard()}
                    {renderSkeletonCard()}
                </div>
            ) : (
                <>
                    {settingsQuery.error && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
                            Unable to load settings. Please refresh.
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ModernCard className="p-6 shadow-md">
                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faGlobe} className="text-indigo-600" />
                                    General Settings
                                </h2>
                                <p className="text-sm text-slate-600">System identity and localization defaults.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">System Name</label>
                                    <input
                                        value={form.systemName}
                                        onChange={(e) => handleChange('systemName', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Supply Management System"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Default Currency</label>
                                        <select
                                            value={form.defaultCurrency}
                                            onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="LKR">LKR - Sri Lankan Rupee</option>
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Time Zone</label>
                                        <select
                                            value={form.timeZone}
                                            onChange={(e) => handleChange('timeZone', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="Asia/Colombo">Asia/Colombo (UTC+5:30)</option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">America/New_York (UTC-5)</option>
                                            <option value="Europe/London">Europe/London (UTC+0)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </ModernCard>

                        <ModernCard className="p-6 shadow-md">
                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBell} className="text-indigo-600" />
                                    Notification Settings
                                </h2>
                                <p className="text-sm text-slate-600">Stay ahead of exceptions and approvals.</p>
                            </div>
                            <div className="space-y-4">
                                <ToggleRow
                                    icon={faEnvelope}
                                    title="System Email Alerts"
                                    description="Critical platform events and system updates."
                                    field="systemEmailAlerts"
                                />
                                <ToggleRow
                                    icon={faBoxes}
                                    title="Low Stock Alerts"
                                    description="Notify when on-hand quantity falls below reorder level."
                                    field="lowStockAlerts"
                                />
                                <ToggleRow
                                    icon={faTruck}
                                    title="Shipment Delay Notifications"
                                    description="Ping when carrier milestones are missed."
                                    field="shipmentDelayNotifications"
                                />
                                <ToggleRow
                                    icon={faClipboardCheck}
                                    title="PO Approval Notifications"
                                    description="Send alerts for purchase order approvals and rejections."
                                    field="poApprovalNotifications"
                                />
                            </div>
                        </ModernCard>

                        <ModernCard className="p-6 shadow-md">
                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPalette} className="text-indigo-600" />
                                    User Preferences
                                </h2>
                                <p className="text-sm text-slate-600">Personalize the workspace experience.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Theme Mode</label>
                                        <select
                                            value={form.themeMode}
                                            onChange={(e) => handleChange('themeMode', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Dashboard Density</label>
                                        <select
                                            value={form.dashboardDensity}
                                            onChange={(e) => handleChange('dashboardDensity', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="comfortable">Comfortable</option>
                                            <option value="compact">Compact</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Default Landing Page</label>
                                    <select
                                        value={form.defaultLandingPage}
                                        onChange={(e) => handleChange('defaultLandingPage', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="dashboard">Dashboard</option>
                                        <option value="inventory">Inventory</option>
                                        <option value="orders">Purchase Orders</option>
                                    </select>
                                </div>
                            </div>
                        </ModernCard>

                        <ModernCard className="p-6 shadow-md">
                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faInfoCircle} className="text-indigo-600" />
                                    System Information
                                </h2>
                                <p className="text-sm text-slate-600">Environment and runtime health.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: 'App Version', value: systemInfo.version, icon: faGlobe },
                                    { label: 'Environment', value: systemInfo.environment, icon: faSliders },
                                    { label: 'Last Updated', value: systemInfo.lastUpdated, icon: faClock },
                                    {
                                        label: 'Health',
                                        value: (
                                            <div className="flex flex-col text-sm text-slate-800 gap-1">
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                                    Frontend: {systemInfo.health.frontend}
                                                </span>
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                                    Backend: {systemInfo.health.backend}
                                                </span>
                                            </div>
                                        ),
                                        icon: faCircleCheck
                                    }
                                ].map((item) => (
                                    <div key={item.label} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                                            <FontAwesomeIcon icon={item.icon} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                                            <p className="text-sm font-bold text-slate-900">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ModernCard>
                    </div>

                    <div className="flex justify-end">
                        <AnimatedButton
                            icon={faClipboardCheck}
                            onClick={handleSave}
                            loading={saving}
                            disabled={!dirty}
                            variant={dirty ? 'primary' : 'outline'}
                            size="md"
                        >
                            Save Changes
                        </AnimatedButton>
                    </div>
                </>
            )}
        </div>
    );
};

export default Settings;
