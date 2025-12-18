import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUp,
    faArrowDown,
    faBoxOpen,
    faTruckLoading,
    faExclamationTriangle,
    faMoneyBillWave,
    faDownload
} from '@fortawesome/free-solid-svg-icons';
import HoverStatCard from '../components/HoverStatCard';
import axios from '../api/client';

const Dashboard = () => {
    const navigate = useNavigate();
    const [overview, setOverview] = useState({
        totalRevenue: 0,
        activeOrders: 0,
        inTransitShipments: 0,
        lowStockCount: 0
    });
    const [trend, setTrend] = useState([]);
    const [recent, setRecent] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [ov, tr, ra, ls] = await Promise.all([
                    axios.get('/api/analytics/overview'),
                    axios.get('/api/analytics/revenue-orders-trend'),
                    axios.get('/api/analytics/recent-activity'),
                    axios.get('/api/analytics/low-stock-products')
                ]);
                setOverview(ov.data?.data || {});
                setTrend(tr.data?.data || []);
                setRecent(ra.data?.data || []);
                setLowStock(ls.data?.data || []);
            } catch (err) {
                console.error('Dashboard data load failed', err);
            }
        };
        load();
    }, []);

    const stats = useMemo(() => ([
        {
            title: 'Total Revenue',
            value: `LKR ${(overview.totalRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            change: '',
            isPositive: true,
            icon: faMoneyBillWave,
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Active Orders',
            value: (overview.activeOrders || 0).toString(),
            change: '',
            isPositive: true,
            icon: faBoxOpen,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            title: 'Pending Shipments',
            value: (overview.inTransitShipments || 0).toString(),
            change: '',
            isPositive: true,
            icon: faTruckLoading,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            title: 'Low Stock Items',
            value: (overview.lowStockCount || 0).toString(),
            change: '',
            isPositive: false,
            icon: faExclamationTriangle,
            color: 'bg-red-100 text-red-600'
        },
    ]), [overview]);

    const salesData = useMemo(() => trend.map((t) => ({
        name: t.period || '',
        revenue: t.revenue || 0,
        orders: t.orders || 0
    })), [trend]);

    const formatNumber = (num = 0) => Number(num || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
    const formatDate = (value) => value ? new Date(value).toLocaleString() : '';

    const handleDownloadReport = () => {
        try {
            setExporting(true);
            const now = new Date();
            const overviewRows = [
                { label: 'Total Revenue', value: `LKR ${formatNumber(overview.totalRevenue)}` },
                { label: 'Active Orders', value: formatNumber(overview.activeOrders) },
                { label: 'Pending Shipments', value: formatNumber(overview.inTransitShipments) },
                { label: 'Low Stock Items', value: formatNumber(overview.lowStockCount) },
            ];

            const trendRows = salesData.map((row) => `<tr><td>${row.name}</td><td>${formatNumber(row.revenue)}</td><td>${formatNumber(row.orders)}</td></tr>`).join('');
            const activityRows = (recent || []).map((item) => `<tr><td>${item.number || ''}</td><td>${item.supplier || ''}</td><td>${item.status || ''}</td><td>${formatDate(item.orderDate)}</td></tr>`).join('');
            const lowStockRows = (lowStock || []).map((item) => `<tr><td>${item.name || ''}</td><td>${item.sku || ''}</td><td>${item.qtyOnHand || 0}</td><td>${item.reorderLevel || 0}</td></tr>`).join('');

            const html = `<!doctype html>
            <html>
              <head>
                <meta charset="utf-8"/>
                <title>Supply Management Report</title>
                <style>
                  * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
                  body { padding: 24px; background: #f8fafc; color: #0f172a; }
                  h1 { margin: 0 0 4px; font-size: 24px; }
                  h2 { margin: 24px 0 12px; font-size: 18px; }
                  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                  th, td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 13px; text-align: left; }
                  th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.03em; font-weight: 700; }
                  .meta { color: #475569; font-size: 13px; margin-bottom: 16px; }
                </style>
              </head>
              <body>
                <h1>Supply Management Dashboard Report</h1>
                <div class="meta">Generated at ${now.toLocaleString()}</div>
                <div class="card">
                  <h2>Overview</h2>
                  <table>
                    <tbody>
                      ${overviewRows.map((r) => `<tr><th>${r.label}</th><td>${r.value}</td></tr>`).join('')}
                    </tbody>
                  </table>
                </div>
                <div class="card">
                  <h2>Revenue & Orders Trend</h2>
                  <table>
                    <thead><tr><th>Period</th><th>Revenue (LKR)</th><th>Orders</th></tr></thead>
                    <tbody>${trendRows || '<tr><td colspan="3">No data</td></tr>'}</tbody>
                  </table>
                </div>
                <div class="card">
                  <h2>Recent Activity</h2>
                  <table>
                    <thead><tr><th>PO Number</th><th>Supplier</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>${activityRows || '<tr><td colspan="4">No recent activity</td></tr>'}</tbody>
                  </table>
                </div>
                <div class="card">
                  <h2>Low Stock Alerts</h2>
                  <table>
                    <thead><tr><th>Product</th><th>SKU</th><th>On Hand</th><th>Reorder Level</th></tr></thead>
                    <tbody>${lowStockRows || '<tr><td colspan="4">No low stock items</td></tr>'}</tbody>
                  </table>
                </div>
              </body>
            </html>`;

            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const frame = document.createElement('iframe');
            frame.style.position = 'fixed';
            frame.style.right = '0';
            frame.style.bottom = '0';
            frame.style.width = '0';
            frame.style.height = '0';
            frame.src = url;
            frame.onload = () => {
                frame.contentWindow?.focus();
                frame.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(frame);
                    URL.revokeObjectURL(url);
                    setExporting(false);
                }, 800);
            };
            document.body.appendChild(frame);
        } catch (err) {
            console.error('Report export failed', err);
            setExporting(false);
            alert('Could not generate the report PDF. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        className={`btn-secondary text-sm inline-flex items-center gap-2 ${exporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={handleDownloadReport}
                        disabled={exporting}
                    >
                        <FontAwesomeIcon icon={faDownload} />
                        {exporting ? 'Preparing...' : 'Download Report'}
                    </button>
                    <button className="btn-primary text-sm" onClick={() => navigate('/orders/new')}>
                        Create Order
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <HoverStatCard key={index}>
                        <div className="flex justify-between items-start p-5">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    {stat.title}
                                </p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <FontAwesomeIcon icon={stat.icon} className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-5 pb-4 text-xs">
                            <div className="flex items-center text-sm">
                                <span
                                    className={`flex items-center font-medium ${
                                        stat.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    <FontAwesomeIcon
                                        icon={stat.isPositive ? faArrowUp : faArrowDown}
                                        className="mr-1"
                                    />
                                    {stat.change}
                                </span>
                                <span className="text-slate-400 ml-2">vs last month</span>
                            </div>
                            <span className="text-slate-400">View details →</span>
                        </div>
                    </HoverStatCard>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue & Orders</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {(recent || []).slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-slate-600">PO</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Purchase Order {item.number}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {item.supplier || 'Supplier'} • {item.status || 'Status'} • {item.orderDate ? new Date(item.orderDate).toLocaleString() : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recent.length === 0 && (
                            <p className="text-sm text-slate-500">No recent activity.</p>
                        )}
                    </div>
                    <button className="w-full mt-4 text-sm text-primary-600 font-medium hover:text-primary-700">
                        View All Activity
                    </button>
                </div>
            </div>

            {/* Low Stock Alert Table */}
            <div className="card overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Low Stock Alerts</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {lowStock.length} Items Critical
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Product Name</th>
                                <th className="px-6 py-3">SKU</th>
                                <th className="px-6 py-3">Stock Level</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStock.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-4 text-slate-500" colSpan={5}>No low stock items.</td>
                                </tr>
                            ) : (
                                lowStock.map((item, idx) => (
                                    <tr key={`${item.sku}-${idx}`} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4">{item.sku}</td>
                                        <td className="px-6 py-4">
                                            <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[120px]">
                                                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, (item.qtyOnHand / Math.max(1, item.reorderLevel)) * 100)}%` }}></div>
                                            </div>
                                            <span className="text-xs mt-1 block">{item.qtyOnHand} / {item.reorderLevel} units</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                Critical
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary-600 hover:text-primary-900 font-medium">Restock</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
