import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const typeStyles = {
        warning: {
            icon: 'text-yellow-600',
            bg: 'bg-yellow-50',
            border: 'border-yellow-200'
        },
        danger: {
            icon: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200'
        },
        info: {
            icon: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
        }
    };

    const style = typeStyles[type] || typeStyles.warning;

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative p-6 pb-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                    
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${style.bg} ${style.border} border-2 flex items-center justify-center ${style.icon}`}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
                        </div>
                        <div className="flex-1 pt-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
