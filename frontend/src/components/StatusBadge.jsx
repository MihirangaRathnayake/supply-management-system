import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatusBadge = ({ status, icon, gradient, label, size = 'md', animated = false }) => {
    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <div className={`
            inline-flex items-center gap-2
            ${sizes[size]}
            rounded-xl
            bg-gradient-to-r ${gradient}
            text-white font-bold
            shadow-lg
            ${animated ? 'animate-pulse' : ''}
            transition-all duration-300
            hover:scale-105
        `}>
            {icon && <FontAwesomeIcon icon={icon} />}
            <span>{label}</span>
        </div>
    );
};

export default StatusBadge;
