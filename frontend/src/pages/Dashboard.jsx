import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUp,
    faArrowDown,
    faBoxOpen,
    faTruckLoading,
    faExclamationTriangle,
    faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import HoverStatCard from '../components/HoverStatCard';

const Dashboard = () => {
    // Mock Data
    const stats = [
        { title: 'Total Revenue', value: '$124,500', change: '+12.5%', isPositive: true, icon: faMoneyBillWave, color: 'bg-green-100 text-green-600' },
        { title: 'Active Orders', value: '45', change: '+5.2%', isPositive: true, icon: faBoxOpen, color: 'bg-blue-100 text-blue-600' },
        { title: 'Pending Shipments', value: '12', change: '-2.4%', isPositive: false, icon: faTruckLoading, color: 'bg-purple-100 text-purple-600' },
        { title: 'Low Stock Items', value: '8', change: '+2', isPositive: false, icon: faExclamationTriangle, color: 'bg-red-100 text-red-600' },
    ];

    const salesData = [
        { name: 'Jan', revenue: 4000, orders: 24 },
        { name: 'Feb', revenue: 3000, orders: 13 },
        { name: 'Mar', revenue: 2000, orders: 98 },
        { name: 'Apr', revenue: 2780, orders: 39 },
        { name: 'May', revenue: 1890, orders: 48 },
        { name: 'Jun', revenue: 2390, orders: 38 },
        { name: 'Jul', revenue: 3490, orders: 43 },
    ];

    const inventoryData = [
        { name: 'Electronics', value: 400 },
        { name: 'Clothing', value: 300 },
        { name: 'Furniture', value: 300 },
        { name: 'Food', value: 200 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary text-sm">Download Report</button>
                    <button className="btn-primary text-sm">Create Order</button>
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
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-slate-600">PO</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">New Purchase Order #102{item}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Created by John Doe • 2 mins ago</p>
                                </div>
                            </div>
                        ))}
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
                        8 Items Critical
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
                            {[1, 2, 3].map((item) => (
                                <tr key={item} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        Industrial Bearing X-200
                                    </td>
                                    <td className="px-6 py-4">BRG-200-X</td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[100px]">
                                            <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                                        </div>
                                        <span className="text-xs mt-1 block">15 / 100 units</span>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
