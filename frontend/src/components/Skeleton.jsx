import React from 'react';

export const SkeletonCard = () => (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl animate-pulse">
        <div className="flex items-start justify-between mb-4">
            <div className="space-y-2 flex-1">
                <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-3/4" />
                <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg w-1/2" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl" />
        </div>
        <div className="space-y-2 mb-4">
            <div className="h-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg w-full" />
            <div className="h-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg w-2/3" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl w-24" />
            <div className="h-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full w-16" />
        </div>
    </div>
);

export const SkeletonList = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count)].map((_, idx) => (
            <SkeletonCard key={idx} />
        ))}
    </div>
);
