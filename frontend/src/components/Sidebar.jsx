import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faTruck,
    faBox,
    faWarehouse,
    faClipboardList,
    faChartLine,
    faUsers,
    faCog,
    faCube
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ isOpen }) => {
    const navItems = [
        { path: '/', icon: faHome, label: 'Dashboard' },
        { path: '/suppliers', icon: faUsers, label: 'Suppliers' },
        { path: '/products', icon: faBox, label: 'Products' },
        { path: '/warehouses', icon: faWarehouse, label: 'Warehouses' },
        { path: '/inventory', icon: faClipboardList, label: 'Inventory' },
        { path: '/orders', icon: faClipboardList, label: 'Purchase Orders' },
        { path: '/shipments', icon: faTruck, label: 'Shipments' },
        { path: '/analytics', icon: faChartLine, label: 'Analytics' },
        { path: '/settings', icon: faCog, label: 'Settings' },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-slate-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 w-64`}
        >
            <div className="h-full px-3 py-4 overflow-y-auto">
                <div className="flex items-center pl-2.5 mb-8">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 text-white mr-3">
                        <FontAwesomeIcon icon={faCube} className="text-xl" />
                    </div>
                    <span className="self-center text-xl font-bold whitespace-nowrap text-slate-800">SupplyChain</span>
                </div>

                <ul className="space-y-2 font-medium">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-lg group transition-colors duration-200 ${isActive
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                }
                            >
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`w-5 h-5 transition duration-75 ${({ isActive }) => isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-900'
                                        }`}
                                />
                                <span className="ml-3">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                            PRO
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-900">Enterprise Plan</p>
                            <p className="text-xs text-slate-500">v2.4.0</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
