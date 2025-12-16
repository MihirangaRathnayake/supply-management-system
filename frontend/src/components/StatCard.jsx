import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatCard = ({ icon, label, value, gradient, trend, trendValue }) => {
    return (
        <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity`} />
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
                        <FontAwesomeIcon icon={icon} className="text-2xl" />
                    </div>
                    {trend && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {trend === 'up' ? '↑' : '↓'} {trendValue}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm text-slate-600 font-semibold uppercase tracking-wide mb-1">{label}</p>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        {value}
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
