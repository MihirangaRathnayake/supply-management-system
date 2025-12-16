import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AnimatedButton = ({ 
    children, 
    icon, 
    onClick, 
    variant = 'primary', 
    size = 'md',
    disabled = false,
    loading = false,
    className = ''
}) => {
    const variants = {
        primary: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50',
        secondary: 'bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:shadow-lg hover:shadow-slate-500/50',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/50',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/50',
        outline: 'bg-white/80 backdrop-blur-sm border-2 border-purple-500 text-purple-600 hover:bg-purple-50'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${variants[variant]}
                ${sizes[size]}
                rounded-2xl font-bold
                transform transition-all duration-300
                hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2
                relative overflow-hidden
                ${className}
            `}
        >
            {loading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {icon && <FontAwesomeIcon icon={icon} className={loading ? 'opacity-0' : ''} />}
            <span className={loading ? 'opacity-0' : ''}>{children}</span>
        </button>
    );
};

export default AnimatedButton;
