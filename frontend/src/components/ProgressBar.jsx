import React from 'react';

const ProgressBar = ({
    value,
    max = 100,
    showLabel = true,
    gradient = true,
    size = 'md',
    barColor,
    gradientColors
}) => {
    const percentage = Math.min((value / max) * 100, 100);

    const sizes = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };

    const gradientClass = gradient
        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
        : 'bg-blue-500';

    const fillStyle = {
        width: `${percentage}%`,
        background: barColor
            ? barColor
            : gradientColors
                ? `linear-gradient(90deg, ${gradientColors})`
                : undefined
    };

    return (
        <div className="w-full">
            <div className={`w-full ${sizes[size]} bg-slate-200 rounded-full overflow-hidden relative`}>
                <div
                    className={`${sizes[size]} ${barColor ? '' : gradientClass} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                    style={fillStyle}
                >
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                </div>
            </div>
            {showLabel && (
                <div className="flex justify-between mt-1 text-xs text-slate-600">
                    <span>{value}</span>
                    <span>{max}</span>
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
