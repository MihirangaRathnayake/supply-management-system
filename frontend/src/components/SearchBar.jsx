import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ value, onChange, onClear, placeholder = 'Search...', className = '' }) => {
    return (
        <div className={`relative group ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative flex items-center">
                <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" 
                />
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-12 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                />
                {value && (
                    <button
                        onClick={onClear}
                        className="absolute right-4 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
