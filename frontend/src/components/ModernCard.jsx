import React from 'react';

const ModernCard = ({ children, className = '', hover = true, glow = false, gradient = false }) => {
    const baseClasses = "relative overflow-hidden rounded-3xl border transition-all duration-300";
    const hoverClasses = hover ? "hover:scale-[1.02] hover:shadow-2xl" : "";
    const glowClasses = glow ? "before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/20 before:via-purple-500/20 before:to-pink-500/20 before:blur-xl before:-z-10" : "";
    const gradientClasses = gradient ? "bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30" : "bg-white/80";
    
    return (
        <div className={`${baseClasses} ${hoverClasses} ${glowClasses} ${gradientClasses} backdrop-blur-xl border-white/20 shadow-xl ${className}`}>
            {children}
        </div>
    );
};

export default ModernCard;
