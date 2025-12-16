import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const styles = {
        success: {
            bg: 'bg-green-500',
            icon: faCheckCircle,
            text: 'text-white'
        },
        error: {
            bg: 'bg-red-500',
            icon: faExclamationCircle,
            text: 'text-white'
        },
        info: {
            bg: 'bg-blue-500',
            icon: faInfoCircle,
            text: 'text-white'
        }
    };

    const style = styles[type] || styles.info;

    return (
        <div className={`${style.bg} ${style.text} rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}>
            <FontAwesomeIcon icon={style.icon} className="text-xl" />
            <p className="flex-1 font-medium">{message}</p>
            <button
                onClick={onClose}
                className="hover:opacity-70 transition-opacity"
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>
        </div>
    );
};

export default Toast;
